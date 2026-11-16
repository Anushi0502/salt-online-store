import firstEditionCover from "@/assets/supplemental-books/living-legacy-planner-first-edition.webp";
import colorEditionCover from "@/assets/supplemental-books/living-legacy-planner-color-2nd-edition.webp";
import sealCover from "@/assets/supplemental-books/seal-the-deal-buyers-journal.webp";

// Amazon-only books from the Senior and Living Today master reference.
// They are not Shopify products, so there is no price and no product page.
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

type SupplementalBook = (typeof SUPPLEMENTAL_BOOKS)[number];

// Same outer structure and classes as the shop-variant ProductCard, without the wishlist button.
const SupplementalBookCard = ({ book }: { book: SupplementalBook }) => (
  <article className="group relative flex min-w-0 flex-col h-full">
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
    <div className="min-w-0 px-1 pt-4 sm:pt-5">
      <h3 className="font-display font-semibold leading-[1.15] tracking-[-0.02em] text-foreground text-[clamp(0.92rem,1.45vw,1.22rem)]">
        {book.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{book.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={book.readNowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-4 text-xs font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/40 hover:text-primary"
        >
          📖 Read Now
        </a>
        <a
          href={book.amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:-translate-y-px"
        >
          Buy on Amazon
        </a>
      </div>
    </div>
  </article>
);

export default SupplementalBookCard;
