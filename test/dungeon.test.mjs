import assert from "node:assert/strict";
import test from "node:test";
import { generateFloor, DungeonEngine, tileIndex } from "../dist/dungeon/index.js";
import { twoRoomFloor, asciiFloor, PARTY } from "./fixtures/floors.mjs";

const baseSpec = (seed, depth = 1, extra = {}) => ({
  seed, depth,
  enemyGroups: [{ id: "yt", weight: 1 }], enemyCount: [3, 5],
  traps: [{ id: "rockfall", weight: 1 }, { id: "alarm-bell", weight: 1 }], trapCount: [2, 4],
  objects: [{ kind: "item", pool: [{ id: "bun", weight: 1 }], count: [2, 3] }],
  ...extra,
});
const engine = (floor, extra = {}) => new DungeonEngine(floor, { seed: "t", party: PARTY, ...extra });
const hp = (d) => d.party().map((m) => m.hp);

function bfs(floor, passable) {
  const seen = new Set([tileIndex(floor.width, floor.start)]);
  const queue = [floor.start];
  while (queue.length) {
    const p = queue.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const q = { x: p.x + dx, y: p.y + dy };
      if (q.x < 0 || q.y < 0 || q.x >= floor.width || q.y >= floor.height) continue;
      const key = tileIndex(floor.width, q);
      if (!seen.has(key) && passable(floor.tiles[key])) { seen.add(key); queue.push(q); }
    }
  }
  return seen;
}

// ---------- FR-003 generation ----------

test("AC-003-02: same seed and spec generate an identical floor; different seeds differ", () => {
  const a = generateFloor(baseSpec("same", 4));
  const b = generateFloor(baseSpec("same", 4));
  const c = generateFloor(baseSpec("other", 4));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.notEqual(JSON.stringify(a), JSON.stringify(c));
});

test("AC-003-01: 300 floors have 5-9 main rooms and every required point is reachable", () => {
  const counts = new Set();
  for (let i = 0; i < 300; i++) {
    const f = generateFloor(baseSpec("gen-" + i, 1 + (i % 15), i % 4 === 0 ? { mechanics: { gates: { defenderGroupId: "guard" } } } : {}));
    const main = f.rooms.length - (f.secretRoom === null ? 0 : 1);
    assert.ok(main >= 5 && main <= 9, "rooms=" + main);
    counts.add(main);
    assert.notEqual(f.startRoom, f.stairsRoom);
    const reach = bfs(f, (k) => k === "room" || k === "corridor" || k === "gate");
    assert.ok(reach.has(tileIndex(f.width, f.stairs)), "stairs unreachable " + i);
    for (const e of f.enemies) assert.ok(bfs(f, (k) => k !== "wall").has(tileIndex(f.width, e.pos)));
  }
  assert.deepEqual([...counts].sort(), [5, 6, 7, 8, 9]);
});

test("secret rooms appear on roughly 10-30% of floors and stay closed until searched", () => {
  let secrets = 0;
  for (let i = 0; i < 300; i++) {
    const f = generateFloor(baseSpec("secret-" + i));
    if (f.secretRoom === null) continue;
    secrets++;
    assert.equal(f.tiles.filter((t) => t === "secret").length, 1);
    const closed = bfs(f, (k) => k === "room" || k === "corridor" || k === "gate");
    const room = f.rooms[f.secretRoom];
    assert.ok(!closed.has(tileIndex(f.width, { x: room.x, y: room.y })), "secret room reachable without search");
  }
  assert.ok(secrets / 300 > 0.1 && secrets / 300 < 0.3, "rate=" + secrets / 300);
});

test("Hulao gates: gate tiles guard the stairs room with stationary defenders", () => {
  let checked = 0;
  for (let i = 0; i < 40 && checked < 10; i++) {
    const f = generateFloor(baseSpec("gate-" + i, 2, { mechanics: { gates: { defenderGroupId: "guard" } } }));
    if (f.gates.length === 0) continue;
    checked++;
    const defenders = f.enemies.filter((e) => e.gateId === "gate-0");
    assert.ok(defenders.length >= 1 && defenders.length <= 2);
    assert.ok(defenders.every((e) => e.behavior === "stationary" && e.groupId === "guard"));
    const closed = bfs(f, (k) => k === "room" || k === "corridor");
    assert.ok(!closed.has(tileIndex(f.width, f.stairs)), "stairs reachable with gates closed");
  }
  assert.ok(checked >= 5);
});

// ---------- FR-002 turn engine ----------

test("AC-002-02: facing costs no turn; wait/search cost one; walking into a wall costs none", () => {
  const d = engine(twoRoomFloor());
  assert.equal(d.execute({ type: "face", direction: "n" }).turnSpent, false);
  assert.equal(d.turn, 0);
  assert.equal(d.execute({ type: "wait" }).turnSpent, true);
  assert.equal(d.execute({ type: "search" }).turnSpent, true);
  assert.equal(d.turn, 2);
  const blocked = d.execute({ type: "move", direction: "n" }); // (2,3)->(2,2) room ok; go to wall
  assert.equal(blocked.turnSpent, true);
  d.execute({ type: "move", direction: "n" });
  const wall = d.execute({ type: "move", direction: "n" });
  assert.deepEqual([wall.turnSpent, wall.events[0].type], [false, "blocked"]);
});

test("food ticks every 10 turns, natural recovery every 3 turns, starvation at food 0", () => {
  const d = engine(twoRoomFloor(), { party: [{ id: "a", maxHp: 100, hp: 50 }, { id: "b", maxHp: 80, hp: 40 }] });
  for (let i = 0; i < 3; i++) d.execute({ type: "wait" });
  assert.deepEqual(hp(d), [51, 41]);
  for (let i = 0; i < 7; i++) d.execute({ type: "wait" });
  assert.equal(d.food, 99);
  const starving = engine(twoRoomFloor(), { food: 0, party: [{ id: "a", maxHp: 100, hp: 3 }] });
  starving.execute({ type: "wait" }); starving.execute({ type: "wait" });
  const r = starving.execute({ type: "wait" });
  assert.deepEqual(hp(starving), [1]);
  assert.ok(r.events.some((e) => e.type === "starvation"));
  for (let i = 0; i < 3; i++) starving.execute({ type: "wait" });
  assert.equal(starving.status, "defeated");
});

test("danger rises at 150/300 turns and reinforcements spawn out of view up to the cap", () => {
  const f = generateFloor(baseSpec("danger", 3, { enemyCount: [0, 0], traps: [], objects: [] }));
  const d = new DungeonEngine(f, { seed: "danger", party: [{ id: "a", maxHp: 1000, hp: 1000 }], reinforcementGroups: [{ id: "yt", weight: 1 }] });
  const levels = []; let spawned = 0;
  for (let i = 0; i < 600 && d.status === "exploring"; i++) {
    for (const e of d.execute({ type: "wait" }).events) {
      if (e.type === "danger") levels.push([d.turn, e.level]);
      if (e.type === "reinforcement") { spawned++; const enemy = d.enemies().find((x) => x.id === e.enemyId); assert.ok(!d.isVisible(enemy.pos)); }
    }
  }
  assert.deepEqual(levels.slice(0, 2), [[150, "caution"], [300, "danger"]]);
  assert.ok(spawned >= 1 && spawned <= 3, "spawned=" + spawned);
  assert.ok(d.enemies().every((e) => e.reinforcement));
});

// ---------- traps / search / secret ----------

test("hidden trap triggers on step, damages the party without KO, and search reveals adjacent traps", () => {
  const traps = [{ id: "t1", type: "rockfall", pos: { x: 8, y: 3 } }, { id: "t2", type: "rockfall", pos: { x: 10, y: 3 } }];
  const d = engine(twoRoomFloor({ traps }), { party: [{ id: "a", maxHp: 100, hp: 100 }, { id: "b", maxHp: 80, hp: 5 }] });
  assert.deepEqual(d.revealedTraps(), []);
  for (let i = 0; i < 6; i++) d.execute({ type: "move", direction: "e" });
  assert.deepEqual(d.position, { x: 8, y: 3 });
  assert.deepEqual(hp(d), [91, 2]); // 100-10 / 5→1 (trap cannot KO), then +1 natural recovery on turn 6
  const r = d.execute({ type: "move", direction: "e" }); // (9,3), t2 adjacent
  assert.ok(!r.events.some((e) => e.type === "trap"));
  const s = d.execute({ type: "search" });
  assert.deepEqual(s.events.filter((e) => e.type === "trap-found").map((e) => e.trapId), ["t2"]);
  assert.deepEqual(d.revealedTraps().map((t) => t.id).sort(), ["t1", "t2"]);
});

test("food-loss, confusion, teleport and alarm traps apply their effects", () => {
  const enemies = [{ id: "e1", groupId: "yt", pos: { x: 20, y: 2 }, facing: "s", behavior: "idle" }];
  const traps = [
    { id: "food", type: "food-loss", pos: { x: 6, y: 3 } },
    { id: "alarm", type: "alarm-bell", pos: { x: 7, y: 3 } },
    { id: "conf", type: "confusion-circle", pos: { x: 8, y: 3 } },
  ];
  const d = engine(twoRoomFloor({ traps, enemies }));
  for (let i = 0; i < 4; i++) d.execute({ type: "move", direction: "e" }); // (6,3)
  assert.equal(d.food, 90);
  const alarm = d.execute({ type: "move", direction: "e" });
  assert.ok(alarm.events.some((e) => e.type === "enemy-alert" && e.enemyId === "e1"));
  d.execute({ type: "move", direction: "e" }); // confusion
  const before = d.position;
  const moves = []; for (let i = 0; i < 3; i++) { d.execute({ type: "move", direction: "e" }); moves.push(d.position); }
  assert.ok(moves.some((p, i) => p.x !== (i === 0 ? before.x : moves[i - 1].x) + 1 || p.y !== 3), "confusion should randomize at least one move");
  const tele = engine(twoRoomFloor({ traps: [{ id: "tp", type: "teleport-circle", pos: { x: 3, y: 3 } }] }));
  const r = tele.execute({ type: "move", direction: "e" });
  const to = r.events.find((e) => e.type === "teleported").to;
  assert.equal(tele.tile(to), "room");
});

test("search opens an adjacent secret passage", () => {
  const rows = [
    "###########",
    "#...#######",
    "#...S,,,..#",
    "#...###...#",
    "###########",
  ];
  const f = asciiFloor(rows, { rooms: [{ x: 1, y: 1, width: 3, height: 3 }, { x: 8, y: 2, width: 2, height: 2 }], start: { x: 3, y: 2 }, stairs: { x: 9, y: 3 }, secretRoom: 1 });
  const d = engine(f);
  assert.equal(d.execute({ type: "move", direction: "e" }).turnSpent, false);
  const r = d.execute({ type: "search" });
  assert.deepEqual(r.events.find((e) => e.type === "secret-found").pos, { x: 4, y: 2 });
  assert.equal(d.execute({ type: "move", direction: "e" }).turnSpent, true);
});

// ---------- detection / surprise / encounter ----------

test("enemies in the same room notice immediately; in corridors only within the front cone", () => {
  const roomEnemy = engine(twoRoomFloor({ enemies: [{ id: "e", groupId: "yt", pos: { x: 4, y: 1 }, facing: "n", behavior: "idle" }] }));
  const r = roomEnemy.execute({ type: "wait" });
  assert.ok(r.events.some((e) => e.type === "enemy-alert"));
  const back = engine(twoRoomFloor({ start: { x: 9, y: 3 }, enemies: [{ id: "e", groupId: "yt", pos: { x: 11, y: 3 }, facing: "e", behavior: "idle" }] }));
  assert.ok(!back.execute({ type: "wait" }).events.some((e) => e.type === "enemy-alert"));
  const front = engine(twoRoomFloor({ start: { x: 9, y: 3 }, enemies: [{ id: "e", groupId: "yt", pos: { x: 11, y: 3 }, facing: "w", behavior: "idle" }] }));
  assert.ok(front.execute({ type: "wait" }).events.some((e) => e.type === "enemy-alert"));
});

test("Player Surprise: bumping an unaware enemy from behind", () => {
  const d = engine(twoRoomFloor({ start: { x: 8, y: 3 }, enemies: [{ id: "e", groupId: "yt", pos: { x: 12, y: 3 }, facing: "e", behavior: "idle" }] }));
  let encounter = null;
  for (let i = 0; i < 4 && encounter === null; i++) encounter = d.execute({ type: "move", direction: "e" }).events.find((e) => e.type === "encounter")?.encounter ?? null;
  assert.deepEqual([encounter.initiator, encounter.surprise], ["player", "ally"]);
  assert.equal(d.status, "encounter");
});

test("Enemy Surprise: a chaser reaching the player's back unseen; facing it makes the contact normal", () => {
  const run = (facing) => {
    const d = engine(twoRoomFloor({ start: { x: 9, y: 3 }, enemies: [{ id: "e", groupId: "yt", pos: { x: 6, y: 3 }, facing: "e", behavior: "idle" }] }));
    d.execute({ type: "face", direction: "e" });
    let encounter = null;
    for (let i = 0; i < 8 && encounter === null; i++) {
      if (facing === "w") d.execute({ type: "face", direction: "w" });
      encounter = d.execute({ type: "wait" }).events.find((e) => e.type === "encounter")?.encounter ?? null;
    }
    return encounter;
  };
  assert.deepEqual([run("e").initiator, run("e").surprise], ["enemy", "enemy"]);
  assert.equal(run("w").surprise, null);
});

test("encounter flow: commands blocked, victory removes the enemy, retreat leaves it alerted with cooldown", () => {
  const mk = () => engine(twoRoomFloor({ start: { x: 8, y: 3 }, enemies: [{ id: "e", groupId: "yt", pos: { x: 9, y: 3 }, facing: "w", behavior: "idle" }] }));
  const d = mk();
  d.execute({ type: "move", direction: "e" });
  assert.throws(() => d.execute({ type: "wait" }), /not accepting commands/);
  d.resolveEncounter("victory", [{ id: "lord", maxHp: 100, hp: 60 }]);
  assert.deepEqual([d.status, d.enemies().length, d.defeatedEnemies()[0], hp(d)[0]], ["exploring", 0, "e", 60]);
  const r = mk();
  r.execute({ type: "move", direction: "e" });
  r.resolveEncounter("retreat");
  const enemy = r.enemies()[0];
  assert.deepEqual([enemy.state, enemy.cooldown, r.status], ["ALERT", 3, "exploring"]);
  const lost = mk(); lost.execute({ type: "move", direction: "e" }); lost.resolveEncounter("defeat");
  assert.equal(lost.status, "defeated");
});

test("boss floors lock the stairs until the boss falls; bosses forbid retreat", () => {
  const f = twoRoomFloor({ boss: true, start: { x: 20, y: 3 }, stairs: { x: 22, y: 3 }, enemies: [{ id: "boss", groupId: "zhangjiao", pos: { x: 23, y: 1 }, facing: "s", behavior: "stationary", boss: true }] });
  const d = engine(f);
  d.execute({ type: "move", direction: "e" });
  d.execute({ type: "move", direction: "e" });
  if (d.status === "encounter") { assert.equal(d.encounter.retreatAllowed, false); assert.throws(() => d.resolveEncounter("retreat"), /not allowed/); d.resolveEncounter("victory"); }
  else {
    assert.deepEqual(d.execute({ type: "descend" }).events[0], { type: "blocked", reason: "stairs-locked" });
    d.execute({ type: "move", direction: "ne" });
    assert.equal(d.status, "encounter"); d.resolveEncounter("victory");
    while (d.position.x !== 22 || d.position.y !== 3) d.execute({ type: "move", direction: d.travelDirection({ x: 22, y: 3 }) });
  }
  assert.equal(d.bossDefeated, true);
  if (d.position.x !== 22 || d.position.y !== 3) while (d.position.x !== 22 || d.position.y !== 3) d.execute({ type: "move", direction: d.travelDirection({ x: 22, y: 3 }) });
  assert.deepEqual(d.execute({ type: "descend" }).events[0], { type: "descended" });
});

test("defeating every gate defender opens the gate", () => {
  const rows = [
    "##############",
    "#...#####....#",
    "#...,,,,G....#",
    "#...#####....#",
    "##############",
  ];
  const f = asciiFloor(rows, {
    rooms: [{ x: 1, y: 1, width: 3, height: 3 }, { x: 9, y: 1, width: 4, height: 3 }],
    start: { x: 3, y: 2 }, stairs: { x: 11, y: 2 },
    enemies: [{ id: "g1", groupId: "guard", pos: { x: 7, y: 2 }, facing: "w", behavior: "stationary", gateId: "gate-0" }],
    gates: [{ id: "gate-0", tiles: [{ x: 8, y: 2 }], defenderIds: ["g1"] }],
  });
  const d = engine(f);
  let guard = 0;
  while (d.status === "exploring" && guard++ < 10) d.execute({ type: "move", direction: "e" });
  assert.equal(d.status, "encounter");
  const events = d.resolveEncounter("victory");
  assert.deepEqual(events, [{ type: "gate-opened", gateId: "gate-0" }]);
  assert.equal(d.tile({ x: 8, y: 2 }), "corridor");
});

test("Yellow Turban sorcery formation empowers enemies in its room until destroyed", () => {
  const objects = [{ id: "s1", kind: "sorcery", contentId: "sorcery-formation", pos: { x: 18, y: 3 }, room: 1 }];
  const mk = () => engine(twoRoomFloor({ start: { x: 17, y: 3 }, objects, enemies: [{ id: "e", groupId: "yt", pos: { x: 23, y: 1 }, facing: "w", behavior: "idle" }] }));
  const untilEncounter = (d) => { for (let i = 0; i < 12; i++) { const enc = d.execute({ type: "wait" }).events.find((e) => e.type === "encounter")?.encounter; if (enc) return enc; } return null; };
  assert.equal(untilEncounter(mk()).empowered, true);
  const c = mk();
  c.execute({ type: "move", direction: "e" });
  assert.ok(c.execute({ type: "interact" }).events.some((e) => e.type === "sorcery-destroyed"));
  assert.equal(untilEncounter(c).empowered, false);
});

// ---------- auto explore / determinism ----------

test("auto explore uncovers an empty floor and stops for stairs and items", () => {
  const f = generateFloor(baseSpec("auto", 2, { enemyCount: [0, 0], traps: [], secretRoomChance: 0, objects: [{ kind: "item", pool: [{ id: "bun", weight: 1 }], count: [1, 1] }] }));
  const d = new DungeonEngine(f, { seed: "auto", party: PARTY });
  const reasons = [];
  for (let i = 0; i < 50; i++) { const r = d.autoExplore(500); reasons.push(r.stopReason); if (r.stopReason === "explored") break; }
  assert.equal(reasons.at(-1), "explored");
  assert.ok(reasons.includes("stair") && reasons.includes("item"));
  for (let i = 0; i < f.tiles.length; i++) if (f.tiles[i] === "room" || f.tiles[i] === "corridor") assert.ok(d.isExplored({ x: i % f.width, y: Math.floor(i / f.width) }));
});

test("FR-001: same floor, seed and command sequence reproduce the same dungeon state hash", () => {
  const play = () => {
    const f = generateFloor(baseSpec("replay", 5));
    const d = new DungeonEngine(f, { seed: "replay", party: PARTY, reinforcementGroups: [{ id: "yt", weight: 1 }] });
    for (let i = 0; i < 60; i++) {
      if (d.status === "encounter") { d.resolveEncounter("victory"); continue; }
      if (d.status !== "exploring") break;
      const r = d.autoExplore(20);
      if (r.stopReason === "enemy") { const e = d.visibleEnemies()[0]; const dir = d.travelDirection(e.pos); d.execute(dir ? { type: "move", direction: dir } : { type: "wait" }); }
      else if (r.stopReason === "explored") d.execute({ type: "wait" });
    }
    return d.stateHash();
  };
  assert.equal(play(), play());
});
