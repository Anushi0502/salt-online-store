# Destructive Shopify operations policy

Adopted 2026-11-07 after the 25 Oct – 6 Nov 2026 catalog loss.

## Background

Shopify's event log for the store records about 16,450 permanent product deletions between 25 Oct and 6 Nov 2026:

| Date (shop time) | Deleted | Recorded as |
|---|---|---|
| Oct 25 | 5,215 | Shopify Web (staff user) |
| Oct 26 | 229 | Shopify Web |
| Oct 28 | 169 | Shopify Web |
| Nov 3 | 5,614 | Shopify CLI Connector App, then Shopify Web |
| Nov 5 | 43 | Shopify Web |
| Nov 6, 12:05–12:11 | 5,179 | Shopify CLI Connector App |

The CLI-attributed deletions match the automation in this repository:

- `scripts/shopify-admin-graphql-client.mjs` authenticates with a token minted from the Shopify CLI client ID (`scripts/refresh-shopify-token.mjs`), or falls back to `shopify store execute`. Shopify attributes both to "Shopify CLI Connector App".
- `scripts/release.mjs` permanently deleted products with a missing variant cost (`shopify:products:missing-cost:apply`) and products with no images (`shopify:products:zero-images:apply`), in both the catalog and product profiles. It also pre-set the deletion approval environment variables itself.
- `scripts/realtime-release-watcher.mjs`, installed as a macOS LaunchAgent (`com.salt.online-store.release-watcher`), polls every 5 minutes. On any product update or collection-count drift, it starts a full release automatically.

## Rules

1. **Products are never deleted automatically.**
   - A missing cost, missing images or an incomplete description is never a reason to delete.
   - The two deletion scripts now only produce reports; `--apply` always refuses.
2. **No destructive step runs inside a release.**
   - The release sets `SALT_RELEASE_CONTEXT=1`, and the guard refuses any destructive operation while it is set.
   - The release no longer deletes products, drafts products in bulk, merges or unpublishes collections, or runs the tag/collection cleanup apply.
3. **The release watcher only reports.**
   - It never starts a release unless `SALT_RELEASE_WATCHER_AUTORUN=1` is set for a supervised session.
4. **Any remaining destructive operation** (for example retiring duplicate collections in `shopify-tag-collection-cleanup.mjs`) needs:
   - a dry run reviewed by a person;
   - `SALT_DESTRUCTIVE_OPERATION_APPROVAL="<operation>:<exact count>:<YYYY-MM-DD>"`, typed by a person for that single run;
   - no more than 25 items per run;
   - no CI, no release pipeline and no watcher.
5. **Every destructive attempt**, refused or approved, is appended to `output/destructive-operations-log.jsonl`.

## Approval gate for protected writes (added 2026-11-07)

`scripts/shopify-write-approval-gate.mjs` checks every GraphQL request before it is sent. It runs in the shared client and in the five scripts that have their own transport:
- `ensure-shopify-finance-redirect`
- `ensure-shopify-product-metafields`
- `shopify-catalog-taxonomy-apply`
- `shopify-orders-bundle-update`
- `shopify-seo-batch-update`

| Class | Examples |
|---|---|
| DELETE | productDelete, collectionDelete, variant/media/redirect/metafield-definition deletes |
| STATUS | productChangeStatus, productSet, productUpdate with `status` |
| PUBLICATION | publishablePublish / Unpublish |
| PRICE | variant updates with `price` or `compareAtPrice` |
| COLLECTION_RULES | collectionUpdate/Create with rules or sources |
| COLLECTION_MEMBERSHIP | collectionAdd/Remove/ReorderProducts, productUpdate with collectionsToJoin/Leave |
| TAGS | tagsAdd, tagsRemove, productUpdate with `tags` |
| BULK | bulkOperationRunMutation, unless the inner mutation only sets metafields |

A protected write is refused:
- inside the release pipeline, the release watcher, or CI / GitHub Actions, even with an approval;
- unless `SALT_SHOPIFY_WRITE_APPROVAL_FILE` names a file in `approvals/` that:
  - is identical to its copy on `origin/main`;
  - is unexpired, with a window of 24 hours or less;
  - lists the class;
  - lists every Product/Variant/Collection ID in the request.
- DELETE approvals are capped at 25 IDs.

Reads and SEO/metafield-only writes are not gated. See `approvals/README.md`.

The release no longer applies these steps. It runs their dry runs only:
- full-catalog collection-rule reconciliation;
- cost-band repricing;
- publication to all channels (full catalog and new cohort);
- the daily collection shuffle;
- governed collection-source repair.

The verify steps that only pass after those writes were removed with them. Run each apply by hand with an approval.

The watcher LaunchAgent installer refuses to run unless `SALT_ALLOW_RELEASE_WATCHER_INSTALL=I_HAVE_WRITTEN_OWNER_APPROVAL` is set.

Limits: this protects against this repository's own scripts. It does not stop someone who holds a valid Shopify token from calling the API directly. Credential rotation and branch protection on `main` remain required.

## What to do on each machine

On any Mac that ran the SALT release automation:

```sh
launchctl list | grep com.salt
launchctl bootout gui/$(id -u)/com.salt.online-store.release-watcher 2>/dev/null
launchctl bootout gui/$(id -u)/com.salt.online-store.release 2>/dev/null
launchctl bootout gui/$(id -u)/com.salt.full-catalog-release-now 2>/dev/null
ls ~/Library/LaunchAgents | grep com.salt   # move these files out of the folder
```

Before rotating the Shopify CLI refresh token or uninstalling the Shopify CLI Connector App, keep these: `/tmp/salt-full-catalog-release-now.log`, `/tmp/salt-full-catalog-release-now.err.log` and the `output/` folder. They are the remaining evidence of which release runs deleted products.
