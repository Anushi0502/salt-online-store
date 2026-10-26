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

  it("shows four real products in the hero once the shelves load", () => {
    const products = [1, 2, 3, 4].map((n) => ({
      handle: `product-${n}`,
      title: `Product ${n}`,
      image: `https://cdn.example.com/${n}.jpg`,
      price: 9.99 + n,
    }));
    render(
      <MemoryRouter>
        <HomeSalesHero products={products} />
      </MemoryRouter>,
    );
    const picks = screen.getByRole("list", { name: "Popular picks" });
    expect(picks.querySelectorAll("li")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Product 1/ })).toHaveAttribute("href", "/products/product-1");
    expect(screen.queryByAltText(/Wrapped holiday gifts/)).not.toBeInTheDocument();
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
