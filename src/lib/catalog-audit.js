// Flags product listings that are unlikely to rank, sell or be trusted, so
// they can be hidden (set to draft) instead of cluttering search, navigation
// and Google. Every flag carries a plain reason a person can check.

import { HEALTH_CLAIM_PATTERN, isTemplateDescription } from "./product-description-rebuild.js";

// Supplier listings with impossible specs draw refunds and Merchant Center
// misrepresentation flags (e.g. "500000mAh power bank", "16TB pen drive").
const IMPOSSIBLE_SPEC_RULES = [
  { pattern: /\b(\d{5,7})\s*mah\b/i, test: (match) => Number(match[1]) > 50000, label: "power bank capacity above 50,000 mAh" },
  {
    pattern: /\b(\d{1,3})\s*tb\b[^.]*\b(?:usb|flash|pen ?drive|u disk|memory stick)\b|\b(?:usb|flash|pen ?drive|u disk|memory stick)\b[^.]*\b(\d{1,3})\s*tb\b/i,
    test: (match) => Number(match[1] || match[2]) >= 2,
    label: "flash drive of 2 TB or more",
  },
];

// Trademarked names on unlicensed goods risk takedowns and Merchant Center
// suspension for counterfeit products.
const BRAND_PATTERN =
  /\b(?:hello kitty|sanrio|kuromi|cinnamoroll|my melody|disney|marvel|spider-?man|batman|naruto|pokemon|pikachu|nintendo|barbie|stitch|frozen|minecraft|roblox|poppy playtime|huggy wuggy|amazing digital circus|sprunki|nike|adidas|jordan|gucci|louis vuitton|chanel|dior|rolex|apple|airpods|iphone original|xiaomi|samsung original|hyperx|haramain|hourglass|maserati|labubu|stanley)\b/i;

const ATTRACTION_CLAIM_PATTERN = /\b(?:pheromones?|sexual(?:ly)?|flirt(?:ing)?|aphrodisiac|seduc\w*)\b/i;

const HANDLE_STOPWORDS = new Set(["for", "and", "with", "the", "a", "of", "new", "1pc", "1pcs", "2pcs", "pcs"]);

// Products that differ only in word order or a "-1" handle suffix.
export function duplicateKey(product) {
  const words = String(product?.handle || "")
    .toLowerCase()
    .replace(/-\d+$/, "")
    .split("-")
    .filter((word) => word && !HANDLE_STOPWORDS.has(word) && !/^\d+$/.test(word));
  return [...new Set(words)].sort().join(" ");
}

function listingStrength(product) {
  return (product.mediaCount?.count || 0) * 10 + Math.min(product.totalInventory || 0, 1000) / 100;
}

export function auditProduct(product) {
  const reasons = [];
  const title = String(product?.title || "");
  const text = `${title} ${String(product?.handle || "").replace(/-/g, " ")}`;
  const minPrice = Number(product?.priceRangeV2?.minVariantPrice?.amount || 0);
  const maxPrice = Number(product?.priceRangeV2?.maxVariantPrice?.amount || 0);

  if (product?.tracksInventory && Number(product?.totalInventory) <= 0) reasons.push("out of stock");
  const media = product?.mediaCount?.count ?? 0;
  if (media === 0) reasons.push("no images");
  else if (media === 1) reasons.push("only one image");
  for (const rule of IMPOSSIBLE_SPEC_RULES) {
    const match = text.match(rule.pattern);
    if (match && rule.test(match)) reasons.push(`impossible spec: ${rule.label}`);
  }
  if (BRAND_PATTERN.test(text)) reasons.push("brand or character name (trademark risk)");
  if (HEALTH_CLAIM_PATTERN.test(title)) reasons.push("health claim in name");
  if (ATTRACTION_CLAIM_PATTERN.test(text)) reasons.push("attraction claim");
  if (minPrice > 0 && minPrice < 5) reasons.push("price under $5");
  if (maxPrice > 300) reasons.push("price over $300");
  if (isTemplateDescription(product?.descriptionHtml) && !/<li>/i.test(String(product?.descriptionHtml || ""))) {
    reasons.push("description has no product details");
  }
  return reasons;
}

// Hard reasons mean the listing should be hidden; soft ones are worth a look.
const HIDE_REASONS = /^(?:out of stock|no images|impossible spec|brand or character|attraction claim|duplicate of)/;

export function auditCatalog(products) {
  const groups = new Map();
  for (const product of products) {
    const key = duplicateKey(product);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  const duplicateOf = new Map();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [keep, ...rest] = [...group].sort((left, right) => listingStrength(right) - listingStrength(left));
    for (const product of rest) duplicateOf.set(product.id, keep);
  }

  return products
    .map((product) => {
      const reasons = auditProduct(product);
      const keep = duplicateOf.get(product.id);
      if (keep) reasons.unshift(`duplicate of ${keep.handle}`);
      const action = reasons.some((reason) => HIDE_REASONS.test(reason)) ? "hide" : reasons.length ? "review" : "keep";
      return { product, reasons, action };
    })
    .filter((entry) => entry.action !== "keep");
}
