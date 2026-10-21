import { describe, expect, it } from "vitest";
import { auditCatalog, auditProduct, duplicateKey } from "@/lib/catalog-audit.js";

const base = {
  tracksInventory: true,
  totalInventory: 100,
  mediaCount: { count: 6 },
  priceRangeV2: { minVariantPrice: { amount: "29.99" }, maxVariantPrice: { amount: "34.99" } },
  descriptionHtml: "<p>Soft cotton tee.</p>",
};

describe("catalog audit", () => {
  it("flags impossible specs, brands, stock and images", () => {
    expect(auditProduct({ ...base, title: "500000MAH Power Bank 120W", handle: "500000mah-power-bank" })).toContain(
      "impossible spec: power bank capacity above 50,000 mAh",
    );
    expect(auditProduct({ ...base, title: "Original Pen Drive 16TB USB 3 2 Flash Drive", handle: "pen-drive" })).toContain(
      "impossible spec: flash drive of 2 TB or more",
    );
    expect(auditProduct({ ...base, title: "Kawaii Hello Kitty Doll Bouquet", handle: "hello-kitty" })).toContain(
      "brand or character name (trademark risk)",
    );
    expect(auditProduct({ ...base, title: "Tote", handle: "tote", totalInventory: 0 })).toContain("out of stock");
    expect(auditProduct({ ...base, title: "Tote", handle: "tote", mediaCount: { count: 0 } })).toContain("no images");
    expect(auditProduct({ ...base, title: "20000mAh Power Bank", handle: "power-bank" })).toEqual([]);
  });

  it("groups duplicates and keeps the strongest listing", () => {
    expect(duplicateKey({ handle: "compression-arthritis-gloves-wrist-support-carpal-tunnel-relief-1" })).toBe(
      duplicateKey({ handle: "compression-arthritis-gloves-carpal-tunnel-wrist-support-relief" }),
    );
    const flagged = auditCatalog([
      { ...base, id: "a", title: "Robe", handle: "warm-long-robe", mediaCount: { count: 8 } },
      { ...base, id: "b", title: "Robe", handle: "long-warm-robe-1", mediaCount: { count: 2 } },
      { ...base, id: "c", title: "Mug", handle: "ceramic-mug" },
    ]);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].product.id).toBe("b");
    expect(flagged[0].reasons[0]).toBe("duplicate of warm-long-robe");
    expect(flagged[0].action).toBe("hide");
  });
});
