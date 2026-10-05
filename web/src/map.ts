import type { DungeonEngine, Point } from "../../src/index.js";

export const VIEW_RADIUS = 8;
const VIEW = VIEW_RADIUS * 2 + 1;

const COLORS = {
  wall: "#120f0b", room: "#6b5b43", corridor: "#54473a", secret: "#120f0b", gate: "#8a5a2b",
  roomFog: "#3a3226", corridorFog: "#30281f", player: "#e8c15a", enemy: "#e05a50", boss: "#ff3b30",
  stairs: "#9ad0ff", trap: "#e0a030", item: "#7bbf6a", recruit: "#6fa8dc", event: "#c58fe0", sorcery: "#b05ad9",
};

/** Draws the explored map around the player; returns the tile under a canvas point for tap-to-move. */
export function drawMap(canvas: HTMLCanvasElement, dungeon: DungeonEngine): void {
  const size = Math.min(canvas.clientWidth || 360, 520);
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(size * ratio)) { canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio); }
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  const cell = canvas.width / VIEW;
  const origin = { x: dungeon.position.x - VIEW_RADIUS, y: dungeon.position.y - VIEW_RADIUS };
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const at = (p: Point): [number, number] => [(p.x - origin.x) * cell, (p.y - origin.y) * cell];
  for (let vy = 0; vy < VIEW; vy += 1) {
    for (let vx = 0; vx < VIEW; vx += 1) {
      const p = { x: origin.x + vx, y: origin.y + vy };
      if (!dungeon.isExplored(p)) continue;
      const tile = dungeon.tile(p);
      if (tile === undefined || tile === "wall" || tile === "secret") continue;
      const visible = dungeon.isVisible(p);
      ctx.fillStyle = tile === "gate" ? COLORS.gate : tile === "room" ? (visible ? COLORS.room : COLORS.roomFog) : (visible ? COLORS.corridor : COLORS.corridorFog);
      ctx.fillRect(vx * cell, vy * cell, cell - 0.5, cell - 0.5);
    }
  }
  const glyph = (p: Point, text: string, color: string, scale = 0.7): void => {
    const [x, y] = at(p);
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(cell * scale)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + cell / 2, y + cell / 2 + 1);
  };
  const stairs = dungeon.floor.stairs;
  if (dungeon.isExplored(stairs)) glyph(stairs, "▼", COLORS.stairs);
  for (const trap of dungeon.revealedTraps()) if (dungeon.isExplored(trap.pos)) glyph(trap.pos, "^", COLORS.trap);
  for (const object of dungeon.objects()) {
    if (!dungeon.isExplored(object.pos)) continue;
    const [text, color] = object.kind === "item" ? ["◆", COLORS.item] : object.kind === "recruit" ? ["★", COLORS.recruit] : object.kind === "event" ? ["?", COLORS.event] : ["卍", COLORS.sorcery];
    glyph(object.pos, text, color);
  }
  for (const enemy of dungeon.visibleEnemies()) {
    const [x, y] = at(enemy.pos);
    ctx.fillStyle = enemy.boss ? COLORS.boss : COLORS.enemy;
    ctx.beginPath();
    ctx.arc(x + cell / 2, y + cell / 2, cell * (enemy.boss ? 0.45 : 0.35), 0, Math.PI * 2);
    ctx.fill();
    if (enemy.state === "ALERT" || enemy.state === "CHASE") glyph({ x: enemy.pos.x, y: enemy.pos.y - 1 }, "!", "#fff", 0.6);
  }
  const [px, py] = at(dungeon.position);
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(px + cell / 2, py + cell / 2, cell * 0.38, 0, Math.PI * 2);
  ctx.fill();
  const facing: Record<string, [number, number]> = { n: [0, -1], ne: [1, -1], e: [1, 0], se: [1, 1], s: [0, 1], sw: [-1, 1], w: [-1, 0], nw: [-1, -1] };
  const [fx, fy] = facing[dungeon.facing] ?? [0, 1];
  ctx.strokeStyle = "#1b1712";
  ctx.lineWidth = Math.max(2, cell * 0.12);
  ctx.beginPath();
  ctx.moveTo(px + cell / 2, py + cell / 2);
  ctx.lineTo(px + cell / 2 + fx * cell * 0.35, py + cell / 2 + fy * cell * 0.35);
  ctx.stroke();
}

export function tileAt(canvas: HTMLCanvasElement, dungeon: DungeonEngine, clientX: number, clientY: number): Point {
  const rect = canvas.getBoundingClientRect();
  const cell = rect.width / VIEW;
  return {
    x: dungeon.position.x - VIEW_RADIUS + Math.floor((clientX - rect.left) / cell),
    y: dungeon.position.y - VIEW_RADIUS + Math.floor((clientY - rect.top) / cell),
  };
}
