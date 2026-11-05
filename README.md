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

## Your own 3D character + animations

Everything already works with the built-in placeholder. To use your own avatar:

1. **Avatar**: make one from a selfie at avaturn.me and download the GLB.
2. **Rig + animations**: upload it to mixamo.com (free Adobe login). Download these animations as FBX
   (tick **In Place** for jump/walk): Idle, Typing, Jump, Waving, Sitting, Pushing, and two dances.
3. **Convert** each FBX to GLB (Blender: File → Import → FBX, then File → Export → glTF Binary),
   then compress: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`.
4. Put them in `public/models/` using the names in `src/content/avatar.ts`
   (`avatar.glb`, `anim/idle.glb`, `anim/typing.glb`, …) and set `enabled: true`.

Which animation plays where (hero = typing, big name = jump, footer/contact = wave, Playground = dance)
is set in `animFor()` in `src/components/scene/poses.ts`.

## Playground music

`src/content/music.ts` lists the songs. The "Demo beat" is generated in the browser. Add tracks you have
the rights to (for example free tracks from pixabay.com/music) as MP3s in `public/audio/` with their BPM.
The showreel video path goes in `site.showreel` (`src/content/site.ts`).

## Contact form

The site is static, so there is no server to receive form posts. Use the email and Copy email button, or add a form service such as Formspree or Web3Forms.
