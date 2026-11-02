import bestsellersBanner from "@/assets/collection-banners/bestsellers-collection-banner.webp";
import kidsBanner from "@/assets/collection-banners/kids-collection-banner.webp";
import luxuryFragrancesBanner from "@/assets/collection-banners/luxury-fragrances-collection-banner.webp";
import menBanner from "@/assets/collection-banners/men-collection-banner.webp";
import saltBooksBanner from "@/assets/collection-banners/salt-books-collection-banner.webp";
import womenBanner from "@/assets/collection-banners/women-collection-banner.webp";
import { resolveThemeAsset } from "@/lib/theme-assets";
import type { ShopifyCollection } from "@/types/shopify";

export type WebsiteCollectionBanner = {
  image: string;
  alt: string;
};

const BANNERS_BY_HANDLE: Record<string, WebsiteCollectionBanner> = {
  kids: {
    image: kidsBanner,
    alt: "Kids collection banner",
  },
  "best-sellers": {
    image: bestsellersBanner,
    alt: "Best Sellers collection banner",
  },
  "appplaza-best-sellers": {
    image: bestsellersBanner,
    alt: "Best Sellers collection banner",
  },
  "luxury-fragrances": {
    image: luxuryFragrancesBanner,
    alt: "Luxury Fragrances collection banner",
  },
  men: {
    image: menBanner,
    alt: "Men collection banner",
  },
  "men-collection": {
    image: menBanner,
    alt: "Men collection banner",
  },
  women: {
    image: womenBanner,
    alt: "Women collection banner",
  },
  "salt-books": {
    image: saltBooksBanner,
    alt: "The Living Legacy Planner editions and Relics of the Century by Courtney R. Jones",
  },
};

// Bundled images are emitted as /assets/<file>, which only exists on the Vite
// server. On the Shopify storefront they live on the theme CDN, so resolve the
// path when it is read (the theme asset map is set at runtime).
function withThemeAsset(banner: WebsiteCollectionBanner | undefined): WebsiteCollectionBanner | null {
  return banner ? { ...banner, image: resolveThemeAsset(banner.image) } : null;
}

function normalizeBannerHandle(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function getWebsiteCollectionBanner(
  collectionOrHandle?: ShopifyCollection | string | null,
): WebsiteCollectionBanner | null {
  if (!collectionOrHandle) {
    return null;
  }

  const handle =
    typeof collectionOrHandle === "string" ? collectionOrHandle : collectionOrHandle.handle;
  const byHandle = BANNERS_BY_HANDLE[normalizeBannerHandle(handle)];
  if (byHandle) {
    return withThemeAsset(byHandle);
  }

  if (typeof collectionOrHandle === "string") {
    return null;
  }

  return withThemeAsset(BANNERS_BY_HANDLE[normalizeBannerHandle(collectionOrHandle.title)]);
}
