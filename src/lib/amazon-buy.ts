import { trackAnalyticsEvent } from "@/lib/analytics-events";

// SALT's own books are printed and shipped by Amazon (KDP). Tag a product in
// Shopify with "amazon-asin:<ASIN>" (print edition) and/or "amazon-kindle:<ASIN>"
// and the product page sends shoppers to Amazon instead of the Shopify cart.
export const AMAZON_PRINT_TAG_PREFIX = "amazon-asin:";
export const AMAZON_KINDLE_TAG_PREFIX = "amazon-kindle:";
// Every SALT book is written by the founder of Senior and Living Today.
export const SALT_BOOK_AUTHOR = "Courtney R. Jones";

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

export type AmazonFormat = "print" | "kindle";

export interface AmazonLink {
  format: AmazonFormat;
  asin: string;
  url: string;
}

function tagList(tags: string[] | string | null | undefined): string[] {
  return (Array.isArray(tags) ? tags : String(tags || "").split(",")).map((tag) => tag.trim());
}

export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}

export function parseAmazonLinks(tags: string[] | string | null | undefined): AmazonLink[] {
  const links: AmazonLink[] = [];

  for (const tag of tagList(tags)) {
    const lower = tag.toLowerCase();
    const format: AmazonFormat | null = lower.startsWith(AMAZON_PRINT_TAG_PREFIX)
      ? "print"
      : lower.startsWith(AMAZON_KINDLE_TAG_PREFIX)
        ? "kindle"
        : null;
    if (!format) continue;

    const prefix = format === "print" ? AMAZON_PRINT_TAG_PREFIX : AMAZON_KINDLE_TAG_PREFIX;
    const asin = tag.slice(prefix.length).trim().toUpperCase();
    if (!ASIN_PATTERN.test(asin) || links.some((link) => link.asin === asin)) continue;

    links.push({ format, asin, url: amazonProductUrl(asin) });
  }

  // Print edition first: it is the primary purchase for a planner.
  return links.sort((a, b) => (a.format === b.format ? 0 : a.format === "print" ? -1 : 1));
}

export function isAmazonProduct(tags: string[] | string | null | undefined): boolean {
  return parseAmazonLinks(tags).length > 0;
}

export function amazonButtonLabel(link: AmazonLink, total: number): string {
  if (total < 2) return "Buy on Amazon";
  return link.format === "kindle" ? "Kindle edition on Amazon" : "Print edition on Amazon";
}

export function trackAmazonClick(link: AmazonLink, productId: string | number, productTitle: string, price: number) {
  trackAnalyticsEvent("amazon_outbound_click", {
    item_id: String(productId),
    item_name: productTitle,
    asin: link.asin,
    format: link.format,
    value: price > 0 ? price : undefined,
    currency: "USD",
    outbound_url: link.url,
  });
}
