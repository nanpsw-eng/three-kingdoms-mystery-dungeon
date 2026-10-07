# Dungeon floor/wall fidelity correction — 2026-10-07

## Confirmed gap

The user supplied the six-panel `dungeon-modular-surface-grammar-concept-v2-20261006.jpg` reference: textured pale cracked stone floors and rough charcoal stone walls. The production renderer instead selected simple hanji marks and rectangular brick tiles from `ink-dungeon-v1.svg`. The reference file existed, but was not used by the map. Earlier statements that graphics were fully reflected based on file decode and binding coverage were incorrect.

The earlier broad historical/superseded classification is corrected: chronological counts/statuses may be old, but the selected visual requirements cannot be discarded merely because a reference was called CONCEPT. This user message reaffirms v2 as the current material target. Later v3/v4 studies remain available; they do not override this explicit selection.

## Implementation

- Copy the original v2 JPEG byte-for-byte to `web/assets/tiles/dungeon-stone-material-v2.jpg`. No generation, repainting or replacement of the source artwork. Source and shipped copy share Git blob `d585a72be6608175513f19b6bab8436c352c7511`.
- Manifest `surfaces` records source rectangles: two floor variants and eight stone samples. White sheet margins and the floor area inside the corridor examples are excluded from stone samples.
- Floor and corridor share those original floor materials. Each original floor sample spans a stable 3×3 world-cell patch, so cracks connect inside the patch and the whole study is not squeezed into every tiny tile. Room/corridor widths and topology remain defined by the dungeon engine; visual reference composition does not alter collisions.
- Wall cap/face use the original rough stone material. Only boundaries facing explored walkable cells receive an ink outline; adjacent wall cells do not get separate rectangular frames. Straight boundaries, corners and junctions follow the existing tile topology.
- Native raster material uses smooth sampling. Stable world-coordinate variants preserve deterministic, non-flickering appearance. Fog, stairs, gates, objects, enemies, touch coordinates and saves retain their current behavior.
- Missing/undecodable raster material falls back to the existing SVG atlas and then existing procedural art.

## Verification and limits

Web TypeScript build passed locally. CI adds `surface-fidelity-smoke.mjs`: confirms native reference source/crop bounds, intercepts real renderer draw calls for both materials, checks stable repeat rendering and floor/wall brightness contrast, captures a side-by-side original/runtime fixture with a room and branching one-cell corridor, and verifies missing-raster gameplay fallback. Existing mobile/engine regression is retained.

Final source `b50b8bd0a859bea11caf3cc68b7f684a42240360`: engine CI `37620211240` PASS (161 tests + web build); visual CI `37620211206` PASS, artifact `11481971039`. Native reference draws: 98 floor / 112 wall; crop bounds, stability, contrast and invalid-raster fallback PASS. Existing 284 image decodes, 48 character / 89 enemy / 16 layout coverage and mobile interaction regressions PASS.

Inspected evidence: `evidence/dungeon-surface-reference-runtime-20261007.jpg` compares the original sheet with the actual renderer; `evidence/dungeon-surface-mobile-20261007.jpg` shows the mobile game. Machine result: `evidence/dungeon-surface-result-20261007.json`.

PR #17 merged main at `8fe07c9e940b6034abfa6a738b19326e22d5a56f`. Vercel production `dpl_8PgKTQ1aacSQQLkfsTVidLLSMiRq` READY at that exact commit; public alias https://three-kingdoms-mystery-dungeon.vercel.app/. Live reload/continue showed original materials and preserved turn 29, gold 36 and party HP 89/103, 112/112, 120/120. Screenshot: `evidence/dungeon-surface-production-20261007.jpg`. Asset loading is not a claim that every character, token, object or UI matches every historical concept. Those surfaces need individual visual comparison; the blanket full-graphics-completion claim is withdrawn.
