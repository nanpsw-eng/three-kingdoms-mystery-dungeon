# Minimal Web Client — Phase 14

Status: `UI_SMOKE_PASS (headless Chromium, 390×844) / REAL_DEVICE_NOT_RUN / DEPLOY_NOT_RUN (Human Gate)`
Date: `2026-10-05`

## Stack decision (OD-001 / U-002, auto-approved A-26)
- No framework, no new runtime dependency. Domain TS compiles to browser-native ES modules (`tsconfig.web.json` → `site/`).
- Rendering: Canvas 2D dungeon map (19×19 view, explored memory, fog), DOM for battle/menus. Mobile-portrait first, 44px touch targets.
- Persistence: localStorage — meta progression, and the in-progress run as `seed + command log` replay (A-06). No accounts/backend (Security/Privacy extension stays ON_DEMAND).
- Hosting: static files; any static host works. **Deploy not performed (Human Gate).**

## Screens
Title (campaign/ruler/2 generals, records & codex) · Dungeon (HUD, map with tap-to-travel, D-pad, auto explore, search, interact, stairs, bag, party/formation) · Battle (5v5 formation grid, timeline preview, manual commands with target selection, Smart/All Attack/Repeat auto modes, ×1/×2/×3) · Trait 3-choice + reroll · Recruit · Events · Safe zone (shop, enhance) · Run end (summary + new unlocks).

## Verification
- `npm run build:web` strict compile PASS; added to CI.
- `scripts/e2e-smoke.mjs` (optional, global Playwright): title → start → explore → battle → manual attack → Smart Auto ×3 → win → bag. Result: battle reached and resolved, **0 console/page errors**.
- Real mobile device, accessibility audit, performance (NFR-004) — `NOT_RUN`.

## Known limitations
- Battle has no animation layer (log + HP bars only); ×1/×2/×3 controls auto pacing of ally actions; enemy turns resolve between them.
- Art direction (OD-002) not started — placeholder glyphs/colors.
