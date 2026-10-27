import { BookOpen, Heart, ShieldCheck, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import InnerBreadcrumbs from "@/components/storefront/InnerBreadcrumbs";
import Reveal from "@/components/storefront/Reveal";
import SectionHeading from "@/components/storefront/SectionHeading";
import SeoMetadata from "@/components/storefront/SeoMetadata";
import livingLegacyBanner from "@/assets/collection-banners/living-legacy-planner-banner.webp";

const PAGE_PATH = "/pages/living-legacy-planner";

const EDITIONS = [
  {
    title: "Hardcover",
    price: "$29.95",
    detail: "Hardcover, 172 pages, 8.25 x 11 in",
    handle: "the-living-legacy-planner",
    summary: "The full planner for seniors and families who want one clear place for their wishes.",
  },
  {
    title: "Color Edition",
    price: "$52.00",
    detail: "Full-color interior, 182 pages, 8.5 x 11 in",
    handle: "products-living-legacy-planner-for-seniors",
    summary: "The same planner in full color, for readers who want the pages easier to follow.",
  },
  {
    title: "Military Deployment & Family Readiness",
    price: "$24.00",
    detail: "Paperback, 79 pages, 8.5 x 11 in",
    handle: "living-legacy-planner-military-deployment-family-readiness-edition",
    summary: "For service members, veterans and the family members who keep things running while they are away.",
  },
];

const INSIDE = [
  "A Temporary Instructions page for when someone needs to take over for a while after an accident, illness or surgery.",
  "Medical details: allergies, medications, surgeries, pharmacy, doctors, hospitals and wishes for medical care.",
  "Insurance, wills, trusts and beneficiaries kept together.",
  "A financial section for personal and business accounts.",
  "Home and service contacts, from the HVAC company to the handyman.",
  "Funeral and final arrangements, plus legacy and life-story pages.",
  "A 10-point discussion guide to start the conversation with the people who matter to you.",
];

const WHY_FAMILIES = [
  "Your family knows what you want and where to find it, so there is less guessing and fewer disputes.",
  "Everything is in one book instead of across folders, drawers and phone notes.",
  "Plenty of room to update entries as your plans or health change, without buying a new book.",
  "A guide to start the hard conversation, so it happens while everyone can still talk it through.",
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
      "Courtney R. Jones, founder of S.A.L.T. (Senior and Living Today) in Dayton, Ohio, and a senior-care advocate with more than 30 years of experience.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "The Living Legacy Planner",
    author: { "@type": "Person", name: "Courtney R. Jones" },
    description:
      "An end-of-life planner and final wishes organizer for seniors, adults who live alone, caregivers and families.",
    url: `https://www.saltonlinestore.com${PAGE_PATH}`,
    image: "https://www.saltonlinestore.com/assets/living-legacy-planner-banner.webp",
    offers: EDITIONS.map((edition) => ({
      "@type": "Offer",
      name: edition.title,
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

const cardClass =
  "rounded-[1.5rem] border border-border/70 bg-background/92 p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.16)] sm:p-6";

const LivingLegacyPlannerPage = () => (
  <>
    <SeoMetadata
      title="Living Legacy Planner: End-of-Life & Final Wishes Organizer | SALT"
      description="Record medical wishes, finances, insurance, funeral plans and life stories in one planner. By Courtney R. Jones. Hardcover, color and military editions."
      canonicalPath={PAGE_PATH}
      image={livingLegacyBanner}
      structuredData={structuredData}
    />

    <section className="mx-auto mt-5 w-[min(1160px,calc(100%_-_20px))] pb-10">
      <Reveal>
        <InnerBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Living Legacy Planner" },
          ]}
        />
      </Reveal>

      <Reveal>
        <div className="mt-4 overflow-hidden rounded-[1.65rem] border border-border/70 bg-background/92 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.18)]">
          <img
            src={livingLegacyBanner}
            alt="The Living Legacy Planner by Courtney R. Jones, sold and shipped by Amazon"
            className="block h-auto w-full"
            fetchPriority="high"
          />
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-10">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                End-of-life planner · Final wishes organizer
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.96] tracking-[-0.04em] text-foreground">
                The Living Legacy Planner
              </h1>
              <p className="mt-4 max-w-[60ch] text-base leading-7 text-muted-foreground sm:text-lg">
                Make sure your family knows what you want and where to find it. One planner for medical care,
                finances, insurance, funeral arrangements and the stories you want to pass on. Written by
                Courtney R. Jones, a senior-care advocate with more than 30 years of experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#editions"
                  className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_18px_36px_-22px_rgba(37,99,235,0.7)] transition hover:-translate-y-px"
                >
                  Choose your edition
                </a>
                <Link
                  to="/contact"
                  className="inline-flex min-h-12 items-center rounded-full border border-border px-6 text-sm font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  Ask us a question
                </Link>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                Sold and shipped by Amazon. Delivery dates are shown at checkout.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { value: "7", label: "areas the planner covers" },
                { value: "10", label: "point discussion guide" },
                { value: "3", label: "editions to choose from" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-border/70 bg-card p-4">
                  <p className="font-display text-3xl text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section id="editions" className="mt-10 scroll-mt-28">
          <SectionHeading
            kicker="Editions"
            title="Choose the edition that fits your family"
            description="Each edition is printed and shipped by Amazon, so you check out on Amazon with its delivery and returns policy."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {EDITIONS.map((edition) => (
              <article key={edition.handle} className={`${cardClass} flex flex-col`}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{edition.detail}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">{edition.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{edition.summary}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="font-display text-2xl text-foreground">{edition.price}</span>
                  <Link
                    to={`/products/${edition.handle}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                  >
                    View and buy
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <SectionHeading kicker="What's inside" title="Every part of the plan, in one book" as="h2" />
            <ul className="mt-5 grid gap-3">
              {INSIDE.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <BookOpen className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={cardClass}>
            <SectionHeading kicker="Why families use it" title="Less guessing when it matters most" as="h2" />
            <ul className="mt-5 grid gap-3">
              {WHY_FAMILIES.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className={cardClass}>
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-2xl text-foreground">Who it's for</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Seniors, adults who live alone, caregivers and families who want a clear plan. It is also a thoughtful
              gift for a parent or grandparent.
            </p>
          </div>
          <div className={cardClass}>
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-2xl text-foreground">Stories from families</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We are gathering stories from families who have used the planner. We only publish a story after the
              person who wrote it gives us permission.
            </p>
            <Link to="/contact" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
              Share your story
            </Link>
          </div>
          <div className={cardClass}>
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-display text-2xl text-foreground">Reviews</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Read what buyers say about each edition on its product page, where reviews are kept together with the
              product.
            </p>
            <Link to="/products/the-living-legacy-planner/reviews" className="mt-4 inline-flex text-sm font-bold text-primary hover:underline">
              Read hardcover reviews
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10 rounded-[1.5rem] border border-border/70 bg-card p-6 sm:p-8">
          <SectionHeading
            kicker="Share your pages"
            title="Finished a page? Show someone what your plan looks like"
            description="Once your planner is filled in, you can send us a photo of a page you are happy to share. Remove any private details first, such as account numbers or addresses. We ask for permission before we post anything."
            as="h2"
          />
          <Link
            to="/contact"
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-border px-5 text-xs font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            Send us a photo
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <SectionHeading kicker="About the author" title="Courtney R. Jones" as="h2" />
          <p className="mt-4 max-w-[70ch] text-sm leading-7 text-muted-foreground sm:text-base">
            Courtney R. Jones is the founder of S.A.L.T. (Senior and Living Today) in Dayton, Ohio, and a senior-care
            advocate with more than 30 years of experience. Courtney wrote The Living Legacy Planner and the SALT
            Online Store is the shop of Senior and Living Today.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10">
          <SectionHeading kicker="Questions" title="Common questions about the planner" as="h2" />
          <div className="mt-5 grid gap-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className={`${cardClass} group`}>
                <summary className="cursor-pointer list-none font-semibold text-foreground">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-10 rounded-[1.65rem] bg-[#0f2547] p-6 text-white sm:p-10">
          <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight">
            Start the plan today, so your family does not have to guess.
          </h2>
          <p className="mt-3 max-w-[60ch] text-sm leading-6 text-white/85 sm:text-base">
            Choose an edition, check out on Amazon, and start with the Temporary Instructions page.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#editions"
              className="inline-flex min-h-12 items-center rounded-full bg-[#e8c46a] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[#0f2547]"
            >
              Choose your edition
            </a>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white"
            >
              Ask us a question
            </Link>
          </div>
        </section>
      </Reveal>
    </section>
  </>
);

export default LivingLegacyPlannerPage;
