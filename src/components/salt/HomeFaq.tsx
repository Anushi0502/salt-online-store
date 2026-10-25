import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import { DELIVERY_DETAIL, RETURNS_DETAIL, PAYMENT_DETAIL } from "@/lib/store-promises";

// Short answers to the questions shoppers (and search/AI answers) ask before a
// first order. Facts come from store-promises so they match the policies.
const HOME_FAQ: Array<{ question: string; answer: string }> = [
  { question: "How long does delivery take?", answer: DELIVERY_DETAIL },
  { question: "Is shipping free?", answer: "Yes. Standard shipping is free on all US orders." },
  {
    question: "How does Bundle & Save work?",
    answer:
      "Add any 2 items from the Bundle & Save collection and 20% comes off automatically at checkout. Add 3 or more and you save 30%. Mix and match any items in the collection; no code needed.",
  },
  { question: "What is the return policy?", answer: RETURNS_DETAIL },
  { question: "Which payment methods can I use?", answer: PAYMENT_DETAIL },
];

export function HomeFaq() {
  return (
    <section
      aria-labelledby="home-faq-title"
      className="salt-section-shell rounded-[1.75rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="home-faq-title"
          className="font-display text-[clamp(1.45rem,3vw,2.15rem)] leading-[0.96] tracking-[-0.035em] text-foreground"
        >
          Questions before you order
        </h2>
        <Link
          to="/pages/faq"
          className="salt-outline-chip h-10 px-4 py-0 text-[0.66rem] font-bold uppercase tracking-[0.14em]"
        >
          All FAQs
        </Link>
      </div>
      <div className="mt-5 divide-y divide-border/70 rounded-[1.25rem] border border-border/70 bg-background/75">
        {HOME_FAQ.map((item) => (
          <details key={item.question} className="group px-4 py-3 sm:px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.95rem] font-semibold text-foreground">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-2 text-[0.88rem] leading-6 text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
