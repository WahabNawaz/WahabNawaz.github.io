import type { MetadataRoute } from "next";
import { projects } from "@/content/data";
import { nav, site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = nav.map((n) => ({ url: `${site.url}${n.href}`, priority: n.href === "/" ? 1 : 0.8 }));
  const work = projects.map((p) => ({ url: `${site.url}/work/${p.slug}/`, priority: 0.7 }));
  return [...pages, ...work];
}
