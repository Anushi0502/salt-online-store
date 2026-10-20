import { describe, expect, it } from "vitest";

import { buildShopifyCdnSrcSet, isShopifyCdnImageUrl, withShopifyImageWidth } from "@/lib/responsive-image";

describe("responsive Shopify images", () => {
  it("recognises Shopify CDN and storefront CDN image URLs", () => {
    expect(isShopifyCdnImageUrl("https://cdn.shopify.com/s/files/1/0580/7659/4275/collections/gifts-banner.png?v=1")).toBe(true);
    expect(isShopifyCdnImageUrl("//www.saltonlinestore.com/cdn/shop/collections/gifts-banner.png?v=1")).toBe(true);
    expect(isShopifyCdnImageUrl("/assets/kids-collection-banner-BXJR-6FH.webp")).toBe(false);
    expect(isShopifyCdnImageUrl("data:image/png;base64,AAAA")).toBe(false);
  });

  it("replaces an existing width and keeps other query parameters", () => {
    expect(withShopifyImageWidth("https://cdn.shopify.com/s/files/a.png?v=12&width=2400", 800)).toBe(
      "https://cdn.shopify.com/s/files/a.png?v=12&width=800",
    );
    expect(withShopifyImageWidth("https://cdn.shopify.com/s/files/a.png", 1200)).toBe(
      "https://cdn.shopify.com/s/files/a.png?width=1200",
    );
  });

  it("builds an ascending srcset only for Shopify CDN images", () => {
    expect(buildShopifyCdnSrcSet("https://cdn.shopify.com/s/files/a.png?v=1", [1600, 800, 800])).toBe(
      "https://cdn.shopify.com/s/files/a.png?v=1&width=800 800w, https://cdn.shopify.com/s/files/a.png?v=1&width=1600 1600w",
    );
    expect(buildShopifyCdnSrcSet("/assets/men-collection-banner.webp", [800])).toBeUndefined();
    expect(buildShopifyCdnSrcSet(null, [800])).toBeUndefined();
  });
});
