// Central gate for protected Shopify Admin writes.
//
// Every script that sends GraphQL to Shopify Admin calls
// assertShopifyWriteAllowed() before the request leaves the machine. Reads
// pass through. Protected writes (delete, status/draft, publish/unpublish,
// price, collection rules, collection membership/order, tags, opaque bulk
// mutations) are refused unless ALL of these hold:
//
//   1. The run is not automated: not the release pipeline, not the release
//      watcher, not CI.
//   2. SALT_SHOPIFY_WRITE_APPROVAL_FILE points at an approval file inside
//      approvals/ whose exact bytes are also on origin/main (so it went through
//      a reviewed pull request; see .github/CODEOWNERS).
//   3. The approval names the mutation classes, lists every target ID, has not
//      expired, and was issued for 24 hours or less.
//   4. Every Product / ProductVariant / Collection ID in the request is in the
//      approved target list. Deletes are capped at 25 targets per approval.
//
// See docs/destructive-operations-policy.md.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// The repository this gate ships in. Approval files and the decision log are
// always resolved against it, whatever the caller's working directory is.
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const WRITE_APPROVAL_FILE_ENV = "SALT_SHOPIFY_WRITE_APPROVAL_FILE";
export const MAX_DELETE_TARGETS = 25;
export const MAX_APPROVAL_HOURS = 24;

export const PROTECTED_CLASSES = Object.freeze([
  "DELETE",
  "STATUS",
  "PUBLICATION",
  "PRICE",
  "COLLECTION_RULES",
  "COLLECTION_MEMBERSHIP",
  "TAGS",
  "BULK",
]);

// Mutation root fields that are always protected, whatever their input.
const ALWAYS = {
  productDelete: "DELETE",
  productsDelete: "DELETE",
  productVariantDelete: "DELETE",
  productVariantsBulkDelete: "DELETE",
  productDeleteMedia: "DELETE",
  productOptionsDelete: "DELETE",
  collectionDelete: "DELETE",
  metafieldDefinitionDelete: "DELETE",
  urlRedirectDelete: "DELETE",
  urlRedirectBulkDeleteAll: "DELETE",
  urlRedirectBulkDeleteByIds: "DELETE",
  urlRedirectBulkDeleteBySavedSearch: "DELETE",
  urlRedirectBulkDeleteBySearch: "DELETE",
  productChangeStatus: "STATUS",
  productBundleUpdate: "STATUS",
  publishablePublish: "PUBLICATION",
  publishablePublishToCurrentChannel: "PUBLICATION",
  publishableUnpublish: "PUBLICATION",
  publishableUnpublishToCurrentChannel: "PUBLICATION",
  publicationUpdate: "PUBLICATION",
  publicationDelete: "DELETE",
  productSet: "STATUS",
  productVariantsBulkReorder: "COLLECTION_MEMBERSHIP",
  collectionAddProducts: "COLLECTION_MEMBERSHIP",
  collectionAddProductsV2: "COLLECTION_MEMBERSHIP",
  collectionRemoveProducts: "COLLECTION_MEMBERSHIP",
  collectionReorderProducts: "COLLECTION_MEMBERSHIP",
  productJoinSellingPlanGroups: "COLLECTION_MEMBERSHIP",
  tagsAdd: "TAGS",
  tagsRemove: "TAGS",
  priceListFixedPricesAdd: "PRICE",
  priceListFixedPricesUpdate: "PRICE",
  priceListFixedPricesByProductUpdate: "PRICE",
  priceListFixedPricesDelete: "PRICE",
  bulkOperationRunMutation: "BULK",
};

// Mutation root fields that are protected only when their input touches a
// protected field. The check reads the field's inline arguments and the
// request variables (not the response selection, which often asks for
// `status` or `price` back). It is deliberately coarse: a protected key
// anywhere in the variables makes the write protected.
const CONDITIONAL = {
  productUpdate: [
    ["STATUS", /\bstatus\b/],
    ["TAGS", /\btags\b/],
    ["COLLECTION_MEMBERSHIP", /\bcollectionsTo(Join|Leave)\b/],
    ["DELETE", /\bdeleteConflictingConstrainedMetafields\b|\bmediaToDelete\b/],
  ],
  productCreate: [
    ["STATUS", /\bstatus\b/],
    ["TAGS", /\btags\b/],
    ["COLLECTION_MEMBERSHIP", /\bcollectionsToJoin\b/],
  ],
  productVariantsBulkUpdate: [["PRICE", /\b(price|compareAtPrice)\b/]],
  productVariantsBulkCreate: [["PRICE", /\b(price|compareAtPrice)\b/]],
  productVariantUpdate: [["PRICE", /\b(price|compareAtPrice)\b/]],
  collectionUpdate: [
    ["COLLECTION_RULES", /\b(ruleSet|rules|appliedDisjunctively|sources)\b/],
    ["COLLECTION_MEMBERSHIP", /\b(products|sortOrder)\b/],
    ["PUBLICATION", /\bpublications?\b/],
  ],
  collectionCreate: [
    ["COLLECTION_RULES", /\b(ruleSet|rules|sources)\b/],
    ["COLLECTION_MEMBERSHIP", /\bproducts\b/],
    ["PUBLICATION", /\bpublications?\b/],
  ],
};

const TARGET_TYPES = new Set(["Product", "ProductVariant", "Collection"]);

function stripComments(query) {
  return String(query || "").replace(/#[^\n]*/g, "");
}

export function isMutationDocument(query) {
  return /(^|[\s}])mutation\b/.test(stripComments(query));
}

// Returns the mutation root field names used anywhere in the document.
export function mutationFieldNames(query) {
  const text = stripComments(query);
  const names = new Set();
  for (const name of [...Object.keys(ALWAYS), ...Object.keys(CONDITIONAL)]) {
    if (new RegExp(`\\b${name}\\s*\\(`).test(text)) names.add(name);
  }
  return [...names];
}

// Text of the argument lists of every `field(...)` call in the document.
function argumentText(text, field) {
  const parts = [];
  const rx = new RegExp(`\\b${field}\\s*\\(`, "g");
  for (const m of text.matchAll(rx)) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < text.length && depth > 0) {
      if (text[i] === "(") depth += 1;
      else if (text[i] === ")") depth -= 1;
      i += 1;
    }
    parts.push(text.slice(start, i - 1));
  }
  return parts.join("\n");
}

export function classifyShopifyWrite(query, variables = {}) {
  if (!isMutationDocument(query)) return { mutation: false, classes: [], fields: [] };
  const text = stripComments(query);
  const varsText = safeJson(variables);
  const fields = mutationFieldNames(text);
  const classes = new Set();
  for (const field of fields) {
    if (ALWAYS[field]) classes.add(ALWAYS[field]);
    const args = argumentText(text, field);
    for (const [cls, rx] of CONDITIONAL[field] || []) {
      if (rx.test(args) || rx.test(varsText)) classes.add(cls);
    }
  }
  // A bulk mutation hides its inputs in a staged upload, so the inner
  // mutation is classified too and the run stays protected as BULK unless the
  // inner mutation only sets metafields.
  if (fields.includes("bulkOperationRunMutation")) {
    const inner = String(variables?.mutation || "");
    const innerFields = mutationFieldNames(inner);
    const metafieldsOnly = /\bmetafieldsSet\s*\(/.test(inner) && innerFields.length === 0;
    if (metafieldsOnly) classes.delete("BULK");
    for (const field of innerFields) {
      if (ALWAYS[field]) classes.add(ALWAYS[field]);
      const args = argumentText(inner, field);
      for (const [cls, rx] of CONDITIONAL[field] || []) if (rx.test(args)) classes.add(cls);
    }
  }
  return { mutation: true, classes: [...classes].sort(), fields };
}

export function extractTargetIds(query, variables = {}) {
  const ids = new Set();
  const rx = /gid:\/\/shopify\/([A-Za-z]+)\/(\d+)/g;
  for (const text of [String(query || ""), safeJson(variables)]) {
    for (const m of text.matchAll(rx)) if (TARGET_TYPES.has(m[1])) ids.add(`gid://shopify/${m[1]}/${m[2]}`);
  }
  return [...ids].sort();
}

export function automationContext(env = process.env) {
  const truthy = (v) => Boolean(v && v !== "0" && v !== "false");
  if (truthy(env.SALT_RELEASE_CONTEXT)) return "release pipeline (SALT_RELEASE_CONTEXT)";
  if (truthy(env.SALT_RELEASE_WATCHER_CHILD)) return "release watcher (SALT_RELEASE_WATCHER_CHILD)";
  if (truthy(env.GITHUB_ACTIONS)) return "GitHub Actions";
  if (truthy(env.CI)) return "CI";
  return "";
}

export function targetsSha256(targets) {
  return createHash("sha256").update([...targets].sort().join("\n")).digest("hex");
}

function safeJson(value) {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return "";
  }
}

// Reads the committed copy of an approval file from origin/main. Throws when
// the file is not there.
export function readApprovalFromMain(repoRoot, relPath) {
  execFileSync("git", ["-C", repoRoot, "fetch", "--quiet", "origin", "main"], { stdio: "ignore", timeout: 60_000 });
  return execFileSync("git", ["-C", repoRoot, "show", `origin/main:${relPath.split(sep).join("/")}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

export function loadApproval({ env = process.env, repoRoot = REPO_ROOT, readMainCopy = readApprovalFromMain } = {}) {
  const file = String(env[WRITE_APPROVAL_FILE_ENV] || "").trim();
  if (!file) throw new Error(`no approval file: set ${WRITE_APPROVAL_FILE_ENV} to a reviewed file in approvals/`);
  const abs = resolve(repoRoot, file);
  const rel = relative(repoRoot, abs);
  if (rel.startsWith("..") || !rel.startsWith(`approvals${sep}`)) {
    throw new Error(`approval file must live in ${resolve(repoRoot, "approvals")}`);
  }
  const local = readFileSync(abs, "utf8");
  let committed;
  try {
    committed = readMainCopy(repoRoot, rel);
  } catch (error) {
    throw new Error(`approval file ${rel} is not on origin/main; merge it through a reviewed pull request first (${error.message})`);
  }
  if (committed !== local) throw new Error(`approval file ${rel} differs from the reviewed copy on origin/main`);
  const approval = JSON.parse(local);
  return { approval, path: rel };
}

export function validateApproval(approval, { now = new Date() } = {}) {
  const problems = [];
  if (!approval || typeof approval !== "object") return ["approval is not a JSON object"];
  if (!String(approval.approvedBy || "").trim()) problems.push("approvedBy is missing");
  if (!String(approval.reason || "").trim()) problems.push("reason is missing");
  const classes = Array.isArray(approval.classes) ? approval.classes : [];
  if (!classes.length) problems.push("classes is empty");
  for (const cls of classes) if (!PROTECTED_CLASSES.includes(cls)) problems.push(`unknown class ${cls}`);
  const targets = Array.isArray(approval.targets) ? approval.targets : [];
  if (!targets.length) problems.push("targets is empty");
  if (approval.targetsSha256 !== targetsSha256(targets)) problems.push("targetsSha256 does not match targets");
  if (classes.includes("DELETE") && targets.length > MAX_DELETE_TARGETS) {
    problems.push(`DELETE approvals are capped at ${MAX_DELETE_TARGETS} targets (got ${targets.length})`);
  }
  const issued = Date.parse(approval.approvedAt);
  const expires = Date.parse(approval.expiresAt);
  if (!Number.isFinite(issued) || !Number.isFinite(expires)) problems.push("approvedAt/expiresAt are not valid dates");
  else {
    if (expires - issued > MAX_APPROVAL_HOURS * 3600_000) problems.push(`approval window is longer than ${MAX_APPROVAL_HOURS} hours`);
    if (now.getTime() < issued) problems.push("approval is not active yet");
    if (now.getTime() > expires) problems.push("approval has expired");
  }
  return problems;
}

export function logWriteDecision(entry, { repoRoot = REPO_ROOT } = {}) {
  try {
    const path = resolve(repoRoot, "output", "shopify-write-approval-log.jsonl");
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`, "utf8");
  } catch {
    // Logging must never turn a refusal into an allowed write.
  }
}

export class ShopifyWriteRefused extends Error {
  constructor(message) {
    super(message);
    this.name = "ShopifyWriteRefused";
    this.retryable = false;
  }
}

// Throws ShopifyWriteRefused unless the request is a read, an unprotected
// write, or a protected write covered by a reviewed, unexpired approval.
export function assertShopifyWriteAllowed({
  query,
  variables = {},
  operation = "Shopify request",
  env = process.env,
  repoRoot = REPO_ROOT,
  now = new Date(),
  readMainCopy = readApprovalFromMain,
} = {}) {
  const { mutation, classes, fields } = classifyShopifyWrite(query, variables);
  if (!mutation || !classes.length) return { allowed: true, classes };
  const targets = extractTargetIds(query, variables);
  const base = { operation, classes, fields, targetCount: targets.length, targetsSample: targets.slice(0, 10) };
  const refuse = (why) => {
    logWriteDecision({ ...base, decision: "refused", why }, { repoRoot });
    throw new ShopifyWriteRefused(
      `${operation}: protected Shopify write refused (${classes.join(", ")} via ${fields.join(", ")}): ${why}. ` +
        "See docs/destructive-operations-policy.md.",
    );
  };
  const context = automationContext(env);
  if (context) refuse(`protected writes never run from the ${context}`);
  let loaded;
  try {
    loaded = loadApproval({ env, repoRoot, readMainCopy });
  } catch (error) {
    refuse(error.message);
  }
  const { approval, path } = loaded;
  const problems = validateApproval(approval, { now });
  if (problems.length) refuse(`approval ${path} is invalid: ${problems.join("; ")}`);
  const missingClasses = classes.filter((cls) => !approval.classes.includes(cls));
  if (missingClasses.length) refuse(`approval ${path} does not cover ${missingClasses.join(", ")}`);
  const approved = new Set(approval.targets);
  if (!targets.length && !classes.every((cls) => cls === "BULK")) refuse("request names no target IDs, so it cannot be matched to the approval");
  const outside = targets.filter((id) => !approved.has(id));
  if (outside.length) refuse(`${outside.length} target(s) are not in approval ${path}, e.g. ${outside.slice(0, 3).join(", ")}`);
  logWriteDecision({ ...base, decision: "allowed", approval: path, approvedBy: approval.approvedBy }, { repoRoot });
  return { allowed: true, classes, approval: path };
}
