"use client";

// Your rigged GLB avatar + one GLB per animation (Mixamo). Clips cross-fade
// when the wanted animation changes; dance clips follow the song position.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { asset, sceneStore } from "@/lib/scene-store";
import { avatar, type AnimState } from "@/content/avatar";
import type { AnimRef } from "./Avatar";

const ENTRIES = Object.entries(avatar.clips) as [AnimState, { file: string; clip?: string }][];

// Plain helpers (outside the component) that drive three.js objects.
function switchClip(actions: Record<string, THREE.AnimationAction | null>, from: string | null, to: string) {
  const next = actions[to];
  if (!next) return false;
  next.reset().setEffectiveWeight(1).fadeIn(0.4).play();
  if (from && actions[from]) actions[from]!.fadeOut(0.4);
  return true;
}

function followSong(action: THREE.AnimationAction | null, playing: boolean, time: number) {
  if (!action) return;
  action.paused = !playing;
  action.time = time % action.getClip().duration;
}

export default function AvatarRig({ anim }: { anim: AnimRef }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef<string | null>(null);
  const { scene } = useGLTF(asset(avatar.model));
  const files = useGLTF(ENTRIES.map(([, c]) => asset(c.file)));

  const clips = useMemo(
    () =>
      ENTRIES.flatMap(([state, c], i) => {
        const gltf = files[i];
        const source = c.clip ? gltf.animations.find((a) => a.name === c.clip) : gltf.animations[0];
        if (!source) return [];
        const clip = source.clone();
        clip.name = state;
        return [clip];
      }),
    [files],
  );
  const { actions } = useAnimations(clips, group);

  // Normalise any avatar to ~2 units tall with its feet where the placeholder's are.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const height = box.max.y - box.min.y || 1;
    const s = 2.0 / height;
    return { s, y: -box.min.y * s - 1.05 };
  }, [scene]);

  useFrame(() => {
    const want = actions[anim.current] ? anim.current : "idle";
    if (want !== current.current && switchClip(actions, current.current, want)) current.current = want;
    if (want === "dance1" || want === "dance2") {
      const d = sceneStore.get().dance;
      followSong(actions[want], d.playing, d.time);
    }
  });

  return (
    <group ref={group} position={[0, fit.y, 0]} scale={fit.s}>
      <primitive object={scene} />
    </group>
  );
}
