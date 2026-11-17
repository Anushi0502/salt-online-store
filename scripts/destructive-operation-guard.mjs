// Store-safety guard for destructive Shopify operations.
//
// Policy (adopted 2026-11-07 after the Oct 25 – Nov 6 product-loss incident):
//   1. Products are never deleted automatically. Missing cost, missing images
//      or incomplete descriptions are never a reason to delete a product.
//   2. No destructive operation (product deletion, collection deletion,
//      unpublishing) may run inside the release pipeline, the release
//      watcher, a LaunchAgent or CI.
//   3. Any destructive operation that is still allowed needs a fresh, explicit
//      human approval that names the operation, the exact item count from the
//      dry run and today's date, and it is limited to small batches.
//   4. Every destructive attempt is appended to an operation log.
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { userInfo, hostname } from "node:os";

export const APPROVAL_ENV = "SALT_DESTRUCTIVE_OPERATION_APPROVAL";
export const RELEASE_CONTEXT_ENV = "SALT_RELEASE_CONTEXT";
export const MAX_ITEMS_PER_RUN = 25;

const rootDir = resolve(import.meta.dirname, "..");
export const destructiveLogPath = resolve(rootDir, "output", "destructive-operations-log.jsonl");

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function expectedApprovalToken(operation, plannedCount, now = new Date()) {
  return `${operation}:${plannedCount}:${todayKey(now)}`;
}

function isTruthy(value) {
  return ["1", "true", "yes"].includes(String(value || "").trim().toLowerCase());
}

/**
 * Throws unless a human approved this exact destructive run.
 * Never call this to "pre-approve" anything; the token must be typed by a
 * person after reviewing the dry-run manifest.
 */
export function assertHumanApprovedDestructiveRun({ operation, plannedCount, env = process.env, now = new Date() }) {
  if (!operation) throw new Error("Destructive guard: operation name is required.");
  const count = Number(plannedCount);
  if (!Number.isInteger(count) || count < 0) throw new Error("Destructive guard: plannedCount must be a whole number.");
  if (isTruthy(env[RELEASE_CONTEXT_ENV]) || isTruthy(env.SALT_RELEASE_WATCHER_CHILD)) {
    throw new Error(`Destructive operation "${operation}" is blocked inside the release pipeline and release watcher. Run it manually after review.`);
  }
  if (isTruthy(env.CI) || isTruthy(env.GITHUB_ACTIONS)) {
    throw new Error(`Destructive operation "${operation}" is blocked in CI.`);
  }
  if (count > MAX_ITEMS_PER_RUN) {
    throw new Error(`Destructive operation "${operation}" planned ${count} items; the limit is ${MAX_ITEMS_PER_RUN} per approved run. Split the work into reviewed batches.`);
  }
  const expected = expectedApprovalToken(operation, count, now);
  const provided = String(env[APPROVAL_ENV] || "").trim();
  if (provided !== expected) {
    throw new Error(
      `Destructive operation "${operation}" needs explicit human approval. Review the dry-run manifest, then set ${APPROVAL_ENV}="${expected}" for this single run.`,
    );
  }
  return { operation, plannedCount: count, approvedToken: expected };
}

/** Product deletion for these reasons is forbidden by store policy. */
export function refusePolicyForbiddenProductDeletion(reason) {
  throw new Error(
    `Permanent product deletion because of "${reason}" is disabled by SALT store policy (2026-11-07). ` +
      "Run the dry-run to get a report, then fix the product data or set individual products to Draft after human review.",
  );
}

export async function logDestructiveOperation(entry, { logPath = destructiveLogPath } = {}) {
  let user = "";
  try {
    user = userInfo().username;
  } catch {
    user = "";
  }
  const record = {
    at: new Date().toISOString(),
    host: hostname(),
    user,
    pid: process.pid,
    argv: process.argv.slice(1),
    ...entry,
  };
  await mkdir(dirname(logPath), { recursive: true });
  await appendFile(logPath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}
