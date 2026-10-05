# SESSION HANDOFF — Project Control Tower / Art Direction v1

## Current State
- Repository: `nanpsw-eng/three-kingdoms-mystery-dungeon`
- Implementation branch: `feature/headless-battle-engine`
- Implementation HEAD: `017e0c4130f914dd33d2ab74f2093d4170b0e438`
- Art branch: `art/ink-graphic-novel-v1`
- Art HEAD before this handoff commit: `8cbca559acf7ea1c706bd9cfb53de5f9e77050c0`
- Current Gate: `PHASE_A_VISUAL_SPEC_READY / CODEX_IMPLEMENTATION_NEXT`
- Latest CI: no status checks returned for either baseline commit; `NOT_RUN / UNKNOWN`
- Open PR: none found
- Merge to main: `NOT_RUN / HUMAN_GATE`
- Production deploy: `NOT_RUN / HUMAN_GATE`

## Approved Baseline
- Product baseline remains unchanged: Three Kingdoms × Mystery Dungeon × Party Roguelite.
- Art direction remains `APPROVED`: modern ink graphic novel × Three Kingdoms lienhuanhua.
- Sources: `docs/decisions/DEC-025-ART_DIRECTION.md`, `docs/art/VISUAL_BIBLE_V1.md`, and `docs/art/reference/*.jpg`.
- Phase A implementation spec: `docs/art/PHASE_A_VISUAL_SPEC_V1.md`.
- Asset state registry: `docs/art/ASSET_REGISTRY.md`.

## Completed
- Confirmed implementation branch HEAD remains `017e0c4130f914dd33d2ab74f2093d4170b0e438`.
- Confirmed art branch was `bfb023ab8e7e3d55c624c3cc7992ce2876bcf652` at recovery start.
- Re-read project rules, exact AI-OS binding, decision index, DEC-025, Visual Bible, Codex handoff, and session handoff from the remote branch.
- Inventoried current web surfaces: legacy dark/gold CSS, procedural pixel portraits/sprites/map, existing Title/Dungeon/Battle DOM/Canvas interaction classes.
- Added approved Phase A visual specification and initial asset registry.
- Updated Codex handoff with concrete Phase A scope and verification requirements.

## Current Art Phase
- Phase A — Visual Token + Title / Yellow Turban Dungeon / Standard Battle vertical slice.
- Design specification: `APPROVED_FOR_IMPLEMENTATION`.
- Code implementation: `NOT_STARTED`.
- Visual QA: `NOT_RUN`.

## DO_NOT_REPEAT
- Do not reopen art direction selection or repeat A/B/C.
- Do not recreate the Visual Bible or ruler character direction.
- Do not redo current visual inventory unless code changes materially.
- Do not rewrite `src/battle/`, `src/dungeon/`, `src/run/`, or `src/content/`.
- Do not polish the legacy pixel/lacquer theme as the final direction.
- Keep legacy assets as fallback until replacement coverage is verified.

## Files Changed
- `docs/art/PHASE_A_VISUAL_SPEC_V1.md` — implementation-ready design and acceptance spec.
- `docs/art/ASSET_REGISTRY.md` — initial status of surfaces and asset families.
- `docs/ai-dev/CODEX_ART_HANDOFF.md` — Phase A implementation brief.

## Test / Build / Visual Evidence
- `npm ci`: `NOT_RUN` — repository checkout is not mounted in this Work runtime.
- `npm test`: `NOT_RUN` — repository checkout is not mounted in this Work runtime.
- `npm run build:web`: `NOT_RUN` — repository checkout is not mounted in this Work runtime.
- UI smoke / screenshots / console errors: `NOT_RUN`.
- GitHub status checks: empty for the two baseline commits; no CI pass inferred.
- Reference JPEGs are present in the repository; visual inspection of binary images was unavailable in this Work runtime.

## Known Blocker
- Work runtime has GitHub API access but no local target repository checkout; direct Git transport was unavailable. Work completed and committed design-source updates through the GitHub connector. Code implementation, tests, browser smoke, and screenshots require the repository checkout in the Codex runtime.

## NEXT_SAFE_ACTION
1. Codex checks out the latest `art/ink-graphic-novel-v1` branch tip and reads the updated `CODEX_ART_HANDOFF.md`, `PHASE_A_VISUAL_SPEC_V1.md`, and `ASSET_REGISTRY.md`.
2. Implement Phase A visual changes only; preserve the product/domain boundaries.
3. Run `npm ci`, `npm test`, `npm run build:web`, and available UI smoke; capture 390×844 Title, Dungeon, and Battle screens.
4. Return the commit SHA, test evidence, and screenshots to Work for visual QA.
5. Mark Phase A accepted only after screenshot review; then proceed to Phase B ruler master set.

## HUMAN GATE
- Main merge: REQUIRED.
- Production deploy/release: REQUIRED.
- Material product baseline or art-direction change: REQUIRED.
- Phase A implementation on art branch: no additional human gate.
