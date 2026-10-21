// Rebuilds readable, specific product titles from Shopify product data.
//
// Problems found in the live catalog:
// 1. Template titles from an earlier automated rewrite, e.g.
//    "Unisex Sleepwear For Daily And Casual Outfit Styling Robe". They drop
//    the real product details and repeat across many products.
// 2. Shortened titles with a generic category tacked on, e.g.
//    "Compression Arthritis Gloves Health Wellness".
// 3. Raw supplier titles with broken possessives ("Men S"), repeated words,
//    years, filler, leading pack counts and cut-off endings.
//
// The product handle still carries the original supplier title, so (1) and
// (2) are rebuilt from the handle. Titles with none of these problems are
// returned unchanged.

const MAX_TITLE_LENGTH = 70;

const TEMPLATE_PHRASES = [
  /\bfor daily and casual outfit styling\b/i,
  /\bfor formal and occasion looks\b/i,
  /\bfor work and weekend looks\b/i,
  /\bfor styling and daily use\b/i,
  /\bfor outfit styling and gifting\b/i,
  /\bfor daily wear and everyday fragrance\b/i,
  /\bfor day and evening wear\b/i,
  /\bfor hair styling and outfit detail\b/i,
  /\band everyday style\b/i,
  /\band wardrobe use\b/i,
];

const POSSESSIVE_WORDS = new Set(["man", "men", "woman", "women", "children", "child", "kid", "kids", "girl", "girls", "boy", "boys", "lady", "baby"]);

const POSSESSIVE_FIXES = new Map([
  ["mens", "Men's"],
  ["womens", "Women's"],
  ["childrens", "Children's"],
]);

const BROKEN_POSSESSIVE = /\b(?:man|men|woman|women|children|child|kids?|girls?|boys?|lady|baby)\s+s\b/i;

const LEADING_FILLER = new Set(["new", "hot", "top", "best", "fashion", "fashionable", "stylish", "trendy", "a", "an", "the"]);

// Verbs and fragments from supplier sentences ("Eyeliner Is Smooth").
const DROP_WORDS = new Set(["is", "are", "there", "this", "our"]);

// Words that read as cut off when a long title is shortened.
const WEAK_TRAILING = new Set(["sun", "leave", "head", "man", "woman", "top", "style", "fashion", "new", "automatic", "female", "male", "random", "instant", "cute", "adorable"]);

// "1 2pcs", "1-3 Pcs", "2Pcs/set", "1 10 Pair Of", "5pcs"
const LEADING_COUNT = /^(?:\d+\s+)*\d+\s*(?:pcs?|pieces?|pairs?|packs?|sets?)(?:\s*\/\s*sets?)?(?:\s+sets?)?(?:\s+of)?\b/i;

// Marketing filler that adds nothing for shoppers or search engines.
const FILLER_PHRASES = /\b(?:hot sale|high[\s-]quality|good quality|top quality|best quality|free shipping|random(?:ly)? (?:model|color|colour|shipped)|promotional|cheap|dropshipping|wholesale|best[\s-]selling)\b/gi;

const YEAR = /\b(?:19|20)\d{2}\b/g;

// Words that cannot end a title.
const DANGLING_END = new Set([
  "and", "or", "for", "with", "of", "the", "a", "an", "to", "in", "on", "at", "by", "from", "de", "la", "le",
  "anti", "non", "high", "low", "multi", "super", "extra", "ultra", "s", "t", "without", "is", "are",
]);

const KEEP_UPPER = new Set([
  "uv", "uv400", "upf", "upf50", "upf50+", "led", "usb", "bpa", "pu", "pvc", "eva", "tpu", "abs", "diy", "3d", "2d",
  "rgb", "hd", "lcd", "xl", "xxl", "xs", "nfc", "ac", "dc", "aaa", "aa", "tf", "fg", "ag", "mma", "bbq", "pp",
  "eu", "us", "uk", "mtb", "y2k", "ss26", "ss25",
]);

const SPECIAL_CASE = new Map([
  ["iphone", "iPhone"],
  ["ipad", "iPad"],
  ["airpods", "AirPods"],
  ["macbook", "MacBook"],
]);

const LOWER_WORDS = new Set(["and", "or", "for", "with", "of", "the", "a", "an", "to", "in", "on", "at", "by", "from"]);

export function isTemplateTitle(title) {
  const value = String(title || "");
  return TEMPLATE_PHRASES.some((pattern) => pattern.test(value));
}

function words(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/[’`]/g, "'")
    .replace(/\bt[\s-]+shirts?\b/gi, (match) => (/s$/i.test(match) ? "T-Shirts" : "T-Shirt"))
    .replace(/\btee(s)?\b(?![-\s]+shirt)/gi, (_, plural) => (plural ? "T-Shirts" : "T-Shirt"))
    .replace(/\bnon[\s-]+(?=stick|slip|skid)/gi, "Non-")
    .replace(/\b([voa])[\s-]+(neck|line)\b/gi, (_, letter, part) => `${letter.toUpperCase()}-${part}`)
    // Handles lose decimal points: "6-5inch" means 6.5 inch, "0-05mm" 0.05mm.
    .replace(/\b(\d+)[\s-]+(\d)(inch|in|cm|mm|ml|l|oz)\b/gi, "$1.$2$3")
    .replace(/\b0[\s-]+(\d+)(inch|in|cm|mm|ml|l|oz)\b/gi, "0.$1$2")
    .replace(FILLER_PHRASES, " ")
    .replace(/[^A-Za-z0-9'+.&-]+/g, " ")
    .replace(/(?<![A-Za-z])-|-(?![A-Za-z])/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[.']+|[.']+$/g, ""))
    .filter((word) => word && !DROP_WORDS.has(word.toLowerCase()));
}

function stem(word) {
  const lower = word.toLowerCase().replace(/'s$/, "");
  if (lower.length > 4 && lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.length > 3 && lower.endsWith("es") && /(?:ch|sh|ss|x|z)es$/.test(lower)) return lower.slice(0, -2);
  if (lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function fixPossessives(list) {
  const out = [];
  for (let index = 0; index < list.length; index += 1) {
    const word = list[index];
    const lower = word.toLowerCase();
    const next = list[index + 1]?.toLowerCase();
    // "Men S Shirt" -> "Men's Shirt"
    if (next === "s" && POSSESSIVE_WORDS.has(lower)) {
      out.push(`${word}'s`);
      index += 1;
      continue;
    }
    if (POSSESSIVE_FIXES.has(lower)) {
      out.push(POSSESSIVE_FIXES.get(lower));
      continue;
    }
    out.push(word);
  }
  return out;
}

// Joined length of a word list.
function joinedLength(list) {
  return list.join(" ").length;
}

// Handles and over-long supplier titles repeat their main noun
// ("Night Light ... Night Light"); drop every later repeat there.
function dropRepeatedPairs(list) {
  const pairs = new Set();
  const out = [];
  for (let index = 0; index < list.length; index += 1) {
    const pair = `${stem(list[index])} ${stem(list[index + 1] || "")}`;
    if (index + 1 < list.length && pairs.has(pair)) {
      // "Case for iPhone 16" after "iPhone 16" would leave "Case for".
      if (out.length && LOWER_WORDS.has(out[out.length - 1].toLowerCase())) out.pop();
      index += 1;
      continue;
    }
    if (index + 1 < list.length) pairs.add(pair);
    out.push(list[index]);
  }
  return out;
}

function dropAllRepeats(list) {
  const seen = new Set();
  return dropRepeatedPairs(list).filter((word, index, pairless) => {
    const key = stem(word);
    if (key.length <= 2 || /^\d/.test(key)) return true;
    // Model names repeat with different numbers ("iPhone 16 ... iPhone 15").
    if (/^\d/.test(pairless[index + 1] || "")) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dropRepeats(list) {
  const out = [];
  const seen = new Set();
  list.forEach((word, index) => {
    const key = stem(word);
    // Single letters left over from stripped punctuation ("T T T").
    if (key.length === 1 && !/\d/.test(key) && key !== "&") return;
    const previous = out.length ? stem(out[out.length - 1]) : "";
    // "Wig Wig", "Square Square"
    if (key === previous && !/^\d/.test(key)) return;
    // A repeat tacked on at the end reads as spam ("Sunglasses ... Sunglasses").
    // Repeats inside the title usually carry meaning ("Lip Plump ... Lip Oil").
    if (index === list.length - 1 && key.length > 2 && !/^\d/.test(key) && seen.has(key)) return;
    seen.add(key);
    out.push(word);
  });
  return out;
}

function stripLeadingFiller(list) {
  let result = [...list];
  for (let guard = 0; guard < 4 && result.length > 2; guard += 1) {
    const match = result.join(" ").match(LEADING_COUNT);
    if (match) {
      const consumed = match[0].trim().split(/\s+/).length;
      result = result.slice(consumed);
      continue;
    }
    if (LEADING_FILLER.has(result[0].toLowerCase())) {
      result = result.slice(1);
      continue;
    }
    break;
  }
  return result;
}

function trimToLength(list, maxLength) {
  const out = [];
  let length = 0;
  for (const word of list) {
    const nextLength = length + (out.length ? 1 : 0) + word.length;
    if (nextLength > maxLength) break;
    out.push(word);
    length = nextLength;
  }
  const wasCut = out.length < list.length;
  const isLoose = (word) =>
    DANGLING_END.has(word.toLowerCase()) ||
    word === "&" ||
    (wasCut && (/^\d+$/.test(word) || WEAK_TRAILING.has(word.toLowerCase())));
  while (out.length > 2 && isLoose(out[out.length - 1])) {
    out.pop();
  }
  return out;
}

function casing(word, index) {
  const lower = word.toLowerCase();
  if (SPECIAL_CASE.has(lower)) return SPECIAL_CASE.get(lower);
  if (KEEP_UPPER.has(lower)) return lower.toUpperCase();
  if (/^t-shirts?$/i.test(word)) return /s$/i.test(word) ? "T-Shirts" : "T-Shirt";
  if (/^\d+(?:\.\d+)?inch$/i.test(word)) return word.replace(/inch$/i, " Inch");
  // Sizes and quantities: 100ml, 20oz, 30cm
  if (/^\d+(?:\.\d+)?[a-z]+$/i.test(word)) return lower;
  if (index > 0 && LOWER_WORDS.has(lower)) return lower;
  if (/'s$/i.test(word)) return word.charAt(0).toUpperCase() + word.slice(1, -2).toLowerCase() + "'s";
  return word
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

function handleWords(handle) {
  return words(String(handle || "").replace(/-+/g, " ").replace(/\s\d+$/, ""));
}

// Shortened titles end with a generic category the handle never mentions
// ("... Velvet Cotton Slippers Shoes", "... Gloves Health Wellness").
function hasForeignCategorySuffix(titleList, handle) {
  const handleStems = new Set(handleWords(handle).map(stem));
  if (handleStems.size < 4 || titleList.length < 2) return false;
  return titleList.slice(-2).some((word) => !/\d/.test(word) && !handleStems.has(stem(word)));
}

// Hand-curated titles ("Men's Plain Black Gym T-Shirt") are left alone.
// Comma-separated names ("Wood Sunglasses, Polarized UV400") are how
// hand-written titles read; supplier titles almost never use them.
function looksCurated(title) {
  return /\b[A-Z][a-z]+'s\b/.test(title) || /\s&\s/.test(title) || /\w, [A-Z0-9]/.test(title);
}

// Supplier titles sometimes lose their first word ("Rate Monitor Strap" for
// handle "1pc-heart-rate-monitor-strap"). Restore up to two dropped words.
function restoreDroppedLead(list, handle) {
  if (list.length < 2 || !handle) return list;
  const source = stripLeadingFiller(handleWords(String(handle).replace(YEAR, " ")));
  const lead = list.slice(0, 2).map((word) => word.toLowerCase());
  for (let index = 1; index <= 2 && index + 1 < source.length; index += 1) {
    if (source[index].toLowerCase() === lead[0] && source[index + 1].toLowerCase() === lead[1]) {
      return [...source.slice(0, index), ...list];
    }
  }
  return list;
}

export function detectTitleProblems(product, { maxLength = MAX_TITLE_LENGTH } = {}) {
  const title = String(product?.title || "").trim();
  const handle = String(product?.handle || "").trim();
  const problems = [];
  if (isTemplateTitle(title)) problems.push("template");
  if (!looksCurated(title)) {
    const titleList = words(title);
    if (hasForeignCategorySuffix(titleList, handle)) problems.push("category-suffix");
    // An earlier rewrite cut many titles to a few words and dropped details
    // such as numbers ("Kitchen Faucet Aerator Degree" for "360 degree").
    if (titleList.length <= 6 && handleWords(handle).length >= 9) problems.push("short-summary");
  }
  if (BROKEN_POSSESSIVE.test(title) || /\b(?:mens|womens|childrens)\b/i.test(title)) problems.push("possessive");
  if (LEADING_COUNT.test(title) || /^\s*(?:new|hot)\b/i.test(title)) problems.push("leading-filler");
  if (YEAR.test(title)) problems.push("year");
  YEAR.lastIndex = 0;
  if (new RegExp(FILLER_PHRASES.source, "i").test(title)) problems.push("filler");
  if (/(?:^|\s)[b-z](?=\s|$)/i.test(title)) problems.push("stray-letter");
  if (title.length > maxLength) problems.push("too-long");
  if (/\b(?:Iphone|Ipad|Airpods)\b/.test(title)) problems.push("casing");
  const list = words(title);
  if (!looksCurated(title) && dropRepeats(list).length !== list.length) problems.push("repeated-words");
  if (list.length > 2 && DANGLING_END.has(list[list.length - 1].toLowerCase())) problems.push("cut-off");
  return [...new Set(problems)];
}

export function cleanProductTitle(product, { maxLength = MAX_TITLE_LENGTH } = {}) {
  const title = String(product?.title || "").trim();
  const handle = String(product?.handle || "").trim();
  const problems = detectTitleProblems(product, { maxLength });
  if (!problems.length) {
    return { title, source: "title", changed: false, problems };
  }

  const fromHandle = ["template", "category-suffix", "short-summary"].some((problem) => problems.includes(problem)) && handle.length > 8;
  const source = fromHandle ? handle.replace(/-+/g, " ").replace(/\s\d+$/, "") : title;

  let list = words(source.replace(YEAR, " "));
  list = fixPossessives(list);
  list = stripLeadingFiller(list);
  while (list.length > 2 && LOWER_WORDS.has(list[0].toLowerCase())) list = list.slice(1);
  if (!fromHandle) list = restoreDroppedLead(list, handle);
  list = dropRepeats(list);
  if (fromHandle || joinedLength(list) > maxLength) list = dropAllRepeats(list);
  list = trimToLength(list, maxLength);

  const cleaned = list.map(casing).join(" ").trim();
  return {
    title: cleaned || title,
    source: fromHandle ? "handle" : "title",
    changed: Boolean(cleaned) && cleaned !== title,
    problems,
  };
}
