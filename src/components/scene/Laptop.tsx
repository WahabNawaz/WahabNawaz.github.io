"use client";

// A thin, rounded laptop in a "crystal diamond" finish, made in code:
// - clear crystal body and lid: glossy, see-through, with a rainbow sheen
//   (iridescence) and tiny diamond facets (a generated normal map) that sparkle;
// - a lit screen showing a code editor (generated canvas texture);
// - a backlit keyboard and a crystal trackpad;
// - a small glowing diamond emblem on the back of the lid (no brand logos).
// Size is in character units (the character is 2 units tall). The hinge is at
// the far edge (+Z) and the lid opens towards the person sitting behind it.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const W = 0.42; // width
const D = 0.29; // depth
const T = 0.014; // thickness of each half
const OPEN = 1.92; // lid angle (radians from closed)

/** Small triangle facets with slightly different tilts: the "diamond" sparkle. */
function facetNormalMap() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(128,128,255)";
  g.fillRect(0, 0, size, size);
  const n = 16;
  const s = size / n;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      for (const tri of [0, 1]) {
        const r = 128 + (rnd() - 0.5) * 120;
        const gg = 128 + (rnd() - 0.5) * 120;
        g.fillStyle = `rgb(${r | 0},${gg | 0},235)`;
        g.beginPath();
        if (tri === 0) {
          g.moveTo(x * s, y * s);
          g.lineTo((x + 1) * s, y * s);
          g.lineTo(x * s, (y + 1) * s);
        } else {
          g.moveTo((x + 1) * s, y * s);
          g.lineTo((x + 1) * s, (y + 1) * s);
          g.lineTo(x * s, (y + 1) * s);
        }
        g.fill();
      }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 4);
  return t;
}

/** A code editor on a dark background. */
function screenTexture() {
  const w = 512, h = 340;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(1, "#161034");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // window bar
  g.fillStyle = "#1c2238";
  g.fillRect(0, 0, w, 26);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(18 + i * 18, 13, 5, 0, Math.PI * 2);
    g.fill();
  });
  // side bar
  g.fillStyle = "#121730";
  g.fillRect(0, 26, 92, h - 26);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = i === 2 ? "#ff6a3d" : "#2c3552";
    g.fillRect(14, 44 + i * 26, 52 - (i % 3) * 10, 8);
  }
  // code
  const palette = ["#c792ea", "#82aaff", "#c3e88d", "#f78c6c", "#89ddff", "#ffcb6b", "#5c6787"];
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let line = 0; line < 13; line++) {
    let x = 112 + (line % 4 === 0 ? 0 : 18 * (1 + (line % 3)));
    const y = 44 + line * 22;
    g.fillStyle = "#3a4466";
    g.fillRect(100, y, 6, 8);
    const words = 2 + Math.floor(rnd() * 4);
    for (let k = 0; k < words; k++) {
      const len = 20 + rnd() * 70;
      g.fillStyle = palette[Math.floor(rnd() * palette.length)];
      g.fillRect(x, y, len, 8);
      x += len + 8;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function Laptop() {
  const caret = useRef<THREE.Mesh>(null);
  const emblem = useRef<THREE.MeshStandardMaterial>(null);

  const { crystal, screen, keys } = useMemo(() => {
    const normals = facetNormalMap();
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: "#dfeeff",
      metalness: 0.45,
      roughness: 0.06,
      transparent: true,
      opacity: 0.86,
      iridescence: 1,
      iridescenceIOR: 2.2,
      iridescenceThicknessRange: [150, 900],
      clearcoat: 1,
      clearcoatRoughness: 0.01,
      specularIntensity: 1,
      specularColor: new THREE.Color("#ffffff"),
      envMapIntensity: 3.4,
      normalMap: normals,
      normalScale: new THREE.Vector2(1.1, 1.1),
      sheen: 0.4,
      sheenColor: new THREE.Color("#bfe3ff"),
    });
    const tex = screenTexture();
    const screenMat = new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 1.25, roughness: 0.25 });
    const keyGeo = new THREE.BoxGeometry(0.022, 0.004, 0.02);
    const keyMat = new THREE.MeshStandardMaterial({ color: "#20232c", roughness: 0.5, emissive: "#9fd4ff", emissiveIntensity: 0.18 });
    const cols = 13, rows = 5;
    const keyMesh = new THREE.InstancedMesh(keyGeo, keyMat, cols * rows);
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        m.makeTranslation(-W / 2 + 0.042 + c * 0.0258, T / 2 + 0.002, D / 2 - 0.05 - r * 0.0245 - 0.06);
        keyMesh.setMatrixAt(i++, m);
      }
    return { crystal: crystalMat, screen: screenMat, keys: keyMesh };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (caret.current) caret.current.visible = Math.floor(t * 2) % 2 === 0;
    if (emblem.current) emblem.current.emissiveIntensity = 1.4 + Math.sin(t * 1.6) * 0.4;
  });

  return (
    <group>
      {/* base: crystal slab with the keyboard and trackpad */}
      <RoundedBox args={[W, T, D]} radius={0.006} smoothness={3} material={crystal} />
      <primitive object={keys} />
      <RoundedBox args={[0.13, 0.002, 0.075]} radius={0.004} position={[0, T / 2 + 0.001, -D / 2 + 0.055]}>
        <meshPhysicalMaterial color="#f4fbff" roughness={0.05} clearcoat={1} iridescence={1} transparent opacity={0.7} />
      </RoundedBox>

      {/* lid: hinges at the far edge (+Z) and opens towards the user */}
      <group position={[0, T / 2, D / 2]} rotation={[OPEN, 0, 0]}>
        <RoundedBox args={[W, T * 0.8, D]} radius={0.006} smoothness={3} position={[0, 0, -D / 2]} material={crystal} />
        {/* the display, on the inner face */}
        <mesh position={[0, -T * 0.45, -D / 2 - 0.004]} rotation={[Math.PI / 2, 0, 0]} material={screen}>
          <planeGeometry args={[W - 0.03, D - 0.035]} />
        </mesh>
        <mesh ref={caret} position={[-0.03, -T * 0.46, -D / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.004, 0.012]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        {/* glowing diamond emblem on the back */}
        <mesh position={[0, T * 0.45, -D / 2]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[1, 1, 0.25]}>
          <octahedronGeometry args={[0.022, 0]} />
          <meshStandardMaterial ref={emblem} color="#ffffff" emissive="#d9f0ff" emissiveIntensity={1.4} roughness={0.1} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
