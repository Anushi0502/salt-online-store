import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { bundleTierFor, hasBundleSaveTag } from "@/lib/bundle-save";
import BundleSaveOffer from "./BundleSaveOffer";

describe("BundleSaveOffer", () => {
  it("detects the bundle-save tag in arrays and comma strings", () => {
    expect(hasBundleSaveTag(["kitchen", "bundle-save"])).toBe(true);
    expect(hasBundleSaveTag("kitchen, Bundle-Save")).toBe(true);
    expect(hasBundleSaveTag(["kitchen"])).toBe(false);
    expect(hasBundleSaveTag(undefined)).toBe(false);
  });

  it("maps quantities to the matching discount tier", () => {
    expect(bundleTierFor(1).discount).toBe(0);
    expect(bundleTierFor(2).discount).toBe(0.2);
    expect(bundleTierFor(5).discount).toBe(0.3);
  });

  it("shows tier totals and savings and selects a quantity", () => {
    const onSelect = vi.fn();
    render(<BundleSaveOffer price={10.99} quantity={1} onSelectQuantity={onSelect} />);
    expect(screen.getByText("You save $4.40")).toBeInTheDocument();
    expect(screen.getByText("You save $9.89")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Buy 2/ }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
