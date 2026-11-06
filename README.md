# portfolio-3d

A 3D portfolio starter: **Next.js 16 + React Three Fiber + GSAP + Lenis**.
All copy is placeholder (lorem ipsum). The 3D character is a free CC0 stand-in (see Credits) until you add your own.

## What is inside

| Feature | Where |
|---|---|
| Persistent 3D character that walks between pages and sections | `src/components/scene/` |
| Where the character stands (per page / per section) | `src/components/scene/poses.ts` |
| GLSL sky with Day / Sunset / Night toggle (home hero) | `src/components/scene/Sky.tsx`, `src/components/SkyToggle.tsx` |
| Smooth scroll (Lenis) synced with GSAP ScrollTrigger | `src/components/SmoothScroll.tsx` |
| Scroll reveals, word-by-word text | `src/components/Reveal.tsx`, `src/components/ScrubText.tsx` |
| Opening: preloader → character walks in and sits → camera rises → headline → nav | `Preloader.tsx`, `scene/Avatar.tsx`, `scene/Scene.tsx` |
| Character animations, head follows the mouse, dance on the beat | `src/components/scene/AvatarRig.tsx`, `src/content/avatar.ts` |
| Pages: Home, Work, case studies, Services, About, Photography, Playground, FAQ, Contact, 404 | `src/app/` |
| Tests (Playwright, 5 screen sizes) | `tests/e2e/site.spec.ts` |
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

## Tests

```bash
npm run build
npm run test:e2e
```

Runs the site from `out/` in Microsoft Edge at 1920×1080, 1440×900, 768×1024, 390×844 and 360×800:
loader and entrance, cursor, scrolling, menu and keyboard focus, back/forward, work pages, services tabs and
ring dragging, About desk, photo lightbox (keys, swipe), Playground music + dance, contact form validation,
footer, reduced motion, no sideways scrolling. Screenshots land in `tests/screenshots/<size>/`,
the HTML report in `tests/report/`.

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

## The 3D character

Right now: **Hoodie Character** from Quaternius' *Ultimate Modular Men* pack, with animations from
Quaternius' *Universal Animation Library* (idle, talk, sit down, sit, walk, jog, jump, push, dance).
Both are **CC0 (public domain)**: free for any use, no credit required. The animations were made for a
different skeleton, so they were retargeted onto this character in a script (each bone copies the source
bone's rotation change from its T-pose; legs, feet and hips are matched to the character's own rig) and the
file was compressed with meshopt: `public/models/avatar.glb`, about 490 KB.

Clip names and which animation plays where:

- `src/content/avatar.ts`: state → clip (`typing`, `walk`, `dance1`, …), speed, beats per loop for dances.
- `src/components/scene/poses.ts`: where the character stands and what it does per page / section
  (hero = sits on the rock with a laptop, big name = jogs, footer/contact = waves, Playground = dances).

### Your own avatar later

1. **Avatar**: make one from a selfie at avaturn.me and download the GLB.
2. **Rig + animations**: upload it to mixamo.com (free Adobe login). Download animations as FBX
   (tick **In Place** for walk/jog): Idle, Talking, Sitting, Sit down, Walking, Jogging, Jump, Waving, Pushing, two dances.
3. **Convert** each FBX to GLB (Blender: File → Import → FBX, then File → Export → glTF Binary),
   then compress: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`.
4. Put them in `public/models/` and point `model` and each clip's `file` in `src/content/avatar.ts` at them.
   Mark sitting clips `seated: true`. A seated state without a sitting clip is bent into a sitting pose in code.

## Playground music

`src/content/music.ts` lists the songs. The "Demo beat" is generated in the browser. Add tracks you have
the rights to (for example free tracks from pixabay.com/music) as MP3s in `public/audio/` with their BPM.
The showreel video path goes in `site.showreel` (`src/content/site.ts`).

## Contact form

The site is static, so there is no server to receive form posts. The form checks the fields, then opens the
visitor's email app with the message filled in. To receive messages directly instead, create a free form at
Formspree or Web3Forms and put its public endpoint URL in `site.formEndpoint` (`src/content/site.ts`).
Never put secret keys in the site code.

## Credits

- 3D character: "Hoodie Character", Ultimate Modular Men pack by Quaternius (quaternius.com), CC0 1.0.
- Animations: Universal Animation Library (Standard) by Quaternius, CC0 1.0. Retargeted onto the character.
- Playground "Demo beat" tracks: generated in the browser by `src/lib/demo-beat.ts` (original).
