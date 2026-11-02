import { ExternalLink, ShieldCheck, Truck } from "lucide-react";
import { amazonButtonLabel, trackAmazonClick, type AmazonLink } from "@/lib/amazon-buy";

type AmazonBuyBoxProps = {
  links: AmazonLink[];
  productId: string | number;
  productTitle: string;
  price: number;
};

export default function AmazonBuyBox({ links, productId, productTitle, price }: AmazonBuyBoxProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section className="mt-5" aria-label="Buy on Amazon">
      <div className="grid gap-2">
        {links.map((link, index) => (
          <a
            key={link.asin}
            href={link.url}
            target="_blank"
            rel="noopener"
            onClick={() => trackAmazonClick(link, productId, productTitle, price)}
            className={
              index === 0
                ? "salt-primary-cta inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition hover:-translate-y-[1px]"
                : "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-base font-semibold text-background transition hover:-translate-y-[1px] hover:opacity-90"
            }
          >
            {amazonButtonLabel(link, links.length)}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-border/70 bg-card/80 p-4 text-sm">
        <p className="flex items-start gap-2 font-semibold">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Sold and shipped by Amazon, a marketplace millions trust
        </p>
        <p className="mt-2 flex items-start gap-2 text-muted-foreground">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {links.some((link) => link.format === "print")
            ? "Print copies usually arrive in 2–7 days."
            : null}
          {links.some((link) => link.format === "kindle") ? " Kindle editions download instantly." : null}{" "}
          Amazon's checkout, delivery and return policies apply.
        </p>
      </div>
    </section>
  );
}
