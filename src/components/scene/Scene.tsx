"use client";

// The persistent 3D layer. It lives in the root layout, so it is NOT
// re-created on page changes: the character walks from page to page.
import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { sceneStore, type SkyMode } from "@/lib/scene-store";
import Avatar from "./Avatar";
import { trackPointer } from "./pointer";

const LIGHT: Record<SkyMode, { key: string; fill: string; keyI: number; ambI: number }> = {
  day: { key: "#fff6e6", fill: "#cfe3ff", keyI: 2.2, ambI: 0.9 },
  sunset: { key: "#ffb27a", fill: "#8a7cff", keyI: 2.0, ambI: 0.7 },
  night: { key: "#b4c3ff", fill: "#3a4890", keyI: 1.7, ambI: 0.75 },
};

/**
 * Soft studio reflections for PBR materials, generated in code (three.js
 * RoomEnvironment), so no HDR file has to be downloaded.
 */
function applyStudioEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.75;
  return () => {
    scene.environment = null;
    env.dispose();
    pmrem.dispose();
  };
}

function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => applyStudioEnvironment(gl, scene), [gl, scene]);
  return null;
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const target = new THREE.Color();

  useFrame((_, dt) => {
    const l = LIGHT[sceneStore.get().sky];
    const k = 1 - Math.exp(-dt * 3);
    if (key.current) {
      key.current.color.lerp(target.set(l.key), k);
      key.current.intensity += (l.keyI - key.current.intensity) * k;
    }
    if (hemi.current) {
      hemi.current.groundColor.lerp(target.set(l.fill), k);
      hemi.current.intensity += (l.ambI - hemi.current.intensity) * k;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", LIGHT.day.fill, LIGHT.day.ambI]} />
      <directionalLight ref={key} position={[4, 6, 5]} intensity={LIGHT.day.keyI} color={LIGHT.day.key} />
    </>
  );
}

export function Shapes() {
  // decorative floating objects; only shown while the hero is in view
  const group = useRef<THREE.Group>(null);
  useFrame(({ viewport }, dt) => {
    const g = group.current;
    if (!g) return;
    const onHero = sceneStore.get().section === "hero";
    const target = onHero && viewport.aspect >= 0.8 ? 1 : 0; // hidden on phones
    const s = g.scale.x + (target - g.scale.x) * (1 - Math.exp(-dt * 5));
    g.scale.setScalar(s);
    g.visible = s > 0.01;
  });
  return (
    <group ref={group} scale={0}>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={1.5} position={[1.6, 2.6, -4]}>
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#ff6a3d" roughness={0.35} flatShading />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={1.5} floatIntensity={1.2} position={[5.4, 1.4, -5]}>
        <mesh>
          <torusGeometry args={[0.45, 0.16, 16, 48]} />
          <meshStandardMaterial color="#3d5aff" roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1.7} rotationIntensity={0.8} floatIntensity={1.8} position={[4.6, -2.4, -3]}>
        <mesh>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#1f9d74" roughness={0.4} flatShading />
        </mesh>
      </Float>
    </group>
  );
}

export default function Scene({ pathname }: { pathname: string }) {
  useEffect(() => {
    trackPointer();
    sceneStore.loadSky();
  }, []);

  return (
    <Canvas
      className="!pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 30 }}
      camera={{ position: [0, 0, 10], fov: 35 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <StudioEnv />
      <Lights />
      <Avatar pathname={pathname} />
      {/* decorative floating shapes are off now that the hero has the rock;
          put <Shapes /> back here to show them on the home hero */}
    </Canvas>
  );
}
