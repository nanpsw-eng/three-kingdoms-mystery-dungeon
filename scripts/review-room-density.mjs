// Read-only design probe. Candidate generators live in a temporary copy of dist/.
// Run npm run build first. Never changes the shipped generator or save data.
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { MVP_CONTENT } from "../dist/content/index.js";

const count = 1000;
const profiles = [
  { name: "baseline", width: 48, height: 34, roomWidth: 9, roomHeight: 7 },
  { name: "compact-rooms", width: 48, height: 34, roomWidth: 6, roomHeight: 6 },
  { name: "compact-rooms-and-floor", width: 40, height: 28, roomWidth: 6, roomHeight: 6 },
];
const plans = MVP_CONTENT.campaigns.flatMap(c => c.floors.map(p => ({ campaign: c.id, plan: p })));
function specFor(index) {
  const { campaign, plan: p } = plans[index % plans.length];
  return {
    seed: `density-review-${index}::${campaign}`, depth: p.depth,
    enemyGroups: p.enemyGroups, enemyCount: p.enemyCount, traps: p.traps, trapCount: p.trapCount,
    ...(p.objects ? { objects: p.objects } : {}),
    ...(p.secretRoomChance !== undefined ? { secretRoomChance: p.secretRoomChance } : {}),
    ...(p.bossGroupId ? { boss: { groupId: p.bossGroupId } } : {}),
    mechanics: {
      ...(p.gateDefenderGroupId ? { gates: { defenderGroupId: p.gateDefenderGroupId } } : {}),
      ...(p.sorceryFormations !== undefined ? { sorceryFormations: p.sorceryFormations } : {}),
      ...(p.alarmNetwork !== undefined ? { alarmNetwork: p.alarmNetwork } : {}),
      ...(p.mechanics ? { list: p.mechanics } : {}),
    },
  };
}
function distances(floor) {
  const key = p => p.y * floor.width + p.x;
  const d = new Map([[key(floor.start), 0]]), queue = [floor.start];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const q = { x: p.x + dx, y: p.y + dy };
      if (q.x < 0 || q.y < 0 || q.x >= floor.width || q.y >= floor.height) continue;
      const k = key(q);
      if (floor.tiles[k] === "wall" || d.has(k)) continue;
      d.set(k, d.get(key(p)) + 1); queue.push(q);
    }
  }
  if (![floor.stairs, ...floor.enemies.map(e => e.pos), ...floor.objects.map(o => o.pos)].every(p => d.has(key(p)))) {
    throw new Error("Required point unreachable");
  }
  return d.get(key(floor.stairs));
}
const result = [];
for (const profile of profiles) {
  const temp = mkdtempSync(join(tmpdir(), "tkmd-density-"));
  try {
    cpSync(new URL("../dist/", import.meta.url), join(temp, "dist"), { recursive: true });
    writeFileSync(join(temp, "package.json"), '{"type":"module"}');
    const balance = join(temp, "dist/dungeon/balance.js");
    let source = readFileSync(balance, "utf8");
    for (const [name, value] of Object.entries({ FLOOR_WIDTH: profile.width, FLOOR_HEIGHT: profile.height, ROOM_MAX_WIDTH: profile.roomWidth, ROOM_MAX_HEIGHT: profile.roomHeight })) {
      source = source.replace(new RegExp(`export const ${name} = \\d+;`), `export const ${name} = ${value};`);
    }
    writeFileSync(balance, source);
    const { generateFloor } = await import(pathToFileURL(join(temp, "dist/dungeon/floor.js")));
    let failures = 0, rooms = 0, area = 0, oversized = 0, corridor = 0, shortestPath = 0, enemies = 0, objects = 0, deterministic = true;
    for (let i = 0; i < count; i++) {
      const spec = specFor(i);
      let f;
      try { f = generateFloor(spec); } catch { failures++; continue; }
      deterministic &&= JSON.stringify(f) === JSON.stringify(generateFloor(spec));
      const main = f.rooms.filter((_, index) => index !== f.secretRoom);
      rooms += main.length; area += main.reduce((n, r) => n + r.width * r.height, 0);
      oversized += main.filter(r => r.width > 6 || r.height > 6).length;
      corridor += f.tiles.filter(t => t === "corridor").length;
      shortestPath += distances(f); enemies += f.enemies.length; objects += f.objects.length;
    }
    const ok = count - failures, round = n => Math.round(n * 100) / 100;
    result.push({ ...profile, samples: count, failures, deterministic,
      meanRooms: round(rooms / ok), meanRoomArea: round(area / rooms), roomsOver6x6Percent: round(100 * oversized / rooms),
      meanCorridorTiles: round(corridor / ok), meanCardinalStartToStairs: round(shortestPath / ok),
      meanEnemies: round(enemies / ok), meanObjects: round(objects / ok), requiredReachability: "PASS (gates/secret treated as openable)" });
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
console.log(JSON.stringify({ countPerProfile: count, planCount: plans.length, note: "Geometry probe, not playthrough/balance/mobile UX validation. Candidate applies to all main rooms including boss rooms; role-specific proposal is not simulated.", profiles: result }, null, 2));
