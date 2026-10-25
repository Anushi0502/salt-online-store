import { ArrowRight, RotateCcw, ShieldCheck, Tag, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import beautifulGiftsBanner from "@/assets/gift-beautiful-banner-v2.jpg";
import { DELIVERY_ESTIMATE, RETURN_WINDOW_DAYS } from "@/lib/store-promises";
import { resolveThemeAsset } from "@/lib/theme-assets";

const HOME_HEADLINE = "Practical gifts they'll actually use";
const HOME_SUBHEADLINE =
  "Everyday kitchen, home and gift finds, most under $25. Buy 2 and save 20% on Bundle & Save picks.";

const TRUST_POINTS = [
  { icon: Truck, title: "Free US shipping", detail: `Tracked, usually ${DELIVERY_ESTIMATE}` },
  { icon: Tag, title: "Buy 2, save 20%", detail: "30% off 3+ Bundle & Save items" },
  { icon: RotateCcw, title: `${RETURN_WINDOW_DAYS}-day returns`, detail: "Easy returns on unused items" },
  { icon: ShieldCheck, title: "Secure checkout", detail: "Card, Shop Pay, Apple Pay, Google Pay" },
] as const;

export function HomeSalesHero() {
  return (
    <section
      aria-labelledby="home-headline"
      className="salt-panel-shell overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_-38px_rgba(66,92,137,0.24)]"
    >
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <p className="salt-editorial-pill inline-flex w-fit items-center gap-1.5 px-3 py-1 text-[0.6rem]">
            Free US shipping · {RETURN_WINDOW_DAYS}-day returns
          </p>
          <div>
            <h1
              id="home-headline"
              className="font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.94] tracking-[-0.045em] text-foreground"
            >
              {HOME_HEADLINE}
            </h1>
            <p className="mt-4 max-w-[34rem] text-[0.98rem] leading-7 text-muted-foreground sm:text-[1.05rem]">
              {HOME_SUBHEADLINE}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/collections/holiday-gifts"
              className="salt-primary-cta inline-flex items-center gap-2 px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em]"
            >
              Shop Holiday Gifts
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/collections/bundle-save"
              className="salt-outline-chip h-11 px-5 py-0 text-[0.7rem] font-bold uppercase tracking-[0.14em]"
            >
              Buy 2, Save 20%
            </Link>
          </div>
          <nav aria-label="Shop gifts by budget" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem]">
            <span className="font-semibold text-foreground">Shop by budget:</span>
            <Link to="/collections/gifts-under-25" className="font-semibold text-primary underline-offset-4 hover:underline">
              Gifts under $25
            </Link>
            <Link to="/collections/gifts-under-50" className="font-semibold text-primary underline-offset-4 hover:underline">
              Gifts under $50
            </Link>
          </nav>
        </div>

        <Link
          to="/collections/holiday-gifts"
          aria-label="Shop Holiday Gifts"
          className="group relative block min-h-[14rem] overflow-hidden sm:min-h-[18rem] lg:min-h-[24rem]"
        >
          <img
            src={resolveThemeAsset(beautifulGiftsBanner)}
            alt="Wrapped holiday gifts with ribbons on a light background"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
          />
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/50 lg:grid-cols-4">
        {TRUST_POINTS.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex items-start gap-3 bg-background/95 px-4 py-4 sm:px-6">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[0.86rem] font-semibold leading-5 text-foreground">{title}</p>
              <p className="text-[0.76rem] leading-5 text-muted-foreground">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
