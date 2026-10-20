// Single source for every delivery, returns and payment promise shown on the
// storefront. Keep these in line with the Shopify shipping and refund policies
// (Settings > Policies); the product page, cart, footer and FAQ all read them.

export const DELIVERY_ESTIMATE = "5–15 business days";
export const DELIVERY_EXTENDED_MAX = "20 business days";
export const PROCESSING_TIME = "1–2 business days";
export const RETURN_WINDOW_DAYS = 14;
export const CANCELLATION_WINDOW_HOURS = 24;
export const SUPPORT_EMAIL = "help@saltonlinestore.com";

// Store page in the Shop app (Shopify admin > Sales channels > Shop). Leave
// empty to hide the Shop app links.
export const SHOP_APP_STORE_URL = "";

// Shop Pay Installments must be turned on in Settings > Payments before this
// is shown.
export const SHOP_PAY_INSTALLMENTS_ENABLED = false;

export const DELIVERY_SUMMARY = `Free US shipping. Delivery usually takes ${DELIVERY_ESTIMATE}.`;

export const DELIVERY_DETAIL =
  `Orders are processed in ${PROCESSING_TIME} and usually arrive within ${DELIVERY_ESTIMATE} of ordering. ` +
  `During holidays or carrier delays, delivery can occasionally take up to ${DELIVERY_EXTENDED_MAX}. ` +
  "Every order ships with tracking, and we email the tracking number as soon as it ships. We ship to all 50 US states.";

export const RETURNS_DETAIL =
  `You can request a return within ${RETURN_WINDOW_DAYS} days of delivery. Items must be unused, in their original ` +
  `packaging, with tags. Email ${SUPPORT_EMAIL} with your order number to start a return. Some items, such as ` +
  "personal care, custom and sale items, cannot be returned. Damaged or wrong items are always put right.";

export const CANCELLATION_DETAIL =
  `You can cancel or change an order within ${CANCELLATION_WINDOW_HOURS} hours, before it ships.`;

export const PAYMENT_DETAIL = SHOP_PAY_INSTALLMENTS_ENABLED
  ? "Pay securely with card, Shop Pay, Apple Pay or Google Pay. Eligible orders can be split into installments with Shop Pay Installments."
  : "Pay securely with card, Shop Pay, Apple Pay or Google Pay.";

export const STORE_FAQ: Array<{ question: string; answer: string }> = [
  { question: "How long does delivery take?", answer: DELIVERY_DETAIL },
  { question: "Is shipping free?", answer: "Yes. Standard shipping is free on all US orders." },
  { question: "What is the return policy?", answer: RETURNS_DETAIL },
  { question: "Can I cancel my order?", answer: CANCELLATION_DETAIL },
  { question: "Which payment methods can I use?", answer: PAYMENT_DETAIL },
  ...(SHOP_APP_STORE_URL
    ? [
        {
          question: "Can I buy SALT products in the Shop app?",
          answer:
            "Yes. SALT has a store in Shopify's Shop app, where you can check out with Shop Pay and track your orders.",
        },
      ]
    : []),
];
