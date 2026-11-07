// How far the 3D files have loaded, filled in by the 3D layer (Scene.tsx,
// from three.js's loading manager) and read by the preloader. A plain object,
// so the preloader does not pull three.js into the first bundle.
export const loadState = {
  scene: 0, // performance.now() when the 3D layer mounted, 0 = not yet
  started: false, // anything has started loading
  active: false, // something is loading right now
  progress: 0, // 0..100
};
