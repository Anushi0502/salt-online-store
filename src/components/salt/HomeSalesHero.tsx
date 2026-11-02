import { ArrowRight, RotateCcw, ShieldCheck, Tag, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import beautifulGiftsBanner from "@/assets/gift-beautiful-banner-v2.jpg";
import { formatMoney } from "@/lib/formatters";
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

export type HomeHeroProduct = {
  handle: string;
  title: string;
  image: string;
  price: number;
};

type HomeSalesHeroProps = {
  // Real products from the homepage shelves, so the hero shows what the
  // headline promises. Falls back to the gift photo until they load.
  products?: HomeHeroProduct[];
};

export function HomeSalesHero({ products = [] }: HomeSalesHeroProps) {
  const showcase = products.slice(0, 4);

  return (
    <section
      aria-labelledby="home-headline"
      className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background shadow-[0_24px_50px_-38px_rgba(66,92,137,0.24)]"
    >
      <div className="relative grid overflow-hidden bg-[linear-gradient(120deg,#0f2547_0%,#173478_48%,#2563eb_100%)] lg:grid-cols-[1.05fr_0.95fr]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.35),transparent_65%)]"
        />
        <div className="relative flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white">
            Free US shipping · {RETURN_WINDOW_DAYS}-day returns
          </p>
          <div>
            <h1
              id="home-headline"
              className="font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.94] tracking-[-0.045em] text-white"
            >
              {HOME_HEADLINE}
            </h1>
            <p className="mt-4 max-w-[34rem] text-[0.98rem] leading-7 text-blue-100 sm:text-[1.05rem]">
              {HOME_SUBHEADLINE}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/collections/holiday-gifts"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#0f2547] shadow-[0_12px_24px_-14px_rgba(0,0,0,0.5)] transition hover:-translate-y-[1px] hover:bg-blue-50"
            >
              Shop Holiday Gifts
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/collections/bundle-save"
              className="inline-flex h-11 items-center rounded-full border border-white/40 px-5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
            >
              Buy 2, Save 20%
            </Link>
          </div>
          <nav aria-label="Shop gifts by budget" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.82rem]">
            <span className="font-semibold text-white/85">Shop by budget:</span>
            <Link to="/collections/gifts-under-25" className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
              Gifts under $25
            </Link>
            <Link to="/collections/gifts-under-50" className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
              Gifts under $50
            </Link>
          </nav>
        </div>

        {showcase.length === 4 ? (
          <ul className="relative grid w-full grid-cols-2 gap-3 self-center p-4 pt-0 sm:gap-4 sm:p-8 sm:pt-0 lg:max-w-[29rem] lg:justify-self-center lg:p-8 lg:pl-0" aria-label="Popular picks">
            {showcase.map((product) => (
              <li key={product.handle}>
                <Link
                  to={`/products/${product.handle}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_36px_-22px_rgba(2,8,23,0.55)] transition hover:-translate-y-0.5"
                >
                  <div className="aspect-[5/4] overflow-hidden bg-slate-50">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <p className="line-clamp-1 text-[0.78rem] font-semibold text-slate-800">{product.title}</p>
                    <p className="shrink-0 text-[0.82rem] font-bold text-[#1d4ed8]">{formatMoney(product.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
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
        )}
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
