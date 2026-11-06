"use client";

// Tiny shared store between the DOM (React UI, Lenis) and the 3D scene.
// The scene reads it every frame (no re-render); UI subscribes with useSky().
import { useSyncExternalStore } from "react";

export type SkyMode = "day" | "sunset" | "night";

// Music-driven dance (Playground). `time` is the song position in seconds;
// the character's dance follows it, so pause = freeze and seek = catch up.
export type Dance = {
  active: boolean; // a song is loaded (playing or paused)
  playing: boolean;
  time: number;
  bpm: number;
  clip: "dance1" | "dance2";
};

type State = {
  sky: SkyMode;
  scroll: number; // 0..1 progress of the current page
  section: string | null; // data-pose of the section in view (see poses.ts)
  footer: boolean; // footer is on screen
  dance: Dance;
};

const state: State = {
  sky: "day",
  scroll: 0,
  section: null,
  footer: false,
  dance: { active: false, playing: false, time: 0, bpm: 112, clip: "dance1" },
};
const listeners = new Set<() => void>();

const SKY_KEY = "sky-mode";

export const sceneStore = {
  get: () => state,
  setScroll(progress: number) {
    state.scroll = Number.isFinite(progress) ? progress : 0;
  },
  setSection(name: string | null) {
    state.section = name;
  },
  setFooter(visible: boolean) {
    state.footer = visible;
  },
  setDance(patch: Partial<Dance>) {
    Object.assign(state.dance, patch);
  },
  setSky(mode: SkyMode) {
    state.sky = mode;
    try {
      localStorage.setItem(SKY_KEY, mode);
    } catch {
      // storage can be blocked (private mode); the toggle still works
    }
    listeners.forEach((l) => l());
  },
  loadSky() {
    try {
      const saved = localStorage.getItem(SKY_KEY) as SkyMode | null;
      if (saved === "day" || saved === "sunset" || saved === "night") {
        sceneStore.setSky(saved);
      }
    } catch {
      // ignore
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSky(): SkyMode {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => state.sky,
    () => "day",
  );
}

export { asset } from "./asset";
