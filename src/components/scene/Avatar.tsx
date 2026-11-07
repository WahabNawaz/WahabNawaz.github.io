"use client";

// The 3D character. The outer group handles WHERE it stands (poses.ts) and
// WHICH animation plays (animFor). Inside is either your rigged GLB avatar
// (src/content/avatar.ts, enabled: true) or the built-in placeholder.
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneStore } from "@/lib/scene-store";
import { isHeroReady, isIntroDone, markHeroReady } from "@/lib/intro";
import { avatar, type AnimState } from "@/content/avatar";
import { animFor, edgePose, footerAnim, footerPose, poseFor, processPose, risePose, rolePose, scrollPose, type ScrollPose } from "./poses";
import { roleTrip } from "@/lib/role-trip";
import { pointer } from "./pointer";
import AvatarRig, { type Seat } from "./AvatarRig";
import { heroSeat } from "./heroSeat";
import Laptop from "./Laptop";
import { DeskBits, GamingChair, Keyboard, Monitor, PcTower, Router } from "./DevSetup";

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
 * Things the avatar uses: the crystal laptop (hero, seated typing), a floating
 * shelf with a developer's setup (big-name section) and a desk with a gaming
 * chair (section "desk"). Models: Laptop.tsx, DevSetup.tsx.
 */
function SeatProps({ seat, place }: { seat: { current: Seat }; place: { current: string } }) {
  const laptop = useRef<THREE.Group>(null);
  const desk = useRef<THREE.Group>(null);
  const shelf = useRef<THREE.Group>(null);

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
    if (laptop.current) laptop.current.position.set(0, (hipY + kneeY) / 2 + 0.1, (hipZ + kneeZ) / 2 + 0.14);
    if (desk.current) desk.current.position.set(0, hipY, hipZ);
    show(laptop.current, onRock);
    show(desk.current, atDesk);
    show(shelf.current, place.current === "shelf");
  });

  return (
    <>

      {/* crystal laptop on the lap, lid towards the character (Laptop.tsx) */}
      <group ref={laptop} scale={0.0001}>
        <Laptop />
      </group>

      {/* floating shelf with a developer's setup, pushed along in the big-name
          section, like the reference: he pushes the bare near end, the setup
          stands on the middle and far part of the slab. The screens and the
          PC's glass side face the camera (-X). Positions below are from his
          body along the slab (the slab runs from 0.3 to 2.2) */}
      <group ref={shelf} scale={0.0001} position={[0, 0.12, 1.25]}>
        <RoundedBox args={[0.9, 0.09, 1.9]} radius={0.025}>
          <meshStandardMaterial color="#dcc7a4" roughness={0.65} />
        </RoundedBox>
        <group position={[0, 0.045, -1.25]}>
          <group position={[-0.2, 0, 0.92]} rotation={[0, -Math.PI / 2, 0]}>
            <DeskBits />
            <Keyboard />
          </group>
          <group position={[0.12, 0, 1.0]} rotation={[0, -Math.PI / 2, 0]}>
            <Monitor kind="editor" />
          </group>
          <group position={[0.14, 0, 1.5]} rotation={[0, -Math.PI / 2 + 0.25, 0]}>
            <Monitor kind="terminal" w={0.26} h={0.42} stand={0.2} />
          </group>
          <group position={[0.1, 0, 1.86]}>
            <PcTower />
            {/* the router sits on the PC, antennas up */}
            <group position={[0, 0.48, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <Router />
            </group>
          </group>
        </group>
      </group>

      {/* desk scene: gaming chair, wooden desk on black legs, monitor, PC with a
          glass side towards the camera, keyboard, mouse, mug and router */}
      <group ref={desk} scale={0.0001}>
        <group position={[0, -0.1, -0.02]}>
          <GamingChair floor={-0.55} />
        </group>
        <RoundedBox args={[1.5, 0.05, 0.7]} radius={0.015} position={[0, 0.2, 0.75]}>
          <meshStandardMaterial color="#d9c3a0" roughness={0.6} />
        </RoundedBox>
        {[-0.66, 0.66].map((x) => (
          <group key={x} position={[x, 0, 0.75]}>
            <mesh position={[0, -0.23, 0]}>
              <boxGeometry args={[0.04, 0.83, 0.04]} />
              <meshStandardMaterial color="#141418" roughness={0.4} metalness={0.4} />
            </mesh>
            <mesh position={[0, -0.64, 0]}>
              <boxGeometry args={[0.05, 0.03, 0.62]} />
              <meshStandardMaterial color="#141418" roughness={0.4} metalness={0.4} />
            </mesh>
          </group>
        ))}
        <group position={[0, 0.225, 0]}>
          <group position={[0.05, 0, 1.0]} rotation={[0, Math.PI, 0]}>
            <Monitor kind="editor" w={0.9} h={0.5} stand={0.24} />
          </group>
          <group position={[0, 0, 0.56]} rotation={[0, Math.PI, 0]}>
            <DeskBits />
            <Keyboard />
          </group>
          {/* the PC stands on the floor by the desk, glass side to the camera */}
          <group position={[0.92, -0.875, 0.55]} rotation={[0, 0.72, 0]}>
            <PcTower />
          </group>
          <group position={[-0.56, 0, 1.0]} rotation={[0, Math.PI, 0]}>
            <Router />
          </group>
        </group>
      </group>
    </>
  );
}

// Opening drop: how much bigger than seated he is, and how close to the camera
// (world units; the camera is at z = 10)
const BIG = 1.6;
const NEAR = 2.2;

// How far in front of the finger's centre line he sits on the hero hand, in
// character sizes (0 = on the centre line: his right shin went through the
// finger, which points right and towards the camera).
const SEAT_FORWARD = 0.22;

export default function Avatar({ pathname }: { pathname: string }) {
  const root = useRef<THREE.Group>(null);
  const hop = useRef<THREE.Group>(null);
  const placed = useRef(false);
  const anim = useRef<AnimState>("typing");
  const dangle = useRef(0);
  const readyTimer = useRef(0);
  const footSince = useRef(-1); // when the footer came on screen (clock seconds), -1 = not on
  const seat = useRef<Seat>({ w: 0, hipY: -0.1, hipZ: 0, kneeY: -0.1, kneeZ: 0.4 });
  // Opening, like the reference: on the home page, once the hands have flown
  // in, the character drops in from above close to the camera (big), lands in
  // the middle of the sky, then hops back onto the seat hand's index finger
  // (getting smaller as he goes further away) and sits down there.
  // "wait" = still above the screen.
  const entrance = useRef<"wait" | "drop" | "land" | "back" | "done">("done");
  const phase = useRef({ t: 0, from: 0 });
  const seated = useRef(0); // eased like the sit-down clip, for the seat height
  const ready = useRef(!avatar.enabled); // the GLB avatar has loaded and drawn
  const place = useRef<string>("");
  const shadow = useRef<THREE.Mesh>(null);
  const shadowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grd.addColorStop(0, "rgba(0,0,0,0.9)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const { viewport } = state;
    const mobile = viewport.aspect < 0.8;
    const { section, footer, dance } = sceneStore.get();
    const pose = poseFor(pathname, section, mobile, footer);
    anim.current = animFor(pathname, section, footer, dance);
    // which seat props to show: the open hand ("rock" spot) in the hero, desk in the "desk" section
    const path = pathname.replace(/\/$/, "") || "/";
    place.current = footer
      ? ""
      : section === "hero" || (path === "/" && !section)
        ? "rock"
        : section === "desk"
          ? "desk"
          : section === "name" && (sceneStore.get().progress.name ?? 0) > 0.1 && (sceneStore.get().progress.name ?? 0) < 0.86
            ? "shelf"
            : "";

    heroSeat.active = path === "/" && !footer && (section === "hero" || !section);
    heroSeat.hipY = seat.current.hipY;
    heroSeat.hipZ = seat.current.hipZ;

    // ease towards the target pose (also animates page-to-page moves)
    const k = 1 - Math.exp(-dt * 3.2);
    let tx = (pose.x * viewport.width) / 2;
    let ty = (pose.y * viewport.height) / 2;
    let tz = 0;
    const ts = (pose.s * viewport.height) / 5;
    // Scroll-driven sections (work, clients): the scroll position inside the
    // section moves the character; phones keep him in the corner instead.
    let scrubbed: ScrollPose | null = null;
    if (!footer && path === "/" && section === "name") {
      // the name section is pinned: its own scroll progress drives him
      scrubbed = scrollPose("name", sceneStore.get().progress.name ?? 0);
      if (scrubbed) {
        tx = (scrubbed.x * viewport.width) / 2;
        ty = (scrubbed.y * viewport.height) / 2;
      }
    }
    // role -> band: he jumps over from the desk, stands big in front of the
    // role title and leaps down into the band, gone (phones too)
    if (!footer && path === "/" && (section === "role" || section === "band")) {
      scrubbed = rolePose(roleTrip.p, roleTrip.out, roleTrip.shift, mobile);
    }
    if (!mobile && !footer && path === "/" && section === "work") {
      // the pinned intro (circle + title) sets the pace, not the whole section
      const el = document.querySelector<HTMLElement>("[data-work-intro]");
      if (el) {
        const r = el.getBoundingClientRect();
        scrubbed = scrollPose(section, (innerHeight - r.top) / (r.height + innerHeight));
      }
    }
    // clients -> services: he follows the bottom edge of the dark clients
    // section (walk, trip, tumble over it, hang upside down at the top-left);
    // showcase: up and away; process: in at step 03 only (poses.ts)
    if (!mobile && !footer && path === "/" && (section === "clients" || section === "services")) {
      const el = document.querySelector<HTMLElement>('[data-pose="clients"]');
      if (el) scrubbed = edgePose(el.getBoundingClientRect().bottom / innerHeight, state.clock.elapsedTime);
    }
    if (!mobile && !footer && path === "/" && section === "brand") {
      const el = document.querySelector<HTMLElement>('[data-pose="brand"]');
      if (el) scrubbed = risePose(el.getBoundingClientRect().top / innerHeight);
    }
    if (!mobile && !footer && path === "/" && section === "process") {
      const el = document.querySelectorAll<HTMLElement>('[data-pose="process"] [data-step]')[2];
      scrubbed = processPose(el ? el.getBoundingClientRect().top / innerHeight : null);
    }
    // footer (every page): standing on the right, rising with the footer;
    // waves, stands, chats in turn (poses.ts footerAnim), starting with the
    // wave once he is in view (his head well up the screen)
    const foot = footer
      ? (document.querySelector<HTMLElement>("[data-footer-body]") ?? document.querySelector<HTMLElement>("footer[data-site-footer]"))
      : null;
    const footBottom = foot ? foot.getBoundingClientRect().bottom / innerHeight : 2;
    if (footer && footBottom < 1.25 && footSince.current < 0) footSince.current = state.clock.elapsedTime;
    if (!footer) footSince.current = -1;
    const since = footSince.current < 0 ? 0 : state.clock.elapsedTime - footSince.current;
    // (the playground's dance always wins)
    const dancing = path === "/playground" && dance.active;
    if (footer && !dancing) anim.current = footerAnim(since);
    if (!mobile && foot) scrubbed = { ...footerPose(footBottom, since), ...(dancing ? { anim: undefined } : {}) };
    if (scrubbed && section !== "name") {
      tx = (scrubbed.x * viewport.width) / 2;
      ty = (scrubbed.y * viewport.height) / 2;
    }
    const tsWant = scrubbed && section !== "name" ? (scrubbed.s * viewport.height) / 5 : ts;
    dangle.current = scrubbed?.dangle ?? 0;
    // In the hero the spot is the top of the bronze hand's index finger:
    // standing = feet on the finger; seated = the seat of the trousers on it,
    // legs hanging in front. `seated` follows the sit-down clip's pace.
    seated.current += (seat.current.w - seated.current) * (1 - Math.exp(-dt * 1.7));
    const onFinger = heroSeat.active && heroSeat.ready;
    const standY = heroSeat.fy + 1.05 * ts;
    if (onFinger) {
      const sitY = heroSeat.fy + (0.1 - seat.current.hipY) * ts;
      const back = seat.current.hipZ * ts; // the hips sit a little behind the feet line
      tx = heroSeat.fx - Math.sin(pose.ry) * back;
      // a little in front of the finger's centre line (towards the camera), so
      // his legs hang down in front of the finger instead of through it
      tz = heroSeat.fz - Math.cos(pose.ry) * back + SEAT_FORWARD * ts;
      ty = standY + (sitY - standY) * seated.current;
    }
    // first frame: on the home hero, wait above the screen for the drop;
    // anywhere else appear in place (only the size animates in)
    if (!placed.current) {
      placed.current = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (path === "/" && (section === "hero" || !section) && !footer && !reduce) {
        entrance.current = "wait";
        g.position.set(0, viewport.height + ts * 6, NEAR);
        g.rotation.y = 0;
        g.scale.setScalar(ts * BIG);
      } else {
        g.position.set(tx, ty, tz);
        g.rotation.y = pose.ry;
      }
    }
    // the page text and header wait for the opening (lib/intro.ts)
    if (entrance.current === "done" && isIntroDone() && !isHeroReady() && !readyTimer.current) {
      readyTimer.current = window.setTimeout(markHeroReady, path === "/" && onFinger ? 700 : 0);
    }

    // turn first, then roll in the screen plane (a dive reads as a dive even
    // when he is side-on)
    g.rotation.order = "ZYX";
    // out of sight in this part of the scroll: jump straight to the spot
    g.visible = !scrubbed?.hide;
    if (scrubbed?.hide && entrance.current === "done") {
      if (scrubbed.anim) anim.current = scrubbed.anim;
      g.position.set(tx, ty, tz);
      g.rotation.set(0, scrubbed.ry, scrubbed.roll);
      g.scale.setScalar(tsWant);
      return;
    }

    if (entrance.current !== "done") {
      const ph = phase.current;
      // scrolled away or left the page mid-entrance: carry on as normal
      if (path !== "/" || (section && section !== "hero") || footer) entrance.current = "done";
      else {
        // frame by frame (at most 1/30 s each), so a stall while he is first
        // drawn does not skip the move
        const edt = Math.min(dt, 1 / 30);
        // where he lands: a little right of the middle, feet low on the
        // screen, close to the camera (so big, and in front of the hands)
        const pf = 10 / (10 - NEAR); // how much nearer things look bigger
        const big = ts * BIG;
        const landX = (viewport.width * 0.03) / pf;
        const landY = (-viewport.height * 0.36) / pf + 1.05 * big;
        if (entrance.current === "wait") {
          anim.current = "jump";
          g.position.set(landX, viewport.height / pf / 2 + big * 2.4, NEAR);
          g.scale.setScalar(big);
          g.rotation.y = 0.5;
          // the hands are in place: a beat, then he drops
          if (isIntroDone() && ready.current && onFinger) {
            ph.t += edt;
            if (ph.t > 0.35) {
              entrance.current = "drop";
              ph.t = 0;
              ph.from = g.position.y;
            }
          }
          return;
        }
        if (entrance.current === "drop") {
          // falling, faster and faster
          ph.t += edt;
          const p = Math.min(1, ph.t / 0.75);
          anim.current = "jump";
          g.position.set(landX, ph.from + (landY - ph.from) * p * p, NEAR);
          g.rotation.y += (0.35 - g.rotation.y) * (1 - Math.exp(-dt * 5));
          if (p >= 1) {
            entrance.current = "land";
            ph.t = 0;
          }
          return;
        }
        if (entrance.current === "land") {
          // a dip as his feet take the weight, then he stands for a moment
          ph.t += edt;
          anim.current = "idle";
          const dip = Math.sin(Math.min(1, ph.t / 0.35) * Math.PI) * big * 0.1;
          g.position.set(landX, landY - dip, NEAR);
          g.rotation.y += (0.1 - g.rotation.y) * (1 - Math.exp(-dt * 5));
          if (ph.t > 0.75) {
            entrance.current = "back";
            ph.t = 0;
          }
          return;
        }
        // "back": hops back onto the finger, shrinking as he goes further away
        ph.t += edt;
        const k = Math.min(1, ph.t / 1.0);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        anim.current = k < 0.85 ? "jump" : "idle";
        g.scale.setScalar(big + (ts - big) * e);
        g.position.set(
          landX + (tx - landX) * e,
          landY + (standY - landY) * e + Math.sin(k * Math.PI) * viewport.height * 0.06,
          NEAR + (tz - NEAR) * e,
        );
        g.rotation.y += ((k < 0.7 ? -0.9 : pose.ry) - g.rotation.y) * (1 - Math.exp(-dt * 6));
        if (k < 1) return;
        entrance.current = "done";
      }
    }
    // Travelling to a new spot: run (or jump, when the trip is mostly up or
    // down), face the way it goes and hop in an arc.
    const dx = tx - g.position.x;
    const dy = ty - g.position.y;
    const dist = Math.hypot(dx, dy);
    // (not while settling onto the finger: that is a sit-down, not a trip;
    // and not where the scroll itself moves him)
    const travelling =
      !scrubbed &&
      dist > viewport.height * 0.06 &&
      !(dance.active && path === "/playground") &&
      !(onFinger && Math.abs(dx) < viewport.width * 0.04);
    if (travelling) anim.current = Math.abs(dy) > Math.abs(dx) * 0.9 ? "jump" : "run";
    if (scrubbed?.anim) anim.current = scrubbed.anim;
    const ry = scrubbed ? scrubbed.ry : pose.ry;
    const facing = travelling && Math.abs(dx) > viewport.width * 0.05 ? Math.sign(dx) * 1.3 : ry + pointer.x * 0.15;
    const ks = scrubbed ? 1 - Math.exp(-dt * 9) : k; // follow the scroll closely

    g.position.x += dx * ks;
    g.position.y += dy * ks;
    g.position.z += (tz - g.position.z) * k;
    g.rotation.y += (facing - g.rotation.y) * k * 1.5;
    const roll = scrubbed?.roll ?? 0;
    g.rotation.z += (roll - g.rotation.z) * (scrubbed ? ks : k);
    g.scale.setScalar(g.scale.x + (tsWant - g.scale.x) * (scrubbed ? ks : k));
    if (hop.current) {
      const lift = travelling ? Math.min(dist / Math.max(g.scale.x, 0.001), 4) * 0.22 : 0;
      hop.current.position.y += (lift - hop.current.position.y) * (1 - Math.exp(-dt * 6));
    }
    // a soft contact shadow under his feet where he stands on the page
    if (shadow.current) {
      const want = section === "role" && !footer && roleTrip.p > 0.98 && roleTrip.out < 0.02 ? 0.42 : 0;
      const o = shadow.current.material as THREE.MeshBasicMaterial;
      o.opacity += (want - o.opacity) * (1 - Math.exp(-dt * 5));
      shadow.current.visible = o.opacity > 0.01;
    }
  });

  return (
    <group ref={root} scale={0.001}>
      <mesh ref={shadow} position={[0, -1.04, 0.05]} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={-1}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={hop}>
        {avatar.enabled ? (
          <>
            {/* nothing while the avatar file loads (the walk-in waits for it) */}
            <Suspense fallback={null}>
              <AvatarRig
                anim={anim}
                dangle={dangle}
                onSeat={(s) => {
                  seat.current = s;
                  ready.current = true;
                }}
              />
            </Suspense>
            <Suspense fallback={null}>
              <SeatProps seat={seat} place={place} />
            </Suspense>
          </>
        ) : (
          <PlaceholderBody anim={anim} />
        )}
      </group>
    </group>
  );
}
