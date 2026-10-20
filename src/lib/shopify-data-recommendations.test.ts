import { afterEach, describe, expect, it, vi } from "vitest";

import { loadProductRecommendations } from "@/lib/shopify-data";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function ajaxProduct(id: number, handle: string): Record<string, unknown> {
  // Shape returned by /recommendations/products.json (Shopify Ajax API).
  return {
    id,
    title: `Recommended ${handle}`,
    handle,
    vendor: "SALT",
    type: "Gifts",
    tags: ["gift"],
    price: 2499,
    compare_at_price: null,
    available: true,
    images: [`//cdn.shopify.com/${handle}.jpg`],
    featured_image: `//cdn.shopify.com/${handle}.jpg`,
    variants: [{ id: id + 1000, title: "Default Title", price: 2499, compare_at_price: null, available: true }],
  };
}

describe("loadProductRecommendations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests related and complementary intents and drops the source product", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("intent=related")) {
        return jsonResponse({ products: [ajaxProduct(7, "source-product"), ajaxProduct(11, "related-one")] });
      }
      return jsonResponse({ products: [ajaxProduct(12, "complement-one")] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const payload = await loadProductRecommendations(7);

    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.some((url) => url.includes("/recommendations/products.json?product_id=7") && url.includes("intent=related"))).toBe(true);
    expect(urls.some((url) => url.includes("intent=complementary"))).toBe(true);
    expect(urls.some((url) => url.includes("collection-products.json"))).toBe(false);
    expect(payload.related.map((product) => product.handle)).toEqual(["related-one"]);
    expect(payload.complementary.map((product) => product.handle)).toEqual(["complement-one"]);
  });

  it("returns empty lists without requesting anything for an invalid product id", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadProductRecommendations(0)).resolves.toEqual({ related: [], complementary: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
