# Product content cleanup (full catalog)

Rewrites product names, descriptions, Google titles and Google descriptions
for every active product, using the rules tested on the 49-product pilot
(`src/lib/product-title-cleanup.js`, `src/lib/product-description-rebuild.js`).

What it changes: title, description, SEO title, SEO description.
What it never changes: URLs (handles), prices, images, variants, tags.
Products with health claims in their name or description are skipped and
listed for manual review. The 49 pilot products are skipped.

## Before you start

- Run from this repo on your computer, with the Shopify CLI logged in to the
  SALT store (the same setup the `shopify:seo:*` scripts use).
- `npm install` once.

## 1. Test run (changes nothing)

```bash
npm run shopify:content-cleanup:dry-run
```

This reads every active product and writes three files to
`output/content-cleanup/`:

- `review-<time>.csv`: current name, new name, new Google title, new
  description, one row per product. Open it in Excel or Google Sheets.
- `backup-<time>.json`: the current content of every product that would
  change.
- `plan-<time>.json`: the exact changes.

## 2. Apply a small batch first

```bash
npm run shopify:content-cleanup:apply -- --plan output/content-cleanup/plan-<time>.json --limit 200
```

Check a few of those products on the live site. Each product is re-read
first and skipped if anyone edited it after the test run.

## 3. Apply the rest

```bash
npm run shopify:content-cleanup:apply -- --plan output/content-cleanup/plan-<time>.json
```

Products already updated in step 2 are skipped automatically because they no
longer match the backup. A log is written next to the plan.

## Undo

```bash
# everything in a backup
npm run shopify:content-cleanup:restore -- --backup output/content-cleanup/backup-<time>.json
# specific products
npm run shopify:content-cleanup:restore -- --backup output/content-cleanup/backup-<time>.json --ids gid://shopify/Product/123,gid://shopify/Product/456
```
