import * as THREE from "three";
function nodeWorld(doc) {
  const out = new Map();
  const visit = (node, parentM) => {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(...node.getTranslation()), new THREE.Quaternion(...node.getRotation()), new THREE.Vector3(...node.getScale()));
    const w = parentM.clone().multiply(m); out.set(node, w);
    node.listChildren().forEach((c) => visit(c, w));
  };
  doc.getRoot().getDefaultScene().listChildren().forEach((n) => visit(n, new THREE.Matrix4()));
  return out;
}
export function bindWorld(doc) {
  const nw = nodeWorld(doc);
  const skin = doc.getRoot().listSkins()[0];
  const meshNode = doc.getRoot().listNodes().find((n) => n.getSkin() === skin);
  const mw = nw.get(meshNode);
  const ibm = skin.getInverseBindMatrices().getArray();
  const map = new Map();
  skin.listJoints().forEach((j, i) => {
    const inv = new THREE.Matrix4().fromArray(Array.from(ibm.slice(i * 16, i * 16 + 16)));
    map.set(j.getName(), mw.clone().multiply(inv.clone().invert()));
  });
  return { map, nw, skin, meshNode };
}
