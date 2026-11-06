"use client";

// The 3D character. The outer group handles WHERE it stands (poses.ts) and
// WHICH animation plays (animFor). Inside is either your rigged GLB avatar
// (src/content/avatar.ts, enabled: true) or the built-in placeholder.
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneStore } from "@/lib/scene-store";
import { isIntroDone } from "@/lib/intro";
import { avatar, type AnimState } from "@/content/avatar";
import { animFor, poseFor } from "./poses";
import { pointer } from "./pointer";
import AvatarRig, { type Seat } from "./AvatarRig";

export type AnimRef = { current: AnimState };

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
      <mesh position={[0, -length / 2, 0]}>
        <capsuleGeometry args={[radius, length, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
    </group>
  );
}

const damp = (from: number, to: number, k: number) => from + (to - from) * k;

/** Placeholder made of simple shapes, with code-driven animations. */
function PlaceholderBody({ anim }: { anim: AnimRef }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const desk = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 8);
    const state = anim.current;
    const b = body.current;
    const L = armL.current;
    const R = armR.current;
    if (!b || !L || !R) return;

    // targets: [body y, body spin, armL x, armL z, armR x, armR z]
    let by = Math.sin(t * 1.2) * 0.06;
    let spin = 0;
    let lx = -0.15, lz = 0.12, rx = -0.15, rz = -0.12;

    if (state === "typing" || state === "sit") {
      lx = -1.05 + Math.sin(t * 16) * 0.06;
      rx = -1.05 + Math.sin(t * 16 + 1.7) * 0.06;
    } else if (state === "wave") {
      rz = -2.5 + Math.sin(t * 9) * 0.35;
      rx = -0.2;
    } else if (state === "jump" || state === "run" || state === "walk") {
      const hop = Math.abs(Math.sin(t * 3.2));
      by = hop * 0.55;
      lz = 0.3 + hop * 1.6;
      rz = -0.3 - hop * 1.6;
    } else if (state === "dance1" || state === "dance2") {
      // driven by the song position, so pause freezes and seeking catches up
      const d = sceneStore.get().dance;
      const beat = (d.time * d.bpm) / 60;
      const ph = beat * Math.PI;
      by = Math.abs(Math.sin(ph)) * 0.18;
      if (state === "dance1") {
        spin = Math.sin(ph / 2) * 0.5;
        lx = -0.4 + Math.sin(ph) * 0.6;
        rx = -0.4 - Math.sin(ph) * 0.6;
        lz = 0.4 + Math.max(0, Math.sin(ph)) * 1.4;
        rz = -0.4 - Math.max(0, -Math.sin(ph)) * 1.4;
      } else {
        spin = Math.sin(ph / 4) * 1.2;
        lz = 1.6 + Math.sin(ph) * 0.5;
        rz = -1.6 + Math.sin(ph) * 0.5;
      }
    }

    b.position.y = damp(b.position.y, -1.05 + by, k);
    b.rotation.y = damp(b.rotation.y, spin, k);
    L.rotation.x = damp(L.rotation.x, lx, k);
    L.rotation.z = damp(L.rotation.z, lz, k);
    R.rotation.x = damp(R.rotation.x, rx, k);
    R.rotation.z = damp(R.rotation.z, rz, k);

    // desk only while working
    if (desk.current) desk.current.visible = state === "typing" || state === "sit" || state === "idle";

    if (head.current) {
      head.current.rotation.y = damp(head.current.rotation.y, pointer.x * 0.6, k * 0.5);
      head.current.rotation.x = damp(head.current.rotation.x, -pointer.y * 0.3 + 0.15, k * 0.5);
    }
    if (screen.current) screen.current.emissiveIntensity = 1.1 + Math.sin(t * 3) * 0.15;
  });

  return (
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

      {/* arms (pivot at the shoulder) */}
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
        <mesh position={[0, 0.07, -0.035]} rotation={[-0.35, 0, 0]} scale={[1.06, 0.72, 1.06]}>
          <sphereGeometry args={[0.245, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={C.hair} roughness={0.9} />
        </mesh>
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
        {[-0.085, 0.085].map((x) => (
          <mesh key={`e${x}`} position={[x, 0.0, 0.222]}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>

      {/* desk + laptop */}
      <group ref={desk} position={[0, 0, 0.62]}>
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
          <mesh position={[0, 0.012, -0.19]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshBasicMaterial color={C.screen} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.012, -0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.5, 0.33]} />
            <meshStandardMaterial ref={screen} color="#111" emissive={C.screen} emissiveIntensity={1.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Things the avatar uses: a floating rock + laptop (hero, seated typing) and a
 * desk, monitor and chair (section "desk"). Simple shapes made here, no files.
 */
function SeatProps({ seat, place }: { seat: { current: Seat }; place: { current: string } }) {
  const rock = useRef<THREE.Group>(null);
  const laptop = useRef<THREE.Group>(null);
  const desk = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const { w, hipY, hipZ, kneeY, kneeZ } = seat.current;
    const k = 1 - Math.exp(-dt * 6);
    const show = (g: THREE.Group | null, on: boolean) => {
      if (!g) return;
      const s = g.scale.x + ((on ? 1 : 0) - g.scale.x) * k;
      g.scale.setScalar(Math.max(s, 0.0001));
      g.visible = s > 0.01;
    };
    const onRock = place.current === "rock" && w > 0.5;
    const atDesk = place.current === "desk" && w > 0.5;
    if (rock.current) rock.current.position.set(0, hipY - 0.42, hipZ - 0.2);
    if (laptop.current) laptop.current.position.set(0, (hipY + kneeY) / 2 + 0.1, (hipZ + kneeZ) / 2 + 0.14);
    if (desk.current) desk.current.position.set(0, hipY, hipZ);
    show(rock.current, onRock);
    show(laptop.current, onRock);
    show(desk.current, atDesk);
  });

  return (
    <>
      {/* floating rock to sit on */}
      <group ref={rock} position={[0, -0.3, -0.05]} scale={0.0001}>
        <mesh scale={[0.75, 0.32, 0.55]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#8a8f86" roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, 0.2, 0]} scale={[0.7, 0.06, 0.5]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color="#6f9b5a" roughness={1} flatShading />
        </mesh>
      </group>

      {/* laptop on the lap, lid towards the character */}
      <group ref={laptop} scale={0.0001}>
        <RoundedBox args={[0.5, 0.025, 0.34]} radius={0.01}>
          <meshStandardMaterial color={C.laptop} metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <group position={[0, 0.01, 0.17]} rotation={[1.85, 0, 0]}>
          <RoundedBox args={[0.5, 0.018, 0.34]} radius={0.01} position={[0, 0, -0.17]}>
            <meshStandardMaterial color={C.laptop} metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0.011, -0.17]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.035, 24]} />
            <meshBasicMaterial color={C.screen} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* desk, monitor and chair */}
      <group ref={desk} scale={0.0001}>
        <mesh position={[0, -0.18, -0.05]}>
          <boxGeometry args={[0.6, 0.06, 0.55]} />
          <meshStandardMaterial color="#2b2b33" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, -0.33]}>
          <boxGeometry args={[0.6, 0.7, 0.06]} />
          <meshStandardMaterial color="#2b2b33" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.6, -0.05]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <RoundedBox args={[1.5, 0.06, 0.7]} radius={0.02} position={[0, 0.32, 0.75]}>
          <meshStandardMaterial color={C.desk} roughness={0.7} />
        </RoundedBox>
        {[-0.68, 0.68].map((x) => (
          <mesh key={x} position={[x, -0.33, 0.75]}>
            <boxGeometry args={[0.05, 1.3, 0.6]} />
            <meshStandardMaterial color={C.desk} roughness={0.8} />
          </mesh>
        ))}
        <group position={[0, 0.72, 0.95]}>
          <RoundedBox args={[0.9, 0.55, 0.04]} radius={0.02}>
            <meshStandardMaterial color="#1b1b20" roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0, -0.025]}>
            <planeGeometry args={[0.84, 0.49]} />
            <meshStandardMaterial color="#111" emissive={C.screen} emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.06, 0.2, 0.06]} />
            <meshStandardMaterial color="#1b1b20" />
          </mesh>
        </group>
        <RoundedBox args={[0.6, 0.03, 0.2]} radius={0.01} position={[0, 0.36, 0.55]}>
          <meshStandardMaterial color="#e9e9ee" />
        </RoundedBox>
      </group>
    </>
  );
}

export default function Avatar({ pathname }: { pathname: string }) {
  const root = useRef<THREE.Group>(null);
  const hop = useRef<THREE.Group>(null);
  const placed = useRef(false);
  const anim = useRef<AnimState>("typing");
  const seat = useRef<Seat>({ w: 0, hipY: -0.1, hipZ: 0, kneeY: -0.1, kneeZ: 0.4 });
  // Opening: on the home page the character walks in from the right once the
  // preloader lifts, then sits down on its rock. "wait" = still off screen.
  const entrance = useRef<"wait" | "walk" | "done">("done");
  const ready = useRef(!avatar.enabled); // the GLB avatar has loaded and drawn
  const place = useRef<string>("");

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const { viewport } = state;
    const mobile = viewport.aspect < 0.8;
    const { section, footer, dance } = sceneStore.get();
    const pose = poseFor(pathname, section, mobile, footer);
    anim.current = animFor(pathname, section, footer, dance);
    // which seat props to show: rock in the hero, desk in the "desk" section
    const path = pathname.replace(/\/$/, "") || "/";
    place.current = footer ? "" : section === "hero" || (path === "/" && !section) ? "rock" : section === "desk" ? "desk" : "";

    // ease towards the target pose (also animates page-to-page moves)
    const k = 1 - Math.exp(-dt * 3.2);
    const tx = (pose.x * viewport.width) / 2;
    const ty = (pose.y * viewport.height) / 2;
    const ts = (pose.s * viewport.height) / 5;
    // first frame: on the home hero, wait off screen for the walk-in;
    // anywhere else appear in place (only the size animates in)
    if (!placed.current) {
      placed.current = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (path === "/" && section !== "desk" && !footer && !reduce) {
        entrance.current = "wait";
        g.position.set(viewport.width / 2 + ts * 0.8, ty, 0);
        g.rotation.y = -Math.PI / 2;
        g.scale.setScalar(ts);
      } else {
        g.position.set(tx, ty, 0);
        g.rotation.y = pose.ry;
      }
    }

    if (entrance.current !== "done") {
      // scrolled away or left the page mid-entrance: carry on as normal
      if (path !== "/" || (section && section !== "hero") || footer) entrance.current = "done";
      else if (entrance.current === "wait") {
        anim.current = "idle";
        if (isIntroDone() && ready.current) entrance.current = "walk";
        return;
      } else {
        const dx = tx - g.position.x;
        const step = ts * 1.75 * dt; // walking pace, scaled with the character
        anim.current = "walk";
        g.scale.setScalar(ts);
        g.position.y = ty;
        if (Math.abs(dx) <= step) {
          g.position.x = tx;
          entrance.current = "done";
        } else {
          g.position.x += Math.sign(dx) * step;
          g.rotation.y += (Math.sign(dx) * (Math.PI / 2) - g.rotation.y) * (1 - Math.exp(-dt * 8));
          return;
        }
      }
    }
    // Travelling to a new spot: run, face the way it goes and jump in an arc.
    const dx = tx - g.position.x;
    const dist = Math.hypot(dx, ty - g.position.y);
    const travelling = dist > viewport.height * 0.06 && !(dance.active && path === "/playground");
    if (travelling) anim.current = "run";
    const facing = travelling && Math.abs(dx) > viewport.width * 0.05 ? Math.sign(dx) * 1.3 : pose.ry + pointer.x * 0.15;

    g.position.x += dx * k;
    g.position.y += (ty - g.position.y) * k;
    g.rotation.y += (facing - g.rotation.y) * k * 1.5;
    g.scale.setScalar(g.scale.x + (ts - g.scale.x) * k);
    if (hop.current) {
      const lift = travelling ? Math.min(dist / Math.max(g.scale.x, 0.001), 4) * 0.22 : 0;
      hop.current.position.y += (lift - hop.current.position.y) * (1 - Math.exp(-dt * 6));
    }
  });

  return (
    <group ref={root} scale={0.001}>
      <group ref={hop}>
        {avatar.enabled ? (
          <>
            {/* nothing while the avatar file loads (the walk-in waits for it) */}
            <Suspense fallback={null}>
              <AvatarRig
                anim={anim}
                onSeat={(s) => {
                  seat.current = s;
                  ready.current = true;
                }}
              />
            </Suspense>
            <SeatProps seat={seat} place={place} />
          </>
        ) : (
          <PlaceholderBody anim={anim} />
        )}
      </group>
    </group>
  );
}
