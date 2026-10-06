# Art Asset Registry — v1

Status vocabulary: `CONCEPT`, `APPROVED`, `MASTER_REQUIRED`, `IMPLEMENTATION_READY`, `IMPLEMENTED`, `NEEDS_REVISION`, `SUPERSEDED`.

| Asset / surface | Status | Source / note | Next action |
|---|---|---|---|
| Global art direction | `APPROVED` | DEC-025 + Visual Bible v1 | Do not reopen without explicit user direction |
| Phase A shared ink/hanji UI system | `IMPLEMENTATION_READY` | `PHASE_A_VISUAL_SPEC_V1.md` | Implement CSS tokens and shared components |
| Title screen visual slice | `IMPLEMENTATION_READY` | Phase A spec; existing selection DOM retained | Implement, capture 390×844 evidence |
| Yellow Turban Dungeon visual slice | `IMPLEMENTATION_READY` | Phase A spec; topology and interaction frozen | Implement renderer skin, capture evidence |
| Standard Battle visual slice | `IMPLEMENTATION_READY` | Phase A spec; battle behavior frozen | Implement cards/timeline/controls, capture evidence |
| Liu Bei portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Cao Cao portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Sun Quan portrait / full-body / exploration token | `MASTER_REQUIRED` | Visual Bible v1 ruler master | Create and approve one consistent master set |
| Dungeon floor/wall/corridor/fog/object illustrations | `MASTER_REQUIRED` | Phase C concept atlases now exist; individual production tiles/crops and runtime checks do not | Refine trap/sorcery distinction and environmental overlay, then create production masters after renderer contract |
| Item silhouette set | `MASTER_REQUIRED` | Phase D item language | Create after Phase C |
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
| Non-pixelized portrait asset compatibility | `MASTER_REQUIRED` | `web/src/assets.ts` pixelizes external portraits at default 48px/28 colors; Codex asks for 40px | Define a non-pixelized route before implementation; do not feed concept boards to current loader |
| Original ruler master comparison v2 (Liu Bei / Cao Cao / Sun Quan) | `CONCEPT` | `concepts/ruler-master-comparison-v2-20261006.jpg` | Review separate assets at target sizes; no production approval yet |
| E2 boss duo (Dong Zhuo / Lü Bu) concept | `CONCEPT` | `concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg` | Simplify armor ornament and preserve broad-vs-tall silhouette contrast |


| Codex Bosses / Achievements / Items three-tab concept sheet | `CONCEPT` | `concepts/codex-secondary-tabs-20261006.jpg` | Keep data-driven counters, refine defeated/earned/unknown icons at mobile size |
| Line-by-line story scene UI two-state concept | `CONCEPT` | `concepts/story-scene-ui-20261006.jpg` | Align speaker portrait to actual 48px row, validate sheet scroll and fixed actions |
| Dungeon modular surface grammar v1 | `SUPERSEDED` | `concepts/dungeon-modular-surface-grammar-concept-v1-20261006.jpg`; first six-surface study without a second floor variant | Retain as history; v2 is the current crop/repeat review source |
| Dungeon modular surface grammar v2 | `SUPERSEDED` | `concepts/dungeon-modular-surface-grammar-concept-v2-20261006.jpg`; first square-cell grammar with less varied floor and incomplete transition set | Retain for history; v3 is the current concept reference |
| Dungeon modular surface grammar v3 | `CONCEPT` | `concepts/dungeon-modular-surface-grammar-concept-v3-20261006.jpg`; floor A/B, H/V corridors, wall endpoint, exterior L-corner, T-junction, and split fog study | Warm/simplify floor, define translucent fog overlay, and verify mixed-cell joins before any production export |
| Dungeon modular surface scale review v2 | `SUPERSEDED` | `concepts/dungeon-modular-surface-scale-review-v2-20261006.jpg`; 26px color/grayscale crops for the initial six-piece grammar | Retain for history; v3 is current |
| Dungeon modular surface scale review v3 | `CONCEPT` | `concepts/dungeon-modular-surface-scale-review-v3-20261006.jpg`; eight exact-study crops reduced to 26px then enlarged 5× in color and grayscale | Design-scale silhouette review only; seamless adjacency, renderer alpha, and runtime use remain unverified |
| Dungeon fog opacity study v1 | `CONCEPT` | `concepts/dungeon-fog-alpha-study-v1.jpg` + editable `concepts/dungeon-fog-alpha-study-v1.svg`; localized charcoal wash compared at 18/28/38% over hanji floor and stone wall | Use 28% as design starting point with feathered edges and no solid full-cell fill; verify with actual renderer before implementation approval |


| Dungeon floor surface concept v4 | `CONCEPT` | `concepts/dungeon-floor-surface-concept-v4-20261006.jpg`; warmer low-contrast floor A/B and H/V corridor references | Keep warmth and sparse seam rhythm; use only as style reference because generated panels have gutters and are not seamless tiles |
| Dungeon authored exact-cell study v1 | `CONCEPT` | `concepts/dungeon-modular-exact-cell-study-v1-20261006.svg` plus color/grayscale renders; explicit 26×26 floor, wall transitions, one-cell doorway, corridor, player/chest markers, and localized 28% fog composition | Expand remaining object markers; verify with actual renderer before moving toward implementation |
| Dungeon exact-cell scale review v1 | `SUPERSEDED` | `concepts/dungeon-exact-cell-scale-review-v1-20261006.jpg`; earlier cell study before explicit doorway/corridor and marker contrast review | Retain for history; v2 is current design-scale review |
| Dungeon exact-cell scale review v2 | `CONCEPT` | `concepts/dungeon-exact-cell-scale-review-v2-20261006.jpg`; 26px color/grayscale logical-cell simulation with room-to-corridor composition | Extend to remaining object silhouettes; actual Canvas scaling, topology, fog compositing, and gameplay remain unverified |

## Current Implementation State

The repository's current web client still uses the legacy dark/gold CSS theme and procedural pixel portrait/sprite/map renderers. This does not change the approved art direction; these remain fallback/legacy implementation surfaces until replacement assets and renderers are verified.

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

| Dungeon core object-marker set v1 | `CONCEPT` | `concepts/dungeon-object-markers-v1.svg` and color/grayscale renders; stair, crossed-blade trap, open-ring sorcery, helmet/spear enemy, and handled pot, checked at 26px with localized 28% fog sample | Keep as visual vocabulary; later compare against renderer and topology screenshots before implementation readiness |
