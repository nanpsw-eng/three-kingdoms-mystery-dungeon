# Mobile gameplay UX and graphics audit — 2026-10-07

## Findings and implementation

The supplied Android screenshot showed a width-sized map, a tall party panel and wrapping action labels pushing controls below the visible browser viewport. Dungeon layout now budgets the available dynamic viewport height: the square map fits the remaining space, party health is compact, movement and actions retain 44px touch targets, and state/log/help are explicit controls. The latest event stays visible; the complete recent log opens separately.

Battle has a bounded, internally scrolling field and action area. Selecting an action gives a target instruction and a cancel button. Help and other informational panels pause automatic combat; closing them resumes the selected mode. Sheets keep their close button visible while scrolling. Skill details derive energy, targeting and effects from the engine definitions; inventory descriptions derive consumable effects from the same content. Save format and gameplay rules are unchanged.

## Graphics reconciliation

The shipped manifest contains 79 busts, 79 full-body illustrations and 124 tokens. The production plan covers 48 playable characters, 19 additional named bosses, 12 ordinary troop portrait masters and 45 explicit shared-portrait faction variants. Existing CI verifies 283 physical image assets, all 89 enemy names, item/equipment atlas bindings and procedural fallback behavior. E1–E9 campaign content is present.

Two renderer gaps remained despite existing files: party detail and expanded codex entries did not request full-body illustrations, and codex navigation scrolled away with the collection. Both are connected here; codex header/tabs remain visible while its list scrolls. Recruitment already used the full-body route and is preserved. No replacement artwork is required by the current production contract.

`CLAUDE_CONTENT_VISUAL_SPEC_20261006.md` is a chronological concept log. Its earlier roster counts and CONCEPT/NOT_RUN entries are retained as historical provenance and explicitly superseded by the production plan, registry and runtime delivery reports. They must not restart completed asset work.

## Verification

- Engine regression: 161 tests passed locally; static web TypeScript build passed.
- PR #16 runs existing gameplay, asset decode, missing-art fallback and coverage checks plus `scripts/mobile-ux-smoke.mjs`.
- New regression covers 360×640, 390×660, 390×844, 412×740 and 768×1024; visible 44px controls, square map, touch wait, readable help/party, full-body decode, fixed codex navigation, manual target selection and paused/resumed automatic combat.
- CI run `37617237283` at `7cb14a0` passed engine/build, existing mobile/art checks and the new UI regression. Final follow-up CI is required for the party-column sizing refinement and saved-state reload assertion. Production deployment will follow the reviewed merge.

This is representative browser regression, not a human playthrough of every campaign or every physical Android/iOS device. Landscape windows below 540px height retain scrolling rather than shrinking touch targets.
