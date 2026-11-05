# portfolio-3d

A 3D portfolio starter: **Next.js 16 + React Three Fiber + GSAP + Lenis**.
All copy is placeholder (lorem ipsum) and the 3D character is a placeholder built from simple shapes.

## What is inside

| Feature | Where |
|---|---|
| Persistent 3D character that walks between pages and sections | `src/components/scene/` |
| Where the character stands (per page / per section) | `src/components/scene/poses.ts` |
| GLSL sky with Day / Sunset / Night toggle (home hero) | `src/components/scene/Sky.tsx`, `src/components/SkyToggle.tsx` |
| Smooth scroll (Lenis) synced with GSAP ScrollTrigger | `src/components/SmoothScroll.tsx` |
| Scroll reveals, word-by-word text | `src/components/Reveal.tsx`, `src/components/ScrubText.tsx` |
| Pages: Home, Work, case studies, Services, About, Contact, FAQ, 404 | `src/app/` |
| All text and lists (edit these first) | `src/content/site.ts`, `src/content/data.ts` |
| SEO: metadata, JSON-LD, sitemap, robots | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts` |

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

This creates a fully static site in `out/` (HTML, CSS, JS). Any static host can serve it.

## Free hosting

### Option A: GitHub Pages (free `username.github.io/repo-name` link)

1. Create a GitHub repo and push this folder to the `main` branch.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site.
   The workflow sets the `/repo-name` base path automatically.

### Option B: Vercel (free `project.vercel.app` link)

1. Push the repo to GitHub.
2. On vercel.com: **Add New → Project → Import** the repo. Keep the defaults and deploy.

After deploying, set `site.url` in `src/content/site.ts` to the real address (used by the sitemap and social previews).

## Replace the placeholder character

1. Model or download a rigged character (Blender, or Mixamo for rigging and animations).
2. Compress it: `npx @gltf-transform/cli optimize in.glb public/models/avatar.glb --compress meshopt`
3. In `src/components/scene/Avatar.tsx`, load it with `useGLTF(asset("/models/avatar.glb"))` and play clips with `useAnimations`.
   Keep the outer `<group ref={root}>`, so the poses and page-to-page moves keep working.

Use `asset()` from `src/lib/scene-store.ts` for every file in `public/` that you load from JavaScript, so paths also work under the GitHub Pages base path.

## Contact form

The site is static, so there is no server to receive form posts. Use the email and Copy email button, or add a form service such as Formspree or Web3Forms.
