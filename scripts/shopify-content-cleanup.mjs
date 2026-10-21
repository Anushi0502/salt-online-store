#!/usr/bin/env node
// Catalog-wide product content cleanup: titles, descriptions, SEO title and
// SEO description, using the rules proven on the 49-product pilot.
//
//   npm run shopify:content-cleanup:dry-run
//     Reads every active product, writes a backup, a plan and a review CSV
//     to output/content-cleanup/. Changes nothing in Shopify.
//
//   npm run shopify:content-cleanup:apply -- --plan output/content-cleanup/plan-<stamp>.json [--limit 500]
//     Applies a reviewed plan. Each product is re-read first and skipped if
//     it changed since the dry run. Results are logged next to the plan.
//
//   npm run shopify:content-cleanup:restore -- --backup output/content-cleanup/backup-<stamp>.json [--ids id1,id2]
//     Puts the saved title, description and SEO fields back.
//
// Products whose title or description makes a health claim are never
// changed; they are listed in the review CSV for a person to check.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createShopifyAdminGraphQLClient } from "./shopify-admin-graphql-client.mjs";
import { auditCatalog } from "../src/lib/catalog-audit.js";
import { cleanProductTitle } from "../src/lib/product-title-cleanup.js";
import { buildSeoTitle, HEALTH_CLAIM_PATTERN, rebuildProductDescription } from "../src/lib/product-description-rebuild.js";

// Claims a rebuilt title must never contain; such products go to manual review.
const ATTRACTION_CLAIM_PATTERN = /\b(?:pheromones?|sexual(?:ly)?|flirt(?:ing)?|aphrodisiac|seduc\w*|attract (?:women|men))\b/i;

const rootDir = process.cwd();
const outputDir = resolve(rootDir, "output", "content-cleanup");
const args = process.argv.slice(2);
const mode = args.includes("--apply")
  ? "apply"
  : args.includes("--restore")
    ? "restore"
    : args.includes("--audit")
      ? "audit"
      : args.includes("--hide")
        ? "hide"
        : args.includes("--unhide")
          ? "unhide"
          : "dry-run";

function argValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? "" : String(args[index + 1] || "");
}

const client = createShopifyAdminGraphQLClient({ rootDir, agentName: "content-cleanup" });

const PRODUCTS_QUERY = `query ContentCleanupProducts($first: Int!, $after: String) {
  products(first: $first, after: $after, query: "status:active") {
    nodes { id handle title status productType descriptionHtml seo { title description } options { name values } }
    pageInfo { hasNextPage endCursor }
  }
}`;

const PRODUCTS_BY_ID_QUERY = `query ContentCleanupProductsById($ids: [ID!]!) {
  nodes(ids: $ids) { ... on Product { id handle title status descriptionHtml seo { title description } } }
}`;

const AUDIT_QUERY = `query ContentCleanupAudit($first: Int!, $after: String) {
  products(first: $first, after: $after, query: "status:active") {
    nodes {
      id handle title status createdAt productType totalInventory tracksInventory descriptionHtml
      mediaCount { count }
      priceRangeV2 { minVariantPrice { amount } maxVariantPrice { amount } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const PRODUCT_STATUS_MUTATION = `mutation ContentCleanupStatus($product: ProductUpdateInput!) {
  productUpdate(product: $product) { product { id status } userErrors { field message } }
}`;

const PRODUCT_UPDATE_MUTATION = `mutation ContentCleanupUpdate($product: ProductUpdateInput!) {
  productUpdate(product: $product) { product { id title } userErrors { field message } }
}`;

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function plainText(html) {
  return String(html || "").replace(/<\/(p|h\d|li)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\n\s*\n+/g, "\n").trim();
}

async function fetchActiveProducts() {
  const products = [];
  let after = null;
  for (let page = 1; ; page += 1) {
    const data = await client.run(PRODUCTS_QUERY, { first: 100, after }, { operation: `content cleanup page ${page}` });
    const connection = data?.products;
    if (!connection) throw new Error("Shopify returned no product connection");
    products.push(...connection.nodes.filter((product) => product?.status === "ACTIVE"));
    process.stdout.write(`\rRead ${products.length} active products`);
    if (!connection.pageInfo?.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }
  process.stdout.write("\n");
  return products;
}

async function fetchByIds(ids) {
  const found = new Map();
  for (let index = 0; index < ids.length; index += 100) {
    const data = await client.run(PRODUCTS_BY_ID_QUERY, { ids: ids.slice(index, index + 100) }, { operation: "content cleanup readback" });
    for (const node of data?.nodes || []) if (node?.id) found.set(node.id, node);
  }
  return found;
}

function planProduct(product) {
  const title = cleanProductTitle(product);
  const description = rebuildProductDescription(product, title.title);
  const claimText = `${product.title} ${title.title}`;
  if (description.needsReview || HEALTH_CLAIM_PATTERN.test(claimText) || ATTRACTION_CLAIM_PATTERN.test(claimText)) {
    return { review: true };
  }
  if (!title.changed && !description.changed) return null;

  const update = { id: product.id };
  if (title.changed) update.title = title.title;
  if (description.changed) update.descriptionHtml = description.html;
  update.seo = {
    title: buildSeoTitle(title.title),
    ...(description.metaDescription ? { description: description.metaDescription } : {}),
  };
  return { update };
}

// Products already finished by hand (the 49-product pilot) are never redone.
async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(resolve(rootDir, path), "utf8"));
  } catch {
    return fallback;
  }
}

// Products already finished by hand (the 49-product pilot plus
// output/backups/finished-product-ids.json) are never redone.
async function loadFinishedIds() {
  const pilot = await readJson("output/backups/pilot-50-plan.json", []);
  const finished = await readJson("output/backups/finished-product-ids.json", { ids: [] });
  return new Set([...pilot.map((entry) => entry.id), ...(finished.ids || [])]);
}

async function dryRun() {
  await mkdir(outputDir, { recursive: true });
  const finished = await loadFinishedIds();
  const products = (await fetchActiveProducts()).filter((product) => !finished.has(product.id));
  const runStamp = stamp();
  const backup = [];
  const plan = [];
  const review = [];
  const csv = [["Status", "Current name", "New name", "New Google title", "New Google description", "New description", "Handle"].map(csvCell).join(",")];

  for (const product of products) {
    const result = planProduct(product);
    if (!result) continue;
    if (result.review) {
      review.push(product.handle);
      csv.push(["NEEDS REVIEW (health claim)", product.title, "", "", "", "", product.handle].map(csvCell).join(","));
      continue;
    }
    backup.push({ id: product.id, handle: product.handle, title: product.title, descriptionHtml: product.descriptionHtml, seo: product.seo });
    plan.push(result.update);
    const { update } = result;
    csv.push(["change", product.title, update.title || "(same)", update.seo.title, update.seo.description || "", update.descriptionHtml ? plainText(update.descriptionHtml) : "(same)", product.handle].map(csvCell).join(","));
  }

  const backupPath = resolve(outputDir, `backup-${runStamp}.json`);
  const planPath = resolve(outputDir, `plan-${runStamp}.json`);
  const csvPath = resolve(outputDir, `review-${runStamp}.csv`);
  await writeFile(backupPath, JSON.stringify(backup, null, 1));
  await writeFile(planPath, JSON.stringify({ createdAt: new Date().toISOString(), backup: backupPath, products: plan }, null, 1));
  await writeFile(csvPath, csv.join("\n"));

  console.log(`Active products: ${products.length}`);
  console.log(`To change: ${plan.length}  |  Health claims for manual review: ${review.length}  |  Already clean: ${products.length - plan.length - review.length}`);
  console.log(`Review:  ${csvPath}`);
  console.log(`Backup:  ${backupPath}`);
  console.log(`Plan:    ${planPath}`);
  console.log("Nothing was changed in Shopify. Check the review file, then run the apply step with this plan.");
}

async function applyPlan() {
  const planPath = argValue("--plan");
  if (!planPath) throw new Error("Pass --plan output/content-cleanup/plan-<stamp>.json");
  const limit = Number(argValue("--limit") || 0);
  const plan = JSON.parse(await readFile(resolve(rootDir, planPath), "utf8"));
  const backup = new Map(JSON.parse(await readFile(plan.backup, "utf8")).map((entry) => [entry.id, entry]));
  const updates = limit > 0 ? plan.products.slice(0, limit) : plan.products;
  const current = await fetchByIds(updates.map((update) => update.id));
  const log = [];
  let applied = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, update] of updates.entries()) {
    const before = backup.get(update.id);
    const now = current.get(update.id);
    // Never overwrite a product someone edited after the dry run.
    if (!before || !now || now.status !== "ACTIVE" || now.title !== before.title || now.descriptionHtml !== before.descriptionHtml) {
      skipped += 1;
      log.push({ id: update.id, result: "skipped: changed since dry run or not active" });
      continue;
    }
    try {
      const data = await client.run(PRODUCT_UPDATE_MUTATION, { product: update }, { allowMutations: true, operation: `content cleanup ${index + 1}/${updates.length}` });
      const errors = data?.productUpdate?.userErrors || [];
      if (errors.length) throw new Error(errors.map((error) => error.message).join("; "));
      applied += 1;
      log.push({ id: update.id, result: "applied" });
    } catch (error) {
      failed += 1;
      log.push({ id: update.id, result: `failed: ${error instanceof Error ? error.message : error}` });
    }
    process.stdout.write(`\rApplied ${applied}, skipped ${skipped}, failed ${failed} of ${updates.length}`);
  }
  process.stdout.write("\n");
  const logPath = resolve(rootDir, planPath.replace(/plan-/, "apply-log-").replace(/\.json$/, `-${stamp()}.json`));
  await writeFile(logPath, JSON.stringify(log, null, 1));
  console.log(`Log: ${logPath}`);
}

async function restore() {
  const backupPath = argValue("--backup");
  if (!backupPath) throw new Error("Pass --backup output/content-cleanup/backup-<stamp>.json");
  const only = new Set(argValue("--ids").split(",").filter(Boolean));
  const entries = JSON.parse(await readFile(resolve(rootDir, backupPath), "utf8")).filter((entry) => !only.size || only.has(entry.id));
  let restored = 0;
  for (const entry of entries) {
    const data = await client.run(
      PRODUCT_UPDATE_MUTATION,
      { product: { id: entry.id, title: entry.title, descriptionHtml: entry.descriptionHtml, seo: { title: entry.seo?.title || "", description: entry.seo?.description || "" } } },
      { allowMutations: true, operation: `content cleanup restore ${entry.handle}` },
    );
    if (!(data?.productUpdate?.userErrors || []).length) restored += 1;
    process.stdout.write(`\rRestored ${restored} of ${entries.length}`);
  }
  process.stdout.write("\n");
}

async function audit() {
  await mkdir(outputDir, { recursive: true });
  const products = [];
  let after = null;
  for (let page = 1; ; page += 1) {
    const data = await client.run(AUDIT_QUERY, { first: 100, after }, { operation: `catalog audit page ${page}` });
    const connection = data?.products;
    if (!connection) throw new Error("Shopify returned no product connection");
    products.push(...connection.nodes.filter((product) => product?.status === "ACTIVE"));
    process.stdout.write(`\rRead ${products.length} active products`);
    if (!connection.pageInfo?.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }
  process.stdout.write("\n");

  const flagged = auditCatalog(products);
  const runStamp = stamp();
  const csvPath = resolve(outputDir, `audit-${runStamp}.csv`);
  const listPath = resolve(outputDir, `audit-${runStamp}.json`);
  const csv = [["Suggested action", "Reasons", "Name", "Price", "Images", "Stock", "Created", "Link", "Product ID"].map(csvCell).join(",")];
  for (const { product, reasons, action } of flagged) {
    csv.push([
      action,
      reasons.join("; "),
      product.title,
      product.priceRangeV2?.minVariantPrice?.amount,
      product.mediaCount?.count,
      product.totalInventory,
      String(product.createdAt || "").slice(0, 10),
      `https://www.saltonlinestore.com/products/${product.handle}`,
      product.id,
    ].map(csvCell).join(","));
  }
  await writeFile(csvPath, csv.join("\n"));
  await writeFile(listPath, JSON.stringify(flagged.map(({ product, reasons, action }) => ({ id: product.id, handle: product.handle, title: product.title, action, reasons })), null, 1));

  const counts = {};
  for (const { reasons } of flagged) for (const reason of reasons) {
    const label = reason.startsWith("duplicate of") ? "duplicate listing" : reason;
    counts[label] = (counts[label] || 0) + 1;
  }
  console.log(`Active products: ${products.length}`);
  console.log(`Suggested to hide: ${flagged.filter((entry) => entry.action === "hide").length}  |  Worth a look: ${flagged.filter((entry) => entry.action === "review").length}`);
  for (const [label, count] of Object.entries(counts).sort((left, right) => right[1] - left[1])) console.log(`  ${count}  ${label}`);
  console.log(`Review:  ${csvPath}`);
  console.log(`List:    ${listPath}`);
  console.log("Nothing was changed in Shopify.");
}

// Sets products to draft: they leave the store, search and Google but are
// not deleted. Only rows the audit marked "hide" are used.
async function hide() {
  const listPath = argValue("--audit-file");
  if (!listPath) throw new Error("Pass --audit-file output/content-cleanup/audit-<stamp>.json");
  const limit = Number(argValue("--limit") || 0);
  const entries = JSON.parse(await readFile(resolve(rootDir, listPath), "utf8")).filter((entry) => entry.action === "hide");
  const selected = limit > 0 ? entries.slice(0, limit) : entries;
  const hidden = [];
  for (const [index, entry] of selected.entries()) {
    const data = await client.run(PRODUCT_STATUS_MUTATION, { product: { id: entry.id, status: "DRAFT" } }, { allowMutations: true, operation: `hide ${index + 1}/${selected.length}` });
    if (!(data?.productUpdate?.userErrors || []).length) hidden.push(entry);
    process.stdout.write(`\rHidden ${hidden.length} of ${selected.length}`);
  }
  process.stdout.write("\n");
  const hiddenPath = resolve(outputDir, `hidden-${stamp()}.json`);
  await writeFile(hiddenPath, JSON.stringify(hidden, null, 1));
  console.log(`Hidden list (use with --unhide): ${hiddenPath}`);
}

async function unhide() {
  const hiddenPath = argValue("--hidden-file");
  if (!hiddenPath) throw new Error("Pass --hidden-file output/content-cleanup/hidden-<stamp>.json");
  const entries = JSON.parse(await readFile(resolve(rootDir, hiddenPath), "utf8"));
  let restored = 0;
  for (const entry of entries) {
    const data = await client.run(PRODUCT_STATUS_MUTATION, { product: { id: entry.id, status: "ACTIVE" } }, { allowMutations: true, operation: `unhide ${entry.handle}` });
    if (!(data?.productUpdate?.userErrors || []).length) restored += 1;
    process.stdout.write(`\rRestored ${restored} of ${entries.length}`);
  }
  process.stdout.write("\n");
}

const actions = { "dry-run": dryRun, apply: applyPlan, restore, audit, hide, unhide };
actions[mode]().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
