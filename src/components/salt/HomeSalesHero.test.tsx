import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { HomeCategoryTiles } from "./HomeCategoryTiles";
import { HomeFaq } from "./HomeFaq";
import { HomeSalesHero } from "./HomeSalesHero";

describe("homepage sales sections", () => {
  it("gives the homepage one headline and links to the two offers", () => {
    render(
      <MemoryRouter>
        <HomeSalesHero />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Practical gifts they'll actually use");
    expect(screen.getByRole("link", { name: /Buy 2, Save 20%/ })).toHaveAttribute("href", "/collections/bundle-save");
    expect(screen.getAllByText("Free US shipping").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Gifts under $25" })).toHaveAttribute("href", "/collections/gifts-under-25");
    expect(screen.getByRole("link", { name: "Gifts under $50" })).toHaveAttribute("href", "/collections/gifts-under-50");
  });

  it("links category tiles only to focus collections", () => {
    render(
      <MemoryRouter>
        <HomeCategoryTiles />
      </MemoryRouter>,
    );
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/collections/holiday-gifts");
    expect(hrefs).toContain("/collections/gifts-under-25");
    expect(hrefs).toContain("/collections/gifts-under-50");
    expect(hrefs).not.toContain("/collections/footwear");
    expect(hrefs).not.toContain("/collections/luxury-fragrances");
  });

  it("answers delivery and Bundle & Save questions", () => {
    render(
      <MemoryRouter>
        <HomeFaq />
      </MemoryRouter>,
    );
    expect(screen.getByText("How long does delivery take?")).toBeInTheDocument();
    expect(screen.getByText("How does Bundle & Save work?")).toBeInTheDocument();
  });
});
