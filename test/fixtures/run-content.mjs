// Small deterministic content pack for Run-layer tests (reuses MVP characters/skills/items).
import { MVP_CONTENT } from "../../dist/content/index.js";

const weakUnit = (slot) => ({ name: "허수아비", stats: { maxHp: 20, atk: 30, def: 30, spd: 40, int: 30 }, reach: "melee", slot });

export const TEST_CAMPAIGN = {
  id: "test-campaign",
  name: "Test",
  floors: [
    {
      depth: 1, enemyGroups: [{ id: "dummy", weight: 1 }], enemyCount: [0, 0], traps: [], trapCount: [0, 0], secretRoomChance: 0,
      objects: [
        { kind: "item", pool: [{ id: "herb", weight: 1 }], count: [1, 1] },
        { kind: "event", pool: [{ id: "ev-exp", weight: 1 }], count: [1, 1] },
        { kind: "recruit", pool: [{ id: "random", weight: 1 }], count: [1, 1] },
      ],
    },
    { depth: 2, enemyGroups: [{ id: "dummy", weight: 1 }], enemyCount: [1, 1], traps: [], trapCount: [0, 0], secretRoomChance: 0, safeZoneAfter: true },
    { depth: 3, enemyGroups: [{ id: "dummy", weight: 1 }], enemyCount: [0, 0], traps: [], trapCount: [0, 0], secretRoomChance: 0, bossGroupId: "test-boss" },
  ],
  shopItems: [{ id: "bun", weight: 1 }],
  shopEquipment: [{ id: "iron-sword", weight: 1 }],
};

export const KO_CAMPAIGN = {
  id: "test-ko", name: "KO test",
  floors: [
    { depth: 1, enemyGroups: [{ id: "glass", weight: 1 }], enemyCount: [1, 1], traps: [], trapCount: [0, 0], secretRoomChance: 0 },
    { depth: 2, enemyGroups: [{ id: "dummy", weight: 1 }], enemyCount: [0, 0], traps: [], trapCount: [0, 0], secretRoomChance: 0, bossGroupId: "test-boss" },
  ],
  shopItems: [{ id: "bun", weight: 1 }], shopEquipment: [{ id: "iron-sword", weight: 1 }],
};

export const TEST_CONTENT = {
  ...MVP_CONTENT,
  enemyGroups: [
    ...MVP_CONTENT.enemyGroups,
    { id: "dummy", name: "허수아비", exp: 5, gold: 7, units: [weakUnit("front-center")], loot: [{ id: "fire-pot", weight: 1 }], lootChance: 1 },
    { id: "test-boss", name: "시험 보스", boss: true, exp: 0, gold: 0, units: [weakUnit("front-center")] },
    { id: "glass", name: "유리대포", exp: 1, gold: 1, units: [{ name: "자객", stats: { maxHp: 1, atk: 2000, def: 1, spd: 150, int: 1 }, reach: "ranged", slot: "front-center" }] },
  ],
  events: [
    ...MVP_CONTENT.events,
    { id: "ev-exp", title: "수련", text: "경험", choices: [{ label: "수련", effects: [{ kind: "exp", amount: 40 }, { kind: "gold", amount: 100 }] }, { label: "쉰다", effects: [] }] },
  ],
  campaigns: [...MVP_CONTENT.campaigns, TEST_CAMPAIGN, KO_CAMPAIGN],
  startingUnlocks: { ...MVP_CONTENT.startingUnlocks, campaigns: ["yellow-turban", "test-campaign", "test-ko"] },
};

export const START = { seed: "run-test", campaignId: "test-campaign", rulerId: "liu-bei", generalIds: ["guan-yu", "zhang-fei"] };

/** Walks toward `pos` through explored space, exploring when needed. Returns when standing on it or a non-dungeon phase starts. */
export function walkTo(run, pos, limit = 400) {
  for (let i = 0; i < limit; i++) {
    if (run.phase !== "dungeon") return;
    const d = run.dungeon;
    if (d.position.x === pos.x && d.position.y === pos.y) return;
    const dir = d.travelDirection(pos) ?? d.frontierDirection(true);
    if (dir === null) throw new Error("no path to " + JSON.stringify(pos));
    run.act({ type: "dungeon", command: { type: "move", direction: dir } });
  }
  throw new Error("walkTo limit");
}
