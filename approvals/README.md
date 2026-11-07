# Approvals for protected Shopify writes

A script may delete, draft, unpublish, publish, reprice, retag, remap or
reorder live Shopify products and collections only with an approval file from
this folder. `scripts/shopify-write-approval-gate.mjs` enforces this for every
script that talks to Shopify Admin.

## How a protected run is approved

1. Run the script's dry run and save its plan.
2. Write `approvals/<date>-<short-name>.json` (see `example.json.txt`):
   - `classes`: which kinds of write are approved: `DELETE`, `STATUS`, `PUBLICATION`, `PRICE`, `COLLECTION_RULES`, `COLLECTION_MEMBERSHIP`, `TAGS`, `BULK`.
   - `targets`: every Product, ProductVariant and Collection ID the run may touch.
   - `targetsSha256`: `node -e 'import("./scripts/shopify-write-approval-gate.mjs").then(m=>console.log(m.targetsSha256(JSON.parse(require("fs").readFileSync("approvals/FILE.json","utf8")).targets)))'`.
   - `approvedBy`, `reason`, `approvedAt`, `expiresAt`. The window is at most 24 hours.
   - A `DELETE` approval covers at most 25 targets.
3. Open a pull request with the file. The store owner reviews it (CODEOWNERS) and merges it into `main`.
4. On the machine that runs the script, update from `main`. Then run the script by hand, outside the release pipeline, the watcher and CI:
   `SALT_SHOPIFY_WRITE_APPROVAL_FILE=approvals/<file>.json npm run <script>:apply`

The gate refuses the write when any of these is true:
- the file is missing;
- the file differs from the copy on `origin/main`;
- the file has expired;
- the file doesn't list the write's class;
- the request touches an ID that isn't in `targets`.

Every decision is appended to `output/shopify-write-approval-log.jsonl`.

## Limits

- This is a code-level control. Anyone with a valid Shopify token can still write directly to Shopify, for example with their own script or `shopify store execute`. Revoking and re-issuing tokens remains the real control.
- For `bulkOperationRunMutation`, the gate checks the class, but the per-product data in the staged upload file is not checked.
- The review requirement only works if branch protection on `main` requires code-owner review.
