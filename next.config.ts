import type { NextConfig } from "next";

// GitHub Pages project sites live under /<repo-name>. The deploy workflow sets
// NEXT_PUBLIC_BASE_PATH for that; Vercel and local dev leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Static HTML export: the `out/` folder can be hosted anywhere
  // (GitHub Pages, Vercel, Netlify, any static host).
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },

  // cacheComponents is left off: it needs a server and conflicts with
  // `output: "export"` (sitemap/robots must be force-static).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
