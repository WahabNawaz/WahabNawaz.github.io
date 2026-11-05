"use client";

// Two cut-out images (transparent PNG/WebP) floating in the hero sky, e.g. a
// pair of sculpted hands reaching towards each other. Set the paths in
// site.heroArt (src/content/site.ts). They slide in, float gently and drift
// with the mouse (parallax). Nothing renders while the paths are empty.
import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { site } from "@/content/site";
import { asset, sceneStore } from "@/lib/scene-store";
import { pointer } from "./pointer";

type Side = "left" | "right";

function Piece({ src, side }: { src: string; side: Side }) {
  const tex = useTexture(asset(src));
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const start = useRef<number | null>(null);

  const img = tex.image as { width: number; height: number } | undefined;
  const ratio = img ? img.width / img.height : 2;
  // width as a share of the screen; phones get bigger pieces
  const w = viewport.width * (viewport.aspect < 0.8 ? 0.95 : 0.52);
  const h = w / ratio;
  const left = side === "left";
  const home = new THREE.Vector3(
    left ? -viewport.width / 2 + w * 0.42 : viewport.width / 2 - w * 0.42,
    left ? -viewport.height / 2 + h * 0.45 : viewport.height / 2 - h * 0.62,
    0,
  );

  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    start.current ??= t;
    const intro = Math.min(1, (t - start.current) / 1.6); // slide in over 1.6s
    const ease = 1 - Math.pow(1 - intro, 3);
    // slide back out once the page scrolls past the hero
    const section = sceneStore.get().section;
    const away = section && section !== "hero" ? 1 : 0;
    const off = Math.max(1 - ease, away) * w * (left ? -1 : 1);
    const k = 1 - Math.exp(-dt * 3);
    const tx = home.x + off + pointer.x * (left ? 0.25 : 0.4);
    const ty = home.y + Math.sin(t * 0.6 + (left ? 0 : 2)) * 0.08 + pointer.y * (left ? 0.15 : 0.25);
    m.position.x += (tx - m.position.x) * (intro < 1 ? 1 : k);
    m.position.y += (ty - m.position.y) * k;
    m.rotation.z = Math.sin(t * 0.4 + (left ? 1 : 3)) * 0.015;
  });

  return (
    <mesh ref={mesh} position={home} renderOrder={1}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function HeroArt() {
  const art = site.heroArt;
  if (!art.left && !art.right) return null;
  return (
    <Suspense fallback={null}>
      {art.left && <Piece src={art.left} side="left" />}
      {art.right && <Piece src={art.right} side="right" />}
    </Suspense>
  );
}
