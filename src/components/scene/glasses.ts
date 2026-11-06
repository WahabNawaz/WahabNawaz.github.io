// Black sunglasses ("kala chashma") made in code and attached to the avatar's
// head bone, so they follow every head turn. Sized and placed from the rig's
// own eye bones, so they fit any avatar that has LeftEye / RightEye bones.
import * as THREE from "three";

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r * 1.6);
  s.quadraticCurveTo(x + w, y + h, x + w - r * 1.6, y + h);
  s.lineTo(x + r * 1.6, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r * 1.6);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Adds the glasses once (the loaded scene is cached and reused). */
export function addGlasses(scene: THREE.Object3D) {
  if (scene.userData.glasses) return;
  const head = scene.getObjectByName("Head");
  const eyeL = scene.getObjectByName("LeftEye");
  const eyeR = scene.getObjectByName("RightEye");
  const top = scene.getObjectByName("HeadTop_End");
  if (!head || !eyeL || !eyeR || eyeL.parent !== head || eyeR.parent !== head) return;

  // a frame in the head bone's space: x = the avatar's left, y = up, z = forward
  const pl = eyeL.position, pr = eyeR.position;
  const x = pl.clone().sub(pr);
  const ipd = x.length();
  x.normalize();
  const up = top && top.parent === head ? top.position.clone() : new THREE.Vector3(0, 1, 0);
  const y = up.sub(x.clone().multiplyScalar(up.dot(x))).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  const mid = pl.clone().add(pr).multiplyScalar(0.5);

  const k = ipd / 0.064; // scale everything to this face
  const lensW = 0.05 * k, lensH = 0.04 * k, rim = 0.0035 * k, depth = 0.004 * k;
  const frameMat = new THREE.MeshPhysicalMaterial({ color: "#0b0b0d", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: "#050506",
    roughness: 0.05,
    metalness: 0.2,
    clearcoat: 1,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 1.4,
  });

  const g = new THREE.Group();
  g.name = "Glasses";
  const outer = roundedRect(lensW + rim * 2, lensH + rim * 2, 0.012 * k);
  outer.holes.push(roundedRect(lensW, lensH, 0.009 * k));
  const ringGeo = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelThickness: 0.0008 * k, bevelSize: 0.0008 * k, bevelSegments: 2, curveSegments: 10 });
  const lensGeo = new THREE.ShapeGeometry(roundedRect(lensW, lensH, 0.009 * k), 10);
  for (const side of [1, -1]) {
    const cx = (side * ipd) / 2;
    const ring = new THREE.Mesh(ringGeo, frameMat);
    ring.position.set(cx, 0, 0);
    ring.rotation.y = side * -0.08; // a slight wrap around the face
    g.add(ring);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(cx, 0, depth * 0.5);
    lens.rotation.y = ring.rotation.y;
    g.add(lens);
    // arm from the outer edge back to the ear
    const armLen = 0.1 * k;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.003 * k, 0.005 * k, armLen), frameMat);
    arm.position.set(side * (ipd / 2 + lensW / 2 + rim * 0.6), lensH * 0.22, -armLen / 2 + depth);
    arm.rotation.y = side * 0.06;
    g.add(arm);
  }
  // bridge over the nose
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(ipd / 2 - lensW / 2, 0.0022 * k, 8, 16, Math.PI), frameMat);
  bridge.position.set(0, lensH * 0.12, depth * 0.5);
  g.add(bridge);
  // brow bar along the top
  const bar = new THREE.Mesh(new THREE.BoxGeometry(ipd + lensW + rim * 2, 0.0035 * k, 0.004 * k), frameMat);
  bar.position.set(0, lensH / 2 + rim * 0.5, depth * 0.5);
  g.add(bar);

  g.traverse((o) => {
    o.frustumCulled = false;
    o.renderOrder = 2;
  });

  // into the head's frame: a little in front of the eyes, a touch lower
  const basis = new THREE.Matrix4().makeBasis(x, y, z);
  const holder = new THREE.Group();
  holder.quaternion.setFromRotationMatrix(basis);
  holder.position.copy(mid).add(z.clone().multiplyScalar(0.03 * k)).add(y.clone().multiplyScalar(-0.002 * k));
  holder.add(g);
  head.add(holder);
  scene.userData.glasses = holder;
}
