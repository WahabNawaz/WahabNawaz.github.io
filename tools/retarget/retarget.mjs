// Delta retargeting: for every mapped bone, the source bone's world-space
// rotation change from its bind (T) pose is applied to the target bone's own
// bind pose. Both rigs are in T-pose, Y-up, facing +Z (checked with bind.mjs).
// The target (Quaternius) rig is IK-style: legs hang off Body, feet hang off
// Root. So Body takes the pelvis motion and the feet are pinned to the ankles.
import { NodeIO } from "@gltf-transform/core";
import * as THREE from "three";
import { bindWorld } from "./bind.mjs";

// usage: node retarget.mjs <character.glb> <UAL1_Standard.glb> <out.glb>
const [TARGET, SOURCE, OUT_ARG] = process.argv.slice(2);
const OUT = OUT_ARG || "avatar-retargeted.glb";
const FPS = 30;
// [output name, source clip, mirrored?]
const CLIPS = process.env.ALL
  ? ["Idle_Loop", "Idle_Talking_Loop", "Sitting_Enter", "Sitting_Idle_Loop", "Sitting_Talking_Loop", "Sitting_Exit", "Dance_Loop", "Walk_Loop", "Jog_Fwd_Loop", "Sprint_Loop", "Jump_Start", "Jump_Loop", "Jump_Land", "Interact", "Push_Loop"].map((c) => [c, c, false])
  : [
      ["Idle_Loop", "Idle_Loop", false],
      ["Idle_Talking_Loop", "Idle_Talking_Loop", false],
      ["Sitting_Enter", "Sitting_Enter", false],
      ["Sitting_Idle_Loop", "Sitting_Idle_Loop", false],
      ["Sitting_Talking_Loop", "Sitting_Talking_Loop", false],
      ["Walk_Loop", "Walk_Loop", false],
      ["Jog_Fwd_Loop", "Jog_Fwd_Loop", false],
      ["Jump_Loop", "Jump_Loop", false],
      ["Push_Loop", "Push_Loop", false],
      ["Dance_Loop", "Dance_Loop", false],
      ["Dance_Loop_Mirror", "Dance_Loop", true],
    ];
const KEEP_ORIGINAL = ["CharacterArmature|Wave"];
const swapSide = (n) => n.replace(/_l$/, "_R_").replace(/_r$/, "_l").replace(/_R_$/, "_r");
const FINGERS = process.env.FINGERS !== "0";

const MAP = { Body: "pelvis", Hips: "pelvis", Abdomen: "spine_01", Torso: "spine_02", Chest: "spine_03", Neck: "neck_01", Head: "Head" };
for (const [s, t] of [["L", "l"], ["R", "r"]]) {
  Object.assign(MAP, {
    [`Shoulder.${s}`]: `clavicle_${t}`, [`UpperArm.${s}`]: `upperarm_${t}`, [`LowerArm.${s}`]: `lowerarm_${t}`, [`Wrist.${s}`]: `hand_${t}`,
    [`UpperLeg.${s}`]: `thigh_${t}`, [`LowerLeg.${s}`]: `calf_${t}`, [`Foot.${s}`]: `foot_${t}`,
  });
  if (FINGERS) for (const f of ["Index", "Middle", "Ring", "Pinky", "Thumb"]) for (let i = 1; i <= 3; i++) MAP[`${f}${i}.${s}`] = `${f.toLowerCase()}_0${i}_${t}`;
}

const io = new NodeIO();
const tgt = await io.read(TARGET);
const src = await io.read(SOURCE);
const T = bindWorld(tgt), SB = bindWorld(src);
const rotOf = (m) => { const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); m.decompose(p, q, s); return q; };
const posOf = (m) => new THREE.Vector3().setFromMatrixPosition(m);

// ---------- source ----------
const srcBindQ = new Map([...SB.map].map(([k, m]) => [k, rotOf(m)]));
const srcBindPos = new Map([...SB.map].map(([k, m]) => [k, posOf(m)]));

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
function srcWorldAt(samplers, t) {
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
  src.getRoot().getDefaultScene().listChildren().forEach((n) => visit(n, new THREE.Matrix4()));
  return world;
}

// ---------- target ----------
const joints = T.skin.listJoints();
const jointSet = new Set(joints);
const byName = new Map(joints.map((j) => [j.getName(), j]));
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

// feet: rigid offset from the lower leg in bind pose
const lower = { "Foot.L": byName.get("LowerLeg.L"), "Foot.R": byName.get("LowerLeg.R") };
const footRel = new Map(Object.entries(lower).map(([f, l]) => [byName.get(f), posOf(bindM(byName.get(f))).applyMatrix4(bindM(l).clone().invert())]));

const body = byName.get("Body");
const bodyBindPos = posOf(bindM(body));
const P = (n) => posOf(bindM(byName.get(n)));
const ankleT = byName.get("LowerLeg.L").listChildren()[0]; // LowerLeg.L_end
const ankleTPos = new THREE.Vector3(...ankleT.getTranslation()).applyMatrix4(bindM(byName.get("LowerLeg.L")));
const legT = P("UpperLeg.L").distanceTo(P("LowerLeg.L")) + P("LowerLeg.L").distanceTo(ankleTPos);
const sp = (n) => srcBindPos.get(n);
const legS = sp("thigh_l").distanceTo(sp("calf_l")) + sp("calf_l").distanceTo(sp("foot_l"));
const ratio = P("UpperLeg.L").y / sp("thigh_l").y; // hip-joint height above the floor
console.log("leg target", legT.toFixed(3), "source", legS.toFixed(3), "ratio", ratio.toFixed(3), "fingers", FINGERS);

// ---------- bake ----------
const root = tgt.getRoot();
const buffer = root.listBuffers()[0];
for (const a of root.listAnimations()) if (!KEEP_ORIGINAL.includes(a.getName())) a.dispose();

for (const [clipName, srcClip, mirror] of CLIPS) {
  const anim = src.getRoot().listAnimations().find((a) => a.getName() === srcClip);
  if (!anim) { console.warn("missing", srcClip); continue; }
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
    const sw = srcWorldAt(samplers, times[f]);
    const worldM = new Map();
    for (const j of order) {
      const p = tgtParent.get(j);
      const pm = jointSet.has(p) ? worldM.get(p) : T.nw.get(p);
      const pq = rotOf(pm);
      const name = j.getName();
      const srcName = MAP[name] && (mirror ? swapSide(MAP[name]) : MAP[name]);
      let wq;
      if (srcName && sw.has(srcName)) {
        const delta = rotOf(sw.get(srcName)).multiply(srcBindQ.get(srcName).clone().invert());
        // mirror across the body's centre plane (x -> -x): (x, y, z, w) -> (x, -y, -z, w)
        if (mirror) delta.set(delta.x, -delta.y, -delta.z, delta.w);
        wq = delta.multiply(tgtBindQ.get(j));
      } else wq = pq.clone().multiply(bindLocalQ.get(j));
      const local = pq.clone().invert().multiply(wq).normalize();
      const pv = prev.get(j);
      if (pv && pv.dot(local) < 0) local.set(-local.x, -local.y, -local.z, -local.w);
      prev.set(j, local.clone());

      let lt = bindLocalT.get(j).clone();
      if (j === body) {
        const off = posOf(sw.get("pelvis")).sub(srcBindPos.get("pelvis")).multiplyScalar(ratio);
        if (mirror) off.x = -off.x;
        lt = bodyBindPos.clone().add(off).applyMatrix4(pm.clone().invert());
      } else if (lower[name]) {
        lt = footRel.get(j).clone().applyMatrix4(worldM.get(lower[name])).applyMatrix4(pm.clone().invert());
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
    const t = tgt.createAnimationSampler().setInput(input).setOutput(tgt.createAccessor().setType("VEC3").setArray(posOut.get(j)).setBuffer(buffer)).setInterpolation("LINEAR");
    out.addSampler(t).addChannel(tgt.createAnimationChannel().setTargetNode(j).setTargetPath("translation").setSampler(t));
  }
  console.log("baked", clipName, frames, "frames", dur.toFixed(2) + "s");
}
await io.write(OUT, tgt);
console.log("wrote", OUT);
