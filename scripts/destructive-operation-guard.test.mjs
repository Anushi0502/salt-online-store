// @vitest-environment node

import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  APPROVAL_ENV,
  MAX_ITEMS_PER_RUN,
  assertHumanApprovedDestructiveRun,
  expectedApprovalToken,
  logDestructiveOperation,
  refusePolicyForbiddenProductDeletion,
} from "./destructive-operation-guard.mjs";

const now = new Date("2026-11-07T12:00:00Z");

test("refuses without an explicit approval token", () => {
  assert.throws(
    () => assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: 2, env: {}, now }),
    /needs explicit human approval/,
  );
});

test("accepts only the exact operation, count and date", () => {
  const token = expectedApprovalToken("collection-retire", 2, now);
  assert.equal(token, "collection-retire:2:2026-11-07");
  assert.doesNotThrow(() =>
    assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: 2, env: { [APPROVAL_ENV]: token }, now }),
  );
  assert.throws(
    () => assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: 3, env: { [APPROVAL_ENV]: token }, now }),
    /needs explicit human approval/,
  );
  const yesterday = new Date("2026-11-08T12:00:00Z");
  assert.throws(
    () => assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: 2, env: { [APPROVAL_ENV]: token }, now: yesterday }),
    /needs explicit human approval/,
  );
});

test("is always blocked inside the release pipeline, the watcher and CI", () => {
  const token = expectedApprovalToken("collection-retire", 1, now);
  for (const env of [
    { SALT_RELEASE_CONTEXT: "1", [APPROVAL_ENV]: token },
    { SALT_RELEASE_WATCHER_CHILD: "1", [APPROVAL_ENV]: token },
    { CI: "true", [APPROVAL_ENV]: token },
    { GITHUB_ACTIONS: "true", [APPROVAL_ENV]: token },
  ]) {
    assert.throws(() => assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: 1, env, now }), /blocked/);
  }
});

test("limits each approved run to small batches", () => {
  const count = MAX_ITEMS_PER_RUN + 1;
  const token = expectedApprovalToken("collection-retire", count, now);
  assert.throws(
    () => assertHumanApprovedDestructiveRun({ operation: "collection-retire", plannedCount: count, env: { [APPROVAL_ENV]: token }, now }),
    /limit is/,
  );
});

test("product deletion for missing cost or images is always refused", () => {
  assert.throws(() => refusePolicyForbiddenProductDeletion("missing variant cost"), /disabled by SALT store policy/);
  assert.throws(() => refusePolicyForbiddenProductDeletion("no product images"), /disabled by SALT store policy/);
});

test("appends a JSON line for every destructive attempt", async () => {
  const dir = await mkdtemp(join(tmpdir(), "salt-guard-"));
  const logPath = join(dir, "log.jsonl");
  await logDestructiveOperation({ operation: "collection-retire", status: "refused" }, { logPath });
  await logDestructiveOperation({ operation: "collection-retire", status: "approved" }, { logPath });
  const lines = (await readFile(logPath, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(lines.length, 2);
  assert.equal(lines[0].status, "refused");
  assert.ok(lines[1].at);
});
