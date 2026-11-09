"use client";

// Premium sky: a full-screen GLSL shader using domain-warped fBm noise
// (noise fed into noise) for soft rolling clouds, plus sun glow, horizon
// mist, contrast/saturation grading, film grain and a vignette.
// Rendered at a lower pixel ratio (clouds are soft, so it stays sharp enough)
// to keep it light. Day / Sunset / Night ease between palettes.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore, type SkyMode } from "@/lib/scene-store";
import { cloudsIn } from "@/lib/intro";
import { pointer } from "./pointer";
import HeroArt from "./HeroArt";

type Palette = {
  top: string; bottom: string; glow: string; shade: string; bright: string;
  glowPos: [number, number]; glowSize: number;
  mist: number; contrast: number; sat: number; stars: number; clouds: number; cover: number; aurora: number;
};

const PALETTE: Record<SkyMode, Palette> = {
  // soft pastel daylight: periwinkle above, lavender-white haze below, big
  // billowing clouds with lilac shadows; the light comes from above the frame
  day: {
    top: "#7f9fd8", bottom: "#f1ebf3", glow: "#fff4ec", shade: "#a8a3c6", bright: "#fffaf8",
    glowPos: [0.82, 1.2], glowSize: 0.012, mist: 0.32, contrast: 1.0, sat: 1.0, stars: 0, clouds: 1.0, cover: 0.4, aurora: 0,
  },
  sunset: {
    top: "#36457f", bottom: "#f6ad86", glow: "#ff8350", shade: "#7a6c9c", bright: "#ffe0cc",
    glowPos: [0.76, 0.34], glowSize: 0.14, mist: 0.6, contrast: 1.08, sat: 1.12, stars: 0.1, clouds: 0.95, cover: 0.44, aurora: 0,
  },
  night: {
    top: "#040918", bottom: "#18213f", glow: "#6d7cff", shade: "#28305a", bright: "#8592c4",
    glowPos: [0.8, 0.82], glowSize: 0.035, mist: 0.3, contrast: 1.1, sat: 0.9, stars: 1, clouds: 0.45, cover: 0.5, aurora: 0,
  },
};

// the "made simple" statement: a starry night with northern lights
const AURORA: Palette = {
  top: "#020617", bottom: "#0a1a36", glow: "#0b2a33", shade: "#0b1830", bright: "#2a3656",
  glowPos: [0.5, 0.95], glowSize: 0.01, mist: 0.12, contrast: 1.05, sat: 1.1, stars: 1, clouds: 0.18, cover: 0.78, aurora: 1,
};
const paletteNow = (fixed?: SkyMode) => {
  if (fixed) return PALETTE[fixed];
  const { section, sky } = sceneStore.get();
  return section === "statement" && sky === "night" ? AURORA : PALETTE[sky];
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  uniform vec3 uShade;
  uniform vec3 uBright;
  uniform float uAurora;
  uniform vec2 uGlowPos;
  uniform float uGlowSize;
  uniform float uMist;
  uniform float uContrast;
  uniform float uSat;
  uniform float uStars;
  uniform float uClouds;
  uniform float uCover;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic: smoother clouds
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = ROT * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    float t = uTime;

    // cumulus: fbm with a gentle domain warp, drifting slowly; flattened a
    // little vertically so the clouds sit in soft horizontal banks
    // (a screen narrower than 16:10 shows the right-hand part of the wide sky,
    // where the clouds are, instead of the clear left side)
    vec2 p = vec2(uv.x * aspect + max(0.0, 1.6 - aspect), uv.y * 1.35) * 2.1 + uPointer * 0.05 + vec2(t * 0.012, 0.0);
    vec2 q = vec2(fbm(p * 0.6 + vec2(0.0, t * 0.006)), fbm(p * 0.6 + vec2(5.2, 1.3)));
    vec2 r = q;
    float f = fbm(p + 0.9 * q);

    // base gradient
    float h = uv.y;
    vec3 sky = mix(uBottom, uTop, pow(clamp(h, 0.0, 1.0), 0.85));

    // sun / moon glow (soft core + wide halo)
    vec2 g = (uv - uGlowPos) * vec2(aspect, 1.0);
    float d2 = dot(g, g);
    vec3 glow = uGlow * (exp(-d2 / uGlowSize) * 0.85 + exp(-sqrt(d2) * 3.2) * 0.14);

    // clouds: thicker low, thin high; lit towards the glow, cool in the shade
    float density = smoothstep(uCover, uCover + 0.2, f) * uClouds;
    density *= smoothstep(0.0, 0.3, h) * (1.0 - 0.35 * smoothstep(0.85, 1.0, h));
    float lit = clamp(length(q) * 0.85 + (1.0 - sqrt(d2)) * 0.25, 0.0, 1.0);
    // a second look a little towards the light: thicker there = in shadow
    float f2 = fbm(p + 0.9 * q + vec2(0.04, 0.09));
    float selfLit = clamp((f - f2) * 7.0 + 0.6, 0.0, 1.0);
    vec3 cloud = mix(uShade, uBright, clamp(lit * 0.6 + selfLit * 0.6, 0.0, 1.0)) + glow * 0.3;
    vec3 col = mix(sky + glow, cloud, density * 0.92);

    // horizon mist
    col = mix(col, mix(uBottom, vec3(1.0), 0.15), uMist * smoothstep(0.42, 0.0, h));

    // northern lights: ribbons that sway, with fine vertical rays
    if (uAurora > 0.001) {
      float aur = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float base = 0.5 + 0.07 * fi + 0.14 * (fbm(vec2(uv.x * aspect * 0.6 + fi * 3.1, t * 0.03 + fi)) - 0.5);
        // a ribbon: sharp lower edge, rays fading upwards
        float dy = h - base;
        float band = exp(-pow(max(dy, 0.0) * (9.0 + fi * 3.0), 1.4)) * smoothstep(-0.035, 0.0, dy);
        float rays = 0.55 + 0.45 * noise(vec2(uv.x * aspect * 70.0 + fi * 11.0 + t * 0.2, fi));
        float patchy = smoothstep(0.25, 0.75, fbm(vec2(uv.x * aspect * 1.4 - t * 0.02 + fi * 5.0, fi)));
        aur += band * rays * patchy * (1.0 - 0.3 * fi);
      }
      vec3 aurCol = mix(vec3(0.12, 0.95, 0.58), vec3(0.42, 0.38, 1.0), smoothstep(0.55, 0.9, h));
      col += aurCol * aur * uAurora * 0.62;
    }

    // stars (night)
    vec2 sp = floor(uv * vec2(aspect, 1.0) * 420.0);
    float star = step(0.9972, hash(sp)) * (0.55 + 0.45 * sin(t * 2.0 + hash(sp) * 40.0));
    col += star * uStars * smoothstep(0.3, 0.95, h) * (1.0 - density);

    // grading: contrast, saturation, vignette, grain
    col = (col - 0.5) * uContrast + 0.5;
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(l), col, uSat);
    vec2 v = uv - 0.5;
    col *= 1.0 - 0.28 * dot(v, v) * 1.6;
    col += (hash(uv * uRes + fract(t * 37.0)) - 0.5) * 0.022;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    #include <colorspace_fragment>
  }
`;

function SkyPlane({ mode }: { mode?: SkyMode }) {
  const size = useThree((s) => s.size);
  const uniforms = useMemo(() => {
    const p = paletteNow(mode);
    return {
      uShade: { value: new THREE.Color(p.shade) },
      uBright: { value: new THREE.Color(p.bright) },
      uAurora: { value: p.aurora },
      uTop: { value: new THREE.Color(p.top) },
      uBottom: { value: new THREE.Color(p.bottom) },
      uGlow: { value: new THREE.Color(p.glow) },
      uGlowPos: { value: new THREE.Vector2(...p.glowPos) },
      uGlowSize: { value: p.glowSize },
      uMist: { value: p.mist },
      uContrast: { value: p.contrast },
      uSat: { value: p.sat },
      uStars: { value: p.stars },
      uClouds: { value: p.clouds * (mode ? 1 : cloudsIn()) },
      uCover: { value: p.cover },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2() },
    };
  }, [mode]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  const tmpV = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = paletteNow(mode);
    const k = 1 - Math.exp(-dt * 2.2);
    u.uShade.value.lerp(tmp.set(p.shade), k);
    u.uBright.value.lerp(tmp.set(p.bright), k);
    u.uTop.value.lerp(tmp.set(p.top), k);
    u.uBottom.value.lerp(tmp.set(p.bottom), k);
    u.uGlow.value.lerp(tmp.set(p.glow), k);
    u.uGlowPos.value.lerp(tmpV.set(p.glowPos[0], p.glowPos[1]), k);
    for (const key of ["glowSize", "mist", "contrast", "sat", "stars", "cover", "aurora"] as const) {
      const name = `u${key[0].toUpperCase()}${key.slice(1)}` as "uGlowSize";
      u[name].value += (p[key] - u[name].value) * k;
    }
    // the hero sky has no clouds under the preloader; they roll in while the
    // hands fly in (lib/intro.ts cloudsIn)
    const clouds = p.clouds * (mode ? 1 : cloudsIn());
    u.uClouds.value += (clouds - u.uClouds.value) * (mode ? k : 1 - Math.exp(-dt * 5));
    u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);
    u.uPointer.value.lerp(tmpV.set(pointer.x, pointer.y), 1 - Math.exp(-dt * 2));
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Sky background for a section. Pauses rendering when scrolled out of view. */
export default function Sky({ className = "", art = false, mode }: { className?: string; art?: boolean; mode?: SkyMode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[0.6, 0.85]}
        camera={{ position: [0, 0, 10], fov: 35 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <SkyPlane mode={mode} />
        {art && <HeroArt />}
      </Canvas>
    </div>
  );
}
