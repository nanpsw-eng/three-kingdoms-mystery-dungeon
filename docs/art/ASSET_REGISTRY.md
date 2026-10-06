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
| Dungeon floor/wall/corridor/fog/object illustrations | `MASTER_REQUIRED` | Phase C visual language | Create after Phase A/B |
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
