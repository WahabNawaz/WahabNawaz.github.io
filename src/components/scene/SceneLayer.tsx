"use client";

// Loads Three.js only in the browser and only after the page HTML is ready,
// so the 3D bundle never blocks the first paint.
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneLayer() {
  const pathname = usePathname();
  return <Scene pathname={pathname} />;
}
