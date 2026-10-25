import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// Brand-safe, in-stock collections the homepage sends shoppers to. Keep this
// list on the focus collections in the 90-day sales plan.
const HOME_CATEGORY_TILES = [
  { title: "Holiday Gifts", detail: "Easy wins for everyone on your list", href: "/collections/holiday-gifts" },
  { title: "Bundle & Save", detail: "Buy 2, save 20% · 3+, save 30%", href: "/collections/bundle-save" },
  { title: "Kitchen Gadgets", detail: "Small tools that solve daily jobs", href: "/collections/kitchen-gadgets" },
  { title: "Cleaning Tools", detail: "Faster, easier cleaning at home", href: "/collections/cleaning-tools" },
  { title: "Storage & Organization", detail: "Tidy drawers, closets and counters", href: "/collections/storage-organization" },
  { title: "Gifts for Seniors", detail: "Comfort and everyday helpers", href: "/collections/gifts-for-seniors" },
  { title: "Kids", detail: "Lunch, school and play", href: "/collections/kids" },
  { title: "Women", detail: "Clothing, bags and accessories", href: "/collections/women" },
  { title: "Men", detail: "Clothing, wallets and accessories", href: "/collections/men-collection" },
] as const;

export function HomeCategoryTiles() {
  return (
    <section
      aria-labelledby="home-categories-title"
      className="salt-section-shell rounded-[1.75rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">Shop by category</p>
      <h2
        id="home-categories-title"
        className="mt-2 font-display text-[clamp(1.45rem,3vw,2.15rem)] leading-[0.96] tracking-[-0.035em] text-foreground"
      >
        Find what you came for
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {HOME_CATEGORY_TILES.map((tile) => (
          <Link
            key={tile.href}
            to={tile.href}
            className="group flex min-h-[6.5rem] flex-col justify-between rounded-[1.25rem] border border-border/70 bg-background/75 p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_36px_-28px_rgba(22,77,160,0.35)]"
          >
            <span className="flex items-start justify-between gap-2 text-[0.98rem] font-semibold leading-5 tracking-[-0.015em] text-foreground">
              {tile.title}
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-2 text-[0.76rem] leading-5 text-muted-foreground">{tile.detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
