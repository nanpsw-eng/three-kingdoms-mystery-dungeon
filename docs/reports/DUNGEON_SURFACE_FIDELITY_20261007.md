# Dungeon floor/wall fidelity correction — 2026-10-07

## Confirmed gap

The user supplied the six-panel `dungeon-modular-surface-grammar-concept-v2-20261006.jpg` reference: textured pale cracked stone floors and rough charcoal stone walls. The production renderer instead selected simple hanji marks and rectangular brick tiles from `ink-dungeon-v1.svg`. The reference file existed, but was not used by the map. Earlier statements that graphics were fully reflected based on file decode and binding coverage were incorrect.

The earlier broad historical/superseded classification is corrected: chronological counts/statuses may be old, but the selected visual requirements cannot be discarded merely because a reference was called CONCEPT. This user message reaffirms v2 as the current material target. Later v3/v4 studies remain available; they do not override this explicit selection.

## Implementation

- Copy the original v2 JPEG byte-for-byte to `web/assets/tiles/dungeon-stone-material-v2.jpg`. No generation, repainting or replacement of the source artwork.
- Manifest `surfaces` records source rectangles: two floor variants and eight stone samples. White sheet margins and the floor area inside the corridor examples are excluded from stone samples.
- Floor and corridor share those original floor materials. Room/corridor widths and topology remain defined by the dungeon engine; visual reference composition does not alter collisions.
- Wall cap/face use the original rough stone material. Only boundaries facing explored walkable cells receive an ink outline; adjacent wall cells do not get separate rectangular frames. Straight boundaries, corners and junctions follow the existing tile topology.
- Native raster material uses smooth sampling. Stable world-coordinate variants preserve deterministic, non-flickering appearance. Fog, stairs, gates, objects, enemies, touch coordinates and saves retain their current behavior.
- Missing/undecodable raster material falls back to the existing SVG atlas and then existing procedural art.

## Verification and limits

Web TypeScript build passed locally. CI adds `surface-fidelity-smoke.mjs`: confirms native reference source/crop bounds, intercepts real renderer draw calls for both materials, checks stable repeat rendering and floor/wall brightness contrast, captures a side-by-side original/runtime fixture with a room and branching one-cell corridor, and verifies missing-raster gameplay fallback. Existing mobile/engine regression is retained.

Final CI IDs, inspected screenshots and production verification are recorded after review. Asset loading is not a claim that every character, token, object or UI matches every historical concept. Those surfaces need individual visual comparison; the blanket full-graphics-completion claim is withdrawn.
