import { ArrowUpRight } from "lucide-react";
import shopAppQr from "@/assets/shop-app-qr.svg";
import { SHOP_APP_PITCH, SHOP_APP_STORE_URL } from "@/lib/store-promises";

type ShopAppPromoProps = {
  variant?: "card" | "compact" | "footer";
  className?: string;
};

// Links shoppers to the SALT store in Shopify's Shop app, where they can check
// out with Shop Pay, use installments on eligible orders and track orders.
const ShopAppPromo = ({ variant = "card", className = "" }: ShopAppPromoProps) => {
  if (!SHOP_APP_STORE_URL) {
    return null;
  }

  const link = (
    <a
      href={SHOP_APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        variant === "footer"
          ? "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#5a31f4] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
          : "inline-flex items-center gap-1.5 rounded-full bg-[#5a31f4] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      }
    >
      Open SALT in the Shop app
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );

  if (variant === "compact") {
    return (
      <div className={`rounded-[1rem] border border-[#5a31f4]/20 bg-[#5a31f4]/[0.04] p-3.5 ${className}`.trim()}>
        <p className="text-sm font-semibold text-foreground">Prefer the Shop app?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{SHOP_APP_PITCH}</p>
        <div className="mt-2.5">{link}</div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`max-w-xs normal-case tracking-normal ${className}`.trim()}>
        <p className="text-sm font-semibold text-white">Shop SALT in the Shop app</p>
        <p className="mt-1 text-xs leading-5 text-white/70">{SHOP_APP_PITCH}</p>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={shopAppQr}
            alt="Scan to open the SALT store in the Shop app"
            width={72}
            height={72}
            loading="lazy"
            className="hidden h-[72px] w-[72px] shrink-0 rounded-lg bg-white p-1 sm:block"
          />
          {link}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-4 rounded-[1.2rem] border border-[#5a31f4]/20 bg-[#5a31f4]/[0.04] p-4 ${className}`.trim()}
    >
      <img
        src={shopAppQr}
        alt="Scan to open the SALT store in the Shop app"
        width={96}
        height={96}
        loading="lazy"
        className="hidden h-24 w-24 shrink-0 rounded-xl border border-border/70 bg-white p-1.5 sm:block"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Prefer to buy in the Shop app?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{SHOP_APP_PITCH}</p>
        <div className="mt-2.5">{link}</div>
        <p className="mt-2 hidden text-[0.68rem] text-muted-foreground sm:block">Or scan the code with your phone camera.</p>
      </div>
    </div>
  );
};

export default ShopAppPromo;
