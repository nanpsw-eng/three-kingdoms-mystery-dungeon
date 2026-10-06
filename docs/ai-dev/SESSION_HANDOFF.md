# SESSION HANDOFF — Visual Design Workspace / Claude Content Sync

## Project Control
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Current product source: `main` at `82b38b4bf877a015e99f53ae551bfedb45bbc790`
- Latest Claude work: PR #10 merged; Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`
- Art/design branch: `art/ink-graphic-novel-v1`
- Art HEAD before this handoff commit: `6c5940add1f350b4129e93c34a56a5b3e656312b`
- Open PR: none
- Latest art CI: commit `6c5940add1f350b4129e93c34a56a5b3e656312b` passed CI run #81; prior design-only commits through #80 passed. This next change is documentation/concept-only; local npm test/build/smoke are `NOT_RUN`.
- Art direction and Product Baseline remain unchanged.

## Current Art Phase
- `PHASE C — Dungeon Graphic Set` is active.
- Phase B ruler visual identity system is `APPROVED` as a design reference; individual generated images remain `CONCEPT`.
- Last confirmed done: separate ruler bust/full-body/token references and a scale-review board; Cao Cao/Sun Quan token v2 respond to readability findings. Phase C surface and object atlases plus 26px reduction preview are recorded as concepts.
- First incomplete task: revise the trap/sorcery silhouette difference and environmental wash strength, then produce a composed room/corridor/fog concept using the same tile language.
- Blocker: renderer still uses procedural/pixelated graphics; actual tile seams, map canvas, mobile layout, and logic regression QA have not run.
- Latest CI: commit `6c5940add1f350b4129e93c34a56a5b3e656312b` passed run #81. Current concept/doc changes have no code tests; local `npm test`, `npm run build:web`, browser smoke are `NOT_RUN`.

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
- Added dedicated square bust references for all three rulers; revised Sun Quan’s bust to read as a mature young ruler.\n- Created separate ruler exploration-token studies; revised Liu Bei v2 to keep both boots within the silhouette.\n- Created individual full-body concept references for Liu Bei, Cao Cao, and Sun Quan; all include complete feet and broad silhouette/palette cues.\n- Built the ruler scale-review board with 40/48px bust and 24/28px token simulations on hanji/fog and grayscale silhouettes.\n- Created Phase C surface and object atlases, then reduced 14 crops to 26px for initial tile/object readability review.\n- Revised Cao Cao and Sun Quan token concepts to clarify sword and command-tablet silhouettes; v1 studies are superseded for current review.

## Asset State
- Global art direction: `APPROVED`.
- Sima Yi v1 master: `SUPERSEDED` by v2 for current review.
- Sima Yi v2 master: `CONCEPT`; uses the cleaned ruler ink/hanji presentation while preserving his dark strategist identity; verify separate bust/full-body/token sizes.
- Liu Bei/Cao Cao/Sun Quan comparison v2: `CONCEPT`; background removed and ornament reduced; serves as shared style reference.
- Individual Liu Bei / Cao Cao / Sun Quan master sheets: Liu Bei/Cao Cao `CONCEPT`; Sun Quan v1 `NEEDS_REVISION`, with bust v2 as current face reference.
- Dedicated square bust references: all `CONCEPT`; source composition is square, but runtime use is blocked by the current portrait loader’s pixelization.\n- Separate Liu Bei/Cao Cao/Sun Quan token studies: all `CONCEPT`; distinguishable palette and prop cues are defined. Liu Bei v1 is superseded by v2 because the boots were clipped.\n- Separate Liu Bei/Cao Cao/Sun Quan full-body references: all `CONCEPT`; complete silhouette and palette blocks exist, but cross-view identity and mobile-scale checks remain.
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
- `docs/art/concepts/sun-quan-bust-concept-v2-20261006.jpg`\n- `docs/art/concepts/liu-bei-exploration-token-concept-v2-20261006.png`\n- `docs/art/concepts/cao-cao-exploration-token-concept-v1-20261006.png`\n- `docs/art/concepts/sun-quan-exploration-token-concept-v1-20261006.png`\n- `docs/art/concepts/liu-bei-full-body-concept-v1-20261006.jpg`\n- `docs/art/concepts/cao-cao-full-body-concept-v1-20261006.jpg`\n- `docs/art/concepts/sun-quan-full-body-concept-v1-20261006.jpg`\n- `docs/art/concepts/cao-cao-exploration-token-concept-v2-20261006.png`\n- `docs/art/concepts/sun-quan-exploration-token-concept-v2-20261006.png`\n- `docs/art/concepts/ruler-scale-review-revised-20261006.jpg`\n- `docs/art/concepts/dungeon-surfaces-concept-v1-20261006.jpg`\n- `docs/art/concepts/dungeon-objects-concept-v1-20261006.jpg`\n- `docs/art/concepts/dungeon-set-scale-review-20261006.jpg`
- `docs/art/concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg`
- `docs/art/concepts/codex-secondary-tabs-20261006.jpg`
- `docs/art/concepts/story-scene-ui-20261006.jpg`
- `docs/art/concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg`
- `docs/art/concepts/lu-xun-meng-huo-boss-concept-20261006.jpg`

## Verification
- PR #10 report states: `npm test` 156/156 PASS, `build:web` PASS, Chromium 390×844 smoke PASS, page errors 0.
- No code was changed in these design commits; repository checks are empty for the latest commit, so tests/build/smoke are `NOT_RUN`.
- Local build/test and production-screen visual QA: `NOT_RUN`.
- Concept images were visually inspected; remaining design gaps are recorded above.

## NEXT_SAFE_ACTION
1. Revise trap vs sorcery shape at 26px and reduce the environmental-wash opacity so it cannot obscure the explored base tile.
2. Compose the revised assets into a room/corridor sample with explored/unexplored edges and one stair/gate transition; keep topology illustrative only.
3. Confirm mobile-scale distinctions on hanji and ink fog; leave all atlases at `CONCEPT` until live implementation compatibility is reviewed.
4. Create individual tile/object production masters after this design review; retain the procedural renderer fallback.

## HUMAN GATE
- Reversible design exploration and reference/spec updates on the art branch: no additional gate.
- Main merge, production deployment, material product change, or art-direction change: user approval required.
