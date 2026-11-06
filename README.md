# portfolio-3d

A 3D portfolio starter: **Next.js 16 + React Three Fiber + GSAP + Lenis**.
All copy is placeholder (lorem ipsum). The 3D character is Abdul Wahab's own avatar, made from his photo (see "The 3D character").

## What is inside

| Feature | Where |
|---|---|
| Persistent 3D character that walks between pages and sections | `src/components/scene/` |
| Where the character stands (per page / per section) | `src/components/scene/poses.ts` |
| GLSL sky with Day / Sunset / Night toggle (home hero) | `src/components/scene/Sky.tsx`, `src/components/SkyToggle.tsx` |
| Smooth scroll (Lenis) synced with GSAP ScrollTrigger | `src/components/SmoothScroll.tsx` |
| Scroll reveals, word-by-word text | `src/components/Reveal.tsx`, `src/components/ScrubText.tsx` |
| Opening: preloader → character walks in and sits → camera rises → headline → nav | `Preloader.tsx`, `scene/Avatar.tsx`, `scene/Scene.tsx` |
| Character animations, head follows the mouse, blinking, dance on the beat | `src/components/scene/AvatarRig.tsx`, `src/content/avatar.ts` |
| Hero hands: 3D hand to sit in + a hand that points at the mouse | `src/components/scene/HeroHands.tsx` |
| Service illustrations (original, rendered in three.js) | `public/illustrations/`, `tools/render/services.html` |
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
ring dragging, service illustrations, About desk, photos + lightbox (keys, swipe), Playground music + dance,
contact form validation, the pointing hand, blinking, footer, reduced motion, no sideways scrolling. Screenshots land in `tests/screenshots/<size>/`,
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

**Avatar**: made with **MetaPerson Creator** (Avatar SDK, metaperson.avatarsdk.com) from Abdul Wahab's own
photo, hair darkened and outfit chosen in the editor, exported as GLB (42K triangles, 1K textures, 73-bone
humanoid rig). The outfit was then recoloured black in the texture (owner's choice), and black sunglasses are
added in code (`src/components/scene/glasses.ts`, fitted to the eye bones, they follow the head).
A real shalwar kameez cut needs a new export from MetaPerson (their editor has one; extra exports cost coins).
**Licence:** this was the *free export*, which MetaPerson marks as **trial / non-commercial use** (their EULA,
accepted by the owner at export time). For commercial use buy a commercial export from Avatar SDK, or switch
back to a CC0 character. The raw photos are **not** in this repository.

**Animations**: Quaternius *Universal Animation Library* (idle, talk, sit down, sit, walk, jog, jump, push,
dance; CC0) and the Wave from Quaternius' *Hoodie Character* (CC0), retargeted onto the avatar's skeleton with
`tools/retarget/retarget-std.mjs` (each mapped bone copies the source bone's world rotation change from its
T-pose; hips follow the pelvis, scaled by hip height). The script also keeps only the face blendshapes the site
uses (blink, smile, jaw), then the file is compressed (meshopt + WebP): `public/models/avatar.glb`, ~1.4 MB.
Check every clip in a plain viewer: `node tools/render/serve.mjs` and open
`http://localhost:4300/tools/render/lab/avatar.html?view=three&t=mid`.

Clip names and which animation plays where:

- `src/content/avatar.ts`: state → clip (`typing`, `walk`, `dance1`, …), speed, beats per loop for dances.
- `src/components/scene/poses.ts`: where the character stands and what it does per page / section
  (hero = sits in the big hand with a laptop, big name = jogs, footer/contact = waves, Playground = dances).
- `AvatarRig.tsx` also blinks every few seconds, smiles a little and moves the jaw while talking.

### Hero hands and the opening

Two huge sculpted hands in the spirit of Michelangelo's *Creation of Adam* (public domain), built in 3D for
this site: dark old bronze with a green patina (a shader) and ivy wound round the forearms. The left hand comes
in from the lower left, palm down; the character walks in from the left once the preloader lifts and sits
down on its knuckles with the laptop. The right hand comes down from the top right and reaches towards him,
its finger turning a little towards the mouse. Model: the WebXR *generic hand* (`@webxr-input-profiles/assets`,
MIT, © 2019 Amazon), posed joint by joint in code, with a forearm added so the arm runs off screen
(`src/components/scene/HeroHands.tsx`).

Home sequence: soft cloud sky (`scene/Sky.tsx`) → big name, the character pushing a floating desk with a PC
across the sky → the statement under northern lights → the next section comes up over the sky like a page
with its corner folded over (`home/Pitch.tsx`) → role → service band → work → clients → services (sticky
heading, illustrations) → process → footer at sunset.

## Service illustrations

`public/illustrations/<service>-560.webp` / `-1120.webp`: five original isometric scenes (WordPress,
Webflow, Shopify, Framer, PHP) built from simple shapes in three.js, with one camera, light and base for all.
To change one: edit `tools/render/services.html`, run `node tools/render/serve.mjs`, then
`node tools/render/shot.mjs "/tools/render/services.html?id=webflow" out.png 1400 1400` and export to WebP.

## Photography

The gallery shows **demo photos from Unsplash** (Unsplash License), fetched through picsum.photos by
`tools/photos/demo-photos.mjs`. They are not the owner's photos: the page says so, and every photo shows its
photographer with a link (`public/photos/demo/credits.json`). To use your own: export WebP files at 160,
800 and 1600 px wide (`name-160.webp` …) into `public/photos/` and list them in
`src/app/photography/page.tsx` with `demo: false`.

## Playground music

`src/content/music.ts` lists the songs. The "Demo beat" is generated in the browser. Add tracks you have
the rights to (for example free tracks from pixabay.com/music) as MP3s in `public/audio/` with their BPM.
The showreel video path goes in `site.showreel` (`src/content/site.ts`).

## Contact form

The site is static, so a form service delivers the messages. The form checks the fields (required, email
format), shows a loading state, blocks double sends, has a hidden honeypot + minimum fill time against spam,
and shows success or failure. **Until a service is set up it opens the visitor's email app instead.**

To receive messages by email (free):

1. Go to web3forms.com, enter the email address that should receive messages, and copy the access key they
   email you.
2. In the GitHub repo: **Settings → Secrets and variables → Actions → Variables → New repository variable**,
   name `WEB3FORMS_KEY`, value = the key. Push any commit (or re-run the deploy workflow).

Or put it straight in `site.form` (`src/content/site.ts`), or use Formspree (`provider: "formspree"`,
`endpoint`). These keys are public by design; never put a secret key in the site code.

## Credits

- 3D avatar: made with MetaPerson Creator by Avatar SDK (metaperson.avatarsdk.com) from the owner's photo,
  free export (trial / non-commercial licence).
- Animations: Universal Animation Library (Standard) by Quaternius, CC0 1.0; Wave from "Hoodie Character"
  (Ultimate Modular Men) by Quaternius, CC0 1.0. Retargeted onto the avatar.
- Hero hands: WebXR generic hand model, @webxr-input-profiles/assets, MIT licence, © 2019 Amazon.
- Service illustrations: original, made for this site.
- Demo photos: Unsplash photographers listed in `public/photos/demo/credits.json` (Unsplash License).
- Playground "Demo beat" tracks: generated in the browser by `src/lib/demo-beat.ts` (original).
