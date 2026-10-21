// Rebuilds machine-template product descriptions into clear, factual copy.
//
// Most catalog descriptions came from an earlier automated rewrite:
//   "<title> is a robe identified by the product title and supplied listing
//    details." ... "SALT catalog listing reference Ref 3HM3AW."
// They still carry a few real facts (product noun, material, size, features).
// This module keeps only those facts, adds the store's delivery and returns
// terms, and writes an answer-first summary plus FAQ that search engines and
// AI answer engines can quote. It never invents product facts. Hand-written
// descriptions are left unchanged.

import {
  DELIVERY_ESTIMATE,
  DELIVERY_EXTENDED_MAX,
  RETURN_WINDOW_DAYS,
} from "./store-promises.ts";

const TEMPLATE_MARKERS = [
  /identified by the product title/i,
  /supplied listing details/i,
  /SALT catalog listing reference/i,
  /\bRef [A-Z0-9]{6}\b/,
  /Use it (?:only )?for the (?:stated product purpose|listed)/i,
];

const META_DESCRIPTION_MAX = 155;

// Product facts stated in the supplier title or handle. Matching words only
// restates what the listing already says; nothing is inferred beyond it.
const MATERIAL_WORDS = [
  "stainless steel", "coral fleece", "faux leather", "genuine leather", "pu leather", "sterling silver", "memory foam",
  "cotton", "linen", "wool", "cashmere", "silk", "satin", "velvet", "flannel", "fleece", "denim", "leather", "suede",
  "polyester", "nylon", "spandex", "lyocell", "mesh", "lace", "chiffon", "knit", "ceramic", "porcelain", "glass",
  "bamboo", "wood", "wooden", "silicone", "rubber", "plastic", "acrylic", "metal", "aluminum", "alloy", "copper",
  "brass", "titanium", "resin", "canvas", "felt", "foam", "eva", "tpu", "abs", "pvc", "paper", "marble",
];

const FEATURE_WORDS = [
  "waterproof", "water resistant", "breathable", "adjustable", "portable", "foldable", "collapsible", "reusable",
  "rechargeable", "wireless", "bluetooth", "non-slip", "anti-slip", "quick dry", "quick drying", "lightweight",
  "heavy duty", "durable", "insulated", "leak proof", "leakproof", "polarized", "uv400", "stretch", "elastic",
  "soft", "warm", "thick", "padded", "cushioned", "magnetic", "led", "usb", "large capacity", "multifunctional",
  "handmade", "non-stick", "dishwasher safe", "microwave safe", "noise cancelling", "shockproof", "scratch resistant",
];

const AUDIENCE_PATTERNS = [
  [/\bunisex\b|\bmen (?:and )?women\b|\bmen women\b/i, "men and women"],
  [/\bwomen'?s?\b|\bladies\b|\bfemale\b/i, "women"],
  [/\bmen'?s?\b|\bmale\b/i, "men"],
  [/\bbab(?:y|ies)\b|\bnewborn\b|\binfant\b|\btoddler\b/i, "babies and toddlers"],
  [/\bkids?\b|\bchildren'?s?\b|\bchild\b|\bboys?\b|\bgirls?\b/i, "kids"],
  [/\bdogs?\b|\bpupp(?:y|ies)\b/i, "dogs"],
  [/\bcats?\b|\bkittens?\b/i, "cats"],
];

const USE_WORDS = [
  "kitchen", "bathroom", "bedroom", "living room", "office", "travel", "outdoor", "camping", "hiking", "beach",
  "gym", "yoga", "fitness", "running", "cycling", "garden", "home", "party", "wedding", "school",
];

const SEASON_WORDS = ["spring", "summer", "autumn", "fall", "winter"];

const ADJECTIVE_FEATURES = new Set([
  "waterproof", "water resistant", "breathable", "adjustable", "portable", "foldable", "collapsible", "reusable",
  "rechargeable", "wireless", "non-slip", "anti-slip", "quick dry", "quick drying", "lightweight", "heavy duty",
  "durable", "insulated", "leak proof", "leakproof", "polarized", "stretch", "elastic", "soft", "warm", "thick",
  "padded", "cushioned", "magnetic", "multifunctional", "handmade", "non-stick", "dishwasher safe", "microwave safe",
  "shockproof", "scratch resistant",
]);

// The refund policy excludes personal care and beauty goods from returns.
const PERSONAL_CARE_PATTERN =
  /\b(?:perfume|fragrance|cologne|eyeliner|mascara|lipstick|lip (?:oil|gloss|balm|plump\w*)|makeup|cosmetic|foundation|concealer|eyeshadow|blush|serum|lotion|cream|shampoo|conditioner|hair (?:oil|perfume|mask)|essential oil|skincare|skin care|nail polish|deodorant)\b/i;

// Health and medical claims need a person to check them before publishing.
export const HEALTH_CLAIM_PATTERN =
  /\b(?:pain relief|relieve|relief|cure|cures|heal|healing|treat|treatment|therapy|therapeutic|arthritis|carpal tunnel|tendonitis|plantar fasciitis|weight loss|lose weight|fat burn|slimming|detox|anti[- ]?aging|medical|clinical|fda|orthopedic|diabetic|blood pressure|sleep apnea|anxiety)\b/i;

// Category labels from an earlier rewrite that are not product names.
const GENERIC_NOUNS = /^(?:health wellness|tool|tools|accessories|kitchen accessories|garden tool|toy|product|makeup product|shopping bag|fish|cookware set)$/i;

function findWords(text, words) {
  const lower = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const found = [];
  for (const word of words) {
    const needle = ` ${word.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
    if (lower.includes(needle) && !found.some((existing) => existing.includes(word) || word.includes(existing))) {
      found.push(word);
    }
  }
  return found;
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plain(html) {
  return decode(String(html || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

export function isTemplateDescription(html) {
  const text = String(html || "");
  return TEMPLATE_MARKERS.some((pattern) => pattern.test(text));
}

function uniqueValues(raw) {
  const seen = new Set();
  return String(raw || "")
    .split(/\s*,\s*/)
    .map((value) => value.trim())
    .filter((value) => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// "Material: ceramic, Ceramic" -> { material: ["ceramic"] }
export function extractTemplateFacts(html) {
  const facts = {};
  const items = String(html || "").match(/<li>[\s\S]*?<\/li>/gi) || [];
  for (const item of items) {
    const text = plain(item);
    const match = text.match(/^([A-Za-z &/]+?):\s*(.+)$/);
    if (!match) continue;
    const label = match[1].trim().toLowerCase();
    const values = uniqueValues(match[2]);
    if (!values.length) continue;
    if (/size|capacity|dimension/.test(label)) facts.size = values;
    else if (/material|fabric/.test(label)) facts.material = values;
    else if (/feature/.test(label)) facts.features = values;
    else if (/colou?r/.test(label)) facts.color = values;
    else if (/^use|occasion|room|setting/.test(label)) facts.use = values;
    else if (/pack|quantity|count/.test(label)) facts.pack = values;
  }
  const noun = plain(html).match(/\bis an? ([a-z0-9 &'-]{3,60}?) identified by the product title/i);
  if (noun) facts.noun = noun[1].trim().toLowerCase();
  return facts;
}

// The old parser read "6-5inch" from handles as "5inch". Prefer the size the
// cleaned title states.
function reconcileSizes(sizes, title) {
  return (sizes || []).map((value) => {
    const match = value.match(/^(\d+)\s*(inch|in|cm|mm|ml|l|oz)$/i);
    if (!match) return value;
    const better = title.match(new RegExp(`\\b\\d+\\.${match[1]}\\s*${match[2]}\\b`, "i"));
    return better ? better[0] : value;
  });
}

function listToText(values) {
  if (!values.length) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

// Supplier option codes ("T0466", "N", "Style B", "2pcs 1") mean nothing to
// shoppers or search engines; only real words are listed.
function isMeaningfulOption(value) {
  const letters = value.replace(/[^a-z]/gi, "");
  return (
    letters.length >= 3 &&
    !/^(?:style|type|color|colour|model)\s*[a-z0-9]{1,3}$/i.test(value) &&
    !/\d{3,}/.test(value) &&
    !/^[a-z]+[\s-]?\d+$/i.test(value) &&
    !/\d+\s*(?:pcs?|pieces?|pairs?|packs?)\b/i.test(value)
  );
}

function optionValues(product, pattern) {
  const option = (product.options || []).find((entry) => pattern.test(String(entry?.name || "")));
  const values = option ? uniqueValues((option.values || option.optionValues?.map((value) => value.name) || []).join(",")) : [];
  return values;
}

export const DELIVERY_RETURNS_LINE =
  `Free US shipping with tracking. Delivery usually takes ${DELIVERY_ESTIMATE} ` +
  `(occasionally up to ${DELIVERY_EXTENDED_MAX} during peak periods). ` +
  `Returns are accepted within ${RETURN_WINDOW_DAYS} days of delivery for unused items in their original packaging.`;

export function rebuildProductDescription(product, cleanTitle) {
  const html = String(product?.descriptionHtml ?? product?.body_html ?? "");
  if (!isTemplateDescription(html)) {
    return { changed: false, html, metaDescription: null, needsReview: false };
  }

  const title = String(cleanTitle || product?.title || "").trim();
  const facts = extractTemplateFacts(html);
  const source = `${title} ${String(product?.handle || "").replace(/-/g, " ")}`;
  const rawNoun = facts.noun || String(product?.productType || product?.product_type || "").trim().toLowerCase();
  const noun = rawNoun && !GENERIC_NOUNS.test(rawNoun) ? rawNoun : "";
  const material = uniqueValues([...(facts.material || []), ...findWords(source, MATERIAL_WORDS)].map((value) => (/^wooden$/i.test(value) ? "wood" : value)).join(","))
    .filter((value) => !noun.includes(value.toLowerCase()))
    .slice(0, 3);
  const features = uniqueValues([...(facts.features || []), ...findWords(source, FEATURE_WORDS)].join(","))
    .filter((value, index, list) => list.findIndex((other) => other.replace(/-/g, " ").toLowerCase() === value.replace(/-/g, " ").toLowerCase()) === index)
    .filter((value) => !/^(?:automatic|manual)$/i.test(value))
    .map((value) => (/^(?:led|usb|uv400)$/i.test(value) ? value.toUpperCase() : value))
    .slice(0, 4);
  const audience = AUDIENCE_PATTERNS.filter(([pattern]) => pattern.test(title)).map(([, label]) => label);
  const uses = uniqueValues([...(facts.use || []), ...findWords(source, USE_WORDS)].map((value) => value.toLowerCase()).join(",")).slice(0, 3);
  const seasons = findWords(source, SEASON_WORDS);
  // Pack counts ("3pcs") are not sizes.
  const sizes = reconcileSizes(facts.size, title).filter(
    (value) => !/^\d+\s*(?:pcs?|pieces?|packs?|sets?|pairs?)$/i.test(value) && !/^0\s*(?:cm|mm|inch|in)$/i.test(value),
  );
  const rawColors = optionValues(product, /colou?r/i);
  const colors = rawColors.filter(isMeaningfulOption).length === rawColors.length ? rawColors.slice(0, 12) : [];
  const sizeOptions = optionValues(product, /size/i).slice(0, 12);

  // The cleaned title already names the product, so the summary opens with it
  // rather than with the old template's product-type guess.
  const name = `<strong>${escapeHtml(title)}</strong>`;
  let summary = material.length
    ? `The ${name} is made of ${escapeHtml(listToText(material))}.`
    : `Shop the ${name} at SALT.`;
  // "soft", "waterproof" describe the product; "large capacity", "LED" are things it has.
  const qualities = features.filter((value) => ADJECTIVE_FEATURES.has(value.toLowerCase()));
  const extras = features.filter((value) => !ADJECTIVE_FEATURES.has(value.toLowerCase()));
  if (qualities.length) summary += ` It is ${escapeHtml(listToText(qualities))}.`;
  if (extras.length) summary += ` It features ${escapeHtml(listToText(extras))}.`;
  const idealFor = [];
  if (audience.length) idealFor.push(`for ${listToText(audience.slice(0, 2))}`);
  if (uses.length) idealFor.push(`for ${listToText(uses)} use`);
  if (seasons.length) idealFor.push(`in ${listToText(seasons)}`);
  if (idealFor.length) summary += ` Made ${escapeHtml(idealFor.join(", "))}.`;

  const details = [];
  if (material.length) details.push(["Material", listToText(material)]);
  if (sizes.length) details.push(["Size or capacity", sizes.join(", ")]);
  if (features.length) details.push(["Features", listToText(features)]);
  if (facts.pack?.length) details.push(["Pack", facts.pack.join(", ")]);
  if (audience.length) details.push(["Made for", listToText(audience.slice(0, 2))]);
  if (uses.length) details.push(["Use", listToText(uses)]);
  if (seasons.length) details.push(["Season", listToText(seasons)]);
  if (colors.length) details.push(["Colors", colors.join(", ")]);
  if (sizeOptions.length) details.push(["Sizes", sizeOptions.join(", ")]);

  const faqs = [];
  if (material.length) {
    faqs.push(["What is it made of?", `It is made of ${listToText(material)}.`]);
  }
  if (colors.length || sizeOptions.length) {
    const parts = [];
    if (colors.length) parts.push(`colors: ${colors.join(", ")}`);
    if (sizeOptions.length) parts.push(`sizes: ${sizeOptions.join(", ")}`);
    faqs.push(["Which options are available?", `Available ${parts.join("; ")}. Choose your option above before adding to cart.`]);
  }
  faqs.push([
    "How long does delivery take?",
    `Delivery usually takes ${DELIVERY_ESTIMATE} with free, tracked US shipping. During holidays or carrier delays it can occasionally take up to ${DELIVERY_EXTENDED_MAX}.`,
  ]);
  const personalCare = PERSONAL_CARE_PATTERN.test(`${title} ${noun}`);
  faqs.push(
    personalCare
      ? [
          "Can I return it?",
          "Personal care and beauty items cannot be returned. If your order arrives damaged or you receive the wrong item, contact us and we will make it right.",
        ]
      : [
          "Can I return it?",
          `Yes. Request a return within ${RETURN_WINDOW_DAYS} days of delivery. The item must be unused and in its original packaging.`,
        ],
  );

  const out = [`<p>${summary}</p>`];
  if (details.length) {
    out.push("<h3>Key details</h3>");
    out.push(`<ul>${details.map(([label, value]) => `<li><strong>${label}:</strong> ${escapeHtml(value)}</li>`).join("")}</ul>`);
  }
  out.push("<h3>FAQs</h3>");
  for (const [question, answer] of faqs) {
    out.push(`<p><strong>${escapeHtml(question)}</strong><br>${escapeHtml(answer)}</p>`);
  }

  // Meta description: first sentence, then the store promise, within 155 chars.
  const firstSentence = plain(summary).split(/(?<=\.)\s/)[0];
  const tail = personalCare ? " Free US shipping." : ` Free US shipping, ${RETURN_WINDOW_DAYS}-day returns.`;
  const room = META_DESCRIPTION_MAX - tail.length;
  const lead =
    firstSentence.length <= room
      ? firstSentence
      : `${firstSentence.slice(0, room - 1).replace(/[\s,]+\S*$/, "")}.`;
  const metaDescription = `${lead}${tail}`;

  return {
    changed: true,
    html: out.join("\n"),
    metaDescription,
    needsReview: HEALTH_CLAIM_PATTERN.test(`${title} ${plain(html)}`),
  };
}

export function buildSeoTitle(cleanTitle) {
  const suffix = " | SALT";
  const title = String(cleanTitle || "").trim();
  if (title.length + suffix.length <= 70) return `${title}${suffix}`;
  if (title.length <= 70) return title;
  // Cut at the last comma that fits, else at a word boundary.
  const head = title.slice(0, 70);
  const comma = head.lastIndexOf(",");
  return (comma > 30 ? head.slice(0, comma) : head.replace(/\s+\S*$/, "")).trim();
}
