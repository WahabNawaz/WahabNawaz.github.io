# Retarget animations onto the character

How `public/models/avatar.glb` was made (Node, no Blender needed):

1. Download (both CC0, free):
   - Quaternius "Ultimate Modular Men" → `Hoodie Character` GLB (character, rig `CharacterArmature`)
   - Quaternius "Universal Animation Library" (Standard) → `UAL1_Standard.glb` (animations)
2. In this folder: `npm i @gltf-transform/core three`
3. `node retarget.mjs HoodieCharacter.glb UAL1_Standard.glb avatar-retargeted.glb`
   (`MIRROR`ed dance and the clip list are set at the top of `retarget.mjs`)
4. Compress: `npx @gltf-transform/cli optimize avatar-retargeted.glb avatar.glb --compress meshopt --texture-compress webp --simplify false`
5. Copy `avatar.glb` to `public/models/`.

How it works: both rigs stand in a T-pose facing +Z. For each mapped bone, the source bone's world-space
rotation change from its T-pose is applied to the character's bone T-pose. The character's rig is IK-style
(legs hang off `Body`, feet off `Root`), so `Body` takes the pelvis motion and the feet are pinned to the
end of the lower legs.
