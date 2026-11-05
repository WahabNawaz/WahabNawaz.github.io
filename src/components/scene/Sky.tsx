"use client";

// Hand-written GLSL sky: gradient + drifting fbm clouds + sun glow + stars.
// Colours ease between Day / Sunset / Night when the toggle changes.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneStore, type SkyMode } from "@/lib/scene-store";

const PALETTE: Record<SkyMode, { top: string; bottom: string; glow: string; clouds: number; stars: number }> = {
  day: { top: "#6fa6dd", bottom: "#eef1f2", glow: "#fff2cf", clouds: 1.0, stars: 0 },
  sunset: { top: "#3e4f8a", bottom: "#ffb48c", glow: "#ff7448", clouds: 0.9, stars: 0.15 },
  night: { top: "#050816", bottom: "#1b2344", glow: "#4f63ff", clouds: 0.35, stars: 1 },
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
  uniform float uClouds;
  uniform float uStars;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

    // sun / moon glow
    vec2 g = vec2((uv.x - 0.72) * aspect, uv.y - 0.3);
    col += uGlow * exp(-dot(g, g) * 5.0) * 0.55;

    // domain-warped clouds
    vec2 p = vec2(uv.x * aspect, uv.y) * 2.4 + vec2(uTime * 0.012, 0.0);
    float c = fbm(p + fbm(p * 0.7 - uTime * 0.008));
    c = smoothstep(0.48, 0.86, c) * uClouds * smoothstep(0.05, 0.55, uv.y);
    col = mix(col, mix(vec3(1.0), uGlow, 0.3), c * 0.6);

    // stars
    vec2 sp = floor(uv * vec2(aspect, 1.0) * 380.0);
    float star = step(0.9965, hash(sp)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(sp) * 40.0));
    col += star * uStars * smoothstep(0.25, 0.9, uv.y);

    // film grain
    col += (hash(uv * uRes + fract(uTime)) - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function SkyPlane() {
  const size = useThree((s) => s.size);
  const uniforms = useMemo(() => {
    const p = PALETTE[sceneStore.get().sky];
    return {
      uTop: { value: new THREE.Color(p.top) },
      uBottom: { value: new THREE.Color(p.bottom) },
      uGlow: { value: new THREE.Color(p.glow) },
      uClouds: { value: p.clouds },
      uStars: { value: p.stars },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
  }, []);
  const material = useRef<THREE.ShaderMaterial>(null);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTE[sceneStore.get().sky];
    const k = 1 - Math.exp(-dt * 2.5);
    u.uTop.value.lerp(tmp.set(p.top), k);
    u.uBottom.value.lerp(tmp.set(p.bottom), k);
    u.uGlow.value.lerp(tmp.set(p.glow), k);
    u.uClouds.value += (p.clouds - u.uClouds.value) * k;
    u.uStars.value += (p.stars - u.uStars.value) * k;
    u.uTime.value += dt;
    u.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Sky background for a section. Pauses rendering when scrolled out of view. */
export default function Sky({ className = "" }: { className?: string }) {
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
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <SkyPlane />
      </Canvas>
    </div>
  );
}
