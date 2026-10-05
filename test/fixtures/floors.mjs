// Hand-built floors for deterministic Dungeon engine tests.
// Legend: '#' wall, '.' room, ',' corridor, 'S' secret passage, 'G' gate.
const KINDS = { "#": "wall", ".": "room", ",": "corridor", S: "secret", G: "gate" };

export function asciiFloor(rows, options) {
  const height = rows.length;
  const width = rows[0].length;
  const tiles = [];
  for (const row of rows) {
    if (row.length !== width) throw new Error("ragged ascii floor");
    for (const ch of row) tiles.push(KINDS[ch] ?? "wall");
  }
  return {
    depth: options.depth ?? 1,
    width,
    height,
    tiles,
    rooms: options.rooms,
    startRoom: options.startRoom ?? 0,
    stairsRoom: options.stairsRoom ?? options.rooms.length - 1,
    secretRoom: options.secretRoom ?? null,
    start: options.start,
    stairs: options.stairs,
    traps: options.traps ?? [],
    objects: options.objects ?? [],
    enemies: options.enemies ?? [],
    gates: options.gates ?? [],
    modifier: options.modifier ?? null,
    boss: options.boss ?? false,
    alarmNetwork: options.alarmNetwork ?? false,
    mechanics: options.mechanics ?? [],
    attempt: 0,
  };
}

// Two rooms joined by a long horizontal corridor (row 3).
//            0         1         2
//            0123456789012345678901234
export const TWO_ROOMS = [
  "#########################",
  "#.....###########.......#",
  "#.....###########.......#",
  "#.....,,,,,,,,,,,.......#",
  "#.....###########.......#",
  "#########################",
];
export const TWO_ROOMS_RECTS = [
  { x: 1, y: 1, width: 5, height: 4 },
  { x: 17, y: 1, width: 7, height: 4 },
];

export function twoRoomFloor(extra = {}) {
  return asciiFloor(TWO_ROOMS, { rooms: TWO_ROOMS_RECTS, start: { x: 2, y: 3 }, stairs: { x: 22, y: 3 }, ...extra });
}

export const PARTY = [
  { id: "lord", maxHp: 100, hp: 100 },
  { id: "gen", maxHp: 80, hp: 80 },
];
