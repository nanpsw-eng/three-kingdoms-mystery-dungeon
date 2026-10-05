# SESSION HANDOFF — Visual Design Workspace / Claude Content Sync

## Project Control
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Current product source: `main` at `4792356fa81f39ca053edc0df30278868abe2c22`
- Latest Claude work: PR #10 merged; Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`
- Art/design branch: `art/ink-graphic-novel-v1`
- Art HEAD before this handoff commit: `f10b206cfe45c2e8ccc4e507d754e65a9f4bb50a`
- Open PR: none
- Latest confirmed CI before this commit: art HEAD `f10b206cfe45c2e8ccc4e507d754e65a9f4bb50a` succeeded (run #63). This commit’s CI is pending/not yet checked.
- Product baseline and DEC-025 art direction remain unchanged.

## Current Task Scope
This Work owns visual design, concept art, asset registry, and visual QA. The user instructed that design work continue here without assigning separate Codex work.
Do not treat these concept assets as final implementation art until their remaining design gaps are resolved.

## Verified Claude Content Delta
- PR #10 added save compatibility handling, Codex/achievement screens, character historical notes, and line-by-line story scenes; it is merged into main.
- The current Codex view has Characters, Bosses, Achievements, and Items tabs with dynamic progress/total counters.
- Character detail uses a 40px portrait row with class, stats, skills, and historical note.
- Story scene progression includes speaker portrait, line progress, next/tap, skip, and choices.
- `docs/art/STORY_ART_QUEUE.md` on main lists 37 added ruler/general designs and about 90 enemy/boss names. Follow its stable ids, aliases, and priority.

## Completed This Session
- Verified main, art, Claude session branch, merged PR #10, current files, and workflow state.
- Generated and reviewed:
  - Sima Yi bust/full-body/exploration-token concept.
  - Codex character detail screen concept v2, with dynamic fraction labels.
  - Liu Bei/Cao Cao/Sun Quan comparison concept.
  - Dong Zhuo/Lü Bu boss comparison concept.
- Added the Sima Yi and Codex v2 JPEG reference copies, Claude content visual spec, and registry entries to the art branch.
- This commit adds the ruler comparison and E2 boss concept reference copies and updates the visual spec, registry, and handoff.

## Asset State
- Sima Yi master set: `CONCEPT`; align with the original ruler master set before approval.
- Codex character-detail screen v2: `CONCEPT`; tab counters match data-driven fractions, but oversized expanded artwork is mood/composition only; actual component currently renders a 40px portrait.
- Liu Bei/Cao Cao/Sun Quan comparison: `CONCEPT`; beard, posture, and palette separation established; reduce remaining metallic detail and split into reusable master files.
- Dong Zhuo/Lü Bu comparison: `CONCEPT`; broad-vs-tall silhouettes established; simplify armor ornament and verify small tokens.
- Codex Bosses/Achievements/Items states: `IMPLEMENTATION_READY` by written spec; visual sheets not yet created.
- Story scene screen: `IMPLEMENTATION_READY` by written spec; visual sheet not yet created.
- Repository concept copies are downscaled reference JPEGs. Original generated concepts remain the high-resolution visual outputs and are not production exports.

## DO_NOT_REPEAT
- Do not reopen A/B/C art direction or regenerate the Visual Bible.
- Do not redo PR #10 content/engine work.
- Do not revise gameplay/save/codex data behavior as part of visual design.
- Do not identify concept sheets as approved or production-ready.
- Keep all new designs within hanji/ink/vermilion and mobile readability rules.

## Files / Visual References
- `docs/art/CLAUDE_CONTENT_VISUAL_SPEC_20261006.md`
- `docs/art/ASSET_REGISTRY.md`
- `docs/art/concepts/sima-yi-master-concept-20261006.jpg`
- `docs/art/concepts/codex-character-detail-mockup-v2-20261006.jpg`
- `docs/art/concepts/ruler-master-comparison-20261006.jpg`
- `docs/art/concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg`

## Verification
- PR #10 report: `npm test` 156/156 PASS, `build:web` PASS, Chromium 390×844 smoke PASS, page errors 0 (per merged PR description).
- Art branch CI before this commit: PASS, run #63.
- Design commits do not change code. Local build/test and production-screen visual QA: `NOT_RUN`.
- Concept images were inspected at full output; they remain CONCEPT and have identified refinement needs.

## NEXT_SAFE_ACTION
1. Create a cohesive Codex Bosses/Achievements/Items tab-state design sheet.
2. Create a story scene UI design sheet showing speaker, progress, advance/skip, and choice states.
3. Refine the three original ruler master concepts into separate portrait/full-body/token designs; align Sima Yi after ruler identity lock.
4. Continue boss and playable-general concepts according to `STORY_ART_QUEUE.md`.

## HUMAN GATE
- Visual exploration and reversible reference/spec updates on the art branch: no additional gate.
- Main merge, production deploy, material product change, or changing the approved art direction: user approval required.
