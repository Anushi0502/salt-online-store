import { describe, expect, it } from "vitest";
import { amazonButtonLabel, isAmazonProduct, parseAmazonLinks } from "@/lib/amazon-buy";

describe("amazon buy links", () => {
  it("reads print and Kindle ASIN tags, print first", () => {
    const links = parseAmazonLinks(["books", "amazon-kindle:B0DH4JN7N3", "Amazon-ASIN:b0dh537cc3"]);
    expect(links).toEqual([
      { format: "print", asin: "B0DH537CC3", url: "https://www.amazon.com/dp/B0DH537CC3" },
      { format: "kindle", asin: "B0DH4JN7N3", url: "https://www.amazon.com/dp/B0DH4JN7N3" },
    ]);
  });

  it("accepts comma-separated tag strings and ISBN-10 ASINs", () => {
    expect(parseAmazonLinks("planner, amazon-asin:1807382044")[0]?.asin).toBe("1807382044");
  });

  it("ignores malformed ASINs, duplicates and unrelated tags", () => {
    expect(parseAmazonLinks(["amazon-asin:123", "amazon-asin:", "bundle-save"])).toEqual([]);
    expect(parseAmazonLinks(["amazon-asin:B0D4JDBFYQ", "amazon-asin:B0D4JDBFYQ"])).toHaveLength(1);
    expect(isAmazonProduct(undefined)).toBe(false);
    expect(isAmazonProduct(["amazon-asin:B0HG7YS5JP"])).toBe(true);
  });

  it("labels a lone link plainly and distinguishes editions when there are two", () => {
    const [print, kindle] = parseAmazonLinks(["amazon-asin:B0DH537CC3", "amazon-kindle:B0DH4JN7N3"]);
    expect(amazonButtonLabel(print, 1)).toBe("Buy on Amazon");
    expect(amazonButtonLabel(print, 2)).toBe("Print edition on Amazon");
    expect(amazonButtonLabel(kindle, 2)).toBe("Kindle edition on Amazon");
  });
});
