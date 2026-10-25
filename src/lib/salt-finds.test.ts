import { describe, expect, it } from "vitest";

import { SALT_FIND_GUIDES } from "./salt-finds";

describe("SALT Finds guide destinations", () => {
  it("keeps only brand-safe guides as exact internal destinations", () => {
    expect(SALT_FIND_GUIDES).toHaveLength(5);
    expect(new Set(SALT_FIND_GUIDES.map((guide) => guide.href)).size).toBe(5);
    expect(SALT_FIND_GUIDES.every((guide) => guide.href.startsWith("/pages/"))).toBe(true);
    expect(SALT_FIND_GUIDES.map((guide) => guide.href)).toEqual([
      "/pages/resources?resource=guide&handle=gift-guides%2Fpractical-gifts-for-someone-who-has-everything",
      "/pages/interactive-stem-assembly-activities-for-kids",
      "/pages/kitchen-cookware-buying-guide",
      "/pages/jeans-denim-fit-guide",
      "/pages/canvas-belt-sizing-style-guide",
    ]);
  });
});
