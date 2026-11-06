"use client";

// A developer's desk setup and a gaming chair, made in code (no model files):
// monitors showing a code editor and a terminal, a PC tower with a glass side
// and spinning RGB fans, an RGB mechanical keyboard, mouse, mat, coffee mug,
// a wifi router and a white/black racing-style gaming chair.
// Units are character units (the character is 2 units tall, ~1.8 m).
// Each piece faces +Z (its front / screen) unless rotated by the caller.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ---------- screen textures ----------
function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** Code editor with a file tree, tabs and a minimap. */
function editorTexture() {
  return canvasTexture(768, 432, (g) => {
    const bg = g.createLinearGradient(0, 0, 768, 432);
    bg.addColorStop(0, "#0d1020");
    bg.addColorStop(1, "#1a1036");
    g.fillStyle = bg;
    g.fillRect(0, 0, 768, 432);
    g.fillStyle = "#151a2e";
    g.fillRect(0, 0, 768, 28);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(16 + i * 16, 14, 5, 0, Math.PI * 2);
      g.fill();
    });
    // tabs
    ["page.tsx", "Hero.tsx", "styles.css"].forEach((_, i) => {
      g.fillStyle = i === 0 ? "#22294a" : "#171c33";
      g.fillRect(150 + i * 110, 28, 106, 24);
      g.fillStyle = i === 0 ? "#ff6a3d" : "#5c6787";
      g.fillRect(162 + i * 110, 38, 60, 5);
    });
    // file tree
    g.fillStyle = "#11152a";
    g.fillRect(0, 28, 140, 404);
    const r = rng(3);
    for (let i = 0; i < 14; i++) {
      g.fillStyle = i === 4 ? "#7aa2ff" : "#2f3858";
      g.fillRect(14 + (i % 3) * 10, 46 + i * 26, 60 + r() * 50, 7);
    }
    // code
    const pal = ["#c792ea", "#82aaff", "#c3e88d", "#f78c6c", "#89ddff", "#ffcb6b", "#5c6787"];
    for (let line = 0; line < 16; line++) {
      const y = 66 + line * 22;
      g.fillStyle = "#3a4466";
      g.fillRect(150, y, 12, 7);
      let x = 176 + (line % 5 === 0 ? 0 : 20 * (1 + (line % 3)));
      const n = 2 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) {
        const len = 24 + r() * 90;
        g.fillStyle = pal[Math.floor(r() * pal.length)];
        g.fillRect(x, y, len, 7);
        x += len + 10;
      }
    }
    // minimap
    g.fillStyle = "#11152a";
    g.fillRect(700, 52, 60, 372);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = pal[i % pal.length];
      g.globalAlpha = 0.5;
      g.fillRect(706, 58 + i * 9, 10 + r() * 40, 3);
    }
    g.globalAlpha = 1;
  });
}

/** Terminal with a build log. */
function terminalTexture() {
  return canvasTexture(320, 480, (g) => {
    g.fillStyle = "#07090f";
    g.fillRect(0, 0, 320, 480);
    g.fillStyle = "#121726";
    g.fillRect(0, 0, 320, 24);
    const r = rng(9);
    for (let i = 0; i < 22; i++) {
      const y = 40 + i * 19;
      g.fillStyle = i % 6 === 0 ? "#28c840" : i % 7 === 3 ? "#febc2e" : "#9aa6c7";
      g.fillRect(12, y, 8, 7);
      g.fillStyle = "#5c6787";
      g.fillRect(28, y, 40 + r() * 200, 7);
    }
    g.fillStyle = "#28c840";
    g.fillRect(12, 40 + 22 * 19, 12, 9);
  });
}

// ---------- shared materials ----------
function useMats() {
  return useMemo(
    () => ({
      black: new THREE.MeshStandardMaterial({ color: "#141418", roughness: 0.45, metalness: 0.3 }),
      matte: new THREE.MeshStandardMaterial({ color: "#1d1f26", roughness: 0.8 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#d9dde3", roughness: 0.18, metalness: 1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#9fb4c8", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1 }),
      white: new THREE.MeshStandardMaterial({ color: "#f3f3f3", roughness: 0.55 }),
      wood: new THREE.MeshStandardMaterial({ color: "#d9c3a0", roughness: 0.62 }),
    }),
    [],
  );
}

// ---------- pieces ----------
/** Monitor on a stand; the screen faces +Z. */
export function Monitor({ w = 0.78, h = 0.44, kind = "editor" as "editor" | "terminal", stand = 0.26 }) {
  const m = useMats();
  const tex = useMemo(() => (kind === "editor" ? editorTexture() : terminalTexture()), [kind]);
  return (
    <group>
      <group position={[0, stand + h / 2, 0]}>
        <RoundedBox args={[w, h, 0.03]} radius={0.012} material={m.black} />
        <mesh position={[0, 0, 0.0155]}>
          <planeGeometry args={[w - 0.025, h - 0.025]} />
          <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1.2} roughness={0.3} />
        </mesh>
      </group>
      <mesh position={[0, stand / 2 + 0.01, -0.04]} material={m.chrome}>
        <boxGeometry args={[0.04, stand, 0.03]} />
      </mesh>
      <RoundedBox args={[0.24, 0.015, 0.16]} radius={0.006} position={[0, 0.008, -0.02]} material={m.chrome} />
    </group>
  );
}

/** PC tower with a glass side on its -X face (put that towards the camera). */
export function PcTower() {
  const m = useMats();
  const fans = useRef<THREE.Group>(null);
  const ring = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", emissive: "#b14dff", emissiveIntensity: 2.2 }), []);
  const strip = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", emissive: "#3dd6ff", emissiveIntensity: 2 }), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    fans.current?.children.forEach((f) => (f.rotation.z += dt * 9));
    // slow colour cycle, purple -> pink -> cyan
    ring.emissive.copy(tmp.setHSL(0.78 + Math.sin(t * 0.5) * 0.1, 0.9, 0.55));
    strip.emissive.copy(tmp.setHSL(0.52 + Math.sin(t * 0.5 + 2) * 0.12, 0.95, 0.55));
  });
  const W = 0.22, H = 0.48, D = 0.44;
  return (
    <group position={[0, H / 2, 0]}>
      {/* shell: back, top, bottom, front and the solid right side */}
      <mesh position={[0, 0, -D / 2 + 0.005]} material={m.black}><boxGeometry args={[W, H, 0.01]} /></mesh>
      <mesh position={[0, H / 2 - 0.005, 0]} material={m.black}><boxGeometry args={[W, 0.01, D]} /></mesh>
      <mesh position={[0, -H / 2 + 0.005, 0]} material={m.black}><boxGeometry args={[W, 0.01, D]} /></mesh>
      <mesh position={[W / 2 - 0.005, 0, 0]} material={m.black}><boxGeometry args={[0.01, H, D]} /></mesh>
      <mesh position={[0, 0, D / 2 - 0.006]} material={m.matte}><boxGeometry args={[W, H, 0.012]} /></mesh>
      {/* glass side */}
      <mesh position={[-W / 2 + 0.003, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.glass}>
        <planeGeometry args={[D - 0.01, H - 0.01]} />
      </mesh>
      {/* inside: board, GPU with a lit edge, cooler ring, RGB strip */}
      <mesh position={[W / 2 - 0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D - 0.04, H - 0.04]} />
        <meshStandardMaterial color="#0d0f14" roughness={0.6} />
      </mesh>
      <mesh position={[0.01, -0.06, -0.02]} material={m.black}><boxGeometry args={[0.16, 0.05, 0.3]} /></mesh>
      <mesh position={[-0.072, -0.06, -0.02]} material={strip}><boxGeometry args={[0.004, 0.012, 0.28]} /></mesh>
      <mesh position={[0.02, 0.1, -0.06]} rotation={[0, Math.PI / 2, 0]} material={ring}><torusGeometry args={[0.045, 0.006, 8, 32]} /></mesh>
      <mesh position={[-0.09, 0.2, 0]} material={strip}><boxGeometry args={[0.004, 0.006, 0.38]} /></mesh>
      {/* three fans facing the glass, lit rings */}
      <group ref={fans}>
        {[0.14, 0, -0.14].map((y) => (
          <group key={y} position={[0.02, y, D / 2 - 0.08]} rotation={[0, Math.PI / 2, 0]}>
            <mesh material={ring}><torusGeometry args={[0.055, 0.007, 8, 32]} /></mesh>
            {[0, 1, 2, 3, 4].map((b) => (
              <mesh key={b} rotation={[(b / 5) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
                <boxGeometry args={[0.004, 0.045, 0.014]} />
                <meshStandardMaterial color="#22232b" roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

/** Mechanical keyboard with RGB under-glow; the long side runs along X. */
export function Keyboard() {
  const m = useMats();
  const glow = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", emissive: "#ff3d9a", emissiveIntensity: 1.6 }), []);
  const keys = useMemo(() => {
    const cols = 15, rows = 5;
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.019, 0.012, 0.019), new THREE.MeshStandardMaterial({ color: "#2a2c34", roughness: 0.6 }), cols * rows);
    const mtx = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        mtx.makeTranslation(-0.147 + c * 0.021, 0.022, -0.042 + r * 0.021);
        mesh.setMatrixAt(i++, mtx);
      }
    return mesh;
  }, []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => glow.emissive.copy(tmp.setHSL((clock.elapsedTime * 0.08) % 1, 0.9, 0.55)));
  return (
    <group>
      <RoundedBox args={[0.34, 0.016, 0.12]} radius={0.006} position={[0, 0.008, 0]} material={m.black} />
      <mesh position={[0, 0.002, 0.061]} material={glow}><boxGeometry args={[0.33, 0.004, 0.004]} /></mesh>
      <primitive object={keys} />
    </group>
  );
}

export function DeskBits() {
  const m = useMats();
  return (
    <group>
      {/* mat */}
      <RoundedBox args={[0.7, 0.004, 0.3]} radius={0.002} position={[0.08, 0.002, 0]}>
        <meshStandardMaterial color="#23252e" roughness={0.9} />
      </RoundedBox>
      {/* mouse */}
      <mesh position={[0.32, 0.016, 0.01]} scale={[0.028, 0.016, 0.045]} material={m.black}>
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      {/* coffee mug */}
      <group position={[0.42, 0, -0.1]}>
        <mesh position={[0, 0.045, 0]} material={m.white}><cylinderGeometry args={[0.032, 0.03, 0.09, 24]} /></mesh>
        <mesh position={[0.036, 0.048, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.white}><torusGeometry args={[0.018, 0.005, 8, 16]} /></mesh>
        <mesh position={[0, 0.088, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.028, 20]} />
          <meshStandardMaterial color="#3b2416" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** Wifi router with two antennas. */
export function Router() {
  const m = useMats();
  return (
    <group>
      <RoundedBox args={[0.16, 0.03, 0.11]} radius={0.01} position={[0, 0.015, 0]} material={m.black} />
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.11, -0.045]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]} material={m.black}>
          <cylinderGeometry args={[0.006, 0.008, 0.18, 10]} />
        </mesh>
      ))}
      {[-0.03, 0, 0.03].map((x) => (
        <mesh key={x} position={[x, 0.031, 0.056]}>
          <boxGeometry args={[0.008, 0.004, 0.002]} />
          <meshStandardMaterial color="#111" emissive="#28c840" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Racing-style gaming chair, white with black wings and trim. The seat top is
 * at y = 0 (put it just under the sitter's hips), the sitter faces +Z.
 */
export function GamingChair({ floor = -0.55 }: { floor?: number }) {
  const m = useMats();
  return (
    <group>
      {/* seat: white cushion with black side bolsters */}
      <RoundedBox args={[0.42, 0.08, 0.48]} radius={0.03} position={[0, -0.04, 0.02]} material={m.white} />
      {[-0.24, 0.24].map((x) => (
        <RoundedBox key={x} args={[0.08, 0.12, 0.5]} radius={0.035} position={[x, -0.02, 0.02]} material={m.black} />
      ))}
      {/* backrest, leaning back a little: white middle, black wings, headrest */}
      <group position={[0, 0.02, -0.24]} rotation={[-0.16, 0, 0]}>
        <RoundedBox args={[0.38, 0.86, 0.1]} radius={0.04} position={[0, 0.43, 0]} material={m.white} />
        {[-0.22, 0.22].map((x) => (
          <RoundedBox key={x} args={[0.1, 0.62, 0.13]} radius={0.04} position={[x, 0.33, 0.01]} rotation={[0, x > 0 ? -0.25 : 0.25, 0]} material={m.white} />
        ))}
        <RoundedBox args={[0.46, 0.2, 0.11]} radius={0.05} position={[0, 0.8, 0]} material={m.white} />
        {/* black piping down the wings */}
        {[-0.265, 0.265].map((x) => (
          <mesh key={x} position={[x, 0.36, 0.06]} material={m.black}>
            <boxGeometry args={[0.012, 0.6, 0.012]} />
          </mesh>
        ))}
        <RoundedBox args={[0.24, 0.1, 0.06]} radius={0.03} position={[0, 0.74, 0.07]} material={m.matte} />
        {/* lumbar pillow */}
        <RoundedBox args={[0.26, 0.11, 0.06]} radius={0.03} position={[0, 0.16, 0.07]} material={m.matte} />
      </group>
      {/* armrests */}
      {[-0.27, 0.27].map((x) => (
        <group key={x} position={[x, 0, 0.02]}>
          <mesh position={[0, 0.1, 0]} material={m.black}><boxGeometry args={[0.035, 0.2, 0.05]} /></mesh>
          <RoundedBox args={[0.07, 0.03, 0.26]} radius={0.012} position={[0, 0.21, 0.02]} material={m.black} />
        </group>
      ))}
      {/* gas lift and the five-star base on casters */}
      <mesh position={[0, (floor - 0.08) / 2, 0]} material={m.chrome}>
        <cylinderGeometry args={[0.025, 0.03, Math.abs(floor) - 0.08, 16]} />
      </mesh>
      <group position={[0, floor + 0.04, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh position={[0, 0, 0.16]} material={m.black}><boxGeometry args={[0.04, 0.03, 0.32]} /></mesh>
              <mesh position={[0, -0.035, 0.3]} rotation={[0, 0, Math.PI / 2]} material={m.black}>
                <cylinderGeometry args={[0.025, 0.025, 0.03, 14]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
