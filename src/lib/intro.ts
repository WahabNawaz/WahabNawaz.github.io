"use client";

// Lets page animations wait until the preloader has finished.
let done = false;
const waiting = new Set<() => void>();

export function markIntroDone() {
  done = true;
  waiting.forEach((cb) => cb());
  waiting.clear();
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
