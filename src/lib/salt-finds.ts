export type SaltFindGuide = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

// Guides naming brands or licensed characters (Digital Circus, Realme,
// Mobwol, branded earbuds) stay published but are not promoted on the homepage.
export const SALT_FIND_GUIDES: readonly SaltFindGuide[] = [
  {
    eyebrow: "This week's pick",
    title: "Practical gifts for someone who has everything",
    description: "Choose by routine, usefulness, and the live product details—not a generic gift label.",
    href: "/pages/resources?resource=guide&handle=gift-guides%2Fpractical-gifts-for-someone-who-has-everything",
  },
  {
    eyebrow: "Build & play",
    title: "Interactive STEM assembly activities",
    description: "Start with the build idea, age wording and time you have.",
    href: "/pages/interactive-stem-assembly-activities-for-kids",
  },
  {
    eyebrow: "Kitchen edit",
    title: "Kitchen & Cookware buying guide",
    description: "Choose the kitchen helper by the task you need to solve.",
    href: "/pages/kitchen-cookware-buying-guide",
  },
  {
    eyebrow: "Style cues",
    title: "Jeans & Denim fit guide",
    description: "Use title-led style cues, then confirm the live size options.",
    href: "/pages/jeans-denim-fit-guide",
  },
  {
    eyebrow: "Fit & style",
    title: "Canvas belt sizing guide",
    description: "Measure first, then compare buckle wording and length options.",
    href: "/pages/canvas-belt-sizing-style-guide",
  },
];
