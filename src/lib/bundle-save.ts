// Must match the Shopify automatic discounts "Bundle & Save: Buy 2, save 20%"
// and "Bundle & Save: Buy 3+, save 30%", which target the bundle-save collection.
export const BUNDLE_SAVE_TAG = "bundle-save";
export const BUNDLE_SAVE_TIERS = [
  { quantity: 1, discount: 0 },
  { quantity: 2, discount: 0.2 },
  { quantity: 3, discount: 0.3 },
] as const;

export function hasBundleSaveTag(tags: string[] | string | null | undefined): boolean {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
  return list.some((tag) => tag.trim().toLowerCase() === BUNDLE_SAVE_TAG);
}

export function bundleTierFor(quantity: number) {
  return [...BUNDLE_SAVE_TIERS].reverse().find((tier) => quantity >= tier.quantity) || BUNDLE_SAVE_TIERS[0];
}
