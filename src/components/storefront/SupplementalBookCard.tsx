import firstEditionCover from "@/assets/supplemental-books/living-legacy-planner-first-edition.webp";
import colorEditionCover from "@/assets/supplemental-books/living-legacy-planner-color-2nd-edition.webp";
import sealCover from "@/assets/supplemental-books/seal-the-deal-buyers-journal.webp";

export const SUPPLEMENTAL_BOOKS = [
  {
    id: "living-legacy-planner-first-edition",
    title: "The Living Legacy Planner – First Edition",
    description:
      "Final wishes, bank and insurance details, medications, doctors, who fixes the furnace, and the memories you want passed down. So nobody has to guess.",
    cover: firstEditionCover,
    coverAlt: "The Living Legacy Planner by Courtney R. Jones, blue cover",
    readNowUrl: "https://www.seniorandlivingtoday.com/books/living-legacy-planner/#look-first",
    amazonUrl: "https://www.amazon.com/dp/B0D4JDBFYQ",
  },
  {
    id: "living-legacy-planner-color-edition",
    title: "The Living Legacy Planner: Color Edition (2nd Edition)",
    description:
      "Everything you love about The Living Legacy Planner, refreshed in full color: 182 pages, large 8.5 x 11 inch size, in paperback or hardcover.",
    cover: colorEditionCover,
    coverAlt: "The Living Legacy Planner Color Edition, 2nd Edition, by Courtney R. Jones",
    readNowUrl: "https://www.seniorandlivingtoday.com/books/living-legacy-planner/#look-second",
    amazonUrl: "https://www.amazon.com/dp/B0GY1BY1FP",
  },
  {
    id: "seal-the-deal-buyers-journal",
    title: "Seal the Deal Buyers Journal",
    description:
      "A step-by-step home buying journal: from finding a realtor and getting financing to inspection, appraisal, closing and the important numbers for your new home.",
    cover: sealCover,
    coverAlt: "Seal the Deal Buyers Journal cover: a hand passing house keys under a gold Seal the Deal emblem",
    readNowUrl: "https://www.seniorandlivingtoday.com/books/#look-deal",
    amazonUrl: "https://www.amazon.com/dp/B0GXKVB7BF",
  },
];

// Read Now and Buy on Amazon for the three Shopify book products, from the master source.
// null readNowUrl means Senior and Living Today has no preview for that book.
export const SHOP_BOOK_ACTIONS: Record<string, { readNowUrl: string | null; amazonUrl: string }> = {
  "relics-of-the-century-book": { readNowUrl: null, amazonUrl: "https://www.amazon.com/dp/B0DH537CC3" },
  "the-daily-bloom-life-balance-guide": {
    readNowUrl: "https://www.seniorandlivingtoday.com/books/#look-bloom",
    amazonUrl: "https://www.amazon.com/dp/B0GY143Z4V",
  },
  "living-legacy-planner-military-deployment-family-readiness-edition": {
    readNowUrl: "https://www.seniorandlivingtoday.com/books/military-edition/#look-inside",
    amazonUrl: "https://www.amazon.com/dp/B0HG7YS5JP",
  },
};

// Shared Read Now and Buy on Amazon row. A missing preview is shown as text, not as a link.
export const BookActions = ({ readNowUrl, amazonUrl }: { readNowUrl: string | null; amazonUrl: string }) => (
  <div className="mt-5 flex flex-wrap gap-3">
    {readNowUrl ? (
      <a
        href={readNowUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-bold uppercase tracking-[0.06em] text-foreground transition hover:border-primary/40 hover:text-primary"
      >
        📖 Read Now
      </a>
    ) : (
      <span className="inline-flex min-h-12 items-center rounded-full border border-dashed border-border px-5 text-sm text-muted-foreground">
        Preview coming soon
      </span>
    )}
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-[0.06em] text-primary-foreground transition hover:-translate-y-px"
    >
      Buy on Amazon
    </a>
  </div>
);

type SupplementalBook = (typeof SUPPLEMENTAL_BOOKS)[number];

// Same outer structure and classes as the shop-variant ProductCard, without the wishlist button.
const SupplementalBookCard = ({ book }: { book: SupplementalBook }) => (
  <article className="group relative flex min-w-0 h-full flex-col">
    <div className="relative overflow-hidden rounded-[1.65rem] border border-border/70 bg-muted shadow-[0_14px_30px_-24px_rgba(15,23,42,0.42)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:shadow-[0_22px_40px_-24px_rgba(15,23,42,0.45)]">
      <a href={book.readNowUrl} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden aspect-square">
        <img
          src={book.cover}
          alt={book.coverAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
        />
      </a>
    </div>
    <div className="flex min-w-0 flex-1 flex-col px-1 pt-4 sm:pt-5">
      <h3 className="font-display font-semibold leading-[1.2] tracking-[-0.02em] text-foreground text-[clamp(1.05rem,1.6vw,1.35rem)]">
        {book.title}
      </h3>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{book.description}</p>
      <div className="flex-1" />
      <BookActions readNowUrl={book.readNowUrl} amazonUrl={book.amazonUrl} />
    </div>
  </article>
);

export default SupplementalBookCard;
