import { describe, expect, it } from "vitest";
import {
  buildSeoTitle,
  extractTemplateFacts,
  isTemplateDescription,
  rebuildProductDescription,
} from "@/lib/product-description-rebuild.js";

const templateHtml = `<h2>About Men S Vintage Suit Set For Daily And Casual Outfit Styling Ceramic</h2>
<p>Men S Vintage Suit Set For Daily And Casual Outfit Styling Ceramic is a ceramic ramen bowl identified by the product title and supplied listing details.</p>
<h3>Key Details</h3>
<ul>
<li>Size or capacity: 5inch, 750 ml</li>
<li>Material: ceramic, Ceramic</li>
<li>Features: large capacity</li>
<li>Audience: Men, men</li>
<li>Use: kitchen</li>
</ul>
<p>SALT catalog listing reference Ref 3HM3AW.</p>`;

describe("rebuildProductDescription", () => {
  it("detects template descriptions and keeps hand-written ones", () => {
    expect(isTemplateDescription(templateHtml)).toBe(true);
    const handWritten = "<p>Soft knit top with a relaxed fit.</p>";
    expect(rebuildProductDescription({ descriptionHtml: handWritten }, "Knit Top")).toMatchObject({
      changed: false,
      html: handWritten,
    });
  });

  it("extracts deduplicated facts", () => {
    expect(extractTemplateFacts(templateHtml)).toMatchObject({
      noun: "ceramic ramen bowl",
      material: ["ceramic"],
      size: ["5inch", "750 ml"],
      features: ["large capacity"],
    });
  });

  it("writes factual copy with the store terms and no reference codes", () => {
    const result = rebuildProductDescription(
      {
        descriptionHtml: templateHtml,
        handle: "6-5inch-japanese-style-ceramic-ramen-bowl-with-lid",
        options: [{ name: "Color", values: ["White", "Black"] }],
      },
      "6.5 Inch Japanese Style Ceramic Ramen Bowl with Lid",
    );

    expect(result.changed).toBe(true);
    expect(result.html).toContain("Shop the <strong>6.5 Inch Japanese Style Ceramic Ramen Bowl with Lid</strong> at SALT.");
    expect(result.html).toContain("6.5 Inch, 750 ml");
    expect(result.html).toContain("Colors:</strong> White, Black");
    expect(result.html).toContain("5–15 business days");
    expect(result.html).toContain("within 14 days of delivery");
    expect(result.html).not.toMatch(/Ref [A-Z0-9]{6}|identified by|Men S/);
    expect(result.metaDescription!.length).toBeLessThanOrEqual(155);
  });

  it("flags health claims for review", () => {
    const result = rebuildProductDescription(
      { descriptionHtml: templateHtml.replace("ceramic ramen bowl", "glove") },
      "Compression Arthritis Gloves Pain Relief",
    );
    expect(result.needsReview).toBe(true);
  });

  it("keeps SEO titles within 70 characters", () => {
    expect(buildSeoTitle("Ceramic Ramen Bowl")).toBe("Ceramic Ramen Bowl | SALT");
    expect(buildSeoTitle("x".repeat(40) + " " + "y".repeat(40)).length).toBeLessThanOrEqual(70);
    expect(buildSeoTitle("0.05mm Slim Waterproof Eyeliner, Quick-Drying, Smudge-Proof, 4 Colors")).toBe(
      "0.05mm Slim Waterproof Eyeliner, Quick-Drying, Smudge-Proof, 4 Colors",
    );
  });
});
