// Shared pixel-art finishing: edge-based volume shading + selective ("sel-out") colored outlines.

export type Grid = (string | null)[][];

/** Darkens (amount < 0) or lightens (amount > 0) a #rrggbb color. */
export function shade(hex: string, amount: number): string {
  const v = parseInt(hex.slice(1), 16);
  const f = (c: number): number => Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  const r = f((v >> 16) & 255), g = f((v >> 8) & 255), b = f(v & 255);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/** Shifts a color toward warm light or cool shadow (hue-shifted shading reads more painterly). */
function tone(hex: string, light: boolean): string {
  const v = parseInt(hex.slice(1), 16);
  let r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  if (light) { r = Math.min(255, r + 26); g = Math.min(255, g + 20); b = Math.min(255, b + 6); }
  else { r = Math.round(r * 0.72); g = Math.round(g * 0.74); b = Math.min(255, Math.round(b * 0.84 + 10)); }
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/** Pixels that are already detail (eyes, mouth, whites) and must not be re-shaded. */
export const DETAIL = new Set(["#1a120c", "#111111", "#7a3b2a", "#8a3b2a", "#5a2a1a", "#f4f1ea", "#ffffff", "#0b0806"]);

/**
 * Finishes a figure grid in place:
 * 1. light from the upper-left: edge pixels facing up/left get a warm highlight, down/right a cool shadow;
 * 2. sel-out outline: each outline pixel takes a deep tone of the fill it borders, darkest at the base.
 */
export function finish(g: Grid): void {
  const h = g.length;
  const w = g[0]!.length;
  const src = g.map((row) => [...row]);
  const empty = (x: number, y: number): boolean => x < 0 || y < 0 || x >= w || y >= h || src[y]![x] == null;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = src[y]![x];
    if (c == null || DETAIL.has(c)) continue;
    const top = empty(x, y - 1) || (src[y - 1]?.[x] !== c && empty(x - 1, y - 1));
    const left = empty(x - 1, y);
    const bottom = empty(x, y + 1);
    const right = empty(x + 1, y);
    if (right || bottom) g[y]![x] = tone(c, false);
    else if (top || left) g[y]![x] = tone(c, true);
  }
  const marks: [number, number, string][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (src[y]![x] != null) continue;
    const near = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => src[y + dy!]?.[x + dx!]).find((c) => c != null);
    if (near == null) continue;
    const below = src[y - 1]?.[x] != null; // outline pixel under the figure (base) is darkest
    marks.push([x, y, DETAIL.has(near) ? "#1a120c" : shade(near, below ? -0.78 : -0.66)]);
  }
  for (const [x, y, c] of marks) g[y]![x] = c;
}
