# SESSION HANDOFF — Visual Design Workspace / Claude Content Sync

## Project Control
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Current product source: `main` at `82b38b4bf877a015e99f53ae551bfedb45bbc790`
- Latest Claude work: PR #10 merged; Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`
- Art/design branch: `art/ink-graphic-novel-v1`
- Current art HEAD before this handoff update: `8af3ebca32a1d7f0f5256d2599480d1938bf7129`
- Open PR: none
- Latest confirmed art CI: commit `8af3ebca32a1d7f0f5256d2599480d1938bf7129` passed CI run #91. This session adds design references only; local npm test/build/browser smoke are `NOT_RUN`.
- Art direction and Product Baseline remain unchanged.

## Current Art Phase
- `PHASE C — Dungeon Graphic Set` is active.
- Phase B ruler identity language is `APPROVED` as a design reference; individual character images remain `CONCEPT`.
- Last confirmed done: surface/object vignette atlases, revised trap/sorcery marks including v3, modular surface grammar v3, localized 28% fog-opacity concept study, and a warm floor plus authored 26×26 exact-cell SVG study with four corner rotations.
- First incomplete task: add an explicit corridor and doorway module to the exact-cell SVG, then place the 28% fog wash over the composed room layout and inspect marker contrast.
- Visual QA: atlas-crop audit remains `NEEDS_REVISION` because its source panels are vignettes. The generated v4 floor study is warmer and quieter; 26px crops retain paving seams in color/grayscale, while standalone generated panels remain unsuitable for seam claims. The authored exact-cell SVG uses canonical #E8DDC4, sparse seams, four oriented corner joins, H/V walls, end cap, T-junction, and 28% fog study. Its composed wall edges align in the authored map; actual renderer integration and Canvas scaling remain unverified. All are `CONCEPT`.
- Blocker: map renderer remains procedural/pixelated; browser/canvas, mobile, and gameplay checks are unverified.
- Latest confirmed CI before this handoff: commit `38da2473089a227ef8882c83f0429144a36246af` passed run #89. For this design-only change, local `npm test`, `npm run build:web`, and browser/runtime smoke are `NOT_RUN`.

## Work Responsibility
This Work owns visual design, concept art, asset registry, and visual QA. The user instructed that all design work continue here without a separate Codex work assignment. Keep the actual game visuals and functional behavior intact while creating design assets and specifications.

## Verified Claude Content Delta
- PR #10 added save compatibility handling, Codex/achievement screens, character historical notes, and line-by-line story scenes; it is merged into main.
- The current Codex view has Characters, Bosses, Achievements, and Items tabs with dynamic progress/total counters.
- Character detail uses a 40px portrait row with class, stats, skills, and historical note.
- Story scene progression includes a 48px speaker portrait, line progress, next/tap, skip, and choices after the final line.
- `docs/art/STORY_ART_QUEUE.md` on main lists 37 added ruler/general designs and about 90 enemy/boss names. Follow stable ids and existing aliases.
- Main advanced to `82b38b4` via PR #11, which only records user-performed remote branch cleanup; comparison with `4792356` found no game-code, content, or art-queue delta.

## Completed This Session
- Verified main HEAD, art HEAD, Claude branch/PR, Codex screen/scene markup, story art queue, and CI.
- Created and reviewed four character concepts:
  - Sima Yi bust/full-body/exploration token.
  - Liu Bei/Cao Cao/Sun Quan ruler comparison.
  - Dong Zhuo/Lü Bu E2 boss comparison.
- Created and reviewed three UI concepts:
  - Codex character-detail state v2 with data-driven tab fractions.
  - Codex Bosses/Achievements/Items tab-state board.
  - Mid-scene and final-choice story sheet states.
- Saved downscaled concept references and updated the asset registry and Claude visual delta spec in the art branch.
- Created an E2 finale trio sheet for Yuan Shao, Cao Cao’s campaign-boss variant, and Cao Ren; added its concept reference, review notes, and registry entry.
- Created an E7/E8 boss duo concept for Lu Xun and Meng Huo, emphasizing fan-led vertical vs shield-led broad silhouettes; added its reference, review notes, and registry entry.
- Refined the ruler comparison into a cleaner v2 master-reference concept and aligned Sima Yi concept v2 to its hanji/ink treatment.
- Created separate Liu Bei, Cao Cao, and Sun Quan concept sheets, each with bust, full-body, and exploration-token views.
- Added dedicated square bust references for all three rulers; revised Sun Quan’s bust to read as a mature young ruler.
- Created separate ruler exploration-token studies; revised Liu Bei v2 to keep both boots within the silhouette.
- Created individual full-body concept references for Liu Bei, Cao Cao, and Sun Quan; all include complete feet and broad silhouette/palette cues.
- Built the ruler scale-review board with 40/48px bust and 24/28px token simulations on hanji/fog and grayscale silhouettes.
- Created Phase C surface and object atlases, then reduced 14 crops to 26px for initial tile/object readability review.
- Revised trap and sorcery markers into distinct angular/open-ring silhouettes; added a 24/28px monochrome review and a room/corridor composition study.
- Revised Cao Cao and Sun Quan token concepts to clarify sword and command-tablet silhouettes; v1 studies are superseded for current review.
- Rendered the exact-cell dungeon SVG through Inkscape at 2×; confirmed and recorded that atlas vignettes fail as logical tile masters.
- Created sorcery marker v3: open brush ring plus one violet flame; kept it as a concept and superseded v2 for current review.
- Created a six-surface modular tile grammar concept for floor, horizontal/vertical corridor, solid/straight wall, and inside corner.
- Created modular grammar v3 with floor A/B, H/V corridors, wall endpoint, exterior corner, T-junction, and floor/wall fog comparison; the concept sheet was reduced and checked at 26px in color and grayscale.
- Confirmed transition silhouettes are readable at 26px; kept v3 at `CONCEPT` because floor wash remains cool/muddy and the generated sheet does not prove seamless cell-edge joins.
- Added a paired color/grayscale scale-review board; did not alter any game code or claim runtime/mobile QA.

## This Session — Modular Surface Cell Review
- Cropped the six square studies from modular grammar v2 to 26×26 logical cells, enlarged 4× for visual review, and checked color plus grayscale.
- Floor A/B, horizontal/vertical corridor, wall segment, and inner-corner silhouettes read at the target scale; floor-to-corridor transitions also read.
- Three repeated wall segments show a noticeable repeated stone rhythm. The tile family still needs wall ends, exterior corners, T-junctions, and broader floor variation.
- Added `docs/art/concepts/dungeon-modular-surface-scale-review-v2-20261006.jpg` as visual evidence; this is a scale simulation, not runtime or production-export QA.
- Sorcery marker v2 remains `SUPERSEDED`; v3 remains `CONCEPT`. Atlas-crop audit remains `NEEDS_REVISION`.
- Local `npm test`, `npm run build:web`, browser/runtime smoke: `NOT_RUN`. Crop, grayscale, and adjacency visual review: `PASS` for the listed concept checks.
- Fog over mixed floor/wall, actual renderer, gameplay, and mobile behavior remain unverified.
- Next safe action: add the missing wall-transition pieces and floor variants, rerun the same 26px crop review, then assess fog strength.

## Asset State
- Global art direction: `APPROVED`.
- Sima Yi v1 master: `SUPERSEDED` by v2 for current review.
- Sima Yi v2 master: `CONCEPT`; uses the cleaned ruler ink/hanji presentation while preserving his dark strategist identity; verify separate bust/full-body/token sizes.
- Liu Bei/Cao Cao/Sun Quan comparison v2: `CONCEPT`; background removed and ornament reduced; serves as shared style reference.
- Individual Liu Bei / Cao Cao / Sun Quan master sheets: Liu Bei/Cao Cao `CONCEPT`; Sun Quan v1 `NEEDS_REVISION`, with bust v2 as current face reference.
- Dedicated square bust references: all `CONCEPT`; source composition is square, but runtime use is blocked by the current portrait loader’s pixelization.
- Separate Liu Bei/Cao Cao/Sun Quan token studies: all `CONCEPT`; distinguishable palette and prop cues are defined. Liu Bei v1 is superseded by v2 because the boots were clipped.
- Separate Liu Bei/Cao Cao/Sun Quan full-body references: all `CONCEPT`; complete silhouette and palette blocks exist, but cross-view identity and mobile-scale checks remain.
- Dong Zhuo/Lü Bu comparison: `CONCEPT`; broad-vs-tall silhouettes established; simplify armor details and verify small tokens.
- Codex character-detail UI: `CONCEPT`; dynamic progress fractions correct, but enlarged art is mood reference and actual code uses a 40px row portrait.
- Codex secondary tab board: `CONCEPT`; visual state language established for campaign-grouped bosses, earned achievements, and identified/unidentified items.
- Story scene UI: `CONCEPT`; reveal and choice states represented; actual portrait must remain 48px and the sheet needs scroll QA.
- E2 Yuan Shao / Cao Cao battle variant / Cao Ren trio: `CONCEPT`; staff, short-sword, and shield-first token silhouettes are distinct, but residual metal/headpiece detail needs simplification.
- E7/E8 Lu Xun / Meng Huo duo: `CONCEPT`; fan-led vertical strategist vs shield-led broad ruler reads clearly; simplify armor details and check token recognition.
- Implementation compatibility gap: current `assets.ts` pixelizes all external portraits at 48px/28 colors; Codex requests 40px; locked portraits use grayscale/brightness 0.35. No code changed here.
- Individual production exports and in-game visual QA: not completed. Token concepts pass a design-board simulation at 24–28px, but actual map renderer, fog, lock-state, and mobile QA remain `NOT_RUN`.
- Repository copies are downscaled JPEG references, not production exports.

## DO_NOT_REPEAT
- Do not reopen A/B/C art direction or recreate the Visual Bible.
- Do not redo PR #10 story/content/engine work.
- Do not alter Codex data, save behavior, story flow, or game rules as visual work.
- Do not mark concept sheets approved or production-ready.
- Keep readable hanji/ink/vermilion surfaces; avoid excess metallic ornament and text-background scenery.

## Files / Visual References
- `docs/art/CLAUDE_CONTENT_VISUAL_SPEC_20261006.md`
- `docs/art/ASSET_REGISTRY.md`
- `docs/art/concepts/sima-yi-master-concept-20261006.jpg` (v1, superseded for current review)
- `docs/art/concepts/sima-yi-master-concept-v2-20261006.jpg`
- `docs/art/concepts/codex-character-detail-mockup-v2-20261006.jpg`
- `docs/art/concepts/ruler-master-comparison-20261006.jpg` (v1)
- `docs/art/concepts/ruler-master-comparison-v2-20261006.jpg`
- `docs/art/concepts/liu-bei-master-concept-v1-20261006.jpg`
- `docs/art/concepts/cao-cao-master-concept-v1-20261006.jpg`
- `docs/art/concepts/sun-quan-master-concept-v1-20261006.jpg`
- `docs/art/concepts/liu-bei-bust-concept-v1-20261006.jpg`
- `docs/art/concepts/cao-cao-bust-concept-v1-20261006.jpg`
- `docs/art/concepts/sun-quan-bust-concept-v2-20261006.jpg`
- `docs/art/concepts/liu-bei-exploration-token-concept-v2-20261006.png`
- `docs/art/concepts/cao-cao-exploration-token-concept-v1-20261006.png`
- `docs/art/concepts/sun-quan-exploration-token-concept-v1-20261006.png`
- `docs/art/concepts/liu-bei-full-body-concept-v1-20261006.jpg`
- `docs/art/concepts/cao-cao-full-body-concept-v1-20261006.jpg`
- `docs/art/concepts/sun-quan-full-body-concept-v1-20261006.jpg`
- `docs/art/concepts/cao-cao-exploration-token-concept-v2-20261006.png`
- `docs/art/concepts/sun-quan-exploration-token-concept-v2-20261006.png`
- `docs/art/concepts/ruler-scale-review-revised-20261006.jpg`
- `docs/art/concepts/dungeon-surfaces-concept-v1-20261006.jpg`
- `docs/art/concepts/dungeon-objects-concept-v1-20261006.jpg`
- `docs/art/concepts/dungeon-set-scale-review-20261006.jpg`
- `docs/art/concepts/dungeon-trap-mark-concept-v2-20261006.png`
- `docs/art/concepts/dungeon-sorcery-mark-concept-v2-20261006.png`
- `docs/art/concepts/dungeon-trap-sorcery-scale-review-v2-20261006.jpg`
- `docs/art/concepts/dungeon-room-corridor-composition-v1-20261006.jpg`
- `docs/art/concepts/dungeon-cell-grid-review-v1.svg`
- `docs/art/concepts/dungeon-cell-grid-crop-audit-render-v1-20261006.jpg`
- `docs/art/concepts/dungeon-sorcery-mark-concept-v3-20261006.png`
- `docs/art/concepts/dungeon-modular-surface-grammar-concept-v1-20261006.jpg`
- `docs/art/concepts/dungeon-modular-surface-grammar-concept-v2-20261006.jpg`
- `docs/art/concepts/dungeon-modular-surface-scale-review-v2-20261006.jpg`
- `docs/art/concepts/dungeon-modular-surface-grammar-concept-v3-20261006.jpg`
- `docs/art/concepts/dungeon-modular-surface-scale-review-v3-20261006.jpg`
- `docs/art/concepts/dungeon-fog-alpha-study-v1-20261006.jpg`
- `docs/art/concepts/dungeon-fog-alpha-study-v1.svg`
- `docs/art/concepts/dungeon-floor-surface-concept-v4-20261006.jpg`
- `docs/art/concepts/dungeon-modular-exact-cell-study-v1-20261006.svg`
- `docs/art/concepts/dungeon-modular-exact-cell-study-v1-20261006.jpg`
- `docs/art/concepts/dungeon-exact-cell-scale-review-v1-20261006.jpg`
- `docs/art/concepts/dungeon-trap-sorcery-scale-review-v2-20261006.jpg`
- `docs/art/concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg`
- `docs/art/concepts/codex-secondary-tabs-20261006.jpg`
- `docs/art/concepts/story-scene-ui-20261006.jpg`
- `docs/art/concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg`
- `docs/art/concepts/lu-xun-meng-huo-boss-concept-20261006.jpg`

## Verification
- Latest confirmed branch CI before this design commit: run #91 on parent `8af3ebca32a1d7f0f5256d2599480d1938bf7129`, `success`.
- V3 crop and grayscale scale review: `PASS` for distinguishing endpoint, L-corner, and T-junction silhouettes at the study scale; seamless edge joins and overlay alpha are `NOT_VERIFIED`.
- No gameplay code changed. `npm test`, `npm run build:web`, browser/runtime smoke, and production-screen/mobile QA: `NOT_RUN`.

## NEXT_SAFE_ACTION
1. Revise floor A/B toward warmer hanji with lower texture contrast.
2. Define fog as a translucent overlay treatment over both light floor and dark wall, then make a mixed-cell adjacency study.
3. Keep all concept crops separate from production exports; renderer/runtime integration remains outside this design review.

## HUMAN GATE
- Reversible design exploration and reference/spec updates on the art branch: no additional gate.
- Main merge, production deployment, material product change, or art-direction change: user approval required.
