"use client";

// Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and Lenis
// stay in sync. Also feeds page scroll progress to the 3D scene.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneStore } from "@/lib/scene-store";

gsap.registerPlugin(ScrollTrigger);

function LenisBridge() {
  const pathname = usePathname();

  const lenis = useLenis((l) => {
    ScrollTrigger.update();
    sceneStore.setScroll(l.progress);
  });

  // Drive Lenis from the GSAP ticker (one animation loop for both).
  useEffect(() => {
    if (!lenis) return;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, [lenis]);

  // New page: jump to the top and let ScrollTrigger re-measure.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    sceneStore.setScroll(0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, anchors: true, respectReducedMotion: true }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
