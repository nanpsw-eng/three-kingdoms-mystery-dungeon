// E8 남만 정벌 (225) — 칠종칠금: 맹획을 일곱 번 사로잡아 일곱 번 놓아준다. 독천·장기. 연의 기준.
import type { FloorPlan, StorySceneDefinition } from "../../run/types.js";
import type { Weighted } from "../../dungeon/floor.js";
import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import type { CampaignModule } from "../module.js";
import { uniqueTraits } from "../module.js";
import { active, allyUpTo, enemyOne, enemyUpTo, energy, heal, physical, shift, status, strategy, ultimate } from "../skills.js";

const ID = "nanman";

const characters = defineCharacters([
  ["meng-huo", "맹획", "general", "infantry", ["탱커", "공격", "생존"], [126, 112, 110, 86, 64], ["mh-club", "mh-roar", "mh-king"], ["t-mh-king", "t-mh-stubborn", "t-mh-beasts"]],
  ["zhu-rong", "축융", "general", "archer", ["연사", "화공", "속도"], [98, 110, 90, 116, 80], ["zr-daggers", "zr-flame", "zr-fire-goddess"], ["t-zr-fire", "t-zr-swift", "t-zr-queen"]],
  ["ma-su", "마속", "general", "strategist", ["제어", "디버프"], [86, 76, 82, 100, 118], ["ms-heart", "ms-theory", "ms-attack-heart"], ["t-ms-theory", "t-ms-heart", "t-ms-pride"]],
]);

const skills = [
  active("mh-club", 35, enemyOne("front"), [physical(38)]),
  active("mh-roar", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(14, "actor")]),
  ultimate("mh-king", enemyUpTo(3), [physical(46, { modifier: 0.8 }), status("stun", 1)]),
  active("zr-daggers", 30, enemyUpTo(2), [physical(28, { modifier: 0.85 })]),
  active("zr-flame", 35, enemyOne(), [physical(30), status("burn", 2, { magnitude: 5 })]),
  ultimate("zr-fire-goddess", enemyUpTo(5), [physical(38, { modifier: 0.72 }), status("burn", 2, { magnitude: 4 })]),
  active("ms-heart", 30, enemyOne(), [status("confusion", 1), strategy(20)]),
  active("ms-theory", 30, allyUpTo(2), [energy(15)]),
  ultimate("ms-attack-heart", enemyUpTo(5), [strategy(36, { modifier: 0.72 }), status("defense-down", 2, { magnitude: 0.2 })]),
  // enemies
  active("nm-spear", 30, enemyOne("front"), [physical(32)]),
  active("nm-poison-dart", 35, enemyUpTo(2), [physical(20, { modifier: 0.85 }), status("poison", 3, { magnitude: 4 })]),
  active("nm-elephant", 40, enemyUpTo(3, "front"), [physical(34, { modifier: 0.8 }), shift(15)]),
  active("nm-rattan", 25, enemyUpTo(3, "front"), [status("taunt", 2)]),
  active("mh-e-club", 35, enemyOne("front"), [physical(40)]),
  ultimate("mh-e-king", enemyUpTo(5), [physical(38, { modifier: 0.72 })]),
  active("zr-e-daggers", 30, enemyUpTo(2), [physical(28, { modifier: 0.85 }), status("burn", 2, { magnitude: 4 })]),
  active("wtg-e-rattan", 30, enemyUpTo(3, "front"), [status("taunt", 2), physical(20)]),
];

const skillNames: Record<string, string> = {
  "mh-club": "남만왕의 철퇴", "mh-roar": "포효", "mh-king": "남만대왕",
  "zr-daggers": "비도", "zr-flame": "화신의 비도", "zr-fire-goddess": "축융부인",
  "ms-heart": "공심", "ms-theory": "병법 강론", "ms-attack-heart": "공심위상",
  "nm-spear": "창술", "nm-poison-dart": "독침", "nm-elephant": "코끼리 돌진", "nm-rattan": "등갑",
  "mh-e-club": "철퇴", "mh-e-king": "남만대왕", "zr-e-daggers": "비도", "wtg-e-rattan": "등갑군",
};

const traits = uniqueTraits([
  ["t-mh-king", "meng-huo", "남만왕", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
  ["t-mh-stubborn", "meng-huo", "불복", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
  ["t-mh-beasts", "meng-huo", "맹수 조련", "ATK +10%", ["공격"], { statPercent: { atk: 0.1 } }],
  ["t-zr-fire", "zhu-rong", "화신의 후예", "ATK +12%", ["화공"], { statPercent: { atk: 0.12 } }],
  ["t-zr-swift", "zhu-rong", "비도술", "SPD +8%", ["연사", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-zr-queen", "zhu-rong", "여장부", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
  ["t-ms-theory", "ma-su", "병법 통달", "INT +12%", ["제어"], { statPercent: { int: 0.12 } }],
  ["t-ms-heart", "ma-su", "공심", "전투 시작 기력 +20", ["디버프"], { entryEnergy: 20 }],
  ["t-ms-pride", "ma-su", "자부", "SPD +8%, DEF -5%", ["속도"], { statPercent: { spd: 0.08, def: -0.05 } }],
]);

type Stats = readonly [number, number, number, number, number];
const A: Record<string, { name: string; stats: Stats; reach: "melee" | "ranged"; skills: string[] }> = {
  warrior: { name: "남만병", stats: [78, 88, 72, 96, 54], reach: "melee", skills: ["nm-spear"] },
  dart: { name: "독침병", stats: [62, 82, 60, 100, 70], reach: "ranged", skills: ["nm-poison-dart"] },
  elephant: { name: "코끼리 부대", stats: [110, 96, 96, 78, 40], reach: "melee", skills: ["nm-elephant"] },
  rattan: { name: "등갑병", stats: [88, 86, 112, 82, 50], reach: "melee", skills: ["nm-rattan", "nm-spear"] },
  shaman: { name: "남만 무녀", stats: [64, 64, 66, 96, 96], reach: "ranged", skills: ["yt-curse"] },
};
const u = (key: keyof typeof A, slot: Parameters<typeof scaledUnit>[4], scale: number) => scaledUnit(A[key]!.name, A[key]!.stats, A[key]!.reach, A[key]!.skills, slot, scale);
const T1 = 0.86;
const T2 = 1.32;
const T3 = 1.72;
const mh = (stats: [number, number, number, number, number]) => boss("맹획", stats, "melee", ["mh-e-club", "mh-e-king"], "front-center");

const enemyGroups = [
  { id: "nm-scouts", name: "남만 척후", exp: 13, gold: 9, units: [u("warrior", "front-left", T1), u("dart", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
  { id: "nm-band", name: "남만 부족", exp: 15, gold: 10, units: [u("warrior", "front-left", T1), u("warrior", "front-right", T1), u("shaman", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "leather-armor", weight: 1 }], lootChance: 0.3 },
  { id: "nm-darts", name: "독침 부대", exp: 15, gold: 11, units: [u("dart", "rear-left", T1), u("dart", "rear-right", T1), u("warrior", "front-center", T1)], loot: [{ id: "medicine", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.3 },
  { id: "nm-beasts", name: "맹수 부대", exp: 28, gold: 20, units: [u("elephant", "front-left", T2), u("warrior", "front-right", T2), u("dart", "rear-left", T2)], loot: [{ id: "scale-armor", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
  { id: "nm-tribe", name: "동굴 부족", exp: 27, gold: 22, units: [u("warrior", "front-left", T2), u("warrior", "front-center", T2), u("shaman", "rear-left", T2), u("dart", "rear-right", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "war-fan", weight: 1 }], lootChance: 0.35 },
  { id: "nm-rattan", name: "등갑군", exp: 47, gold: 30, units: [u("rattan", "front-left", T3), u("rattan", "front-center", T3), u("rattan", "front-right", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "fire-pot", weight: 2 }], lootChance: 0.4 },
  { id: "nm-war-elephants", name: "전투 코끼리", exp: 48, gold: 32, units: [u("elephant", "front-left", T3), u("elephant", "front-right", T3), u("dart", "rear-left", T3)], loot: [{ id: "elixir", weight: 2 }, { id: "ancient-blade", weight: 1 }], lootChance: 0.4 },
  { id: "nm-wutugu", name: "오과국 병사", exp: 46, gold: 30, units: [u("rattan", "front-left", T3), u("shaman", "rear-left", T3), u("dart", "rear-right", T3), u("warrior", "front-right", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
  // 칠종칠금 — 1·2차 (4F)
  { id: "boss-mh-1", name: "맹획 (1차)", boss: true, exp: 40, gold: 30, nextPhase: "boss-mh-2", duel: { unitIndex: 0, penalty: 0.5 },
    units: [mh([220, 98, 90, 96, 50]), u("warrior", "front-left", T1)] },
  { id: "boss-mh-2", name: "맹획 (2차)", boss: true, exp: 50, gold: 40, phaseScene: "nm-capture-2",
    units: [mh([240, 100, 94, 96, 50]), u("dart", "rear-left", T1), u("warrior", "front-right", T1)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 1 },
  // 3·4·5차 (8F) — 맹우·코끼리, 축융, 다시 맹획
  { id: "boss-mh-3", name: "맹획·맹우 (3차)", boss: true, exp: 40, gold: 30, nextPhase: "boss-mh-4",
    units: [mh([260, 106, 98, 96, 50]), boss("맹우", [220, 100, 92, 92, 50], "melee", ["nm-elephant"], "front-left")] },
  { id: "boss-mh-4", name: "축융부인 (4차)", boss: true, exp: 50, gold: 40, nextPhase: "boss-mh-5", phaseScene: "nm-zhu-rong", recruit: { characterId: "zhu-rong", chance: 0.5 },
    units: [boss("축융", [260, 110, 90, 116, 80], "ranged", ["zr-e-daggers"], "rear-left"), u("elephant", "front-center", T2)] },
  { id: "boss-mh-5", name: "맹획 (5차)", boss: true, exp: 60, gold: 50, phaseScene: "nm-capture-5",
    units: [mh([280, 110, 100, 98, 50]), u("warrior", "front-left", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
  // 6·7차 (12F) — 오과국 등갑군, 마지막 맹획
  { id: "boss-mh-6", name: "올돌골 등갑군 (6차)", boss: true, exp: 40, gold: 30, nextPhase: "boss-mh-7",
    units: [boss("올돌골", [380, 110, 130, 84, 50], "melee", ["wtg-e-rattan", "nm-spear"], "front-center"), u("rattan", "front-left", T3), u("rattan", "front-right", T3)] },
  { id: "boss-mh-7", name: "맹획 (7차)", boss: true, exp: 0, gold: 0, phaseScene: "nm-capture-7", recruit: { characterId: "meng-huo", chance: 1 },
    units: [mh([340, 116, 106, 100, 50]), u("elephant", "front-left", T3), u("dart", "rear-left", T3)] },
];

const scenes: StorySceneDefinition[] = [
  { id: "nm-intro", title: "남정",
    lines: [
      { name: "해설", text: "건흥 3년, 남중의 여러 군이 반란을 일으키고 남만왕 맹획이 그 중심에 섰다." },
      { speaker: "zhuge-liang", name: "제갈량", text: "마음을 공격하는 것이 상책이요, 성을 공격하는 것은 하책이다." },
    ],
    variants: {
      "cao-cao": [{ name: "해설", text: "위는 남방의 반란을 지켜본다. 촉이 남쪽을 평정하면 다음은 북쪽이다." }, { speaker: "zhuge-liang", name: "제갈량", text: "마음을 공격하는 것이 상책이다." }],
      "sun-quan": [{ name: "해설", text: "오는 촉과 화친했다. 남쪽 국경 너머에서 촉의 남정이 시작된다." }, { speaker: "zhuge-liang", name: "제갈량", text: "마음을 공격하는 것이 상책이다." }],
    } },
  { id: "nm-capture-2", title: "두 번째 생포",
    lines: [{ speaker: "맹획", name: "맹획", text: "산길에서 방심했을 뿐이다! 놓아주면 다시 싸우겠다!" }, { name: "해설", text: "맹획을 놓아주자, 그는 곧장 다시 군사를 모아 돌아왔다." }] },
  { id: "nm-mh-2-down", title: "놓아주다",
    lines: [{ name: "해설", text: "두 번 사로잡고 두 번 놓아주었다. 맹획은 노수 건너 깊은 남쪽으로 물러났다." }] },
  { id: "nm-f5", title: "독천",
    lines: [{ name: "해설", text: "남쪽 땅에는 마시면 말을 잃는다는 독천과 사람을 병들게 하는 장기가 서려 있다." }, { name: "해설", text: "시간이 지날수록 부대가 중독된다. (상단 '장기')" }],
    choices: [
      { label: "만안계의 약수를 찾는다", effects: [{ kind: "heal", ratio: 0.25 }, { kind: "food", amount: -8 }] },
      { label: "참고 진군한다", effects: [{ kind: "exp", amount: 40 }] },
    ] },
  { id: "nm-zhu-rong", title: "축융부인",
    lines: [{ speaker: "축융", name: "축융", text: "사내들이 못났으니 내가 나간다! 화신의 비도를 받아라!" }] },
  { id: "nm-capture-5", title: "다섯 번째",
    lines: [{ speaker: "맹획", name: "맹획", text: "이번엔 아내가 붙잡혔을 뿐이다! 한 번만 더!" }] },
  { id: "nm-mh-5-down", title: "다섯 번째 놓아줌",
    lines: [{ name: "해설", text: "다섯 번. 맹획은 마지막 희망인 오과국의 등갑군을 찾아갔다." }] },
  { id: "nm-f9", title: "반사곡",
    lines: [{ name: "해설", text: "기름 먹인 등나무 갑옷은 칼도 화살도 튕겨 낸다. 그러나 불에는 약하다고 한다." }] },
  { id: "nm-capture-7", title: "일곱 번째",
    lines: [{ speaker: "맹획", name: "맹획", text: "…일곱 번 잡고 일곱 번 놓아준 일은 예로부터 없었습니다." }] },
  { id: "nm-mh-7-down", title: "칠종칠금",
    lines: [
      { speaker: "맹획", name: "맹획", text: "승상은 하늘의 위엄을 지녔습니다. 남인은 다시는 배반하지 않겠습니다." },
      { name: "해설", text: "맹획이 마음으로 복종했다. 남중이 평정되었다." },
    ] },
  { id: "nm-outro", title: "출사표",
    lines: [
      { name: "해설", text: "남방을 안정시킨 제갈량은 후주에게 출사표를 올렸다." },
      { speaker: "zhuge-liang", name: "제갈량", text: "선제께서 창업하시다 중도에 붕어하셨고, 지금 천하는 셋으로 나뉘었습니다…" },
    ] },
];

const events = [
  { id: "ev-nm-spring", title: "만안계 약수", text: "숨어 사는 은자가 장기를 막는 약초와 맑은 샘을 알려 준다.", choices: [
    { label: "약초를 얻는다", effects: [{ kind: "item" as const, itemId: "medicine" }] },
    { label: "샘물로 쉰다", effects: [{ kind: "heal" as const, ratio: 0.3 }] }] },
  { id: "ev-nm-mantou", title: "만두", text: "강의 신에게 사람 머리를 바친다는 풍습 대신, 밀가루로 머리 모양을 빚어 바치자는 제안이 나왔다.", choices: [
    { label: "만두를 빚는다", effects: [{ kind: "food" as const, amount: -5 }, { kind: "exp" as const, amount: 40 }] },
    { label: "그냥 건넌다", effects: [{ kind: "damage" as const, ratio: 0.1 }] }] },
  { id: "ev-nm-tribe", title: "부족장의 선물", text: "중립을 지키던 부족이 군량을 보내왔다.", choices: [
    { label: "받는다", effects: [{ kind: "food" as const, amount: 20 }] },
    { label: "답례한다", effects: [{ kind: "gold" as const, amount: -20 }, { kind: "exp" as const, amount: 35 }] }] },
];
const EVENTS: Weighted[] = [{ id: "ev-nm-spring", weight: 2 }, { id: "ev-nm-mantou", weight: 1 }, { id: "ev-nm-tribe", weight: 2 }, { id: "ev-shrine", weight: 1 }];

const MIASMA = { type: "miasma", params: { interval: 20 } };
const JUNGLE: Weighted<(typeof MODIFIERS)[number]["id"]>[] = [{ id: "fog", weight: 3 }, { id: "rain", weight: 2 }, { id: "night", weight: 1 }];

function nmFloor(depth: number): FloorPlan {
  const withEvents = (items: readonly Weighted[], count: readonly [number, number], recruit: number, event: number) =>
    objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
  if (depth === 4) return { depth, enemyGroups: [{ id: "nm-band", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-mh-1", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
  if (depth === 8) return { depth, enemyGroups: [{ id: "nm-beasts", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-mh-3", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0), mechanics: [MIASMA] };
  if (depth === 12) return { depth, enemyGroups: [{ id: "nm-rattan", weight: 1 }, { id: "nm-wutugu", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-mh-6", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), modifierChance: 0.5, modifiers: JUNGLE };
  const tier = depth <= 3 ? 1 : depth <= 7 ? 2 : 3;
  const groups: Weighted[] = tier === 1
    ? (depth === 1 ? [{ id: "nm-scouts", weight: 3 }, { id: "nm-band", weight: 1 }] : [{ id: "nm-scouts", weight: 2 }, { id: "nm-band", weight: 2 }, { id: "nm-darts", weight: 2 }])
    : tier === 2 ? [{ id: "nm-beasts", weight: 2 }, { id: "nm-tribe", weight: 2 }, { id: "nm-darts", weight: 1 }]
    : [{ id: "nm-rattan", weight: 2 }, { id: "nm-war-elephants", weight: 2 }, { id: "nm-wutugu", weight: 2 }];
  return {
    depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
    objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 10 ? 0.3 : 0, 0.35),
    ...(tier === 1 ? { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS } : { mechanics: [MIASMA], modifierChance: 0.5, modifiers: JUNGLE }),
  };
}

export const E8_NANMAN: CampaignModule = {
  campaign: {
    id: ID, name: "남만 정벌", order: 8, era: "225",
    summary: "칠종칠금. 독천과 장기의 땅에서 맹획을 일곱 번 사로잡아 마음을 얻는다.",
    scenes: {
      intro: "nm-intro", outro: "nm-outro", floorEnter: { 5: "nm-f5", 9: "nm-f9" },
      bossDefeated: { "boss-mh-2": "nm-mh-2-down", "boss-mh-5": "nm-mh-5-down", "boss-mh-7": "nm-mh-7-down" },
    },
    floors: Array.from({ length: 12 }, (_, index) => nmFloor(index + 1)),
    shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 3 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 2 }, { id: "elixir", weight: 1 }],
    shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "silk-robe", weight: 1 }, { id: "dragon-armor", weight: 1 }],
  },
  characters, skills, skillNames, traits, enemyGroups, events, scenes,
  unlocks: [
    { id: "u-nanman", condition: { kind: "clear-campaign", campaignId: "yiling" }, unlock: { campaignId: ID } },
    { id: "u-ma-su", condition: { kind: "reach-depth", campaignId: ID, depth: 5 }, unlock: { characterId: "ma-su" } },
    { id: "u-nanman-clear", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { achievement: "칠종칠금" } },
  ],
};
