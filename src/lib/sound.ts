"use client";

// Tiny UI sounds made with the Web Audio API: no audio files to download.
// Off by default; the choice is remembered in localStorage.
import { useSyncExternalStore } from "react";

const KEY = "sound-on";
let enabled = false;
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

function audio() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const sound = {
  get enabled() {
    return enabled;
  },
  set(on: boolean) {
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {
      // ignore
    }
    if (on) audio(); // unlock audio inside the click that turned it on
    listeners.forEach((l) => l());
  },
  load() {
    try {
      enabled = localStorage.getItem(KEY) === "1";
    } catch {
      enabled = false;
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useSoundOn() {
  return useSyncExternalStore(sound.subscribe, () => enabled, () => false);
}

/** Short soft "tick" for clicks. */
export function playClick() {
  if (!enabled) return;
  const c = audio();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.05);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}

/** Airy "whoosh" for page changes and the menu. */
export function playWhoosh() {
  if (!enabled) return;
  const c = audio();
  const t = c.currentTime;
  const len = 0.45;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(2400, t + len * 0.45);
  filter.frequency.exponentialRampToValueAtTime(500, t + len);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.12, t + len * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
  src.stop(t + len);
}
