// Retarget onto a standard humanoid rig (Mixamo-style names: Hips, Spine,
// LeftArm, LeftUpLeg, ...), e.g. a MetaPerson Creator avatar.
//
// Same method as retarget.mjs (delta retargeting): for every mapped bone the
// source bone's world-space rotation change from its bind T-pose is applied to
// the target bone's own bind T-pose. Hips also take the source pelvis movement,
// scaled by hip height. Unmapped bones (twist bones, extra neck bones, eyes)
// keep their bind pose relative to their parent.
//
// It also keeps only the face blendshapes the site uses (blinking, smile, jaw),
// which removes most of the file size.
//
// usage: node retarget-std.mjs <avatar.glb> <UAL1_Standard.glb> <wave-source.glb> <out.glb>
//   wave-source = the Quaternius "Hoodie Character" GLB (has the CC0 Wave clip)
// then:  npx @gltf-transform/cli optimize out.glb avatar.glb --compress meshopt --texture-compress webp --texture-size 1024 --simplify false
import { NodeIO } from "@gltf-transform/core";
import * as THREE from "three";
import { bindWorld } from "./bind.mjs";

const [TARGET, UAL, WAVE_SRC, OUT = "avatar-retargeted.glb"] = process.argv.slice(2);
const FPS = 30;
const KEEP_MORPHS = ["eyeBlinkLeft", "eyeBlinkRight", "jawOpen", "mouthSmileLeft", "mouthSmileRight"];

// target bone -> UAL (Quaternius Universal Animation Library) bone
const MAP_UAL = { Hips: "pelvis", Spine: "spine_01", Spine1: "spine_02", Spine2: "spine_03", Neck: "neck_01", Head: "Head" };
// target bone -> Quaternius "Hoodie Character" bone (IK-style rig, used for the Wave clip only)
const MAP_HOODIE = { Hips: "Body", Spine: "Abdomen", Spine1: "Torso", Spine2: "Chest", Neck: "Neck", Head: "Head" };
for (const [S, s, H] of [["Left", "l", "L"], ["Right", "r", "R"]]) {
  Object.assign(MAP_UAL, {
    [`${S}Shoulder`]: `clavicle_${s}`, [`${S}Arm`]: `upperarm_${s}`, [`${S}ForeArm`]: `lowerarm_${s}`, [`${S}Hand`]: `hand_${s}`,
    [`${S}UpLeg`]: `thigh_${s}`, [`${S}Leg`]: `calf_${s}`, [`${S}Foot`]: `foot_${s}`, [`${S}ToeBase`]: `ball_${s}`,
  });
  Object.assign(MAP_HOODIE, {
    [`${S}Shoulder`]: `Shoulder.${H}`, [`${S}Arm`]: `UpperArm.${H}`, [`${S}ForeArm`]: `LowerArm.${H}`, [`${S}Hand`]: `Wrist.${H}`,
    [`${S}UpLeg`]: `UpperLeg.${H}`, [`${S}Leg`]: `LowerLeg.${H}`,
  });
  for (const f of ["Index", "Middle", "Ring", "Pinky", "Thumb"])
    for (let i = 1; i <= 3; i++) {
      MAP_UAL[`${S}Hand${f}${i}`] = `${f.toLowerCase()}_0${i}_${s}`;
      MAP_HOODIE[`${S}Hand${f}${i}`] = `${f}${i}.${H}`;
    }
}
const swapUAL = (n) => n.replace(/_l$/, "_R_").replace(/_r$/, "_l").replace(/_R_$/, "_r");

// [output clip name, source, source clip, mirrored?, move hips?]
const CLIPS = [
  ["Idle_Loop", "ual", "Idle_Loop", false, true],
  ["Idle_Talking_Loop", "ual", "Idle_Talking_Loop", false, true],
  ["Sitting_Enter", "ual", "Sitting_Enter", false, true],
  ["Sitting_Idle_Loop", "ual", "Sitting_Idle_Loop", false, true],
  ["Sitting_Talking_Loop", "ual", "Sitting_Talking_Loop", false, true],
  ["Walk_Loop", "ual", "Walk_Loop", false, true],
  ["Jog_Fwd_Loop", "ual", "Jog_Fwd_Loop", false, true],
  ["Jump_Loop", "ual", "Jump_Loop", false, true],
  ["Push_Loop", "ual", "Push_Loop", false, true],
  ["Dance_Loop", "ual", "Dance_Loop", false, true],
  ["Dance_Loop_Mirror", "ual", "Dance_Loop", true, true],
  ["Wave", "hoodie", "CharacterArmature|Wave", false, false],
];

const io = new NodeIO();
const tgt = await io.read(TARGET);
const SRC = {
  ual: { doc: await io.read(UAL), map: MAP_UAL, pelvis: "pelvis", swap: swapUAL },
  hoodie: { doc: await io.read(WAVE_SRC), map: MAP_HOODIE, pelvis: "Body", swap: (n) => n },
};
const rotOf = (m) => { const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); return q; };
const posOf = (m) => new THREE.Vector3().setFromMatrixPosition(m);

// ---------- keep only the blendshapes we use ----------
for (const mesh of tgt.getRoot().listMeshes()) {
  const names = mesh.getExtras()?.targetNames;
  if (!Array.isArray(names) || !names.length) continue;
  const keep = names.map((n, i) => (KEEP_MORPHS.includes(n) ? i : -1)).filter((i) => i >= 0);
  for (const prim of mesh.listPrimitives()) {
    const targets = prim.listTargets();
    targets.forEach((t, i) => { if (!keep.includes(i)) { prim.removeTarget(t); t.dispose(); } });
  }
  mesh.setWeights(keep.map(() => 0));
  mesh.setExtras({ ...mesh.getExtras(), targetNames: keep.map((i) => names[i]) });
  console.log("blendshapes", mesh.getName() || "(mesh)", names.length, "->", keep.length);
}

// ---------- sources ----------
for (const s of Object.values(SRC)) {
  const B = bindWorld(s.doc);
  s.bindQ = new Map([...B.map].map(([k, m]) => [k, rotOf(m)]));
  s.bindPos = new Map([...B.map].map(([k, m]) => [k, posOf(m)]));
}
function sampler(ch) {
  const inp = ch.getSampler().getInput().getArray(), out = ch.getSampler().getOutput().getArray();
  const n = ch.getTargetPath() === "rotation" ? 4 : 3;
  return (t) => {
    let i = 0;
    while (i < inp.length - 1 && inp[i + 1] < t) i++;
    const j = Math.min(i + 1, inp.length - 1), span = inp[j] - inp[i];
    const k = span > 0 ? Math.min(1, Math.max(0, (t - inp[i]) / span)) : 0;
    if (n === 4) return new THREE.Quaternion().fromArray(out, i * 4).slerp(new THREE.Quaternion().fromArray(out, j * 4), k);
    return new THREE.Vector3().fromArray(out, i * 3).lerp(new THREE.Vector3().fromArray(out, j * 3), k);
  };
}
function srcWorldAt(doc, samplers, t) {
  const world = new Map();
  const visit = (node, parentM) => {
    const name = node.getName();
    const sr = samplers.rot.get(name), sp = samplers.pos.get(name);
    const q = sr ? sr(t) : new THREE.Quaternion(...node.getRotation());
    const p = sp ? sp(t) : new THREE.Vector3(...node.getTranslation());
    const m = parentM.clone().multiply(new THREE.Matrix4().compose(p, q, new THREE.Vector3(...node.getScale())));
    world.set(name, m);
    node.listChildren().forEach((c) => visit(c, m));
  };
  doc.getRoot().getDefaultScene().listChildren().forEach((n) => visit(n, new THREE.Matrix4()));
  return world;
}

// ---------- target ----------
const T = bindWorld(tgt);
const joints = T.skin.listJoints();
const jointSet = new Set(joints);
const tgtParent = new Map();
for (const n of tgt.getRoot().listNodes()) n.listChildren().forEach((c) => tgtParent.set(c, n));
const bindM = (j) => T.map.get(j.getName());
const parentBindM = (j) => { const p = tgtParent.get(j); return jointSet.has(p) ? bindM(p) : T.nw.get(p); };
const tgtBindQ = new Map(joints.map((j) => [j, rotOf(bindM(j))]));
const bindLocalQ = new Map(joints.map((j) => [j, rotOf(parentBindM(j)).invert().multiply(tgtBindQ.get(j))]));
const bindLocalT = new Map(joints.map((j) => [j, posOf(parentBindM(j).clone().invert().multiply(bindM(j)))]));
const order = [];
const seen = new Set();
const add = (j) => { if (seen.has(j)) return; const p = tgtParent.get(j); if (jointSet.has(p)) add(p); seen.add(j); order.push(j); };
joints.forEach(add);
const hips = joints.find((j) => j.getName() === "Hips");
const hipsBindPos = posOf(bindM(hips));

// ---------- bake ----------
const root = tgt.getRoot();
const buffer = root.listBuffers()[0];
for (const a of root.listAnimations()) a.dispose();

for (const [clipName, srcKey, srcClip, mirror, moveHips] of CLIPS) {
  const S = SRC[srcKey];
  const anim = S.doc.getRoot().listAnimations().find((a) => a.getName() === srcClip);
  if (!anim) { console.warn("missing", srcClip); continue; }
  const ratio = hipsBindPos.y / S.bindPos.get(S.pelvis).y;
  const samplers = { rot: new Map(), pos: new Map() };
  for (const ch of anim.listChannels()) {
    const n = ch.getTargetNode().getName();
    if (ch.getTargetPath() === "rotation") samplers.rot.set(n, sampler(ch));
    if (ch.getTargetPath() === "translation") samplers.pos.set(n, sampler(ch));
  }
  const dur = Math.max(...anim.listSamplers().map((s) => { const a = s.getInput().getArray(); return a[a.length - 1]; }));
  const frames = Math.max(2, Math.round(dur * FPS) + 1);
  const times = new Float32Array(frames).map((_, i) => Math.min(dur, i / FPS));
  const rotOut = new Map(joints.map((j) => [j, new Float32Array(frames * 4)]));
  const posOut = new Map(joints.map((j) => [j, new Float32Array(frames * 3)]));
  const prev = new Map();

  for (let f = 0; f < frames; f++) {
    const sw = srcWorldAt(S.doc, samplers, times[f]);
    const worldM = new Map();
    for (const j of order) {
      const p = tgtParent.get(j);
      const pm = jointSet.has(p) ? worldM.get(p) : T.nw.get(p);
      const pq = rotOf(pm);
      const name = j.getName();
      const srcName = S.map[name] && (mirror ? S.swap(S.map[name]) : S.map[name]);
      let wq;
      if (srcName && sw.has(srcName) && S.bindQ.has(srcName)) {
        const delta = rotOf(sw.get(srcName)).multiply(S.bindQ.get(srcName).clone().invert());
        if (mirror) delta.set(delta.x, -delta.y, -delta.z, delta.w); // mirror across x = 0
        wq = delta.multiply(tgtBindQ.get(j));
      } else wq = pq.clone().multiply(bindLocalQ.get(j));
      const local = pq.clone().invert().multiply(wq).normalize();
      const pv = prev.get(j);
      if (pv && pv.dot(local) < 0) local.set(-local.x, -local.y, -local.z, -local.w);
      prev.set(j, local.clone());

      let lt = bindLocalT.get(j).clone();
      if (j === hips && moveHips) {
        const off = posOf(sw.get(S.pelvis)).sub(S.bindPos.get(S.pelvis)).multiplyScalar(ratio);
        if (mirror) off.x = -off.x;
        lt = hipsBindPos.clone().add(off).applyMatrix4(pm.clone().invert());
      }
      rotOut.get(j).set([local.x, local.y, local.z, local.w], f * 4);
      posOut.get(j).set(lt.toArray(), f * 3);
      worldM.set(j, pm.clone().multiply(new THREE.Matrix4().compose(lt, local, new THREE.Vector3(...j.getScale()))));
    }
  }

  const out = tgt.createAnimation(clipName);
  const input = tgt.createAccessor().setType("SCALAR").setArray(times).setBuffer(buffer);
  for (const j of joints) {
    const r = tgt.createAnimationSampler().setInput(input).setOutput(tgt.createAccessor().setType("VEC4").setArray(rotOut.get(j)).setBuffer(buffer)).setInterpolation("LINEAR");
    out.addSampler(r).addChannel(tgt.createAnimationChannel().setTargetNode(j).setTargetPath("rotation").setSampler(r));
    if (j === hips) {
      const t = tgt.createAnimationSampler().setInput(input).setOutput(tgt.createAccessor().setType("VEC3").setArray(posOut.get(j)).setBuffer(buffer)).setInterpolation("LINEAR");
      out.addSampler(t).addChannel(tgt.createAnimationChannel().setTargetNode(j).setTargetPath("translation").setSampler(t));
    }
  }
  console.log("baked", clipName, frames, "frames", dur.toFixed(2) + "s", "hip ratio", ratio.toFixed(3));
}
await io.write(OUT, tgt);
console.log("wrote", OUT);
