# Claude Content Visual Delta — 2026-10-06

Status: `DESIGN_WORK_IN_PROGRESS`
Content source: `main` at `82b38b4bf877a015e99f53ae551bfedb45bbc790`
Latest Claude feature: PR #10, Claude commit `3b5bbf3b5b6bfdb7508cca815213da90c4accb5c`, merged to `main`
Art baseline: DEC-025 + Visual Bible v1 — unchanged and approved.

## 1. Verified Product Delta

Claude Code expanded the playable campaign/content set through E9 and merged these follow-up surfaces:
- Codex and achievements view with four tabs: characters, bosses, achievements, items.
- Expandable character entries with class, stats, skills, and short historical note.
- 44-character / 39-boss / 16-achievement / 22-item collection surfaces in the current Codex view model. Tab labels display earned/unlocked/seen count over total, not total-only counts.
- Historical notes for the roster and unlock hints.
- Line-by-line story scenes with speaker portrait, progress `n/m`, next/tap progression, skip behavior, and deferred choice presentation.
- Save-compatibility guard for removed/locked campaign or character ids.
- Story art queue records 37 added ruler/general designs and about 90 enemy/boss names; stable ids and aliases are in `docs/art/STORY_ART_QUEUE.md` on current `main`.

The additions are already merged. Do not duplicate engine/content work while designing their visual representation.

## 2. Design Deliverables Created Here

### Sima Yi character concept
`concepts/sima-yi-master-concept-20261006.jpg` shows bust, full-body, and small exploration token using one identity. It is a **CONCEPT**, not approved production art. Its charcoal/black robe, narrow crimson accents, mature face, and quiet strategist posture follow DEC-025. The final design must be checked against the three original ruler masters before approval.

### Codex character detail concept v2
`concepts/codex-character-detail-mockup-v2-20261006.jpg` is a visual concept for the current character tab. It uses data-driven count fractions and preserves the paper/ink/vermilion family. It is **CONCEPT** only. The enlarged Sima Yi artwork is mood/composition reference; current code uses a 40px portrait in the expandable row, so do not copy the oversized portrait directly into a final compact layout.

## 3. Codex Tab Visual Rules

Shared shell:
- Keep the current full-screen Codex entry point and close action.
- Header and tabs stay fixed while the long record list scrolls.
- Use warm paper cards, thin ink dividers, one consistent brush label, and vermilion selected-state mark.
- Each tab displays the existing dynamic fraction: unlocked/total, defeated/total, earned/total, or seen/total.
- All rows and tab buttons retain >=44px hit areas and visible keyboard focus.

### Characters
- Stable order follows the content registry.
- Each row uses one bust portrait thumbnail, name, and class.
- Locked character: readable name + unlock hint; show a subdued monochrome silhouette or asset variant, never a nearly invisible darkened image.
- Expanded row: stats as aligned columns, skill names/icons in a compact group, and the historical note in a clearly separated text block.
- Avoid repeating the full portrait or scenic art behind body text.

### Bosses
- Group entries under campaign headings in campaign order.
- Defeated and not-yet-defeated states use distinct silhouette/value treatment plus explicit text; do not rely on color alone.
- Undiscovered/unbeaten names stay concealed where the current content model returns unknown; preserve its reveal semantics.
- Boss portraits are phase-F assets, not required before Codex UI styling.

### Achievements
- Render as a compact list with a small ink seal/check symbol, title, and unlock hint.
- Earned: dark ink glyph with a limited vermilion stamp.
- Un-earned: paper-gray silhouette with the title and hint still legible.
- No gold medals, gacha rarity, or decorative card frame.

### Items
- Use a responsive silhouette grid for the 22 item records.
- Seen item: family silhouette from the item visual language (food, medicine, scroll, weapon, armor, treasure).
- Unseen item: distinct “unknown” wrapped bundle / covered object, not a generic question mark alone.
- Names and discovery state remain accessible as text; silhouette supplements rather than replaces the label.

## 4. Story Scene UI Visual Rules

The newly implemented reveal interaction stays unchanged:
- Speaker portrait and speaker name sit beside the current line on a paper panel.
- Narration uses an inset paper strip with a narrow ink rule.
- Progress `n/m` is a small but readable marker, aligned away from the primary action.
- “다음” / tap advances one line; “건너뛰기” remains secondary.
- Choices appear only when the current implementation exposes them.
- Use a single brush stroke for emphasis, not full-frame illustration behind text.
- Reduced-motion preference remains respected.

## 5. Character and Enemy Art Priority

Source order remains `docs/art/STORY_ART_QUEUE.md`; use stable content ids and the existing `ART_ALIASES` mapping. Do not invent replacement ids.

1. Establish the original three ruler master set from Visual Bible v1: Liu Bei, Cao Cao, Sun Quan. This remains the style consistency gate.
2. Continue Sima Yi as the first new ruler concept because the current story art queue explicitly prioritizes him. Keep today’s sheet at `CONCEPT` until compared with the three-master set.
3. Design final campaign bosses in the queue order: Dong Zhuo, Lü Bu, Yuan Shao, Cao Cao, Cao Ren, Lu Xun, Meng Huo, Sima Yi.
4. Design new playable generals, then common enemies.
5. Every character master must define bust, full-body, and exploration token as the same person. Enemy groups may share uniform language but must remain silhouette-distinct.

## 6. Current Acceptance Boundary

- The generated images are compact repository concept references, not final production assets.
- The original generated high-resolution images remain the master concept outputs; the repository copies are downscaled JPEG references.
- UI concept count values are illustrative data states; actual counts must come from the existing Codex view-model.
- No gameplay logic, save behavior, Codex data, campaign content, or product baseline changes are authorized by this visual document.
- Next design completion work: create the three original ruler master concepts, refine Sima Yi against them, then produce separate visual studies for the Bosses/Achievements/Items tab states and story scene sheet.


## 7. Ruler Master Concept Review

A comparison concept now exists at `concepts/ruler-master-comparison-20261006.jpg`.
- Liu Bei reads through the long tapered beard, warm ivory layers, and open gesture.
- Cao Cao reads through a shorter clipped beard, more compact posture, and charcoal/deep-crimson layers.
- Sun Quan reads through a younger near-clean-shaven face and cool blue-gray/dark-green layers.
- This is still `CONCEPT`: reduce the residual metallic ornament, verify each identity at thumbnail size, and create separate reusable bust/full-body/token masters before marking the set approved.

## 8. E2 Boss Concepts

A Dong Zhuo / Lü Bu comparison concept now exists at `concepts/dong-zhuo-lu-bu-boss-concept-20261006.jpg`.
- Dong Zhuo: broad, low visual mass; older face; oxblood/charcoal robe and court armor.
- Lü Bu: tall, vertical silhouette; restrained plume/headwrap; halberd as the principal identifier.
- Keep both at `CONCEPT`: current armor has more surface ornament than the final UI language should use. Simplify for production art and test the token silhouettes at small sizes.

## 9. Work-Only Next Design Steps

1. Design the Bosses, Achievements, and Items Codex tab states as a cohesive screen sheet.
2. Design the line-by-line story scene panel with speaker portrait, `n/m`, next/tap, skip, and choice states.
3. Refine and approve the three original ruler master assets; align Sima Yi to that approved identity system.
4. Continue the campaign boss and playable-general queue from `STORY_ART_QUEUE.md`.

These are visual-design tasks in this Work. No separate Codex implementation assignment is being issued.


## 10. Codex Secondary Tab Concept Review

Visual study: `concepts/codex-secondary-tabs-20261006.jpg`.
- Bosses: campaign section labels, explicit defeated/not defeated states, and concealed unknown boss silhouettes.
- Achievements: ink seal mark for earned state; muted but legible symbol and hint for unearned state.
- Items: six item-family silhouettes and a covered unknown bundle, with text labels.
- The board is a concept; sample counts/labels are illustrative. Use actual view-model data and group order.
- Reduce landscape/branch decorations if they lower row contrast. Final renderer should prefer the code's campaign-grouped entries and item grid semantics.

## 11. Story Scene UI Concept Review

Visual study: `concepts/story-scene-ui-20261006.jpg`.
- Shows a dungeon dimmer behind a paper sheet, a mid-reveal state, and a final choice state.
- The scene title, portrait beside text, progress marker, next/tap action, skip, and deferred choices match the current behavior.
- The portrait in the left study is intentionally oversized for concept readability; the production row uses a 48px portrait. Keep the final face near text and never behind copy.
- Sample dialogue/choices are illustrative; actual content remains owned by story data.
- Sheet scroll and fixed actions need a 390×844 layout check before visual approval.

## 12. Work-Only Design Queue

1. Refine the ruler master concept into separately usable bust/full-body/token design references, remove excess metallic details, and verify silhouette recognition.
2. Bring the E2 boss duo and Sima Yi concepts into that shared master language.
3. Create independent portrait studies in the existing Story Art Queue priority: Sima Yi, campaign bosses, playable generals, then common enemies.
4. Expand item-family icon silhouettes and enemy faction visual language after the Codex tab concepts are stable.

No separate Codex implementation assignment is being issued; these are design tasks for this Work.


## 13. E2 Campaign Boss Trio Concept Review

Visual study: `concepts/e2-boss-trio-yuan-shao-cao-cao-cao-ren-20261006.jpg`.
- Yuan Shao: tall ivory/plum silhouette, formal staff, aristocratic authority.
- Cao Cao battle variant: compact charcoal mass, clipped beard, short command sword, one deep-crimson cue. Keep the campaign boss variant compatible with, but visually distinct in pose from, the original ruler master.
- Cao Ren: broad slate/blue-gray defender, shield-first silhouette, straight spear, restrained beige under-layer.
- Each column pairs bust, full body, and small token to test same-character continuity; the token shapes are readable by staff, short sword, and shield.
- This is a generated concept sheet, not production art. Keep all three at `CONCEPT`; reduce residual metal/headpiece detail, verify small-token recognition, and create separate clean masters before approval.
- This asset set follows the E2 finale priority already listed in `STORY_ART_QUEUE.md`; character ids and story aliases remain unchanged.



## 14. E7 / E8 Campaign Boss Duo Concept Review

Visual study: `concepts/lu-xun-meng-huo-boss-concept-20261006.jpg`.
- Lu Xun (E7): composed younger strategist in cool blue-gray, dark teal, and warm beige; folding command fan leads the narrow vertical token silhouette.
- Meng Huo (E8): broad mature ruler in forest green, earth brown, and beige; shield-first stance with short spear creates a wide silhouette. Treatment stays dignified and grounded rather than monstrous or caricatured.
- Bust, full-body, and token repeat the same face, clothing blocks, and prop cues. Both characters remain `CONCEPT`; generated armor detail and token clarity need review before separate reusable masters are approved.
- The concept translates the existing E7/E8 bosses in `STORY_ART_QUEUE.md`; ids, aliases, story text, and encounter behavior remain unchanged.



## 15. Ruler Master Comparison v2

Visual study: `concepts/ruler-master-comparison-v2-20261006.jpg`.
- The revised board retains Liu Bei’s long refined beard, warm open silhouette; Cao Cao’s clipped beard, compact dark mass; and Sun Quan’s younger blue-gray/dark-green presence.
- It removes the earlier battle/background scenery and reduces metallic ornament so the three identities compare directly on hanji.
- Each character now has bust, full-body, and a simplified token in one column. The repeated face, palette, and outline language support cross-view recognition.
- Status remains `CONCEPT`: the sheet is not a production export or final approval. Next validation is separate portrait/full-body/token masters at intended sizes, including grayscale/silhouette reading and mobile thumbnail review. Avoid assuming tiny generated token detail will survive raster reduction.


## 16. Ruler Master and Sima Yi Refinement

Current studies:
- `concepts/ruler-master-comparison-v2-20261006.jpg`
- `concepts/sima-yi-master-concept-v2-20261006.jpg`

Ruler comparison v2 is the cleaner shared line/paper reference: no battle scenery, reduced metal trim, and one bust/full-body/token sequence per ruler. Sima Yi v2 keeps his charcoal/deep-crimson palette, narrow strategist gaze, neat beard, and folding command fan while adopting the same subdued hanji presentation.

Both stay `CONCEPT`. This is a consistency pass, not approval of production art. The next review must use separate deliverables at their intended sizes: bust portrait crop, full-body combat/event illustration, and simplified exploration token. Check silhouette recognition in monochrome and at the actual small UI scale before the ruler set becomes an implementation master.


## 17. Individual Ruler Master Concept Sheets

The ruler comparison v2 is now accompanied by individual character sheets:
- `concepts/liu-bei-master-concept-v1-20261006.jpg`
- `concepts/cao-cao-master-concept-v1-20261006.jpg`
- `concepts/sun-quan-master-concept-v1-20261006.jpg`

Each sheet repeats bust portrait, full-body, and simplified exploration token for one ruler, using the same hanji ground and ink contour system. Distinguishing keys remain long tapered beard/open warm posture for Liu Bei; clipped beard/compact charcoal silhouette for Cao Cao; younger nearly clean-shaven face/cool blue-gray and dark green for Sun Quan. These separate sheets are `CONCEPT`, not approved production art.

Before approval, inspect the actual intended 40px portrait size and in-game token size; test silhouette/value recognition without color. Simplify small belt hardware if it competes with the face, beard, sash, or pose. The downscaled repository JPEGs are for design continuity only.


## 18. Portrait Asset Compatibility and 40px Review

Verified against the current `main` source (`web/src/codex.ts`, `web/src/assets.ts`, `web/style.css`):
- Character Codex rows request `ui.portrait(c.id, 40, ...)`; story speaker art is 48px.
- `assets.ts` routes external portraits through `pixelize()`, whose default output is 48px with a 28-color palette. It crops the center square before palette reduction. The global CSS also applies pixelated image rendering to `img.px` and canvas elements.
- The Codex locked portrait currently receives grayscale + `brightness(0.35)`. That is below this design system's intended readable locked state; retain legible name/unlock hint and use a distinct silhouette/value overlay rather than near-black art.

The new square bust references are composition studies sized for portrait use, but remain `CONCEPT`. Do not register them as production-ready or run them through the pixelizing portrait loader. Required visual integration contract:
1. Preserve a non-pixelized ink portrait path for bust art; render at the requested 40px/48px CSS size without palette reduction or pixelated interpolation.
2. Keep each source as a clean individual square portrait, not the wide composite character sheet. Face, beard/hair identity, and key palette blocks must survive the 40px crop.
3. Keep full-body art and exploration token as separate assets with stable ids. The existing 16×16 procedural sprite is a fallback, not an image export size for final art.
4. Locked state must retain readable silhouette and contrast without relying on color alone.

Local 40px browser preview, grayscale screenshot, and token-scale in-game QA are `NOT_RUN`; only the source contract and generated square compositions were inspected. This is a design/renderer compatibility gap, not a change to domain or Codex data logic.


## 19. Ruler Exploration Token Concept Review

Separate exploration-token studies are now recorded:
- `concepts/liu-bei-exploration-token-concept-v2-20261006.png`: warm ivory / beige robe, muted crimson sash, long beard, open but grounded stance. Version 2 restores clear margin below both boots.
- `concepts/cao-cao-exploration-token-concept-v1-20261006.png`: compact charcoal silhouette, deep-crimson cue, clipped beard, short command sword.
- `concepts/sun-quan-exploration-token-concept-v1-20261006.png`: cool blue-gray and dark-green blocks, mature near-clean-shaven face, command tablet, upright balanced posture.

All three remain `CONCEPT`. Their repository PNGs are compact review references with transparent backgrounds; they are not production masters. Preserve transparency in eventual exports, keep identity cues to large silhouette and palette blocks, and test each against both hanji floor and ink fog at the actual 24–28px map-cell display size. Do not add facial micro-detail intended only for enlarged review.

The current map renderer uses 16×16 procedural figures and pixelated canvas output. Keep that behavior available as fallback. A distinct non-pixel token-rendering path is a prerequisite for implementation; visual check of generated PNGs at runtime tile size, fog contrast, and grayscale is `NOT_RUN`. No map topology or interaction change is implied.


## 20. Individual Ruler Full-Body Concept Review

Separate full-body reference images now pair with the ruler bust and exploration-token studies:
- `concepts/liu-bei-full-body-concept-v1-20261006.jpg`: complete ivory/beige layered robes, muted-crimson sash, long tapered beard, and an open, grounded gesture.
- `concepts/cao-cao-full-body-concept-v1-20261006.jpg`: compact charcoal silhouette with deep-crimson inner layers and a short command sword; armor ornament remains a simplification point.
- `concepts/sun-quan-full-body-concept-v1-20261006.jpg`: mature-young, clean-shaven face with balanced upright blue-gray/dark-green clothing and a narrow command tablet.

These three images are `CONCEPT` references, reduced to 256×384 on canonical hanji for repository continuity. Keep the high-resolution generated masters separate from these downscaled comparison references. The ruler set is not approved yet: compare each face, broad palette blocks, garment silhouette, and identifying prop across bust / full-body / token; test monochrome reading and actual mobile render sizes before moving to `APPROVED` or `IMPLEMENTATION_READY`.


## 21. Ruler Scale Review and Token Revision

Review board: `concepts/ruler-scale-review-revised-20261006.jpg`.
- Bust crops were reduced to 40px and 48px for review. The shared face/style treatment remains coherent, with Liu Bei's long beard, Cao Cao's clipped beard, and Sun Quan's mature-young clean-shaven face surviving the small crop.
- Tokens were reduced to 24px and 28px, then shown on warm hanji and muted ink fog. Broad palette blocks and whole-body silhouettes remain distinguishable.
- The first 24px grayscale pass showed Cao Cao's sword and Sun Quan's command tablet merged into their clothing. Both were revised: Cao Cao v2 projects a short straight sword beyond the cloak; Sun Quan v2 places the command tablet outside his robe contour. Their v1 token concepts are superseded for current review.
- Revised monochrome silhouettes now separate Liu Bei's long-beard/open-sleeve mass, Cao Cao's compact sword-led shape, and Sun Quan's upright tablet-led pose. These are design-board simulations, not live map-canvas captures.
- The Ruler Master visual identity system is `APPROVED` as a design reference. Individual bust/full-body/token images remain `CONCEPT`; downscaled references are not production exports.
- Runtime portrait review, actual map-cell and fog behavior, locked-state QA, and browser/mobile clipping checks remain `NOT_RUN`. The current portrait loader pixelizes art and the current map renderer uses procedural 16×16 figures; no generated concept is approved for those paths yet.


## 22. Phase C Dungeon Graphic Concept Set v1

Concept atlases:
- `concepts/dungeon-surfaces-concept-v1-20261006.jpg`: explored hanji floor, ink-outlined stone wall, directional corridor, soft charcoal fog, ancient stairs, and timber gate.
- `concepts/dungeon-objects-concept-v1-20261006.jpg`: chest, food/storage pot, floor trap, sorcery circle, player marker, Yellow Turban scout, neutral environment-wash marker, and pouch/medicine find.
- `concepts/dungeon-set-scale-review-20261006.jpg`: each source cell reduced to a 26px square for an initial readability check, then enlarged for review.

Initial design review:
- Floor, wall, corridor, fog, stairs, and gate have distinct value and structure. Fog is a layered ink wash, not a flat black tile.
- Chest and pot have different silhouettes; the scout's ochre headband and separated spear read apart from the warm-ivory player marker.
- Trap and sorcery currently share a circular stone base. Their current radial marks versus violet seal cues help, but silhouette-only separation is too weak; revise the trap into a plate/line mechanism and simplify sorcery marks into a more open brush seal.
- The environment wash is intentionally abstract and does not name or create a gameplay modifier. Keep overlays light enough to preserve the explored tile underneath until mapped to existing content ids.
- All three references remain `CONCEPT`. The reduction board is a cropped atlas simulation, not a live map or canvas capture. Tile collisions, room/corridor seams, fog adjacency, hit areas, mobile behavior, and gameplay are `NOT_RUN`.
- Do not change dungeon topology, turn rules, content data, or Canvas interaction. Keep the procedural renderer as fallback; current implementation compatibility remains unverified.
