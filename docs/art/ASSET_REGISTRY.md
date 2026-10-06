# Art Asset Registry — v1

Status vocabulary: `CONCEPT`, `APPROVED`, `MASTER_REQUIRED`, `IMPLEMENTATION_READY`, `IMPLEMENTED`, `NEEDS_REVISION`, `SUPERSEDED`.

| Asset / surface | Status | Source / note | Next action |
|---|---|---|---|
| Global art direction | `APPROVED` | DEC-025 + Visual Bible v1 | Do not reopen without explicit user direction |
| Phase A shared ink/hanji UI system | `IMPLEMENTED` | `PHASE_A_VISUAL_SPEC_V1.md`; `web/style.css` tokens/components (Claude, 2026-10-06) | Codex visual QA against reference boards; tune in place |
| Title screen visual slice | `IMPLEMENTED` | Phase A spec; DOM unchanged; 390×844 smoke screenshot (Claude) | Codex visual QA |
| Yellow Turban Dungeon visual slice | `IMPLEMENTED` | `web/src/map.ts` palette: hanji floor/corridor, ink wall, soft ink-wash fog, vermilion facing/alert (procedural tiles retained) | Codex visual QA; production tiles remain Phase C |
| Standard Battle visual slice | `IMPLEMENTED` | Paper cards, blue-gray/vermilion side stripes, vermilion active keyline + ▶, timeline underline, ink hit pulse | Codex visual QA |
| Liu Bei bust portrait | `IMPLEMENTED` | `web/assets/portraits/liu-bei.webp`; native-resolution ink illustration, no pixelization | Create identity-matched full-body and exploration token |
| Cao Cao bust portrait | `IMPLEMENTED` | `web/assets/portraits/cao-cao.webp`; native-resolution ink illustration, no pixelization | Create identity-matched full-body and exploration token |
| Sun Quan bust portrait | `IMPLEMENTED` | `web/assets/portraits/sun-quan.webp`; native-resolution ink illustration, no pixelization | Create identity-matched full-body and exploration token |
| Ruler Master Set (full-body + exploration token) | `MASTER_REQUIRED` | Bust masters are integrated; procedural fallback still covers map figures | Extend each ruler identity to combat/event art and map token |
| Dungeon floor/wall/corridor/fog/object set v1 | `IMPLEMENTED` | `web/assets/tiles/ink-dungeon-v1.svg` + manifest maps floor/walls, doorway, stairs, trap, sorcery, recruit/event, player/enemy/chest/pot; feathered 28% fog; procedural fallback retained | Browser-check live map at 390×844 and verify no-manifest fallback |
| Item silhouette set v1 | `IMPLEMENTED` | Same SVG atlas maps food, medicine, scroll, weapon, armor, jade seal, boots, tally, fire pot, smoke bomb, and unidentified item IDs; `sprites.ts` uses non-pixelized asset route; `main.ts` uses dedicated unknown icon | Browser-check Bag/Shop, gear variants, and missing-asset fallback |
| Item silhouette set v1 | `CONCEPT` | `concepts/item-silhouettes-v1.svg` and color/grayscale renders; 26px food, medicine, scroll, weapon, armor, jade-seal treasure, and wrapped unidentified state | Map the latest `src/content/items.ts` IDs to specific variants, then integrate via the asset manifest with procedural fallback |
| Existing procedural pixel portraits/sprites/map tiles | `SUPERSEDED` | Legacy main visual language; retained as fallback | Keep functional until replacement coverage is verified |


| Sima Yi first master concept | `SUPERSEDED` | `concepts/sima-yi-master-concept-20261006.jpg` | Keep as history; use v2 for current review |
| Sima Yi master concept v2 | `CONCEPT` | `concepts/sima-yi-master-concept-v2-20261006.jpg` | Check token and face consistency at target sizes; keep separate from production asset approval |
| Codex character-detail screen concept v2 | `CONCEPT` | `concepts/codex-character-detail-mockup-v2-20261006.jpg` | Layout reference only; align final details with current 40px portrait component |
| Codex Bosses / Achievements / Items views | `IMPLEMENTATION_READY` | `CLAUDE_CONTENT_VISUAL_SPEC_20261006.md` | Design tab-specific states and readable unknown/locked states |
| Line-by-line story scene UI | `IMPLEMENTATION_READY` | `CLAUDE_CONTENT_VISUAL_SPEC_20261006.md` | Apply speaker portrait, n/m progress, next/tap/skip and choices |
| Story expansion character + enemy production art queue | `MASTER_REQUIRED` | `STORY_ART_QUEUE.md` on latest main | Work from existing stable ids / aliases; follow queue order |


| Liu Bei square bust concept v1 | `CONCEPT` | `concepts/liu-bei-bust-concept-v1-20261006.jpg` | Design reference only; current portrait loader pixelizes images |
| Cao Cao square bust concept v1 | `CONCEPT` | `concepts/cao-cao-bust-concept-v1-20261006.jpg` | Design reference only; current portrait loader pixelizes images |
| Sun Quan square bust concept v2 | `CONCEPT` | `concepts/sun-quan-bust-concept-v2-20261006.jpg` | Update full-body/token identity; design reference only |
| Non-pixelized portrait asset compatibility | `IMPLEMENTED` | Manifest `nativePortraits` route checks image load before use; legacy pixelized/procedural fallback remains | Keep route fallback-safe while extending character coverage |
| Original ruler master comparison v2 (Liu Bei / Cao Cao / Sun Quan) | `CONCEPT` | `concepts/ruler-master-comparison-v2-20261006.jpg` | Review separate assets at target sizes; no production approval yet |
| E2 boss duo (Dong Zhuo / Lü Bu) concept | `CONCEPT` | `concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg` | Simplify armor ornament and preserve broad-vs-tall silhouette contrast |


| Codex Bosses / Achievements / Items three-tab concept sheet | `CONCEPT` | `concepts/codex-secondary-tabs-20261006.jpg` | Keep data-driven counters, refine defeated/earned/unknown icons at mobile size |
| Line-by-line story scene UI two-state concept | `CONCEPT` | `concepts/story-scene-ui-20261006.jpg` | Align speaker portrait to actual 48px row, validate sheet scroll and fixed actions |
| Dungeon modular surface grammar v1 | `SUPERSEDED` | `concepts/dungeon-modular-surface-grammar-concept-v1-20261006.jpg`; first six-surface study without a second floor variant | Retain as history; v2 is the current crop/repeat review source |
| Dungeon modular surface grammar v2 | `CONCEPT` | `concepts/dungeon-modular-surface-grammar-concept-v2-20261006.jpg`; Floor A/B, H/V corridor, horizontal wall segment, and inner corner studies in square cells | Review tile adjacency; add wall endpoints, T-junctions, exterior corners, and fog variants before production |
| Dungeon modular surface scale review v2 | `CONCEPT` | `concepts/dungeon-modular-surface-scale-review-v2-20261006.jpg`; 26px color/grayscale crops plus H/V floor joins, repeated wall, and alternating floor samples | Current design QA evidence only; tile variants and actual Canvas/runtime integration remain open |

## Current Implementation State

Phase A's hanji/ink skin is implemented on `main` and synced into the art branch. The art branch adds a fallback-safe, non-pixelized SVG atlas for Canvas dungeon/object marks and inventory icons, plus three native-resolution ruler bust masters. The manifest loads portraits only after successful image decode; existing pixel/procedural portraits and map figures remain fallback. Full-body art, exploration tokens, and 390×844 runtime QA remain open.

| Liu Bei individual master concept v1 | `CONCEPT` | `concepts/liu-bei-master-concept-v1-20261006.jpg` | Review portrait at 40px and token in grayscale; create final production exports later |
| Cao Cao individual master concept v1 | `CONCEPT` | `concepts/cao-cao-master-concept-v1-20261006.jpg` | Review portrait at 40px and token in grayscale; create final production exports later |
| Sun Quan individual master concept v1 | `NEEDS_REVISION` | `concepts/sun-quan-master-concept-v1-20261006.jpg` | Update full-body and token to the more mature face in portrait v2 |
| E2 campaign boss trio (Yuan Shao / Cao Cao battle variant / Cao Ren) | `CONCEPT` | `concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg` | Preserve tall/elegant, compact/dark, and broad/shield-first reads; simplify ornament before master approval |

| E7 / E8 boss duo (Lu Xun / Meng Huo) | `CONCEPT` | `concepts/lu-xun-meng-huo-boss-concept-20261006.jpg` | Preserve fan-led vertical strategist vs shield-led broad ruler; review armor and token detail before approval |

| Liu Bei exploration token concept v2 | `CONCEPT` | `concepts/liu-bei-exploration-token-concept-v2-20261006.png`; safety margin corrected so both feet remain visible | Review at 24–28px over explored floor and fog; do not treat as production art |
| Cao Cao exploration token concept v1 | `CONCEPT` | `concepts/cao-cao-exploration-token-concept-v1-20261006.png`; compact charcoal silhouette with short-sword cue | Review at 24–28px over explored floor and fog; do not treat as production art |
| Sun Quan exploration token concept v1 | `CONCEPT` | `concepts/sun-quan-exploration-token-concept-v1-20261006.png`; upright cool blue-gray / dark-green silhouette with command tablet | Review at 24–28px over explored floor and fog; do not treat as production art |
| Exploration token renderer compatibility | `MASTER_REQUIRED` | `web/src/map.ts` currently paints 16×16 procedural figures and canvas rendering is pixelated | Define a separate non-pixel token route; preserve existing procedural sprite as fallback |
| Ruler bust and token concept bundle | `CONCEPT` | Separate busts and token studies now exist for Liu Bei, Cao Cao, and Sun Quan; Sun Quan bust v2 is the current face cue | Align all three full-body studies to their respective portrait/token before any production approval |

| Liu Bei individual full-body concept v1 | `CONCEPT` | `concepts/liu-bei-full-body-concept-v1-20261006.jpg`; complete boots, open sleeve gesture, ivory and muted-crimson blocks | Compare with bust v1 and token v2 at thumbnail scale |
| Cao Cao individual full-body concept v1 | `CONCEPT` | `concepts/cao-cao-full-body-concept-v1-20261006.jpg`; compact charcoal/deep-crimson mass, short command sword | Simplify armor ornament; compare clipped beard and token silhouette |
| Sun Quan individual full-body concept v1 | `CONCEPT` | `concepts/sun-quan-full-body-concept-v1-20261006.jpg`; upright blue-gray/dark-green robes, command tablet | Align with mature bust v2; compare at grayscale and tile scale |

| Ruler Master visual identity system (Liu Bei / Cao Cao / Sun Quan) | `APPROVED` | Three-view references and `concepts/ruler-scale-review-revised-20261006.jpg`; silhouette/color/propping reviewed at 40/48px bust and 24/28px token simulation | Keep approval scoped to visual identity guidance; individual image exports remain `CONCEPT` |
| Cao Cao exploration token concept v1 | `SUPERSEDED` | Replaced by `concepts/cao-cao-exploration-token-concept-v2-20261006.png`; sword cue blended into robe at small size | Retain v1 for history only |
| Cao Cao exploration token concept v2 | `CONCEPT` | `concepts/cao-cao-exploration-token-concept-v2-20261006.png`; short command sword projects beyond compact cloak silhouette | Validate in actual map renderer before integration |
| Sun Quan exploration token concept v1 | `SUPERSEDED` | Replaced by `concepts/sun-quan-exploration-token-concept-v2-20261006.png`; command tablet was not clear at small size | Retain v1 for history only |
| Sun Quan exploration token concept v2 | `CONCEPT` | `concepts/sun-quan-exploration-token-concept-v2-20261006.png`; command tablet separates from robe silhouette | Validate width/readability in actual map renderer before integration |
| Ruler master scale-review board | `CONCEPT` | `concepts/ruler-scale-review-revised-20261006.jpg`; simulated 40/48px busts and 24/28px tokens on hanji/fog plus monochrome silhouettes | Design-level review only; actual page/canvas QA remains open |
| Ruler production portrait/token exports | `MASTER_REQUIRED` | Current image files are downscaled concept references; runtime loaders remain pixelizing/procedural | Prepare production masters only after actual rendering contract is available |

| Dungeon surface atlas v1 | `CONCEPT` | `concepts/dungeon-surfaces-concept-v1-20261006.jpg`; illustrative floor/wall/corridor vignettes plus fog/stair/gate studies | Reference only; panels are not modular 26px tile masters |
| Dungeon object and marker atlas v1 | `CONCEPT` | `concepts/dungeon-objects-concept-v1-20261006.jpg`; chest, pot, trap, sorcery, player, Yellow Turban scout, environment wash, food/medicine | Trap and sorcery forms need stronger silhouette separation; environmental wash should preserve base tile contrast |
| Dungeon 26px scale review v1 | `CONCEPT` | `concepts/dungeon-set-scale-review-20261006.jpg`; source cells reduced to 26px and enlarged for inspection | Test mixed-cell seams, fog boundary, and markers in a composed map before advancing status |

| Dungeon trap marker v2 | `CONCEPT` | `concepts/dungeon-trap-mark-concept-v2-20261006.png`; angular fractured plate replaces circular base | Check one-cell footprint and grayscale against sorcery |
| Dungeon sorcery formation marker v3 | `CONCEPT` | `concepts/dungeon-sorcery-mark-concept-v3-20261006.png`; one open ink ring and one muted-violet flame, simplified for 26px cells | Compare beside trap and fog; retain concept status until production crop and renderer QA |
| Dungeon sorcery formation marker v2 | `SUPERSEDED` | `concepts/dungeon-sorcery-mark-concept-v2-20261006.png`; ornate open ring with talisman, radial marks, and inner flame | Retain as history; use v3 for current cell-scale review |
| Trap / sorcery 24–28px review v2 | `CONCEPT` | `concepts/dungeon-trap-sorcery-scale-review-v2-20261006.jpg`; form difference survives monochrome reduction | Preserve the angular vs open-circular silhouette distinction |
| Dungeon room/corridor composition v1 | `CONCEPT` | `concepts/dungeon-room-corridor-composition-v1-20261006.jpg`; rooms, one-cell-style corridor, explored boundary, fog, gate/stairs and markers | Composition only; create an exact 26px grid mockup before visual approval |

| Dungeon trap v2 26px scale proof | `CONCEPT` | `concepts/dungeon-trap-sorcery-scale-review-v2-20261006.jpg`; angular broken plate reads separately from circular sorcery in monochrome | Keep this pair as the silhouette baseline |
| Dungeon room/corridor composition v1 | `CONCEPT` | `concepts/dungeon-room-corridor-composition-v1-20261006.jpg`; shows explored room, corridor, second room/fog and current marker set | Reference only; wall seams, marker footprints and exact corridor width remain unapproved |

| Dungeon exact-cell atlas-crop audit v1 | `NEEDS_REVISION` | `concepts/dungeon-cell-grid-review-v1.svg`; Inkscape render shows vignette atlas panels reduced into logical cells | Replace the vignette crops with modular tile masters; review wall/floor seams and fog strength |

| Dungeon exact-cell room / corridor v1 | `CONCEPT` | `concepts/dungeon-modular-exact-cell-study-v1-20261006.svg`; one-cell doorway, one-cell corridor, player/chest marks, localized fog | Keep reference-only pending Canvas/renderer compatibility check |
| Dungeon core object markers v1 | `CONCEPT` | `concepts/dungeon-object-markers-v1.svg` with color/grayscale boards; stair, trap, sorcery, enemy, pot at 26px and under fog | Integrate through a new atlas path with procedural fallback; validate actual map screenshots |
| Item silhouette language v1 | `CONCEPT` | `concepts/item-silhouettes-v1.svg` with color/grayscale boards; category silhouettes including unknown state | Map current item IDs to specific variants and integrate into bag/map UI |

| Dungeon core object markers v1 | `IMPLEMENTED` | `web/assets/tiles/ink-dungeon-v1.svg` loaded through `web/assets/manifest.json`; stair/trap/sorcery/enemy/pot modules have editable concept source in `concepts/dungeon-object-markers-v1.svg` | Browser QA at mobile size and missing-asset fallback |
| Item silhouette language v1 | `IMPLEMENTED` | `web/assets/tiles/ink-dungeon-v1.svg`; 26×26 category/catalog aliases and unknown parcel state; editable concept in `concepts/item-silhouettes-v1.svg` | QA current content IDs in Bag/Shop, including unidentified equipment |
