"use client";

// PLACEHOLDER CHARACTER built from simple shapes: a developer typing at a
// floating desk. Replace it with your own rigged GLB (Blender + Mixamo):
//   const { scene, animations } = useGLTF(asset("/models/avatar.glb"));
//   const { actions } = useAnimations(animations, ref);
// and keep the outer <group ref={root}> so poses and page moves still work.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneStore } from "@/lib/scene-store";
import { poseFor } from "./poses";
import { pointer } from "./pointer";

const C = {
  hoodie: "#ece7dd",
  pants: "#26262e",
  skin: "#e9be97",
  hair: "#1d1a17",
  shoes: "#fafafa",
  desk: "#d9cfbf",
  laptop: "#c9ccd2",
  screen: "#ff6a3d",
};

function Limb({ length, radius, color, ...props }: { length: number; radius: number; color: string } & React.ComponentProps<"group">) {
  // pivot at the top, limb hangs down along -Y
  return (
    <group {...props}>
      <mesh position={[0, -length / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, length, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
    </group>
  );
}

export default function Avatar({ pathname }: { pathname: string }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const placed = useRef(false);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const { viewport, clock } = state;
    const t = clock.elapsedTime;
    const mobile = viewport.aspect < 0.8;
    const { section, footer } = sceneStore.get();
    const pose = poseFor(pathname, section, mobile, footer);

    // ease towards the target pose (also animates page-to-page moves)
    const k = 1 - Math.exp(-dt * 3.2);
    const tx = (pose.x * viewport.width) / 2;
    const ty = (pose.y * viewport.height) / 2;
    const ts = (pose.s * viewport.height) / 5;
    // first frame: appear in place (only the size animates in)
    if (!placed.current) {
      g.position.set(tx, ty, 0);
      g.rotation.y = pose.ry;
      placed.current = true;
    }
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (ty - g.position.y) * k;
    g.rotation.y += (pose.ry + pointer.x * 0.15 - g.rotation.y) * k;
    const s = g.scale.x + (ts - g.scale.x) * k;
    g.scale.setScalar(s);

    // idle float
    if (body.current) body.current.position.y = Math.sin(t * 1.2) * 0.06;

    // head follows the mouse
    if (head.current) {
      head.current.rotation.y += (pointer.x * 0.6 - head.current.rotation.y) * k;
      head.current.rotation.x += (-pointer.y * 0.3 + 0.15 - head.current.rotation.x) * k;
    }

    // typing
    if (armL.current) armL.current.rotation.x = -1.05 + Math.sin(t * 16) * 0.06;
    if (armR.current) armR.current.rotation.x = -1.05 + Math.sin(t * 16 + 1.7) * 0.06;

    // screen flicker
    if (screen.current) screen.current.emissiveIntensity = 1.1 + Math.sin(t * 3) * 0.15;
  });

  return (
    <group ref={root} scale={0.001}>
      <group ref={body} position={[0, -1.05, 0]}>
        {/* floating platform */}
        <RoundedBox args={[2.1, 0.22, 1.7]} radius={0.1} position={[0, -0.11, 0.25]}>
          <meshStandardMaterial color={C.desk} roughness={0.9} />
        </RoundedBox>

        {/* legs + shoes */}
        <Limb length={0.62} radius={0.11} color={C.pants} position={[-0.14, 0.86, 0]} />
        <Limb length={0.62} radius={0.11} color={C.pants} position={[0.14, 0.86, 0]} />
        <RoundedBox args={[0.2, 0.1, 0.32]} radius={0.04} position={[-0.14, 0.05, 0.05]}>
          <meshStandardMaterial color={C.shoes} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.1, 0.32]} radius={0.04} position={[0.14, 0.05, 0.05]}>
          <meshStandardMaterial color={C.shoes} />
        </RoundedBox>

        {/* torso (hoodie) */}
        <mesh position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.3, 0.42, 8, 16]} />
          <meshStandardMaterial color={C.hoodie} roughness={0.85} />
        </mesh>

        {/* arms reach forward to the keyboard */}
        <group ref={armL} position={[-0.36, 1.48, 0]} rotation={[-1.05, 0, 0.12]}>
          <Limb length={0.5} radius={0.085} color={C.hoodie} />
        </group>
        <group ref={armR} position={[0.36, 1.48, 0]} rotation={[-1.05, 0, -0.12]}>
          <Limb length={0.5} radius={0.085} color={C.hoodie} />
        </group>

        {/* head */}
        <group ref={head} position={[0, 1.82, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 32, 32]} />
            <meshStandardMaterial color={C.skin} roughness={0.6} />
          </mesh>
          {/* hair: a cap on top and towards the back */}
          <mesh position={[0, 0.07, -0.035]} rotation={[-0.35, 0, 0]} scale={[1.06, 0.72, 1.06]}>
            <sphereGeometry args={[0.245, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={C.hair} roughness={0.9} />
          </mesh>
          {/* glasses: two round lenses + bridge */}
          {[-0.085, 0.085].map((x) => (
            <mesh key={x} position={[x, 0.0, 0.228]}>
              <torusGeometry args={[0.055, 0.012, 8, 24]} />
              <meshStandardMaterial color={C.hair} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.0, 0.235]}>
            <boxGeometry args={[0.06, 0.012, 0.012]} />
            <meshStandardMaterial color={C.hair} />
          </mesh>
          {/* eyes */}
          {[-0.085, 0.085].map((x) => (
            <mesh key={`e${x}`} position={[x, 0.0, 0.222]}>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>

        {/* desk + laptop */}
        <group position={[0, 0, 0.62]}>
          <RoundedBox args={[1.25, 0.06, 0.55]} radius={0.02} position={[0, 1.02, 0]}>
            <meshStandardMaterial color={C.desk} roughness={0.7} />
          </RoundedBox>
          {[-0.55, 0.55].map((x) => (
            <mesh key={x} position={[x, 0.5, 0]}>
              <boxGeometry args={[0.05, 1.0, 0.45]} />
              <meshStandardMaterial color={C.desk} roughness={0.8} />
            </mesh>
          ))}
          <RoundedBox args={[0.56, 0.03, 0.38]} radius={0.01} position={[0, 1.07, -0.02]}>
            <meshStandardMaterial color={C.laptop} metalness={0.6} roughness={0.35} />
          </RoundedBox>
          {/* lid hinges at the far edge and opens towards the character */}
          <group position={[0, 1.08, 0.17]} rotation={[1.85, 0, 0]}>
            <RoundedBox args={[0.56, 0.02, 0.38]} radius={0.01} position={[0, 0, -0.19]}>
              <meshStandardMaterial color={C.laptop} metalness={0.6} roughness={0.35} />
            </RoundedBox>
            {/* logo on the back of the lid (the side the camera sees) */}
            <mesh position={[0, 0.012, -0.19]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 24]} />
              <meshBasicMaterial color={C.screen} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.012, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.5, 0.33]} />
              <meshStandardMaterial
                ref={screen}
                color="#111"
                emissive={C.screen}
                emissiveIntensity={1.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
