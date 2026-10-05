# Phase A Visual Specification v1

Status: `APPROVED_FOR_IMPLEMENTATION`
Scope: CSS token layer + Title / Yellow Turban Dungeon / standard Battle vertical slice
Decision baseline: `DEC-025-ART_DIRECTION.md`
Visual baseline: `VISUAL_BIBLE_V1.md`

## 1. Intent

Replace the current dark lacquer presentation with a unified warm-hanji, ink-structure, restrained-vermilion interface. Preserve the existing gameplay flow, DOM behavior, Canvas input, topology, and fallback renderers. This is a skin and presentation task.

The three screens are a connected vertical slice:
1. Title and expedition selection
2. Yellow Turban Dungeon exploration
3. Standard battle in the current dungeon

No new screen flow, game rule, reward, or content decision is part of this work.

## 2. Token Contract

Use these CSS custom properties as the visual source of truth. Existing names may be retained as aliases during migration, but components should consume the semantic tokens.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#171513` | Primary text, outlines, brush labels |
| `--ink-soft` | `#302A25` | Secondary ink surface, control borders |
| `--paper` | `#E8DDC4` | Main hanji ground |
| `--paper-light` | `#F2EBDD` | Raised cards and readable content surfaces |
| `--paper-shadow` | `#D5C8AD` | Inset fields, dividers, inactive tracks |
| `--vermilion` | `#A64032` | Primary action, current target, warning emphasis |
| `--vermilion-light` | `#B34535` | Hover/pressed state only |
| `--muted` | `#756C63` | Supporting copy and subdued labels |
| `--blue-gray` | `#77838D` | Ally/secondary semantic marker, limited |
| `--jade` | `#668274` | Healing/success semantic, limited |
| `--energy` | `#A77D42` | Energy fill only; never a gold frame system |
| `--line` | `#51483E` | Thin structural ink line |
| `--line-soft` | `#B8AA90` | Quiet paper divider |

Rules:
- The viewport is primarily paper colored; dark ink is reserved for typography, map marks, and selected brush surfaces.
- Use a subtle CSS paper grain only if it does not reduce text contrast or tile clarity. Prefer low-opacity gradients/noise-free texture; do not add a large image dependency.
- Remove lacquer gradients, gold borders, black page wells, and pixel-font UI styling from the main theme.
- Keep body/stat text in the existing legible sans-serif stack. Display serif may be used for the game title and short section labels only.
- HP uses vermilion. Energy uses muted ochre. Neither bar uses glossy gradients.
- All interactive controls must have a 44px minimum touch target, except tightly packed battle mode/speed controls may use a 40px visual height only if their full hit area remains at least 44px.

## 3. Shared Component Language

### Panels
- Warm paper-light fill, 1px ink-soft border, restrained offset shadow.
- No double-rule, corner studs, gold trim, or repeated ornamental frame.
- Use spacing and alignment to group information.

### Section labels
- Short black-ink brush strip with warm paper text.
- Reuse one shape, padding, and type scale across screens. A slightly imperfect edge may be CSS-only; no hand-drawn SVG asset is required for Phase A.
- Keep labels short and never place body copy on a textured strip.

### Buttons
- Primary: flat vermilion with high-contrast light text.
- Secondary: paper-light fill, ink border and text.
- Selected: thin vermilion edge or a small vermilion marker; no gold glow.
- Disabled: reduce contrast carefully while retaining legibility.
- Focus-visible state must be obvious.

### Bars and status
- HP: vermilion fill; energy: muted ochre fill; neutral track: paper-shadow with ink-soft edge.
- Numeric values remain readable at 390px width and use tabular numerals.

## 4. Screen Composition

### Title / Expedition Selection
- Page ground: warm hanji.
- Title banner: an open paper composition, not a dark framed hero card. Use the existing ruler portrait row as a temporary fallback and keep it secondary to the title.
- Game title: ink black, display face; vermilion may mark a small seal/accent only.
- Campaign, ruler, and general selection stay in the existing order and retain their existing behavior.
- Selection state must be clear by border/marker and text, not color alone.
- Resume/Start primary action uses vermilion.
- The current pixel portraits remain fallback assets until the Ruler Master phase; do not describe them as final artwork.

### Yellow Turban Dungeon
- Preserve the current procedural map topology, coordinate system, Canvas drawing/input behavior, fog visibility rules, and object interactions.
- Explored floor: light paper/stone ground with a restrained uneven ink edge.
- Wall: heavier ink perimeter and low-contrast stone marks.
- Corridor: same paper ground, narrower and directionally legible.
- Unexplored cells: uneven charcoal ink fog with soft variation; no uniform black rectangle.
- Stairs, gate, chest, pot, trap, and sorcery use distinct silhouettes. In this phase, simplify existing procedural marks by silhouette and value grouping; production illustration icons remain a later asset phase.
- Player marker: single warm-vermilion/ivory silhouette, distinct from enemies.
- Enemy marker: ink/charcoal silhouette with a restrained vermilion warning mark.
- Keep tile boundaries and explored/fog transitions readable on a 390×844 viewport. Do not put decorative texture over text or hide a tile's logical state.
- HUD, party, movement pad, map, controls, and log become paper components with thin ink separation.

### Standard Battle
- Battlefield background: light paper field with sparse ink wash at the edges; no full-screen dark well.
- Preserve existing 5v5 formation, target selection, turn order, combat actions, Smart Auto/Repeat/All Attack, and speed controls.
- Ally/enemy cards use the same paper card base. Distinguish sides with a narrow blue-gray or vermilion semantic stripe and explicit labels/icons.
- Active turn: thin vermilion keyline plus text marker; no gold glow or luminous shadow.
- Timeline: horizontally scrollable paper chips with clear order; current actor has a vermilion underline/seal.
- Attack/confirm: vermilion primary. Skill, item, formation, and mode controls use neutral secondary styling.
- Hit feedback may use one short ink-brush stroke or outline pulse. No particle burst; preserve reduced-motion behavior.
- KO state uses reduced saturation/opacity while retaining readable name and status.

## 5. Existing Web Surface Mapping

The current client already supplies the interaction surfaces. Prefer CSS retheme first:
- Title: `.title-banner`, `.title-row`, `.panel`, `.pick`, `.primary`, `.selected`
- Dungeon: `.hud`, `.party`, `.member`, `.pad`, map Canvas, `.log`
- Battle: `.field`, `.formation`, `.unit`, `.timeline`, `.modes`, `.tag`, `.bar`
- Sheets: `.modal`, `.sheet`, `.choice`

Only add small `main.ts` class/data attributes if CSS cannot target the three screen contexts clearly. Do not change command handling or domain behavior. If reaching this visual result requires changing a domain module, stop and record `VISUAL_ADAPTER_REQUIRED` with the reason.

## 6. Asset/Fallback Boundary

- Phase A may continue using current procedural portraits, sprites, icons, and map tiles as explicit fallback.
- Do not remove or silently pixelize any future illustration asset.
- Asset selection must prefer a new ink-graphic-novel asset when present and fall back safely when absent.
- Ruler portrait/full-body/token master creation is Phase B; production illustrated dungeon objects are Phase C; item set is Phase D.

## 7. Acceptance Evidence

Codex implementation is ready to begin when this spec is paired with the approved reference boards. Implementation must provide:
- `npm test` PASS
- `npm run build:web` PASS
- Project UI smoke/e2e result, or `NOT_RUN` with reason
- 390×844 screenshot evidence for Title, Dungeon, and standard Battle
- Console errors = 0 and page errors = 0 in the smoke session
- No clipping of core actions or party/map/battle data
- Touch targets >=44px
- Missing-asset fallback checked
- Battle/Dungeon/Run/Content domain directories unchanged

Do not report visual acceptance from a CSS diff alone. Work performs visual QA against the screenshot evidence after implementation.
