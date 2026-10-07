import type { DungeonEngine, Point } from "../../src/index.js";
import { assetPainting, assetSurface, assetTile, assetToken } from "./assets.js";
import { figureCanvas, iconCanvas } from "./sprites.js";

export const VIEW_RADIUS = 7;
const VIEW = VIEW_RADIUS * 2 + 1;
const T = 16;

// Deterministic per-tile noise so floors look hand-laid but never flicker.
function hash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function makeTile(draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = T; canvas.height = T;
  draw(canvas.getContext("2d")!);
  return canvas;
}

function speckle(ctx: CanvasRenderingContext2D, seed: number, colors: string[], count: number): void {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(hash(i, seed, 7) * colors.length)]!;
    ctx.fillRect(Math.floor(hash(i, seed, 1) * T), Math.floor(hash(i, seed, 2) * T), 1, 1);
  }
}

// Stone slabs for rooms: two staggered slab rows with grout and chips.
const FLOOR = [0, 1, 2, 3].map((variant) => makeTile((ctx) => {
  ctx.fillStyle = "#cfc2a5"; ctx.fillRect(0, 0, T, T);
  ctx.fillStyle = "#ddd1b6"; ctx.fillRect(1, 1, 6, 6); ctx.fillRect(9, 1, 6, 6); ctx.fillRect(1, 9, 14, 6);
  ctx.fillStyle = "#9c8f78";
  ctx.fillRect(0, 7, T, 1); ctx.fillRect(0, 15, T, 1); ctx.fillRect(7, 0, 1, 7); ctx.fillRect(variant % 2 ? 4 : 11, 8, 1, 7);
  speckle(ctx, variant + 10, ["#b8aa90", "#e8ddc4", "#a39579"], 7);
}));
// Packed earth for corridors.
const CORRIDOR = [0, 1, 2].map((variant) => makeTile((ctx) => {
  ctx.fillStyle = "#c2b495"; ctx.fillRect(0, 0, T, T);
  speckle(ctx, variant + 20, ["#ab9d80", "#d2c5a8", "#9c8f78"], 18);
}));
// Wall block: dark cap, brick face when standing above floor.
const WALL_CAP = makeTile((ctx) => {
  ctx.fillStyle = "#1b1815"; ctx.fillRect(0, 0, T, T);
  ctx.fillStyle = "#2c2723"; ctx.fillRect(1, 1, T - 2, T - 2);
  speckle(ctx, 30, ["#3a342e", "#171513"], 10);
});
const WALL_FACE = makeTile((ctx) => {
  ctx.fillStyle = "#1b1815"; ctx.fillRect(0, 0, T, 5);
  ctx.fillStyle = "#5c544a"; ctx.fillRect(0, 5, T, 11);
  ctx.fillStyle = "#3d3630";
  for (const y of [5, 10, 15]) ctx.fillRect(0, y, T, 1);
  for (const [x, y] of [[4, 6], [12, 6], [0, 11], [8, 11]] as const) ctx.fillRect(x, y, 1, 4);
  ctx.fillStyle = "#6e665b"; ctx.fillRect(1, 6, 2, 1); ctx.fillRect(9, 11, 2, 1);
});
const STAIRS = makeTile((ctx) => {
  ctx.fillStyle = "#171513"; ctx.fillRect(1, 1, 14, 14);
  const steps = ["#e8ddc4", "#c2b495", "#8f8270", "#51483e"];
  steps.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(2 + i * 2, 2 + i * 3, 12 - i * 4, 3); });
  ctx.fillStyle = "#a64032"; ctx.fillRect(7, 13, 2, 1);
});
const GATE = makeTile((ctx) => {
  ctx.fillStyle = "#6a3e1e"; ctx.fillRect(0, 0, T, T);
  ctx.fillStyle = "#4a2a12"; for (const x of [3, 7, 11]) ctx.fillRect(x, 0, 1, T);
  ctx.fillStyle = "#7d8794"; ctx.fillRect(0, 3, T, 2); ctx.fillRect(0, 11, T, 2);
  ctx.fillStyle = "#c9d2db"; for (const x of [1, 6, 13]) { ctx.fillRect(x, 3, 1, 1); ctx.fillRect(x, 11, 1, 1); }
});
const TRAP_COLORS: Record<string, string> = {
  rockfall: "#9a8a7a", "poison-needle": "#7ae07a", "fire-circle": "#e8603a", pit: "#0e0b08", "alarm-bell": "#e8b84a",
  "food-loss": "#c58f3a", "confusion-circle": "#c58fe0", "teleport-circle": "#6fc3ff",
};
function trapTile(type: string): HTMLCanvasElement {
  return makeTile((ctx) => {
    const c = TRAP_COLORS[type] ?? "#e0a030";
    if (type === "pit") { ctx.fillStyle = "#0e0b08"; ctx.fillRect(3, 3, 10, 10); ctx.fillStyle = "#3a2f24"; ctx.fillRect(3, 3, 10, 1); return; }
    if (type.endsWith("circle")) {
      ctx.fillStyle = c;
      for (const [x, y] of [[6, 2], [9, 2], [3, 5], [12, 5], [3, 9], [12, 9], [6, 12], [9, 12], [7, 7], [8, 8], [7, 8], [8, 7]] as const) ctx.fillRect(x, y, 1, 1);
      for (let i = 4; i < 12; i++) { ctx.fillRect(i, 3, 1, 1); ctx.fillRect(i, 12, 1, 1); ctx.fillRect(3, i, 1, 1); ctx.fillRect(12, i, 1, 1); }
      return;
    }
    ctx.fillStyle = "#1a120c"; ctx.fillRect(4, 10, 8, 2);
    ctx.fillStyle = c; for (const x of [5, 8, 11]) { ctx.fillRect(x - 1, 7, 1, 3); ctx.fillRect(x - 1, 6, 1, 1); }
  });
}
const TRAPS = new Map<string, HTMLCanvasElement>();
const BANNER = makeTile((ctx) => {
  ctx.fillStyle = "#5e3a1c"; ctx.fillRect(4, 1, 1, 14);
  ctx.fillStyle = "#3a6ea5"; ctx.fillRect(5, 2, 7, 7); ctx.fillStyle = "#e8b84a"; ctx.fillRect(7, 4, 3, 3);
  ctx.fillStyle = "#3a6ea5"; ctx.fillRect(5, 9, 3, 2); ctx.fillRect(9, 9, 3, 2);
});
const EVENT = makeTile((ctx) => {
  ctx.fillStyle = "#e9dcb5"; ctx.fillRect(3, 4, 10, 8); ctx.fillStyle = "#8a5a2b"; ctx.fillRect(2, 3, 12, 1); ctx.fillRect(2, 12, 12, 1);
  ctx.fillStyle = "#555555"; for (const y of [6, 8, 10]) ctx.fillRect(5, y, 6, 1);
  ctx.fillStyle = "#c0392b"; ctx.fillRect(10, 9, 2, 2);
});
const SORCERY = makeTile((ctx) => {
  ctx.fillStyle = "#b05ad9";
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; ctx.fillRect(Math.round(7.5 + Math.cos(a) * 6), Math.round(7.5 + Math.sin(a) * 6), 1, 1); }
  ctx.fillStyle = "#f2c230"; ctx.fillRect(7, 3, 2, 10); ctx.fillRect(3, 7, 10, 2);
  ctx.fillStyle = "#c0392b"; ctx.fillRect(7, 7, 2, 2);
});

export interface MapOptions {
  readonly playerKey: string;
  readonly enemyKey: (groupId: string) => string;
}

export function drawMap(canvas: HTMLCanvasElement, dungeon: DungeonEngine, options: MapOptions): void {
  const ratio = window.devicePixelRatio || 1;
  const css = canvas.clientWidth || 360;
  const cell = Math.max(T, Math.floor((css * ratio) / VIEW));
  const size = cell * VIEW;
  if (canvas.width !== size) { canvas.width = size; canvas.height = size; }
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#3a352f";
  ctx.fillRect(0, 0, size, size);
  const origin = { x: dungeon.position.x - VIEW_RADIUS, y: dungeon.position.y - VIEW_RADIUS };
  // ink pooling: soft per-cell variation so unexplored space reads as wash, not a flat black block
  for (let vy = 0; vy < VIEW; vy++) {
    for (let vx = 0; vx < VIEW; vx++) {
      const n = hash(origin.x + vx, origin.y + vy, 11);
      // soft blots larger than a cell, low alpha, so neighbouring cells blend instead of forming a checkerboard
      const blot = ctx.createRadialGradient((vx + 0.5) * cell, (vy + 0.5) * cell, 0, (vx + 0.5) * cell, (vy + 0.5) * cell, cell * 1.1);
      blot.addColorStop(0, n < 0.5 ? `rgba(23, 21, 19, ${0.1 + n * 0.3})` : `rgba(92, 84, 74, ${(n - 0.5) * 0.3})`);
      blot.addColorStop(1, "rgba(23, 21, 19, 0)");
      ctx.fillStyle = blot;
      ctx.fillRect((vx - 0.6) * cell, (vy - 0.6) * cell, cell * 2.2, cell * 2.2);
    }
  }
  const at = (p: Point): [number, number] => [(p.x - origin.x) * cell, (p.y - origin.y) * cell];
  const blit = (image: CanvasImageSource, p: Point, scale = 1, lift = 0): void => {
    const [x, y] = at(p);
    const s = cell * scale;
    ctx.imageSmoothingEnabled = image instanceof HTMLImageElement;
    const ratio = image instanceof HTMLImageElement ? image.naturalWidth / image.naturalHeight : 1;
    const width = Math.min(s, s * ratio), height = Math.min(s, s / ratio);
    if (image instanceof HTMLImageElement && image.dataset.inkPaper) ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(image, x + (cell - width) / 2, y + (cell - height) / 2 - lift, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = false;
  };
  const paint = (name: string, p: Point, scale = 1): boolean => {
    const source = assetPainting("map:" + name);
    if (!source) return false;
    const [x, y] = at(p), s = cell * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(source.image, source.sx, source.sy, source.width, source.height, x + (cell-s)/2, y + (cell-s)/2, s, s);
    ctx.imageSmoothingEnabled = false;
    return true;
  };
  /** Draws a named tileset tile when one is loaded, else the procedural fallback. */
  const terrain = (name: string, fallback: CanvasImageSource, p: Point, variant = 0): void => {
    if (paint(name.startsWith("trap-") ? "trap" : name, p)) return;
    const material = name === "corridor" ? "floor" : name.startsWith("wall-") ? "wall" : name;
    // A floor study spans a 3×3 world-cell patch, rather than shrinking the
    // entire crack pattern into every cell. Adjacent subrects share one sample.
    const span = material === "floor" ? 3 : 1;
    const surface = assetSurface(material, span > 1 ? hash(Math.floor(p.x / span), Math.floor(p.y / span)) : variant);
    if (surface !== null) {
      const [x, y] = at(p);
      ctx.imageSmoothingEnabled = true;
      const sw = surface.width / span, sh = surface.height / span;
      const ix = ((p.x % span) + span) % span, iy = ((p.y % span) + span) % span;
      ctx.drawImage(surface.image, surface.sx + ix * sw, surface.sy + iy * sh, sw, sh, x, y, cell, cell);
      ctx.imageSmoothingEnabled = false;
      return;
    }
    const tile = assetTile(name, variant);
    if (tile === null) { blit(fallback, p); return; }
    const [x, y] = at(p);
    ctx.drawImage(tile.image, tile.sx, tile.sy, tile.size, tile.size, x, y, cell, cell);
  };
  const passable = (p: Point): boolean => { const t = dungeon.tile(p); return t === "room" || t === "corridor" || t === "gate"; };
  const fog: Point[] = [];
  for (let vy = 0; vy < VIEW; vy++) {
    for (let vx = 0; vx < VIEW; vx++) {
      const p = { x: origin.x + vx, y: origin.y + vy };
      const tile = dungeon.tile(p);
      if (tile === undefined) continue;
      if (tile === "wall" || tile === "secret") {
        const below = { x: p.x, y: p.y + 1 };
        const seen = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => { const q = { x: p.x + dx!, y: p.y + dy! }; return dungeon.isExplored(q) && passable(q); });
        if (!seen) continue;
        const face = passable(below) && dungeon.isExplored(below);
        terrain(face ? "wall-face" : "wall-cap", face ? WALL_FACE : WALL_CAP, p, hash(p.x, p.y, 3));
        if (assetSurface("wall") !== null) {
          // Outline only exposed stone boundaries, never every cell. Adjacent wall
          // cells stay one connected structure; no walkability/visibility changes.
          const [x, y] = at(p);
          ctx.strokeStyle = "#211e1a"; ctx.lineWidth = Math.max(1, cell * 0.045);
          for (const [dx, dy, ax, ay, bx, by] of [[0,-1,0,0,1,0],[1,0,1,0,1,1],[0,1,0,1,1,1],[-1,0,0,0,0,1]]) {
            const q = { x: p.x + dx!, y: p.y + dy! };
            if (!dungeon.isExplored(q) || !passable(q)) continue;
            ctx.beginPath(); ctx.moveTo(x + ax! * cell, y + ay! * cell); ctx.lineTo(x + bx! * cell, y + by! * cell); ctx.stroke();
          }
        }
        if (!dungeon.isVisible(p)) fog.push(p);
        continue;
      }
      if (!dungeon.isExplored(p)) continue;
      const variant = hash(p.x, p.y);
      if (tile === "gate") terrain("gate", GATE, p);
      else if (tile === "room") terrain("floor", FLOOR[Math.floor(variant * FLOOR.length)]!, p, variant);
      else terrain("corridor", CORRIDOR[Math.floor(variant * CORRIDOR.length)]!, p, variant);
      if (!dungeon.isVisible(p)) fog.push(p);
    }
  }
  const stairs = dungeon.floor.stairs;
  if (dungeon.isExplored(stairs)) terrain("stairs", STAIRS, stairs);
  for (const trap of dungeon.revealedTraps()) {
    if (!dungeon.isExplored(trap.pos)) continue;
    let image = TRAPS.get(trap.type);
    if (!image) { image = trapTile(trap.type); TRAPS.set(trap.type, image); }
    terrain("trap-" + trap.type, image, trap.pos);
  }
  for (const object of dungeon.objects()) {
    if (!dungeon.isExplored(object.pos)) continue;
    const name = object.kind === "item" ? "item-" + object.contentId : object.kind === "recruit" ? "recruit" : object.kind === "event" ? "event" : "sorcery";
    const fallback = object.kind === "item" ? iconCanvas(object.contentId) : object.kind === "recruit" ? BANNER : object.kind === "event" ? EVENT : SORCERY;
    // Containers are presentations of existing pickups; interaction/rewards stay unchanged.
    const presentation = object.kind !== "item" ? object.kind : /rice|bun/.test(object.contentId) ? "pot" : /medicine|herb|elixir|treatment/.test(object.contentId) ? "find" : "chest";
    if (paint(presentation, object.pos, object.kind === "item" ? 0.85 : 1)) continue;
    const tile = assetTile(name);
    if (tile === null) {
      blit(fallback, object.pos, object.kind === "item" ? 0.75 : 1);
      continue;
    }
    const [x, y] = at(object.pos);
    const scale = object.kind === "item" ? 0.78 : 1;
    const s = cell * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(tile.image, tile.sx, tile.sy, tile.size, tile.size, x + (cell - s) / 2, y + (cell - s) / 2, s, s);
    ctx.imageSmoothingEnabled = false;
  }
  // localized 28% ink wash over remembered-but-not-visible ground; never a flat black cell.
  for (const p of fog) {
    const [x, y] = at(p);
    const tile = assetTile("fog", hash(p.x, p.y, 19));
    ctx.globalAlpha = 0.28;
    const originalFog = paint("fog", p);
    ctx.globalAlpha = 1;
    if (originalFog) continue;
    if (tile !== null) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tile.image, tile.sx, tile.sy, tile.size, tile.size, x, y, cell, cell);
      ctx.imageSmoothingEnabled = false;
    } else {
      const wash = ctx.createRadialGradient(x + cell * 0.5, y + cell * 0.5, cell * 0.08, x + cell * 0.5, y + cell * 0.5, cell * 0.76);
      wash.addColorStop(0, "rgba(23, 21, 19, 0.28)");
      wash.addColorStop(0.68, "rgba(23, 21, 19, 0.14)");
      wash.addColorStop(1, "rgba(23, 21, 19, 0)");
      ctx.fillStyle = wash;
      ctx.fillRect(x, y, cell, cell);
    }
  }
  // Existing floor modifiers receive a subdued ink overlay; no new modifier semantics.
  if (dungeon.floor.modifier) {
    ctx.globalAlpha = 0.08;
    for (let vy = 0; vy < VIEW; vy++) for (let vx = 0; vx < VIEW; vx++) {
      const p = {x:origin.x+vx,y:origin.y+vy};
      if (dungeon.isExplored(p) && passable(p)) paint("environment", p);
    }
    ctx.globalAlpha = 1;
  }
  // torchlight: warm glow around the ruler, falling off into darkness at the view edge
  const [lx, ly] = at(dungeon.position);
  const cx = lx + cell / 2, cy = ly + cell / 2;
  const dark = ctx.createRadialGradient(cx, cy, cell * 4, cx, cy, cell * (VIEW_RADIUS + 2));
  dark.addColorStop(0, "rgba(23, 21, 19, 0)");
  dark.addColorStop(1, "rgba(23, 21, 19, 0.42)");
  ctx.fillStyle = dark; ctx.fillRect(0, 0, size, size);
  const warm = ctx.createRadialGradient(cx, cy, 0, cx, cy, cell * 3.5);
  warm.addColorStop(0, "rgba(255, 248, 230, 0.12)");
  warm.addColorStop(1, "rgba(255, 248, 230, 0)");
  ctx.fillStyle = warm; ctx.fillRect(0, 0, size, size);
  for (const enemy of dungeon.visibleEnemies()) {
    const [x, y] = at(enemy.pos);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(x + cell * 0.2, y + cell * 0.82, cell * 0.6, cell * 0.12);
    const enemyKey = options.enemyKey(enemy.groupId);
    const enemyToken = assetToken(enemyKey);
    blit(enemyToken ?? figureCanvas(enemyKey), enemy.pos, enemy.boss ? 1.35 : enemyToken === undefined ? 1 : 1.2, cell * 0.08);
    if (enemy.state === "ALERT" || enemy.state === "CHASE") {
      const s = Math.max(2, Math.floor(cell / 8));
      ctx.fillStyle = "#f2ebdd"; ctx.fillRect(x + cell * 0.72, y - s * 3, s * 3, s * 4);
      ctx.fillStyle = "#a64032"; ctx.fillRect(x + cell * 0.72 + s, y - s * 2.5, s, s * 2); ctx.fillRect(x + cell * 0.72 + s, y, s, s * 0.8);
    }
  }
  const [px, py] = at(dungeon.position);
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(px + cell * 0.2, py + cell * 0.82, cell * 0.6, cell * 0.12);
  const playerToken = assetToken(options.playerKey);
  blit(playerToken ?? figureCanvas(options.playerKey), dungeon.position, playerToken === undefined ? 1 : 1.2, cell * 0.08);
  // facing marker: a vermilion mark on the tile edge
  const facing: Record<string, [number, number]> = { n: [0, -1], ne: [1, -1], e: [1, 0], se: [1, 1], s: [0, 1], sw: [-1, 1], w: [-1, 0], nw: [-1, -1] };
  const [fx, fy] = facing[dungeon.facing] ?? [0, 1];
  const m = Math.max(2, Math.floor(cell / 8));
  ctx.fillStyle = "#a64032";
  ctx.fillRect(px + cell / 2 + fx * cell * 0.5 - m / 2, py + cell / 2 + fy * cell * 0.5 - m / 2, m, m);
}

export function tileAt(canvas: HTMLCanvasElement, dungeon: DungeonEngine, clientX: number, clientY: number): Point {
  const rect = canvas.getBoundingClientRect();
  const cell = rect.width / VIEW;
  return {
    x: dungeon.position.x - VIEW_RADIUS + Math.floor((clientX - rect.left) / cell),
    y: dungeon.position.y - VIEW_RADIUS + Math.floor((clientY - rect.top) / cell),
  };
}
