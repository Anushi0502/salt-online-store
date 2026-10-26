import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { parseAmazonLinks } from "@/lib/amazon-buy";
import AmazonBuyBox from "./AmazonBuyBox";

describe("AmazonBuyBox", () => {
  it("links to Amazon in a new tab and records the click", () => {
    const dataLayer: Array<Record<string, unknown>> = [];
    window.dataLayer = dataLayer;
    const links = parseAmazonLinks(["amazon-asin:B0HG7YS5JP"]);
    render(<AmazonBuyBox links={links} productId="gid://shopify/Product/1" productTitle="Planner" price={24} />);

    const button = screen.getByRole("link", { name: /buy on amazon/i });
    expect(button).toHaveAttribute("href", "https://www.amazon.com/dp/B0HG7YS5JP");
    expect(button).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/sold and shipped by amazon/i)).toBeInTheDocument();
    expect(screen.getByText(/2–7 days/)).toBeInTheDocument();

    fireEvent.click(button, { preventDefault: vi.fn() });
    expect(dataLayer[0]).toMatchObject({ event: "amazon_outbound_click", asin: "B0HG7YS5JP", format: "print", value: 24 });
    delete window.dataLayer;
  });

  it("renders nothing without Amazon links", () => {
    const { container } = render(<AmazonBuyBox links={[]} productId="1" productTitle="x" price={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
