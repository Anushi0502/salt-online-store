import { Link } from "react-router-dom";
import InnerBreadcrumbs from "@/components/storefront/InnerBreadcrumbs";
import Reveal from "@/components/storefront/Reveal";
import SeoMetadata from "@/components/storefront/SeoMetadata";
import livingLegacyBanner from "@/assets/collection-banners/living-legacy-planner-banner.webp";

const PAGE_PATH = "/pages/living-legacy-planner";

const EDITIONS = [
  {
    title: "The Living Legacy Planner",
    edition: "Hardcover",
    price: "$29.95",
    detail: "172 pages · 8.25 × 11 in",
    handle: "the-living-legacy-planner",
    summary:
      "The full planner for seniors and families who want one clear place for their wishes, from medical care to the stories they want to pass on.",
    emoji: "📘",
    cover: "#0f2547",
    accent: "#e8c46a",
  },
  {
    title: "Color Edition",
    edition: "Full color",
    price: "$52.00",
    detail: "182 pages · 8.5 × 11 in",
    handle: "products-living-legacy-planner-for-seniors",
    summary:
      "The same planner in full color, so the sections are easier to find and the pages are a pleasure to fill in.",
    emoji: "🎨",
    cover: "#3f6e8c",
    accent: "#f2a65a",
  },
  {
    title: "Military Deployment & Family Readiness",
    edition: "Paperback",
    price: "$24.00",
    detail: "79 pages · 8.5 × 11 in",
    handle: "living-legacy-planner-military-deployment-family-readiness-edition",
    summary:
      "For service members, veterans and the family members who keep things running while they are away.",
    emoji: "🎖️",
    cover: "#4a5a3a",
    accent: "#e6d9b8",
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

const FAQS = [
  {
    question: "What is The Living Legacy Planner?",
    answer:
      "It is an end-of-life planner and final wishes organizer. It helps seniors and adults record medical care preferences, financial details, insurance, funeral arrangements and life stories in one place.",
  },
  {
    question: "Which edition should I choose?",
    answer:
      "The Hardcover is the full planner. The Color Edition has a full-color interior. The Military Deployment and Family Readiness Edition is a paperback for service members, veterans and their families who need a plan while away from home.",
  },
  {
    question: "Where do I buy it, and how long does delivery take?",
    answer:
      "Each edition is printed and shipped by Amazon. You check out on Amazon, and Amazon's delivery and return policy applies. Delivery dates are shown at checkout.",
  },
  {
    question: "Who wrote it?",
    answer:
      "Courtney R. Jones, founder of Senior and Living Today (S.A.L.T.) in Dayton, Ohio, and a senior-care advocate with more than 30 years of experience.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "The Living Legacy Planner",
    author: { "@type": "Person", name: "Courtney R. Jones" },
    publisher: { "@type": "Organization", name: "Senior and Living Today (S.A.L.T.)" },
    description:
      "An end-of-life planner and final wishes organizer for seniors, adults who live alone, caregivers and families.",
    url: `https://www.saltonlinestore.com${PAGE_PATH}`,
    image: "https://www.saltonlinestore.com/assets/living-legacy-planner-banner.webp",
    offers: EDITIONS.map((edition) => ({
      "@type": "Offer",
      name: `${edition.title}, ${edition.edition}`,
      price: edition.price.replace("$", ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.saltonlinestore.com/products/${edition.handle}`,
    })),
  },
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

// A simple illustrated planner cover, drawn in SVG so it works without image files.
const BookCover = ({ color, accent, title, edition, className = "" }: { color: string; accent: string; title: string; edition: string; className?: string }) => (
  <svg viewBox="0 0 300 400" role="img" aria-label={`${title}, ${edition} cover illustration`} className={className}>
    <rect x="34" y="18" width="250" height="364" rx="18" fill={color} />
    <rect x="34" y="18" width="26" height="364" rx="10" fill="rgba(0,0,0,0.22)" />
    <circle cx="170" cy="130" r="54" fill={accent} opacity="0.9" />
    <path d="M170 102 C152 118, 152 146, 170 158 C188 146, 188 118, 170 102Z" fill={color} opacity="0.85" />
    <rect x="86" y="214" width="170" height="10" rx="5" fill={accent} opacity="0.85" />
    <rect x="86" y="238" width="140" height="8" rx="4" fill="#ffffff" opacity="0.55" />
    <rect x="86" y="258" width="150" height="8" rx="4" fill="#ffffff" opacity="0.55" />
    <rect x="86" y="278" width="120" height="8" rx="4" fill="#ffffff" opacity="0.55" />
    <text x="170" y="336" textAnchor="middle" fill="#ffffff" fontSize="20" fontFamily="Georgia, serif" fontWeight="700">The Living</text>
    <text x="170" y="362" textAnchor="middle" fill="#ffffff" fontSize="20" fontFamily="Georgia, serif" fontWeight="700">Legacy Planner</text>
  </svg>
);

const LivingLegacyPlannerPage = () => (
  <>
    <SeoMetadata
      title="Living Legacy Planner: End-of-Life & Final Wishes Organizer | SALT"
      description="From Senior and Living Today (S.A.L.T.): record medical wishes, finances, insurance, funeral plans and life stories in one planner by Courtney R. Jones."
      canonicalPath={PAGE_PATH}
      image={livingLegacyBanner}
      structuredData={structuredData}
    />
    <style>{pageStyles}</style>

    <section className="mx-auto mt-5 w-[min(1200px,calc(100%_-_20px))] space-y-8 pb-12 sm:space-y-10">
      <Reveal>
        <InnerBreadcrumbs items={[{ label: "Home", to: "/" }, { label: "Living Legacy Planner" }]} />
      </Reveal>

      {/* 1. Hero block */}
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
                planner by Courtney R. Jones.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#editions" className={`${btnPrimary} bg-[#e8c46a] text-[#0f2547]`}>
                  Choose your edition
                </a>
                <Link to="/contact" className={`${btnGhost} border-white/40 text-white hover:text-[#e8c46a]`}>
                  Ask us a question
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[420px]">
              <BookCover className="llp-float w-full drop-shadow-[0_40px_50px_rgba(0,0,0,0.45)]" color="#1d3d6e" accent="#e8c46a" title="The Living Legacy Planner" edition="Hardcover" />
            </div>
          </div>
          <p className="relative border-t border-white/10 px-6 py-4 text-sm text-white/75 sm:px-10">
            🚚 Printed and shipped by Amazon. Delivery dates are shown at checkout.
          </p>
        </div>
      </Reveal>

      {/* 2. Brand block */}
      <Reveal>
        <div className={`${panel} grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center`}>
          <div className="relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center">
            <svg viewBox="0 0 300 300" role="img" aria-label="Senior and Living Today S.A.L.T. emblem" className="w-full">
              <circle cx="150" cy="150" r="140" fill="#f6efe4" />
              <circle cx="150" cy="150" r="120" fill="none" stroke="#0f2547" strokeWidth="2" strokeDasharray="6 8" className="llp-sway" />
              <text x="150" y="140" textAnchor="middle" fill="#0f2547" fontSize="50" fontFamily="Georgia, serif" fontWeight="700" letterSpacing="4">S.A.L.T.</text>
              <text x="150" y="175" textAnchor="middle" fill="#9a3b2e" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="3">SENIOR AND LIVING TODAY</text>
              <path d="M150 200 C130 186, 120 204, 150 222 C180 204, 170 186, 150 200Z" fill="#9a3b2e" opacity="0.8" />
            </svg>
          </div>
          <div>
            <p className={kicker}>Our brand</p>
            <h2 className={h2}>Senior and Living Today</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              S.A.L.T. stands for Senior and Living Today. Based in Dayton, Ohio, it is the brand behind the planners
              and resources on this site, built for older adults, families and caregivers who want clear, practical tools
              for everyday life and for the planning that comes after.
            </p>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Every product here is made in-house under this brand. ❤️
            </p>
          </div>
        </div>
      </Reveal>

      {/* 3. Editions: one big block each */}
      <div id="editions" className="scroll-mt-28 space-y-8 sm:space-y-10">
        {EDITIONS.map((edition, index) => (
          <Reveal key={edition.handle}>
            <article className={`${panel} llp-lift grid gap-8 lg:grid-cols-2 lg:items-center ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="flex justify-center rounded-[1.5rem] bg-card p-6 sm:p-10">
                <BookCover
                  className="llp-float w-full max-w-[300px] drop-shadow-[0_30px_40px_rgba(15,23,42,0.3)]"
                  color={edition.cover}
                  accent={edition.accent}
                  title={edition.title}
                  edition={edition.edition}
                />
              </div>
              <div>
                <p className={kicker}>
                  {edition.emoji} {edition.edition} · {edition.detail}
                </p>
                <h2 className={h2}>{edition.title}</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">{edition.summary}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <span className="font-display text-4xl text-foreground">{edition.price}</span>
                  <Link to={`/products/${edition.handle}`} className={btnPrimary}>
                    View and buy
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* 4. What's inside */}
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

      {/* 5. Why families use it */}
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
                It is also a gift that says, "I have thought about this for you." For seniors who live alone, caregivers,
                and families who want a clear plan.
              </p>
            </div>
            <Link to="#editions" className={`${btnPrimary} mt-8 self-start bg-[#e8c46a] text-[#0f2547]`}>
              Find the right edition
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 6. Stories, reviews and sharing */}
      <Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              emoji: "🌷",
              title: "Family stories",
              text: "We are gathering stories from families who have used the planner. We only publish a story after the person who wrote it gives us permission.",
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

      {/* 7. Author block */}
      <Reveal>
        <div className={`${panel} grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center`}>
          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[#0f2547] font-display text-5xl text-[#e8c46a]" aria-hidden="true">
            CRJ
          </div>
          <div>
            <p className={kicker}>✍️ Meet the author</p>
            <h2 className={h2}>Courtney R. Jones</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Courtney R. Jones is the founder of Senior and Living Today (S.A.L.T.) in Dayton, Ohio, and a senior-care
              advocate with more than 30 years of experience. Courtney wrote The Living Legacy Planner.
            </p>
          </div>
        </div>
      </Reveal>

      {/* 8. FAQ */}
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

      {/* 9. Final call to action */}
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
            <a href="#editions" className={`${btnPrimary} bg-[#e8c46a] text-[#0f2547]`}>
              Choose your edition
            </a>
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
