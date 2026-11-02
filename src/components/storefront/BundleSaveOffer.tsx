import { BUNDLE_SAVE_TIERS, bundleTierFor } from "@/lib/bundle-save";
import { formatMoney } from "@/lib/formatters";

type BundleSaveOfferProps = {
  price: number;
  quantity: number;
  onSelectQuantity: (quantity: number) => void;
};

export default function BundleSaveOffer({ price, quantity, onSelectQuantity }: BundleSaveOfferProps) {
  if (!(price > 0)) {
    return null;
  }

  const activeTier = bundleTierFor(quantity);

  return (
    <section className="mt-3.5" aria-labelledby="bundle-save-heading">
      <p id="bundle-save-heading" className="text-sm font-semibold">
        Buy more, save more
      </p>
      <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Choose a bundle">
        {BUNDLE_SAVE_TIERS.map((tier) => {
          const unitPrice = price * (1 - tier.discount);
          const total = unitPrice * tier.quantity;
          const saved = price * tier.quantity - total;
          const selected = activeTier.quantity === tier.quantity;
          return (
            <button
              key={tier.quantity}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelectQuantity(tier.quantity)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {tier.quantity === 1 ? "Buy 1" : tier.quantity === 2 ? "Buy 2" : "Buy 3+"}
                  {tier.quantity === 2 ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground">
                      Most popular
                    </span>
                  ) : null}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {tier.discount > 0
                    ? `${formatMoney(unitPrice)} each · save ${Math.round(tier.discount * 100)}%`
                    : `${formatMoney(price)} each`}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold">{formatMoney(total)}</span>
                {saved > 0 ? (
                  <span className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    You save {formatMoney(saved)}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Discount applies automatically at checkout. Mix and match any items from{" "}
        <a href="/collections/bundle-save" className="font-semibold underline underline-offset-2">
          Bundle &amp; Save
        </a>
        .
      </p>
    </section>
  );
}
