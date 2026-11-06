// Prefix a /public path with the GitHub Pages base path when it is set.
// Plain module (no "use client"), so server and client components can both use it.
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
