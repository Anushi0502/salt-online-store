import { afterEach, describe, expect, it } from "vitest";

import bestsellersBanner from "@/assets/collection-banners/bestsellers-collection-banner.webp";
import { getWebsiteCollectionBanner } from "./website-collection-banners";

const themeWindow = window as Window & { SALT_THEME_ASSETS?: Record<string, string> };

describe("website collection banners", () => {
  afterEach(() => {
    themeWindow.SALT_THEME_ASSETS = {};
  });

  it("serves bundled banners from the theme CDN on the storefront", () => {
    const cdnUrl = "https://cdn.shopify.com/s/files/1/0000/0000/t/123/assets/bestsellers-collection-banner.webp";
    themeWindow.SALT_THEME_ASSETS = { [bestsellersBanner]: cdnUrl };

    const banner = getWebsiteCollectionBanner("best-sellers");

    expect(banner?.image).toBe(cdnUrl);
    expect(banner?.alt).toBe("Best Sellers collection banner");
  });

  it("returns null for collections without a website banner", () => {
    expect(getWebsiteCollectionBanner("kitchen-gadgets")).toBeNull();
  });
});
