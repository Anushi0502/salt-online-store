import { Link } from "react-router-dom";
import InnerBreadcrumbs from "@/components/storefront/InnerBreadcrumbs";
import Reveal from "@/components/storefront/Reveal";
import SeoMetadata from "@/components/storefront/SeoMetadata";
import courtneySeated from "@/assets/living-legacy/courtney-r-jones-seated.webp";
import courtneyPortrait from "@/assets/living-legacy/courtney-r-jones-portrait.webp";
import colorCover from "@/assets/living-legacy/color-edition-cover.webp";
import dailyBloomCover from "@/assets/living-legacy/daily-bloom-cover.webp";
import hardcoverCover from "@/assets/living-legacy/hardcover-edition-cover.webp";
import militaryBackCover from "@/assets/living-legacy/military-edition-back-cover.webp";
import militaryCover from "@/assets/living-legacy/military-edition-cover.webp";
import relicsCover from "@/assets/living-legacy/relics-of-the-century-cover.webp";

const PAGE_PATH = "/pages/living-legacy-planner";
const SITE = "https://www.saltonlinestore.com";

// Amazon links are cleaned to the product ID only, so no tracking parameters are shared.
const amazon = (asin: string) => `https://www.amazon.com/dp/${asin}`;

const EDITIONS = [
  {
    id: "hardcover",
    title: "The Living Legacy Planner",
    edition: "First edition · Black and white",
    price: "$29.95",
    detail: "172 pages · 8.25 × 11 in · Hardcover",
    asin: "B0D4JDBFYQ",
    shopHandle: "the-living-legacy-planner",
    cover: hardcoverCover,
    summary:
      "The full planner for seniors and families. One clear place for medical care, finances, insurance, funeral wishes and the stories you want to pass on.",
    emoji: "📘",
  },
  {
    id: "color",
    title: "The Living Legacy Planner: Color Edition",
    edition: "Full color",
    price: "$52.00",
    detail: "182 pages · 8.5 × 11 in · Full-color interior",
    asin: "1807382044",
    shopHandle: "products-living-legacy-planner-for-seniors",
    cover: colorCover,
    summary:
      "The same planner in full color, so each section is easier to find and the pages are a pleasure to fill in.",
    emoji: "🎨",
  },
  {
    id: "military",
    title: "The Living Legacy Planner: Military Deployment & Family Readiness Edition",
    edition: "Military edition",
    price: "$24.00",
    detail: "79 pages · 8.5 × 11 in · Paperback",
    asin: "B0HG7YS5JP",
    shopHandle: "living-legacy-planner-military-deployment-family-readiness-edition",
    cover: militaryCover,
    summary:
      "Made for enlisted service members, veterans and their families. Keep life balanced and organized while you are away from home, deployed or temporarily disabled.",
    emoji: "🎖️",
  },
];

const INSIDE = [
  { emoji: "🌡️", title: "Temporary Instructions", text: "For when someone needs to take over for a while after an accident, illness or surgery." },
  { emoji: "🩺", title: "Medical details", text: "Allergies, medications, surgeries, pharmacy, doctors, hospitals and your wishes for care." },
  { emoji: "🛡️", title: "Insurance and wills", text: "Insurance, wills, trusts and beneficiaries kept together in one place." },
  { emoji: "💰", title: "Finances", text: "A section for personal and business accounts." },
  { emoji: "🔧", title: "Home and service contacts", text: "From the HVAC company to the handyman, the people who keep the house running." },
  { emoji: "🕊️", title: "Final arrangements", text: "Funeral wishes, plus legacy and life-story pages." },
  { emoji: "💬", title: "10-point discussion guide", text: "A way to start the conversation with the people who matter most." },
];

const WHY_FAMILIES = [
  { emoji: "🔍", title: "Less guessing", text: "Your family knows what you want and where to find it." },
  { emoji: "🗂️", title: "One place for everything", text: "No more folders, drawers and phone notes spread across the house." },
  { emoji: "✏️", title: "Room to change", text: "Plenty of space to update entries as your plans or health change." },
  { emoji: "🤝", title: "An easier first conversation", text: "A guide that helps you start the talk while everyone can still take part." },
];

const MILITARY_PILLARS = [
  { emoji: "🛡️", title: "Protect your family" },
  { emoji: "🗃️", title: "Preserve what matters" },
  { emoji: "🔒", title: "Prepare with confidence" },
  { emoji: "💛", title: "Leave a legacy of love" },
];

const FAQS = [
  {
    question: "What is The Living Legacy Planner?",
    answer:
      "It is an end-of-life planner and final wishes organizer. It helps seniors and adults record medical care preferences, financial details, insurance, funeral arrangements and life stories in one place.",
  },
  {
    question: "Which edition should I choose?",
    answer:
      "The first edition is the black-and-white planner. The Color Edition has a full-color interior. The Military Deployment and Family Readiness Edition is a paperback for service members, veterans and their families who need a plan while away from home.",
  },
  {
    question: "Where do I buy it, and how long does delivery take?",
    answer:
      "Each edition links to its Amazon listing. You check out on Amazon, and Amazon's delivery and return policy applies. Delivery dates are shown at checkout.",
  },
  {
    question: "What is Daily Bloom?",
    answer:
      "The Daily Bloom: A Life Balance Guide is a companion book by Courtney R. Jones for balancing daily routines, notes and goals. It is available on Amazon.",
  },
  {
    question: "Who wrote it?",
    answer:
      "Courtney R. Jones, founder of Senior and Living Today (S.A.L.T.) in Dayton, Ohio, and a senior-care advocate with more than 30 years of experience.",
  },
];

const structuredData = [
  ...EDITIONS.map((edition) => ({
    "@context": "https://schema.org",
    "@type": "Book",
    name: edition.title,
    bookFormat: edition.detail.includes("Paperback") ? "https://schema.org/Paperback" : "https://schema.org/Hardcover",
    author: { "@type": "Person", name: "Courtney R. Jones" },
    publisher: { "@type": "Organization", name: "Senior and Living Today (S.A.L.T.)" },
    description: edition.summary,
    url: `${SITE}${PAGE_PATH}#${edition.id}`,
    image: `${SITE}${PAGE_PATH}`,
    offers: {
      "@type": "Offer",
      price: edition.price.replace("$", ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: amazon(edition.asin),
    },
  })),
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
];

const pageStyles = `
@keyframes llp-float { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-10px) rotate(-1.5deg); } }
@keyframes llp-glow { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
@keyframes llp-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.llp-float { animation: llp-float 6s ease-in-out infinite; }
.llp-glow { animation: llp-glow 4s ease-in-out infinite; }
.llp-sway { animation: llp-sway 5s ease-in-out infinite; transform-origin: 50% 100%; }
.llp-lift { transition: transform .35s ease, box-shadow .35s ease; }
.llp-lift:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -30px rgba(15,23,42,.35); }
@media (prefers-reduced-motion: reduce) { .llp-float, .llp-glow, .llp-sway { animation: none; } .llp-lift { transition: none; } }
`;

const panelBase = "rounded-[2rem] border border-border/70 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)] sm:p-10";
const panel = `${panelBase} bg-background/95`;
const kicker = "text-xs font-bold uppercase tracking-[0.2em] text-primary";
const h2 = "mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.03em] text-foreground";
const btnPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_18px_36px_-22px_rgba(37,99,235,0.7)] transition hover:-translate-y-px";
const btnGhost =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-border px-7 text-sm font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/40 hover:text-primary";
const btnGold = "bg-[#e8c46a] text-[#0f2547] shadow-[0_18px_36px_-22px_rgba(232,196,106,0.7)]";

const AmazonButton = ({ asin, label, className = "" }: { asin: string; label: string; className?: string }) => (
  <a href={amazon(asin)} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} ${className}`}>
    {label}
  </a>
);

const LivingLegacyPlannerPage = () => (
  <>
    <SeoMetadata
      title="Living Legacy Planner: End-of-Life & Final Wishes Organizer | SALT"
      description="Plan final wishes, medical care, finances and family readiness with The Living Legacy Planner by Courtney R. Jones. Hardcover, color and military editions, sold on Amazon."
      canonicalPath={PAGE_PATH}
      image={`${SITE}${militaryCover}`}
      structuredData={structuredData}
    />
    <style>{pageStyles}</style>

    <section className="mx-auto mt-5 w-[min(1200px,calc(100%_-_20px))] space-y-8 pb-12 sm:space-y-10">
      <Reveal>
        <InnerBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Living Legacy Planner" }]} />
      </Reveal>

      {/* 1. Hero */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.25rem] bg-[#0f2547] text-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.6)]">
          <span aria-hidden="true" className="llp-glow pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#e8c46a]/25 blur-3xl" />
          <span aria-hidden="true" className="llp-glow pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[#3f6e8c]/50 blur-3xl" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e8c46a]">
                🌸 Senior and Living Today (S.A.L.T.)
              </p>
              <h1 className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em]">
                The Living Legacy Planner
              </h1>
              <p className="mt-5 max-w-[34ch] text-lg leading-8 text-white/90 sm:text-xl">
                Make sure your family knows what you want, and where to find it. ✨
              </p>
              <p className="mt-4 max-w-[52ch] text-base leading-7 text-white/75">
                Medical care, finances, insurance, funeral arrangements and the stories you want to pass on, all in one
                planner by Courtney R. Jones. Three editions for every family.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#editions" className={`${btnPrimary} ${btnGold}`}>
                  Choose your edition
                </a>
                <a href={amazon(EDITIONS[0].asin)} target="_blank" rel="noopener noreferrer" className={`${btnGhost} border-white/40 text-white hover:text-[#e8c46a]`}>
                  Buy on Amazon
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[400px]">
              <img
                src={hardcoverCover}
                alt="The Living Legacy Planner hardcover, by Courtney R. Jones"
                className="llp-float mx-auto w-full max-w-[360px] rounded-[1.25rem] drop-shadow-[0_40px_50px_rgba(0,0,0,0.45)]"
                fetchPriority="high"
              />
            </div>
          </div>
          <p className="relative border-t border-white/10 px-6 py-4 text-sm text-white/75 sm:px-10">
            🚚 Printed and shipped by Amazon. Delivery dates are shown at checkout.
          </p>
        </div>
      </Reveal>

      {/* 2. Founder and brand */}
      <Reveal>
        <div className={`${panel} grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}>
          <div>
            <p className={kicker}>✍️ From the author</p>
            <h2 className={h2}>Courtney R. Jones</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Courtney R. Jones is the founder of Senior and Living Today (S.A.L.T.) in Dayton, Ohio, and a senior-care
              advocate with more than 30 years of experience. She wrote The Living Legacy Planner, and the SALT Online
              Store is the shop of Senior and Living Today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#editions" className={btnPrimary}>
                See the planners
              </a>
              <Link to="/contact" className={btnGhost}>
                Talk to our team
              </Link>
            </div>
          </div>
          <img
            src={courtneySeated}
            alt="Courtney R. Jones seated with a Living Legacy Planner and a SALT mug"
            className="w-full rounded-[1.5rem] object-cover shadow-[0_24px_50px_-30px_rgba(15,23,42,0.4)]"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* 3. Editions: one big block each, with real covers */}
      <div id="editions" className="scroll-mt-28 space-y-8 sm:space-y-10">
        {EDITIONS.map((edition, index) => (
          <Reveal key={edition.id}>
            <article
              id={edition.id}
              className={`${panel} llp-lift grid gap-8 lg:grid-cols-2 lg:items-center ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div className="flex justify-center rounded-[1.5rem] bg-card p-6 sm:p-10">
                <img
                  src={edition.cover}
                  alt={`${edition.title}, ${edition.edition} cover`}
                  className="llp-float w-full max-w-[320px] rounded-[0.75rem] drop-shadow-[0_30px_40px_rgba(15,23,42,0.3)]"
                  loading="lazy"
                />
              </div>
              <div>
                <p className={kicker}>
                  {edition.emoji} {edition.edition} · {edition.detail}
                </p>
                <h3 className={h2}>{edition.title}</h3>
                <p className="mt-5 text-base leading-8 text-muted-foreground">{edition.summary}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <span className="font-display text-4xl text-foreground">{edition.price}</span>
                  <AmazonButton asin={edition.asin} label="Buy on Amazon" />
                  <Link to={`/products/${edition.shopHandle}`} className="text-sm font-bold text-primary hover:underline">
                    Details on SALT →
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* 4. Military edition spotlight */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${panelBase} bg-[#3a2f22] text-[#f4ead8]`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c46a]">🇺🇸 Military edition</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.03em]">
              Prepare today. Protect tomorrow.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#f4ead8]/85">
              Designed specifically for enlisted service members, veterans and their families. Use it to record your
              medical preferences, finances and legacy wishes, plus the details your spouse or caregiver will need while
              you are deployed or away.
            </p>
            <ul className="mt-7 grid grid-cols-2 gap-4">
              {MILITARY_PILLARS.map((pillar) => (
                <li key={pillar.title} className="rounded-[1.25rem] bg-white/5 p-4">
                  <span className="text-2xl" aria-hidden="true">{pillar.emoji}</span>
                  <p className="mt-2 text-sm font-semibold">{pillar.title}</p>
                </li>
              ))}
            </ul>
            <AmazonButton asin={EDITIONS[2].asin} label="Get the military edition" className={`${btnGold} mt-8`} />
          </div>
          <img
            src={militaryBackCover}
            alt="Back cover of the Military Deployment and Family Readiness Edition"
            className="w-full rounded-[1.5rem] object-cover shadow-[0_30px_60px_-30px_rgba(15,23,42,0.5)]"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* 5. What's inside */}
      <Reveal>
        <div className={panel}>
          <p className={kicker}>📖 What's inside</p>
          <h2 className={h2}>Every part of the plan, in one book</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {INSIDE.map((item) => (
              <div key={item.title} className="llp-lift rounded-[1.5rem] border border-border/70 bg-card p-6">
                <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
                <h3 className="mt-3 font-display text-2xl text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 6. Why families use it + gift */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${panelBase} bg-[#f6efe4]`}>
            <p className={kicker}>💛 Why families use it</p>
            <h2 className={h2}>Less guessing when it matters most</h2>
            <ul className="mt-7 grid gap-5">
              {WHY_FAMILIES.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
                  <span>
                    <strong className="block font-display text-xl text-foreground">{item.title}</strong>
                    <span className="text-sm leading-7 text-muted-foreground">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${panelBase} flex flex-col justify-between border-transparent bg-[#0f2547] text-white`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c46a]">🎁 A thoughtful gift</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">For a parent or grandparent</h2>
              <p className="mt-5 text-base leading-8 text-white/80">
                It says, "I have thought about this for you." It also suits seniors who live alone, caregivers, and
                families who want a clear plan in place.
              </p>
            </div>
            <a href="#editions" className={`${btnPrimary} ${btnGold} mt-8 self-start`}>
              Find the right edition
            </a>
          </div>
        </div>
      </Reveal>

      {/* 7. Daily Bloom and Relics */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className={`${panel} llp-lift grid gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-center`}>
            <img src={dailyBloomCover} alt="The Daily Bloom: A Life Balance Guide cover by Courtney R. Jones" className="w-full rounded-[1rem] shadow-[0_20px_40px_-26px_rgba(15,23,42,0.4)]" loading="lazy" />
            <div>
              <p className={kicker}>🌼 Companion book</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">The Daily Bloom: A Life Balance Guide</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Balance daily routines, notes and goals alongside the Living Legacy planners.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AmazonButton asin="B0GY143Z4V" label="Buy on Amazon" />
                <Link to="/products/the-daily-bloom" className="inline-flex min-h-12 items-center text-sm font-bold text-primary hover:underline">
                  Monthly planner on SALT →
                </Link>
              </div>
            </div>
          </article>
          <article className={`${panel} llp-lift grid gap-6 sm:grid-cols-[0.8fr_1.2fr] sm:items-center`}>
            <img src={relicsCover} alt="Relics of the Century book cover" className="w-full rounded-[1rem] shadow-[0_20px_40px_-26px_rgba(15,23,42,0.4)]" loading="lazy" />
            <div>
              <p className={kicker}>🕰️ Keepsake</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-foreground">Relics of the Century</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                A nostalgic look at everyday items from past decades, for sharing memories across the generations.
              </p>
              <div className="mt-6">
                <Link to="/products/relics-of-the-century-book" className={btnGhost}>
                  View on SALT · $19.99
                </Link>
              </div>
            </div>
          </article>
        </div>
      </Reveal>

      {/* 8. Stories, reviews and sharing */}
      <Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              emoji: "🌷",
              title: "Family stories",
              text: "We are gathering stories from families who have used the planner. We publish a story only after the person who wrote it gives permission.",
              cta: "Share your story",
              to: "/contact",
            },
            {
              emoji: "⭐",
              title: "Reviews",
              text: "Read what buyers say about each edition on its product page, where reviews are kept with the product.",
              cta: "Read the hardcover reviews",
              to: "/products/the-living-legacy-planner/reviews",
            },
            {
              emoji: "📸",
              title: "Share your pages",
              text: "Filled in a few pages? Send us a photo. Remove any private details first, such as account numbers or addresses.",
              cta: "Send us a photo",
              to: "/contact",
            },
          ].map((item) => (
            <div key={item.title} className={`${panel} llp-lift flex flex-col`}>
              <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
              <h2 className="mt-4 font-display text-2xl text-foreground">{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{item.text}</p>
              <Link to={item.to} className="mt-5 inline-flex text-sm font-bold text-primary hover:underline">
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </Reveal>

      {/* 9. Author portrait block */}
      <Reveal>
        <div className={`${panel} grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center`}>
          <img src={courtneyPortrait} alt="Courtney R. Jones, founder of Senior and Living Today" className="mx-auto w-full max-w-[340px] rounded-[1.5rem] object-cover shadow-[0_24px_50px_-30px_rgba(15,23,42,0.4)]" loading="lazy" />
          <div>
            <p className={kicker}>👩🏽‍💼 Meet the author</p>
            <h2 className={h2}>Courtney R. Jones</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Founder of Senior and Living Today (S.A.L.T.) in Dayton, Ohio, and a senior-care advocate with more than 30
              years of experience. Her planners help families talk about the hard things while there is still time.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 10. FAQ */}
      <Reveal>
        <div className={panel}>
          <p className={kicker}>❓ Questions</p>
          <h2 className={h2}>Good questions, straight answers</h2>
          <div className="mt-8 grid gap-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-[1.5rem] border border-border/70 bg-card p-5 open:shadow-[0_18px_40px_-30px_rgba(15,23,42,0.3)]">
                <summary className="cursor-pointer list-none text-lg font-semibold text-foreground">{faq.question}</summary>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 11. Contact */}
      <Reveal>
        <div className={`${panel} grid gap-6 md:grid-cols-3`}>
          <div className="md:col-span-3">
            <p className={kicker}>📞 Talk to us</p>
            <h2 className={h2}>Questions before you order? Ask the SALT team.</h2>
          </div>
          <a href="tel:+18888357211" className="rounded-[1.25rem] border border-border/70 bg-card p-5 text-foreground transition hover:border-primary/40">
            <span className="text-2xl" aria-hidden="true">📱</span>
            <p className="mt-2 font-semibold">+1 888-835-7211</p>
          </a>
          <a href="mailto:help@saltonlinestore.com" className="rounded-[1.25rem] border border-border/70 bg-card p-5 text-foreground transition hover:border-primary/40">
            <span className="text-2xl" aria-hidden="true">✉️</span>
            <p className="mt-2 font-semibold">help@saltonlinestore.com</p>
          </a>
          <Link to="/contact" className="rounded-[1.25rem] border border-border/70 bg-card p-5 text-foreground transition hover:border-primary/40">
            <span className="text-2xl" aria-hidden="true">💬</span>
            <p className="mt-2 font-semibold">Send a message</p>
          </Link>
        </div>
      </Reveal>

      {/* 12. Final call to action */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#0f2547,#1d3d6e)] p-8 text-center text-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.6)] sm:p-14">
          <span aria-hidden="true" className="llp-glow pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[#e8c46a]/30 blur-3xl" />
          <p className="relative text-4xl" aria-hidden="true">🕊️ 🌿 ✨</p>
          <h2 className="relative mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-tight">
            Start the plan today, so your family does not have to guess.
          </h2>
          <p className="relative mx-auto mt-4 max-w-[50ch] text-base leading-8 text-white/80">
            Choose your edition, check out on Amazon, and start with the Temporary Instructions page.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <AmazonButton asin={EDITIONS[0].asin} label="Buy on Amazon" className={btnGold} />
            <Link to="/contact" className={`${btnGhost} border-white/40 text-white hover:text-[#e8c46a]`}>
              Ask us a question
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  </>
);

export default LivingLegacyPlannerPage;
