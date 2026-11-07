import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertShopifyWriteAllowed,
  classifyShopifyWrite,
  extractTargetIds,
  targetsSha256,
  WRITE_APPROVAL_FILE_ENV,
} from "./shopify-write-approval-gate.mjs";

const P1 = "gid://shopify/Product/1001";
const P2 = "gid://shopify/Product/1002";
const C1 = "gid://shopify/Collection/2001";
const V1 = "gid://shopify/ProductVariant/3001";
const NOW = new Date("2026-11-08T10:00:00Z");

function repoWithApproval(approval, { onMain = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "salt-gate-"));
  mkdirSync(join(root, "approvals"), { recursive: true });
  const text = JSON.stringify(approval, null, 2);
  writeFileSync(join(root, "approvals", "a.json"), text);
  const readMainCopy = () => {
    if (!onMain) throw new Error("not found");
    return text;
  };
  return { root, readMainCopy, env: { [WRITE_APPROVAL_FILE_ENV]: "approvals/a.json" } };
}

function approval(overrides = {}) {
  const targets = overrides.targets || [P1];
  return {
    approvedBy: "store owner",
    reason: "test",
    classes: ["STATUS"],
    targets,
    targetsSha256: targetsSha256(targets),
    approvedAt: "2026-11-08T09:00:00Z",
    expiresAt: "2026-11-08T21:00:00Z",
    ...overrides,
    ...(overrides.targets ? { targetsSha256: targetsSha256(overrides.targets) } : {}),
  };
}

const DELETE = `mutation D($id: ID!) { productDelete(input: { id: $id }) { deletedProductId } }`;
const DRAFT = `mutation S($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id } } }`;
const UNPUBLISH = `mutation U($id: ID!, $i: [PublicationInput!]!) { publishableUnpublish(id: $id, input: $i) { userErrors { message } } }`;
const REPRICE = `mutation R($pid: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $pid, variants: $v) { userErrors { message } } }`;
const REMAP = `mutation C($c: CollectionInput!) { collectionUpdate(input: $c) { collection { id } } }`;
const SEO_ONLY = `mutation S($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id } } }`;
const BULK = `mutation B($mutation: String!, $stagedUploadPath: String!) { bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) { bulkOperation { id } } }`;

describe("classifyShopifyWrite", () => {
  it("treats reads as unprotected", () => {
    expect(classifyShopifyWrite(`query { products(first: 1) { nodes { id } } }`).mutation).toBe(false);
  });

  it("flags delete, draft, unpublish, reprice and remap", () => {
    expect(classifyShopifyWrite(DELETE, { id: P1 }).classes).toEqual(["DELETE"]);
    expect(classifyShopifyWrite(DRAFT, { p: { id: P1, status: "DRAFT" } }).classes).toEqual(["STATUS"]);
    expect(classifyShopifyWrite(UNPUBLISH, { id: P1, i: [] }).classes).toEqual(["PUBLICATION"]);
    expect(classifyShopifyWrite(REPRICE, { pid: P1, v: [{ id: V1, price: "9.99" }] }).classes).toEqual(["PRICE"]);
    expect(classifyShopifyWrite(REMAP, { c: { id: C1, ruleSet: { rules: [] } } }).classes).toEqual(["COLLECTION_RULES"]);
  });

  it("lets SEO-only product updates and metafield-only bulk runs through", () => {
    expect(classifyShopifyWrite(SEO_ONLY, { p: { id: P1, seo: { title: "x" } } }).classes).toEqual([]);
    const inner = `mutation M($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { userErrors { message } } }`;
    expect(classifyShopifyWrite(BULK, { mutation: inner, stagedUploadPath: "x" }).classes).toEqual([]);
  });

  it("keeps opaque bulk product updates protected", () => {
    const inner = `mutation M($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } } }`;
    expect(classifyShopifyWrite(BULK, { mutation: inner, stagedUploadPath: "x" }).classes).toContain("BULK");
  });

  it("extracts only product, variant and collection targets", () => {
    expect(extractTargetIds(UNPUBLISH, { id: P1, i: [{ publicationId: "gid://shopify/Publication/9" }] })).toEqual([P1]);
  });
});

describe("assertShopifyWriteAllowed", () => {
  const draft = { query: DRAFT, variables: { p: { id: P1, status: "DRAFT" } }, now: NOW };

  it("refuses protected writes with no approval file", () => {
    const { root } = repoWithApproval(approval());
    expect(() => assertShopifyWriteAllowed({ ...draft, env: {}, repoRoot: root })).toThrow(/no approval file/);
  });

  it("refuses inside the release pipeline, watcher and CI even with an approval", () => {
    const { root, env, readMainCopy } = repoWithApproval(approval());
    for (const extra of [{ SALT_RELEASE_CONTEXT: "1" }, { SALT_RELEASE_WATCHER_CHILD: "1" }, { CI: "true" }, { GITHUB_ACTIONS: "true" }]) {
      expect(() => assertShopifyWriteAllowed({ ...draft, env: { ...env, ...extra }, repoRoot: root, readMainCopy })).toThrow(/never run from/);
    }
  });

  it("refuses an approval that is not on origin/main", () => {
    const { root, env, readMainCopy } = repoWithApproval(approval(), { onMain: false });
    expect(() => assertShopifyWriteAllowed({ ...draft, env, repoRoot: root, readMainCopy })).toThrow(/not on origin\/main/);
  });

  it("refuses a locally edited approval", () => {
    const { root, env } = repoWithApproval(approval());
    const readMainCopy = () => "{}";
    expect(() => assertShopifyWriteAllowed({ ...draft, env, repoRoot: root, readMainCopy })).toThrow(/differs/);
  });

  it("refuses expired, over-long, wrong-class and out-of-scope approvals", () => {
    const cases = [
      [approval({ expiresAt: "2026-11-08T09:30:00Z" }), /expired/],
      [approval({ expiresAt: "2026-11-10T09:00:00Z" }), /longer than 24 hours/],
      [approval({ classes: ["PRICE"] }), /does not cover STATUS/],
      [approval({ targets: [P2] }), /not in approval/],
      [{ ...approval(), targetsSha256: "bad" }, /targetsSha256/],
    ];
    for (const [a, rx] of cases) {
      const { root, env, readMainCopy } = repoWithApproval(a);
      expect(() => assertShopifyWriteAllowed({ ...draft, env, repoRoot: root, readMainCopy })).toThrow(rx);
    }
  });

  it("caps delete approvals at 25 targets", () => {
    const targets = Array.from({ length: 26 }, (_, i) => `gid://shopify/Product/${5000 + i}`);
    const { root, env, readMainCopy } = repoWithApproval(approval({ classes: ["DELETE"], targets }));
    expect(() =>
      assertShopifyWriteAllowed({ query: DELETE, variables: { id: targets[0] }, now: NOW, env, repoRoot: root, readMainCopy }),
    ).toThrow(/capped at 25/);
  });

  it("allows a reviewed, unexpired approval that covers every target, and logs it", () => {
    const { root, env, readMainCopy } = repoWithApproval(approval());
    expect(assertShopifyWriteAllowed({ ...draft, env, repoRoot: root, readMainCopy }).allowed).toBe(true);
    const log = readFileSync(join(root, "output", "shopify-write-approval-log.jsonl"), "utf8");
    expect(log).toMatch(/"decision":"allowed"/);
  });

  it("does not need an approval for unprotected writes", () => {
    expect(
      assertShopifyWriteAllowed({ query: SEO_ONLY, variables: { p: { id: P1, seo: { title: "x" } } }, env: { SALT_RELEASE_CONTEXT: "1" } }).allowed,
    ).toBe(true);
  });
});

describe("selection sets do not trigger protection", () => {
  it("ignores status and price that are only read back", () => {
    const q = `mutation V($pid: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $pid, variants: $v) { productVariants { id price compareAtPrice } } }`;
    expect(classifyShopifyWrite(q, { pid: P1, v: [{ id: V1, metafields: [] }] }).classes).toEqual([]);
    const p = `mutation P($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id status tags } } }`;
    expect(classifyShopifyWrite(p, { p: { id: P1, seo: { title: "x" } } }).classes).toEqual([]);
  });

  it("still catches protected fields written inline", () => {
    const q = `mutation { productUpdate(product: { id: "${P1}", status: DRAFT }) { product { id } } }`;
    expect(classifyShopifyWrite(q).classes).toEqual(["STATUS"]);
  });
});
