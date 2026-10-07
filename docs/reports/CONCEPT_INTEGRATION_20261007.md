# Remaining concept integration — 2026-10-07

Status: QA_PASS_READY_SINGLE_RELEASE. User requested actual integration of remaining graphics, with ONE production deployment after the complete batch. Work is isolated on feat/complete-concept-integration; no incremental main checkpoints/deploys.

## Implementation contract

- Original reference files are copied byte-for-byte into web/assets/reference. Source rectangle descriptors in manifest.paintings render directly from those images, not newly generated lookalikes.
- Liu Bei/Cao Cao/Sun Quan use original bust/full-body references and transparent v2 exploration PNGs. Sima Yi, Dong Zhuo/Lü Bu, Yuan Shao/Cao Ren and Lu Xun/Meng Huo sheet rectangles replace their visibly divergent portrait/full-body variants. Cao Cao's separate master is the selected ruler source rather than a contradictory early boss-sheet variant.
- Remaining roster/enemy exploration tokens use compact exports of their existing full-body artwork, sharing troop masters where already approved. Named reference sheets use the same full-body source in ink/multiply map markers. Character aspect ratios are preserved. SVG/procedural fallbacks remain.
- Native full bodies now appear in battle cards and story/duel rows as well as party/recruitment/codex. Responsive thumbnail bounds preserve names, stats and targets.
- Detailed source stairs/gate/fog/chest/pot/find/environment artwork and transparent trap-v2/sorcery-v3 marks are integrated through the real map renderer. Existing food pickups display as storage pots, medicine as finds, other pickups as chests. These containers are graphical presentations of current item objects; interaction, collision, contents and rewards are unchanged. No independent breakable pot/new treasure system is introduced.
- Existing floor modifiers receive a subdued 8% environment ink wash. Remembered nonvisible tiles use original fog at 28%. Floor/wall v2 from PR17 remains selected; conflicting historical surface studies are not all simultaneously active.
- Codex bosses gain portraits (unrevealed silhouettes), items gain a real icon grid (unseen unknown icon), achievements gain earned/locked ink seals. Existing visibility counts, unlocks and hints stay canonical.
- Story uses the original mockup's text-free building banner and mountain ornament rectangles with dynamic title/dialogue/actions. It never bakes mockup dialogue/counts into game UI.
- Battle hit brush and heal pulse gain jade ring, defense upward mark, fire/poison wash and confusion swirl/status accents. They derive from actual statuses/guard/HP changes; reduced-motion disables animation.

## Verification plan / limits

Engine tests 161 PASS and web build PASS locally. Browser QA runs in GitHub visual-smoke since local Chromium is unavailable. Existing gameplay/save/manual target/mobile/fallback tests remain; new concept-integration smoke checks actual preferred source rendering, all codex tabs, story backdrop, object draw rectangles, transparent ruler tokens/aspect and reduced motion. CI screenshots must be visually inspected before the single authorized production merge.

The malformed historical codex-character-detail JPEG was already invalid in its original commit. It remains historical UNKNOWN; current character detail is implemented from the readable shared UI specification and approved Bible. No unapproved style switch or gameplay changes. All old variants/review fixtures cannot be active simultaneously; chosen current sources above are explicit.

Browser CI 37627136008 PASS, engine CI 37627135988 PASS on source 91357a0193bcc0e86eb8116b5dcf5177e93d68f2. All 378 images decode; fallback/manual attack/auto battle/save/mobile viewport checks PASS. Coverage: 48 characters, 89 enemy names, 16 layouts. Source surface QA: 98 floor + 112 wall draws, stable source selection. Integration: 39 boss portraits, 22 item images, 16 earned seals; all 8 map source rectangles observed, story backdrop and reduced motion PASS. Errors: 0. Screenshots visually inspected and persisted with QA JSON in docs/reports/evidence/concept-*20261007.*.

Fixed test-only map seed makes the actual keyboard encounter repeatable (2 steps); no engine or production randomness change. Campaign audit waits for visible application screens and decoded images instead of network-idle during running game timers.

Single authorized release: merge PR18 once to main. Record the subsequent live deployment verification on this feature branch, not via a second production-triggering main commit. Historical audit describes the pre-integration state.
