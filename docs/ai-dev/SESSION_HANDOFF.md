# SESSION HANDOFF — 2026-10-06 (two parallel tracks)

이 파일은 두 작업 트랙의 최소 Context Index다. 각 트랙은 자기 섹션만 갱신한다.
- **Track A — Story/Engine (Claude)**: `ccr-bb39f6f8-g46bbv` (session branch). Remote branches: `main`, `gh-pages`, `art/ink-graphic-novel-v1`, `ccr-bb39f6f8-g46bbv` (merged branches deleted by user 2026-10-06) · `src/**`, `test/**`, `scripts/simulate.mjs`, `docs/**`(아트 제외)
- **Track B — Art (Codex)**: `art/ink-graphic-novel-v1` · `web/style.css`, `web/src/{sprites,portraits,pixel,map,assets}.ts`, `web/assets/**`, `docs/art/**`

## Shared
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon` (public)
- Delegation: full (DEC-024). Production deploy APPROVED by user; `main` merges are performed by Track A at stage boundaries, including Track B art work ("코덱스의 그래픽 작업을 중간중간 확인해서 실제 게임 내에 반영").
- Deploy: every `main` push → tests → `site/` to `gh-pages`. URL https://nanpsw-eng.github.io/three-kingdoms-mystery-dungeon/ (Settings → Pages → `gh-pages` once; not verifiable from sandbox)
- Still requires the user: paid services, repo visibility change, a different art direction (DEC-025), Product Baseline material change

---

## Track A — Story/Engine (Claude)
- Gate: `STORY_EXPANSION_COMPLETE (S0–S5) / HUMAN_PLAYTEST_NEXT`
- Local: `npm test` 156/0 PASS · Phase A ink skin implemented (see Track B note) · `build:web` PASS · sim smart 200: E1 35.0% · E2 28.0% · E3 29.5% · E4 24.5% · E5 28.0% · E6 24.0% · E7 24.0% · E8 27.0% · E9 27.0% · E1 renown1 16.0% · campaign chain → ending PASS (22 runs)

| Stage | Report |
|---|---|
| MVP phases 7–14 | `docs/reports/*PHASE*.md`, `RUN_SIMULATION_PHASE13.md`, `WEB_CLIENT_PHASE14.md` |
| S0 foundation | `docs/reports/STORY_S0_FOUNDATION.md` |
| S1 E2 반동탁연합 | `docs/reports/STORY_S1_ANTI_DONG.md` |
| S2 E3 서주 · E4 관도 | `docs/reports/STORY_S2_XUZHOU_GUANDU.md` |
| S3 E5 적벽 | `docs/reports/STORY_S3_RED_CLIFFS.md` |
| S4 E6 형주·익주 · E7 이릉 | `docs/reports/STORY_S4_JING_YI_YILING.md` |
| S5 E8 남만 · E9 북벌 · 엔딩 · 명성 | `docs/reports/STORY_S5_NANMAN_NORTHERN_ENDING.md` |
| Summary | `docs/reports/STORY_EXPANSION_COMPLETE.md` |
| Polish (saves · codex · scenes) | `docs/reports/POLISH_CODEX_SCENES_SAVES.md` |

DO_NOT_REPEAT
- MVP battle/dungeon/run/content/sim/web
- S0: scenes/variants/choices, duel, multi-phase boss, enemy recruit + meta unlock, mechanic registry (7 types), validateContent, story.ts UI
- S1/S2: `CampaignModule` per campaign (`src/content/campaigns/e2..e9`), renown X8, `scripts/campaign-chain.mjs`, `pursuit` mechanic, timeline UI, `ART_ALIASES`, duel HP ratio 0.6

NEXT_SAFE_ACTION
1. Human playtest on the deployed site; tune first-boss walls (E2 화웅, E6 마초) from feedback in campaign module files only
2. Keep merging Track B art; remove `ART_ALIASES` entries as real art lands
3. Each stage: validateContent clean, sim 20–35%, tests, report, PR → main, deploy; check Track B branch and merge art

---

## Track B — Current Visual Control (2026-10-06)
- Art branch remains aligned with implementation sync `7030eff`; Phase A Title/Dungeon/Battle ink skin and Phase C/D map/item atlas are implemented.
- Phase B ruler masters are implemented: Liu Bei, Cao Cao, Sun Quan each have bust, full-body art, and matching exploration token.
- Phase E general roster is implemented for all 12: Guan Yu, Zhang Fei, Zhao Yun, Huang Zhong, Zhuge Liang, Zhang Liao, Xiahou Dun, Jia Xu, Taishi Ci, Zhou Yu, Gan Ning, Hua Tuo.
- CURRENT HEAD (code before this handoff update): `d4a77a40bd2373476d17032aa63489037a4b38c4`.
- CURRENT ART PHASE: Phase E complete; Phase F is next.
- COMPLETED: Phase A vertical slice; map/item atlas; Phase B ruler masters; Phase E 12 general masters. All assets connect through manifest routes; procedural fallback remains for missing/uncovered content.
- DO_NOT_REPEAT: approved art direction, Phase A, map/item atlas, 3 ruler sets, and 12 general sets; battle/dungeon/run/content logic.
- FILES CHANGED ACROSS RECENT ASSET COMMITS: `web/assets/manifest.json`, `web/assets/portraits/*.webp`, `web/assets/tokens/*.svg`, `web/src/assets.ts`, `web/src/main.ts`, `web/src/map.ts`, `web/style.css`, `test/art-assets.test.mjs`, `docs/art/ASSET_REGISTRY.md`.
- TEST RESULT: GitHub CI #119 PASS (`npm ci`, `npm test`, `npm run build:web`). Local checks NOT_RUN. Browser smoke, console/page error check, and 390×844 clipping/touch-target QA NOT_RUN.
- VISUAL EVIDENCE: transparent bust/full-body assets and distinctive 64px SVG exploration tokens exist for all 15 characters; generated figures were reviewed on hanji background in this session. Runtime screenshot remains unavailable.
- KNOWN GAP: CI workflow does not include browser smoke or screenshot; live runtime and missing-asset fallback have not been visually exercised. Remaining Phase F/G/H art work is open.
- NEXT_SAFE_ACTION: run the art branch in a browser at 390×844 and check Title, Dungeon, Battle, portraits/full-body event cards, map tokens, and missing-asset fallback; then implement Phase F Yellow Turban units and Zhang Bao/Zhang Liang/Zhang Jiao bosses.
- HUMAN GATE: no PR, main merge, or production deploy performed.

## Track B — Art (Codex) — latest Codex handoff below, nested verbatim (historical snapshot; current state above)

> **Integration note (Claude, 2026-10-06, user instruction "코덱스 그래픽 작업을 파악해서 게임에 반영·배포")**
> - `PHASE_A_VISUAL_SPEC_V1.md` (status `IMPLEMENTATION_READY`) was implemented by Claude: `web/style.css` rewritten to the spec tokens/components; `web/src/map.ts` palette moved to hanji floor / ink wall / soft ink-wash fog / vermilion markers; `web/index.html` theme-color. Domain code unchanged; 156 tests PASS; 390×844 smoke PASS (title/dungeon/battle screenshots).
> - Concept images (`docs/art/concepts/*`) were **not** wired into the game, per the registry (`CONCEPT`, loader would pixelize).
> - Codex next: visual QA of the implemented Phase A against the reference boards and fine-tuning in `style.css`/`map.ts` (yours to own from here), then Phase B/C production exports and a non-pixelizing portrait/token route.

## SESSION HANDOFF — Visual Design Workspace / Claude Content Sync

### Project Control
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Current product source: `main` at `82b38b4bf877a015e99f53ae551bfedb45bbc790`
- Latest Claude work: PR #10 merged; Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`
- Art/design branch: `art/ink-graphic-novel-v1`
- Current art HEAD before this handoff update: `ce12be9c2350733823abd031b101cb8916ce5b3b`
- Open PR: none
- Latest art CI: commit `ce12be9c2350733823abd031b101cb8916ce5b3b` passed CI run #88. This update adds concept references only; local npm test/build/browser smoke are `NOT_RUN`.
- Art direction and Product Baseline remain unchanged.

### Current Art Phase
- `PHASE C — Dungeon Graphic Set` is active; Phase A implementation was already completed by PR #12 and is not repeated. Phase C/D atlas integration is in the art branch, pending browser QA.
- Phase B ruler identity language is `APPROVED` as a design reference; individual character images remain `CONCEPT`.
- Last confirmed done: surface/object vignette atlases, revised trap/sorcery marks including v3, exact-cell crop audit, and modular surface grammar v2 with a 26px color/grayscale and join review.
- First incomplete task: complete the modular transition set with wall endpoints, exterior corners, and T-junctions; then tune fog over both floor and wall.
- Visual QA: atlas-crop audit remains `NEEDS_REVISION` because its source panels are vignettes. Grammar v2 was cropped from square cells to 26px; all six silhouettes remain readable in color/grayscale and H/V floor joins read. Repeated wall texture is conspicuous; missing endpoints/T-junction/exterior-corner pieces keep the grammar at `CONCEPT`.
- Blocker: map renderer remains procedural/pixelated; browser/canvas, mobile, and gameplay checks are unverified.
- Latest confirmed CI: commit `18ab7ab7c1541ca6a470d057105f4af5a83fc055` passed run #87. For this design-only change, `npm test`, `npm run build:web`, and browser/runtime smoke are `NOT_RUN`; Inkscape SVG rendering passed.

### Work Responsibility
This Work owns visual design, concept art, asset registry, and visual QA. The user instructed that all design work continue here without a separate Codex work assignment. Keep the actual game visuals and functional behavior intact while creating design assets and specifications.

### Verified Claude Content Delta
- PR #10 added save compatibility handling, Codex/achievement screens, character historical notes, and line-by-line story scenes; it is merged into main.
- The current Codex view has Characters, Bosses, Achievements, and Items tabs with dynamic progress/total counters.
- Character detail uses a 40px portrait row with class, stats, skills, and historical note.
- Story scene progression includes a 48px speaker portrait, line progress, next/tap, skip, and choices after the final line.
- `docs/art/STORY_ART_QUEUE.md` on main lists 37 added ruler/general designs and about 90 enemy/boss names. Follow stable ids and existing aliases.
- Main advanced to `82b38b4` via PR #11, which only records user-performed remote branch cleanup; comparison with `4792356` found no game-code, content, or art-queue delta.

### Completed This Session
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

### This Session — Modular Surface Cell Review
- Cropped the six square studies from modular grammar v2 to 26×26 logical cells, enlarged 4× for visual review, and checked color plus grayscale.
- Floor A/B, horizontal/vertical corridor, wall segment, and inner-corner silhouettes read at the target scale; floor-to-corridor transitions also read.
- Three repeated wall segments show a noticeable repeated stone rhythm. The tile family still needs wall ends, exterior corners, T-junctions, and broader floor variation.
- Added `docs/art/concepts/dungeon-modular-surface-scale-review-v2-20261006.jpg` as visual evidence; this is a scale simulation, not runtime or production-export QA.
- Sorcery marker v2 remains `SUPERSEDED`; v3 remains `CONCEPT`. Atlas-crop audit remains `NEEDS_REVISION`.
- Local `npm test`, `npm run build:web`, browser/runtime smoke: `NOT_RUN`. Crop, grayscale, and adjacency visual review: `PASS` for the listed concept checks.
- Fog over mixed floor/wall, actual renderer, gameplay, and mobile behavior remain unverified.
- Next safe action: add the missing wall-transition pieces and floor variants, rerun the same 26px crop review, then assess fog strength.

### Asset State
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

### DO_NOT_REPEAT
- Do not reopen A/B/C art direction or recreate the Visual Bible.
- Do not redo PR #10 story/content/engine work.
- Do not alter Codex data, save behavior, story flow, or game rules as visual work.
- Do not mark concept sheets approved or production-ready.
- Keep readable hanji/ink/vermilion surfaces; avoid excess metallic ornament and text-background scenery.

### Files / Visual References
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
- `docs/art/concepts/dungeon-trap-sorcery-scale-review-v2-20261006.jpg`
- `docs/art/concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg`
- `docs/art/concepts/codex-secondary-tabs-20261006.jpg`
- `docs/art/concepts/story-scene-ui-20261006.jpg`
- `docs/art/concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg`
- `docs/art/concepts/lu-xun-meng-huo-boss-concept-20261006.jpg`

### Verification
- Latest confirmed branch CI: run #88 on parent `ce12be9c2350733823abd031b101cb8916ce5b3b`, `success`.
- Crop, grayscale, floor/corridor join, and repeated-wall review for the v2 concept: `PASS` at the visual-study level; wall rhythm still needs variants.
- No gameplay code changed. `npm test`, `npm run build:web`, browser/runtime smoke, and production-screen/mobile QA: `NOT_RUN`.

### NEXT_SAFE_ACTION
1. Add wall endpoints, exterior corners, and T-junction pieces to the modular grammar; keep floor A/B values consistent.
2. Crop the expanded set to 26px and recheck grayscale legibility and repeated joins.
3. Review fog alpha over both light floor and dark wall samples.
4. Keep concept assets separate from production exports; runtime/canvas integration remains outside this design review.

### HUMAN GATE
- Reversible design exploration and reference/spec updates on the art branch: no additional gate.
- Main merge, production deployment, material product change, or art-direction change: user approval required.
