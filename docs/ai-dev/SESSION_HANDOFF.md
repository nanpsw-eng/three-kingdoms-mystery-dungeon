# SESSION HANDOFF — Visual Design Workspace / Claude Content Sync

## Project Control
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Current product source: `main` at `82b38b4bf877a015e99f53ae551bfedb45bbc790`
- Latest Claude work: PR #10 merged; Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`
- Art/design branch: `art/ink-graphic-novel-v1`
- Art HEAD before this handoff commit: `a3e76683e18e1829c09640793ae64328c11dc56e`
- Open PR: none
- Art commit checks: no GitHub status checks were reported for the documentation/concept-only commits through `a3e76683e18e1829c09640793ae64328c11dc56e`; no code workflow run was returned.
- Art direction and Product Baseline remain unchanged.

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

## Asset State
- Global art direction: `APPROVED`.
- Sima Yi v1 master: `SUPERSEDED` by v2 for current review.
- Sima Yi v2 master: `CONCEPT`; uses the cleaned ruler ink/hanji presentation while preserving his dark strategist identity; verify separate bust/full-body/token sizes.
- Liu Bei/Cao Cao/Sun Quan comparison v2: `CONCEPT`; background removed and ornament reduced; serves as shared style reference.
- Individual Liu Bei / Cao Cao / Sun Quan master sheets: Liu Bei/Cao Cao `CONCEPT`; Sun Quan v1 `NEEDS_REVISION`, with bust v2 as current face reference.
- Dedicated square bust references: all `CONCEPT`; source composition is square, but runtime use is blocked by the current portrait loader’s pixelization.
- Dong Zhuo/Lü Bu comparison: `CONCEPT`; broad-vs-tall silhouettes established; simplify armor details and verify small tokens.
- Codex character-detail UI: `CONCEPT`; dynamic progress fractions correct, but enlarged art is mood reference and actual code uses a 40px row portrait.
- Codex secondary tab board: `CONCEPT`; visual state language established for campaign-grouped bosses, earned achievements, and identified/unidentified items.
- Story scene UI: `CONCEPT`; reveal and choice states represented; actual portrait must remain 48px and the sheet needs scroll QA.
- E2 Yuan Shao / Cao Cao battle variant / Cao Ren trio: `CONCEPT`; staff, short-sword, and shield-first token silhouettes are distinct, but residual metal/headpiece detail needs simplification.
- E7/E8 Lu Xun / Meng Huo duo: `CONCEPT`; fan-led vertical strategist vs shield-led broad ruler reads clearly; simplify armor details and check token recognition.
- Implementation compatibility gap: current `assets.ts` pixelizes all external portraits at 48px/28 colors; Codex requests 40px; locked portraits use grayscale/brightness 0.35. No code changed here.
- Individual production exports, exploration-token image set, and in-game visual QA: not completed.
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
1. Define a non-pixelized portrait render contract and readable locked portrait state; current `assets.ts` pixelizes and Codex darkens locked portraits.
2. Create separate full-body and exploration-token masters aligned to the revised ruler faces; validate 40px/48px and 16px-scale behavior in a real screen before `IMPLEMENTATION_READY`.
3. Refine Sima Yi and remaining campaign-boss/playable-general concepts against the ruler masters.
4. Start item silhouettes once character asset integration is compatible with the approved style.

## HUMAN GATE
- Reversible design exploration and reference/spec updates on the art branch: no additional gate.
- Main merge, production deployment, material product change, or art-direction change: user approval required.
