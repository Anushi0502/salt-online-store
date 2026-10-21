import { describe, expect, it } from "vitest";
import { cleanProductTitle, isTemplateTitle } from "@/lib/product-title-cleanup.js";

describe("cleanProductTitle", () => {
  it("rebuilds template titles from the original handle", () => {
    const result = cleanProductTitle({
      title: "Men S Vintage Suit Set For Daily And Casual Outfit Styling Ceramic",
      handle: "6-5inch-japanese-style-ceramic-ramen-bowl-with-lid-vintage-instant",
    });

    expect(result.source).toBe("handle");
    expect(result.title).toBe("6.5 Inch Japanese Style Ceramic Ramen Bowl with Lid Vintage Instant");
  });

  it("fixes broken possessives, years, filler and repeated words", () => {
    expect(cleanProductTitle({ title: "Men S Cycling Leggings Compression Pants Basketball Leggings" }).title).toBe(
      "Men's Cycling Leggings Compression Pants Basketball",
    );
    // Repeats inside a title often carry meaning and stay.
    expect(cleanProductTitle({ title: "1 2pcs Lip Plump Long Lasting Lip Oil Moisturizing Gloss Serum" }).title).toBe(
      "Lip Plump Long Lasting Lip Oil Moisturizing Gloss Serum",
    );
    expect(cleanProductTitle({ title: "Protective Iphone Case For Iphone 16 Pro" }).title).toBe(
      "Protective iPhone Case for iPhone 16 Pro",
    );
    expect(cleanProductTitle({ title: "2026 New Children Four Wheels Sneakers Black Outdoor Sport Pink" }).title).toBe(
      "Children Four Wheels Sneakers Black Outdoor Sport Pink",
    );
    expect(cleanProductTitle({ title: "Good Quality Bodysuit Women Waist Trainer Tummy Slimmer Shapewear" }).title).toBe(
      "Bodysuit Women Waist Trainer Tummy Slimmer Shapewear",
    );
  });

  it("keeps T-shirts and drops dangling endings", () => {
    expect(
      cleanProductTitle({
        title: "Unisex Casual Short Sleeve Shirt For Daily And Casual Outfit Styling",
        handle: "dank-meme-hamster-t-shirt-womens-streetwear-short-sleeve",
      }).title,
    ).toBe("Dank Meme Hamster T-Shirt Women's Streetwear Short Sleeve");
    expect(cleanProductTitle({ title: "Children S Boy Overalls Waist Cinching Bags Jumpsuit Spring And" }).title).toBe(
      "Children's Boy Overalls Waist Cinching Bags Jumpsuit Spring",
    );
  });

  it("restores a first word the supplier title lost", () => {
    expect(
      cleanProductTitle({
        title: "Rate Monitor Chest Strap Replacement Belt",
        handle: "1-2pcs-heart-rate-monitor-chest-strap-replacement-belt-for-g",
      }).title,
    ).toBe("Heart Rate Monitor Chest Strap Replacement Belt");
  });

  it("leaves hand-written comma-style titles unchanged", () => {
    const result = cleanProductTitle({
      title: "KINGSEVEN Walnut Wood Round Sunglasses, Polarized UV400 Unisex",
      handle: "kingseven-brand-walnut-sunglasses-men-women-polarized-uv400-lens-wood-round-frame-glasses",
    });
    expect(result.changed).toBe(false);
  });

  it("leaves clean titles unchanged", () => {
    const result = cleanProductTitle({ title: "Baby Musical Feeding Bottle Pacifier Newborn Soft Teether Rattles" });
    expect(result.changed).toBe(false);
    expect(isTemplateTitle(result.title)).toBe(false);
  });
});
