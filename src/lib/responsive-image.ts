/**
 * Shopify's image CDN resizes on request with a `width` query parameter. A
 * srcset lets phones download a 800 px banner instead of the full 2400 px file.
 * Non-Shopify URLs (bundled theme assets, data URIs) return undefined so the
 * browser just uses `src`.
 */
export function isShopifyCdnImageUrl(src: string | null | undefined): boolean {
  const value = String(src || "").trim();
  if (!value || value.startsWith("data:")) {
    return false;
  }

  return /(^|\/\/)cdn\.shopify\.com\/s\/files\//i.test(value) || /\/cdn\/shop\/(files|collections|products)\//i.test(value);
}

export function withShopifyImageWidth(src: string, width: number): string {
  const [base, hash = ""] = src.split("#");
  const [path, query = ""] = base.split("?");
  const params = query
    .split("&")
    .filter((part) => part && !/^width=/i.test(part));
  params.push(`width=${Math.round(width)}`);
  return `${path}?${params.join("&")}${hash ? `#${hash}` : ""}`;
}

export function buildShopifyCdnSrcSet(src: string | null | undefined, widths: number[]): string | undefined {
  if (!src || !isShopifyCdnImageUrl(src)) {
    return undefined;
  }

  const uniqueWidths = Array.from(new Set(widths.filter((width) => Number.isFinite(width) && width > 0))).sort(
    (left, right) => left - right,
  );
  if (!uniqueWidths.length) {
    return undefined;
  }

  return uniqueWidths.map((width) => `${withShopifyImageWidth(src, width)} ${width}w`).join(", ");
}
