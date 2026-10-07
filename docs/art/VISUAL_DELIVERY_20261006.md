# Graphics delivery — 2026-10-06

## Outcome
The approved ink graphic novel direction covers the shipped roster and enemies without rebuilding existing art or changing the game engine/content. Latest explicit user instruction authorizes completing recommended work, main merge, and production deployment without another permission prompt.

| Surface | Delivered scope |
|---|---|
| Playable characters | 48 unique identities; original 15 preserved, 33 newly produced |
| Additional named bosses | 19 masters; 3 Yellow Turban leaders and 16 further bosses |
| Ordinary troop portraits | 12 role masters; 45 faction variants explicitly share these portraits |
| Physical files | 79 bust WebP, 79 full-body WebP, 124 SVG tokens, existing map/item atlas |
| Enemy display names | 89 bound to native portrait and token identities |
| Runtime visuals | Native map/timeline tokens, codex and story portraits, local typography, hit/heal/status cues, >=44px controls, reduced motion |

The full-body URL adapter now defers downloads until a full-body slot is displayed. Image failures retain procedural art, and named figures no longer borrow another historical figure's face. Ordinary soldiers share a portrait by role; their faction/weapon tokens remain distinct.

## Production and review
Each of the 64 new raster masters was generated separately with a transparent background. Exporting the same master into bust and full-body WebP preserves identity; 384px busts and 768×1152px maximum full bodies avoid runtime pixelization. 61 exact prompts, all 64 source hashes, export settings and crop exceptions are in GENERATION_PROVENANCE_20261006.json. SVG tokens are editable source, with broad silhouettes and role/prop cues at 24–28px. Original 15 masters and original 23 tokens were preserved byte-for-byte (53 original files compared against 9428e29; no differences). The exact prompt text for the initial three Yellow Turban boss calls was not retained; their sources and derived assets are hashed.

Contact review: evidence/final-20261006/roster-review.jpg (104px and 40px portraits with 28px tokens). Individual face cropping was adjusted where the default frame clipped a face or showed too much torso. Old concepts and stale next-action lists were archived so recovery starts from the current checkpoint.

## Verification
| Check | Status / evidence |
|---|---|
| Original checkpoint exact-head mobile CI | PASS — d0d6b1d, visual-smoke run 37469154209 |
| New-head npm test / build:web | PASS locally — 161 tests, 0 failures; build completed |
| Manifest file decode (283 physical paths) | PASS — main run 37546880371, 283/283 |
| Mobile gameplay / missing-art fallback | PASS — main run 37546880371 |
| Expanded roster at 360, 390 and 768px | PASS — main run 37546880371 |
| Codex tabs and nine campaign intro screens | PASS — main run 37546880371; 16 coverage layouts |
| Main merge / Pages deployment | PR #13 MERGED; gh-pages publish PASS (37546880382); public URL HTTP 404 at 2026-10-07 inspection |
| Full campaign manual playthrough / balance acceptance | NOT_RUN — remains Track A human playtest scope |

GitHub Actions publishes JSON metrics and screenshots in the mobile-visual artifact for each exact SHA. The isolated visual fixture unlocks content only inside its temporary browser context; user saves and shipped progression are unchanged.

## Scope and rollback
No src/** domain or content change. PR diff should be limited to visual adapters/assets/styles, asset tests, authoring/verification scripts and art continuity documentation. Revert the visual merge to restore the prior skin/assets; source engine and save format do not require migration. No paid external service activation or repository visibility change.
