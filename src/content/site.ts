// All copy here is placeholder (lorem ipsum). Replace it with real content.

export const site = {
  name: "Abdul Wahab",
  shortName: "AW",
  role: "Web Developer",
  tagline: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  // Used for canonical URLs, sitemap and Open Graph. Change after deploying.
  url: "https://wahabnawaz.github.io",
  email: "hello@example.com",
  location: "Lorem City",
  timeZone: "Asia/Karachi",
  status: "Open for new projects",
  year: "2026",
  // Showreel video for the Playground, e.g. "/video/showreel.mp4" (put the file in /public/video)
  showreel: "" as string,
  // Contact form delivery (static hosting, so a form service sends the email).
  // Pick ONE and fill it in; leave both empty and the form opens the visitor's
  // email app instead.
  //  - Web3Forms: get a free access key at https://web3forms.com (it is emailed
  //    to you), then provider "web3forms" + accessKey "xxxxxxxx-xxxx-...".
  //    Or leave this file alone and add a GitHub repository variable named
  //    WEB3FORMS_KEY; the deploy workflow passes it in at build time.
  //  - Formspree: create a form at https://formspree.io, then provider
  //    "formspree" + endpoint "https://formspree.io/f/xxxxxxx".
  // Both values are public by design. Never put a secret key here.
  form: {
    provider: (process.env.NEXT_PUBLIC_WEB3FORMS_KEY ? "web3forms" : "") as "" | "web3forms" | "formspree",
    accessKey: (process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "") as string,
    endpoint: "" as string,
  },
  // Optional extra art: two transparent cut-out images floating in the hero sky,
  // e.g. "/hero/left.webp". The hero hands are 3D (scene/HeroHands.tsx), so
  // these stay empty unless you want something more.
  heroArt: { left: "" as string, right: "" as string },
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "X", href: "https://x.com/" },
  ],
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work/" },
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Photography", href: "/photography/" },
  { label: "Playground", href: "/playground/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Contact", href: "/contact/" },
];

export const lorem = {
  short: "Lorem ipsum dolor sit amet.",
  sentence:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  paragraph:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  long:
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.",
};
