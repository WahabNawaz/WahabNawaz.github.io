// Placeholder data (lorem ipsum). Each list drives a section or a page.
import { lorem } from "./site";

export type Project = {
  slug: string;
  title: string;
  year: string;
  role: string;
  client: string;
  summary: string;
  tags: string[];
  url: string;
  challenge: string;
  solution: string;
  overview: string[];
  // Two colours for the generated placeholder cover. Replace with real images.
  colors: [string, string];
};

export const projects: Project[] = [
  {
    slug: "project-alpha",
    title: "Project Alpha",
    year: "2026",
    role: "Design & development",
    client: "Lorem Studio",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    tags: ["Next.js", "Three.js", "GSAP"],
    url: "https://example.com",
    challenge: lorem.paragraph,
    solution: lorem.long,
    overview: [lorem.paragraph, lorem.long],
    colors: ["#ff6a3d", "#ffd1a8"],
  },
  {
    slug: "project-beta",
    title: "Project Beta",
    year: "2026",
    role: "Front-end developer",
    client: "Ipsum Agency",
    summary: "Sed do eiusmod tempor incididunt ut labore et dolore magna.",
    tags: ["E-commerce", "Shopify", "Headless"],
    url: "https://example.com",
    challenge: lorem.paragraph,
    solution: lorem.long,
    overview: [lorem.paragraph, lorem.long],
    colors: ["#3d5aff", "#b8c4ff"],
  },
  {
    slug: "project-gamma",
    title: "Project Gamma",
    year: "2025",
    role: "WebGL developer",
    client: "Dolor Brand",
    summary: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    tags: ["WebGL", "GLSL", "React Three Fiber"],
    url: "https://example.com",
    challenge: lorem.paragraph,
    solution: lorem.long,
    overview: [lorem.paragraph, lorem.long],
    colors: ["#1f9d74", "#bfeedd"],
  },
  {
    slug: "project-delta",
    title: "Project Delta",
    year: "2025",
    role: "Automation",
    client: "Sit Amet Co.",
    summary: "Duis aute irure dolor in reprehenderit in voluptate velit.",
    tags: ["n8n", "OpenAI", "Automation"],
    url: "https://example.com",
    challenge: lorem.paragraph,
    solution: lorem.long,
    overview: [lorem.paragraph, lorem.long],
    colors: ["#9b3dff", "#e2c8ff"],
  },
];

export type Service = {
  id: string;
  number: string;
  title: string;
  kicker: string;
  intro: string;
  includes: { title: string; text: string }[];
  tools: string[];
};

const includes = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    title: `Lorem item ${i + 1}`,
    text: lorem.sentence,
  }));

export const services: Service[] = [
  {
    id: "development",
    number: "01",
    title: "Full-stack development",
    kicker: "Lorem ipsum dolor",
    intro: lorem.paragraph,
    includes: includes(6),
    tools: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
  },
  {
    id: "webgl",
    number: "02",
    title: "WebGL & 3D",
    kicker: "Consectetur adipiscing",
    intro: lorem.paragraph,
    includes: includes(6),
    tools: ["Three.js", "React Three Fiber", "GLSL", "Blender", "GSAP"],
  },
  {
    id: "ecommerce",
    number: "03",
    title: "E-commerce",
    kicker: "Sed do eiusmod",
    intro: lorem.paragraph,
    includes: includes(6),
    tools: ["Shopify", "Liquid", "Stripe", "Storefront API"],
  },
  {
    id: "automation",
    number: "04",
    title: "AI automation",
    kicker: "Tempor incididunt",
    intro: lorem.paragraph,
    includes: includes(6),
    tools: ["n8n", "Make", "Zapier", "OpenAI", "Claude"],
  },
];

export const process = [
  { step: "01", title: "Discovery", text: lorem.sentence },
  { step: "02", title: "Design", text: lorem.sentence },
  { step: "03", title: "Build", text: lorem.sentence },
  { step: "04", title: "Launch", text: lorem.sentence },
];

export const testimonials = [
  { quote: lorem.sentence, name: "Lorem Ipsum", company: "Dolor Studio" },
  { quote: lorem.paragraph.slice(0, 140) + ".", name: "Sit Amet", company: "Consectetur Co." },
  { quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.", name: "Adipiscing Elit", company: "Tempor Agency" },
  { quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse.", name: "Magna Aliqua", company: "Labore Brand" },
];

export const clients = ["Lorem", "Ipsum", "Dolor", "Sit Amet", "Consectetur", "Adipiscing", "Elit", "Tempor"];

export const experience = [
  { period: "2026 — Now", title: "Freelance", place: "Worldwide" },
  { period: "2025 — 2026", title: "Senior developer", place: "Lorem Studio" },
  { period: "2023 — 2025", title: "Front-end developer", place: "Ipsum Agency" },
];

export const hobbies = [
  { title: "Photography", text: lorem.sentence },
  { title: "Writing", text: lorem.sentence },
  { title: "Films & anime", text: lorem.sentence },
  { title: "Gaming", text: lorem.sentence },
];

export const faqs = [
  { q: "Lorem ipsum dolor sit amet?", a: lorem.paragraph },
  { q: "Consectetur adipiscing elit sed do?", a: lorem.sentence },
  { q: "Eiusmod tempor incididunt ut labore?", a: lorem.paragraph },
  { q: "Ut enim ad minim veniam quis?", a: lorem.sentence },
  { q: "Duis aute irure dolor in reprehenderit?", a: lorem.paragraph },
  { q: "Excepteur sint occaecat cupidatat?", a: lorem.sentence },
];
