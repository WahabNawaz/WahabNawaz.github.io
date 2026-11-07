"use client";

// Lets page animations wait for the opening, in two steps:
// 1. intro done: the preloader has finished and fades away;
// 2. hero ready: on the home page, the 3D opening has played (the hands have
//    flown in and the character has dropped in and sat down). Anywhere else,
//    and on later visits, this follows right after step 1. A fallback timer
//    makes sure the page never waits for a 3D scene that cannot load.
let done = false;
let doneAt = 0;
const waiting = new Set<() => void>();

let heroReady = false;
const waitingHero = new Set<() => void>();
const HERO_FALLBACK = 9000; // ms after the intro

export function markIntroDone() {
  if (done) return;
  done = true;
  doneAt = performance.now();
  waiting.forEach((cb) => cb());
  waiting.clear();
  window.setTimeout(markHeroReady, HERO_FALLBACK);
}

/** Runs cb now if the intro already finished, otherwise when it does. */
export function onIntroDone(cb: () => void) {
  if (done) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  return () => waiting.delete(cb);
}

export const isIntroDone = () => done;

/** Seconds since the preloader finished (-1 before that). */
export const introSeconds = () => (done ? (performance.now() - doneAt) / 1000 : -1);

export function markHeroReady() {
  if (heroReady) return;
  heroReady = true;
  waitingHero.forEach((cb) => cb());
  waitingHero.clear();
}

/** Runs cb once the opening is over (see above). */
export function onHeroReady(cb: () => void) {
  if (heroReady) {
    cb();
    return () => {};
  }
  waitingHero.add(cb);
  return () => waitingHero.delete(cb);
}

export const isHeroReady = () => heroReady;

/**
 * The 3D opening on the home hero (HeroHands.tsx runs it): `k` goes 0 → 1
 * frame by frame (so a stall while the 3D files are first drawn does not skip
 * it), -1 = not started; `done` = played, or not playing on this visit.
 * Shared with the sky, which brings its clouds in while the hands fly in.
 */
export const opening = { k: -1, done: false };

/** 0..1: how far the hero sky's clouds have come in. */
export function cloudsIn() {
  // on later visits in the session the preloader is skipped: clouds as usual
  if (typeof document !== "undefined" && document.documentElement.classList.contains("intro-seen")) return 1;
  // the preloader shows a cloudless sky
  if (!done) return 0;
  if (opening.done) return 1;
  if (opening.k < 0) return introSeconds() > 3 ? 1 : 0;
  return Math.min(1, Math.max(0, (opening.k - 0.2) / 0.8));
}
