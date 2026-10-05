export interface Point {
  readonly x: number;
  readonly y: number;
}

/** 8 directions, clockwise from north. */
export const DIRECTIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
export type Direction = (typeof DIRECTIONS)[number];

const DELTAS: Readonly<Record<Direction, Point>> = {
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 },
};

export function delta(direction: Direction): Point {
  return DELTAS[direction];
}

export function step(point: Point, direction: Direction): Point {
  const d = DELTAS[direction];
  return { x: point.x + d.x, y: point.y + d.y };
}

export function samePoint(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}

export function chebyshev(left: Point, right: Point): number {
  return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

export function manhattan(left: Point, right: Point): number {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

/** Direction index distance on the 8-way compass (0..4). */
export function directionDistance(left: Direction, right: Direction): number {
  const diff = Math.abs(DIRECTIONS.indexOf(left) - DIRECTIONS.indexOf(right));
  return Math.min(diff, 8 - diff);
}

export function opposite(direction: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 4) % 8] as Direction;
}

/** Approximate compass direction from `from` toward `to` (undefined when equal). */
export function directionTo(from: Point, to: Point): Direction | undefined {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  if (dx === 0 && dy === 0) return undefined;
  for (const direction of DIRECTIONS) {
    const d = DELTAS[direction];
    if (d.x === dx && d.y === dy) return direction;
  }
  return undefined;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function rectContains(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

export function rectCenter(rect: Rect): Point {
  return { x: rect.x + Math.floor(rect.width / 2), y: rect.y + Math.floor(rect.height / 2) };
}

export function rectsOverlap(left: Rect, right: Rect, padding: number): boolean {
  return (
    left.x - padding < right.x + right.width &&
    right.x - padding < left.x + left.width &&
    left.y - padding < right.y + right.height &&
    right.y - padding < left.y + left.height
  );
}

/** Bresenham line including both endpoints. */
export function line(from: Point, to: Point): Point[] {
  const points: Point[] = [];
  let x = from.x;
  let y = from.y;
  const dx = Math.abs(to.x - from.x);
  const dy = -Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    points.push({ x, y });
    if (x === to.x && y === to.y) return points;
    const doubled = 2 * error;
    if (doubled >= dy) { error += dy; x += sx; }
    if (doubled <= dx) { error += dx; y += sy; }
  }
}
