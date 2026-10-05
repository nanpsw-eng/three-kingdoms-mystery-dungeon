// E7 이릉대전 (222) — 복수의 동정 → 오군 유인·매복 → 칠백 리 연영 화계 → 육손. 연의 기준.
import type { FloorPlan, StorySceneDefinition } from "../../run/types.js";
import type { Weighted } from "../../dungeon/floor.js";
import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import type { CampaignModule } from "../module.js";
import { uniqueTraits } from "../module.js";
import { active, allyUpTo, cleanse, enemyOne, enemyUpTo, energy, heal, physical, shift, status, strategy, ultimate } from "../skills.js";

const ID = "yiling";

const characters = defineCharacters([
  ["lu-xun", "육손", "general", "strategist", ["화공", "광역", "제어"], [90, 78, 88, 104, 122], ["lx-patience", "lx-fire", "lx-burn-camps"], ["t-lx-scholar", "t-lx-patience", "t-lx-fire"]],
  ["lu-meng", "여몽", "general", "infantry", ["기습", "지휘", "공격"], [108, 110, 102, 100, 100], ["lm-white-robes", "lm-study", "lm-jingzhou"], ["t-lm-scholar", "t-lm-disguise", "t-lm-command"]],
  ["zhou-tai", "주태", "general", "infantry", ["탱커", "생존", "호위"], [124, 104, 114, 88, 70], ["zt-shield", "zt-scars", "zt-twelve-wounds"], ["t-zt-scars", "t-zt-guard", "t-zt-endure"]],
]);

const skills = [
  active("lx-patience", 30, allyUpTo(3), [energy(15)]),
  active("lx-fire", 35, enemyUpTo(3), [strategy(30, { modifier: 0.8 }), status("burn", 2, { magnitude: 4 })]),
  ultimate("lx-burn-camps", enemyUpTo(5), [strategy(46, { modifier: 0.75 }), status("burn", 3, { stacks: 2, magnitude: 5 })]),
  active("lm-white-robes", 30, enemyOne(), [physical(36, { critChance: 0.2 })]),
  active("lm-study", 30, allyUpTo(2), [energy(15), heal(10)]),
  ultimate("lm-jingzhou", enemyUpTo(3), [physical(46, { modifier: 0.8 }), shift(20)]),
  active("zt-shield", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(14, "actor")]),
  active("zt-scars", 35, enemyOne("front"), [physical(34)]),
  ultimate("zt-twelve-wounds", allyUpTo(5), [heal(24), cleanse()]),
  // enemies
  active("wu-e-ambush", 30, enemyOne(), [physical(32, { critChance: 0.2 })]),
  active("wu-e-fire-arrow", 35, enemyUpTo(2), [physical(24, { modifier: 0.85 }), status("burn", 2, { magnitude: 4 })]),
  active("lx-e-wait", 35, enemyUpTo(3), [strategy(26, { modifier: 0.8 }), shift(15)]),
  ultimate("lx-e-blaze", enemyUpTo(5), [strategy(42, { modifier: 0.72 }), status("burn", 2, { stacks: 2, magnitude: 5 })]),
  active("gn-e-bells", 35, enemyOne(), [physical(38, { critChance: 0.2 })]),
];

const skillNames: Record<string, string> = {
  "lx-patience": "인내", "lx-fire": "화계", "lx-burn-camps": "화소연영",
  "lm-white-robes": "백의도강", "lm-study": "괄목상대", "lm-jingzhou": "형주 탈환",
  "zt-shield": "호위", "zt-scars": "상흔", "zt-twelve-wounds": "열두 군데 상처",
  "wu-e-ambush": "매복", "wu-e-fire-arrow": "화전", "lx-e-wait": "지구전", "lx-e-blaze": "화소연영", "gn-e-bells": "금범의 방울",
};

const traits = uniqueTraits([
  ["t-lx-scholar", "lu-xun", "서생", "INT +12%", ["화공"], { statPercent: { int: 0.12 } }],
  ["t-lx-patience", "lu-xun", "인내", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
  ["t-lx-fire", "lu-xun", "연영 화계", "전투 시작 기력 +25", ["광역"], { entryEnergy: 25 }],
  ["t-lm-scholar", "lu-meng", "오하아몽 아님", "INT +8%, ATK +6%", ["지휘"], { statPercent: { int: 0.08, atk: 0.06 } }],
  ["t-lm-disguise", "lu-meng", "백의", "SPD +8%", ["기습", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-lm-command", "lu-meng", "대도독", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
  ["t-zt-scars", "zhou-tai", "전신 상흔", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
  ["t-zt-guard", "zhou-tai", "호위무장", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
  ["t-zt-endure", "zhou-tai", "불굴", "회복 아이템 효과 +30%", ["생존"], { healItemBonus: 0.3 }],
]);

type Stats = readonly [number, number, number, number, number];
const A: Record<string, { name: string; stats: Stats; reach: "melee" | "ranged"; skills: string[] }> = {
  inf: { name: "오군 보병", stats: [76, 86, 78, 90, 62], reach: "melee", skills: ["yt-stab"] },
  archer: { name: "오군 궁병", stats: [64, 86, 64, 96, 64], reach: "ranged", skills: ["wu-e-fire-arrow"] },
  ambusher: { name: "오군 복병", stats: [72, 92, 70, 106, 60], reach: "melee", skills: ["wu-e-ambush"] },
  marine: { name: "강동 수군", stats: [72, 82, 72, 98, 74], reach: "ranged", skills: ["water-surge"] },
  elite: { name: "해번군", stats: [86, 94, 88, 92, 60], reach: "melee", skills: ["dong-halberd"] },
};
const u = (key: keyof typeof A, slot: Parameters<typeof scaledUnit>[4], scale: number) => scaledUnit(A[key]!.name, A[key]!.stats, A[key]!.reach, A[key]!.skills, slot, scale);
const T1 = 0.86;
const T2 = 1.12;
const T3 = 1.6;

const enemyGroups = [
  { id: "yl-pickets", name: "오군 초병", exp: 13, gold: 9, units: [u("inf", "front-left", T1), u("archer", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
  { id: "yl-squad", name: "오군 보병대", exp: 15, gold: 11, units: [u("inf", "front-left", T1), u("inf", "front-right", T1), u("archer", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
  { id: "yl-marines", name: "강동 수군", exp: 15, gold: 12, units: [u("marine", "rear-left", T1), u("marine", "rear-right", T1), u("inf", "front-center", T1)], loot: [{ id: "bun", weight: 2 }, { id: "war-fan", weight: 1 }], lootChance: 0.3 },
  { id: "yl-ambush", name: "오군 복병대", exp: 28, gold: 22, units: [u("ambusher", "front-left", T2), u("ambusher", "front-right", T2), u("archer", "rear-left", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "swift-boots", weight: 1 }], lootChance: 0.35 },
  { id: "yl-line", name: "오군 방어선", exp: 28, gold: 20, units: [u("elite", "front-left", T2), u("inf", "front-right", T2), u("archer", "rear-left", T2), u("archer", "rear-right", T2)], loot: [{ id: "scale-armor", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
  { id: "yl-firestarters", name: "화공대", exp: 46, gold: 30, units: [u("archer", "rear-left", T3), u("archer", "rear-right", T3), u("elite", "front-center", T3)], loot: [{ id: "elixir", weight: 2 }, { id: "fire-pot", weight: 1 }], lootChance: 0.4 },
  { id: "yl-jiefan", name: "해번군 본대", exp: 48, gold: 32, units: [u("elite", "front-left", T3), u("elite", "front-center", T3), u("elite", "front-right", T3), u("archer", "rear-left", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
  { id: "yl-pursuers", name: "추격하는 오군", exp: 46, gold: 30, units: [u("ambusher", "front-left", T3), u("ambusher", "front-right", T3), u("marine", "rear-left", T3)], loot: [{ id: "rice-sack", weight: 2 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
  // bosses
  { id: "boss-gan-ning", name: "오군 선봉 감녕", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 },
    units: [boss("감녕", [270, 102, 92, 108, 70], "melee", ["gn-e-bells", "wu-e-ambush"], "front-center"), u("marine", "rear-left", T1 * 1.1), u("inf", "front-left", T1 * 1.1)], loot: [{ id: "ancient-blade", weight: 1 }], lootChance: 1 },
  { id: "boss-zhu-ran", name: "주연·주태", boss: true, exp: 140, gold: 100, recruit: { characterId: "zhou-tai", chance: 0.4 },
    units: [boss("주연", [340, 108, 104, 100, 80], "melee", ["wu-e-ambush", "dong-halberd"], "front-center"), boss("주태", [360, 100, 116, 88, 70], "melee", ["dong-halberd"], "front-left"), u("archer", "rear-right", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
  { id: "boss-lu-xun", name: "대도독 육손", boss: true, exp: 60, gold: 40, nextPhase: "boss-lu-xun-2", recruit: { characterId: "lu-xun", chance: 0.3 },
    units: [boss("육손", [400, 90, 104, 106, 128], "ranged", ["lx-e-wait", "wu-e-fire-arrow"], "rear-left"), u("elite", "front-left", T3), u("elite", "front-right", T3), u("archer", "rear-right", T3)] },
  { id: "boss-lu-xun-2", name: "화소연영", boss: true, exp: 0, gold: 0, phaseScene: "yl-burn",
    units: [boss("육손", [280, 92, 100, 110, 132], "ranged", ["lx-e-wait", "lx-e-blaze"], "rear-left"), u("archer", "rear-right", T3), u("ambusher", "front-center", T3)] },
];

const scenes: StorySceneDefinition[] = [
  { id: "yl-intro", title: "복수의 동정",
    lines: [
      { name: "해설", text: "장무 원년, 관우를 잃은 유비가 황제에 올라 대군을 일으켰다. 형주를 되찾고 아우의 원수를 갚기 위해서다." },
      { name: "해설", text: "그러나 출병 직전 장비마저 부하의 손에 쓰러졌다." },
    ],
    variants: {
      "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "운장, 익덕… 도원에서의 맹세를 지키지 못한다면 내가 무슨 낯으로 살겠는가." }],
      "cao-cao": [{ name: "해설", text: "위는 조비가 제위에 올랐다. 촉과 오가 싸우는 동안 위는 강 건너 불을 구경한다." }],
      "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "화친은 거절당했다. 젊은 서생 육손에게 모든 것을 맡긴다." }],
    } },
  { id: "yl-gan-ning-down", title: "금범의 최후",
    lines: [{ name: "해설", text: "강동의 금범적 감녕이 쓰러졌다. 그러나 오군은 이상할 정도로 순순히 물러난다." }] },
  { id: "yl-f5", title: "유인",
    lines: [{ name: "해설", text: "오군은 싸우지 않고 물러나기만 한다. 산길마다 복병의 기척이 느껴진다." }],
    choices: [
      { label: "신중하게 진군한다", effects: [{ kind: "food", amount: -10 }, { kind: "heal", ratio: 0.25 }] },
      { label: "단숨에 밀어붙인다", effects: [{ kind: "exp", amount: 45 }] },
    ] },
  { id: "yl-zhu-ran-down", title: "효정",
    lines: [{ name: "해설", text: "효정까지 밀고 들어갔다. 더위를 피해 숲 속에 칠백 리에 걸쳐 진영을 늘어세운다." }] },
  { id: "yl-f9", title: "칠백 리 연영",
    lines: [
      { speaker: "lu-xun", name: "육손", text: "숲에 진을 쳤으니 이제 때가 왔다. 각자 띠풀 한 단씩을 들고 불을 질러라." },
      { name: "해설", text: "숲이 불타기 시작했다. 불길이 번지기 전에 빠져나가야 한다. (상단 '화염')" },
    ] },
  { id: "yl-burn", title: "화소연영",
    lines: [{ speaker: "육손", name: "육손", text: "기다린 보람이 있군요. 바람이 우리 편입니다." }] },
  { id: "yl-lu-xun-down", title: "백제성으로",
    lines: [{ name: "해설", text: "불길을 뚫고 겨우 빠져나왔다. 대군은 잿더미가 되었고, 남은 길은 백제성뿐이다." }] },
  { id: "yl-outro", title: "백제성 탁고",
    lines: [{ name: "해설", text: "백제성에서 병이 깊어진 유비는 제갈량에게 아들과 나라를 부탁하고 눈을 감았다." }],
    variants: {
      "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "승상, 아들이 보좌할 만하면 돕고, 그렇지 못하면 그대가 스스로 취하시오." }],
      "cao-cao": [{ name: "해설", text: "촉과 오의 싸움은 끝났다. 위는 힘을 비축하며 다음을 노린다." }],
      "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "백면서생이라 비웃던 자들이 이제 육손 앞에 고개를 숙이는구나." }],
    } },
];

const events = [
  { id: "ev-yl-zhang-fei", title: "장비의 유품", text: "길가에서 장비의 장팔사모를 지키던 병사를 만났다.", choices: [
    { label: "넋을 기린다", effects: [{ kind: "exp" as const, amount: 40 }] },
    { label: "병사를 받아들인다", effects: [{ kind: "heal" as const, ratio: 0.25 }] }] },
  { id: "ev-yl-heat", title: "한여름 더위", text: "찌는 더위에 병사들이 쓰러진다. 숲 그늘로 들어가자는 의견이 나온다.", choices: [
    { label: "숲에서 쉰다", effects: [{ kind: "heal" as const, ratio: 0.3 }, { kind: "food" as const, amount: -5 }] },
    { label: "강행군", effects: [{ kind: "damage" as const, ratio: 0.1 }, { kind: "exp" as const, amount: 30 }] }] },
  { id: "ev-yl-stone", title: "어복포의 돌무더기", text: "강가의 돌무더기에서 살기가 느껴진다. 누군가 남긴 진법인가.", choices: [
    { label: "피해 간다", effects: [{ kind: "food" as const, amount: -8 }] },
    { label: "살펴본다", effects: [{ kind: "item" as const, itemId: "scout-map" }, { kind: "damage" as const, ratio: 0.08 }] }] },
];
const EVENTS: Weighted[] = [{ id: "ev-yl-zhang-fei", weight: 1 }, { id: "ev-yl-heat", weight: 2 }, { id: "ev-yl-stone", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }];

const AMBUSH = { type: "ambush", params: { interval: 45, chance: 0.5 } };
const FOREST_FIRE = { type: "spreading-fire", params: { start: 100, interval: 12, ratio: 0.03 } };
const SUMMER: Weighted<(typeof MODIFIERS)[number]["id"]>[] = [{ id: "dry", weight: 3 }, { id: "strong-wind", weight: 2 }, { id: "smoke", weight: 1 }];

function ylFloor(depth: number): FloorPlan {
  const withEvents = (items: readonly Weighted[], count: readonly [number, number], recruit: number, event: number) =>
    objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
  if (depth === 4) return { depth, enemyGroups: [{ id: "yl-squad", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-gan-ning", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
  if (depth === 8) return { depth, enemyGroups: [{ id: "yl-line", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-zhu-ran", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0) };
  if (depth === 12) return { depth, enemyGroups: [{ id: "yl-firestarters", weight: 1 }, { id: "yl-jiefan", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-lu-xun", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), mechanics: [{ type: "spreading-fire", params: { start: 110, interval: 12, ratio: 0.03 } }], modifierChance: 0.6, modifiers: SUMMER };
  const tier = depth <= 3 ? 1 : depth <= 7 ? 2 : 3;
  const groups: Weighted[] = tier === 1
    ? (depth === 1 ? [{ id: "yl-pickets", weight: 3 }, { id: "yl-squad", weight: 1 }] : [{ id: "yl-pickets", weight: 2 }, { id: "yl-squad", weight: 2 }, { id: "yl-marines", weight: 2 }])
    : tier === 2 ? [{ id: "yl-ambush", weight: 3 }, { id: "yl-line", weight: 2 }]
    : [{ id: "yl-firestarters", weight: 2 }, { id: "yl-jiefan", weight: 2 }, { id: "yl-pursuers", weight: 2 }];
  return {
    depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
    objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 10 ? 0.3 : 0, 0.35),
    ...(tier === 1 ? { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }
      : tier === 2 ? { mechanics: [AMBUSH], modifierChance: 0.5, modifiers: SUMMER }
      : { mechanics: [FOREST_FIRE], modifierChance: 0.6, modifiers: SUMMER }),
  };
}

export const E7_YILING: CampaignModule = {
  campaign: {
    id: ID, name: "이릉대전", order: 7, era: "222",
    summary: "관우와 장비의 원수를 갚으려는 동정. 물러나는 오군을 쫓아 들어간 숲에서 칠백 리 연영이 불탄다.",
    scenes: {
      intro: "yl-intro", outro: "yl-outro", floorEnter: { 5: "yl-f5", 9: "yl-f9" },
      bossDefeated: { "boss-gan-ning": "yl-gan-ning-down", "boss-zhu-ran": "yl-zhu-ran-down", "boss-lu-xun-2": "yl-lu-xun-down" },
    },
    floors: Array.from({ length: 12 }, (_, index) => ylFloor(index + 1)),
    shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }],
    shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "silk-robe", weight: 1 }, { id: "tiger-tally", weight: 1 }, { id: "dragon-armor", weight: 1 }],
  },
  characters, skills, skillNames, traits, enemyGroups, events, scenes,
  unlocks: [
    { id: "u-yiling", condition: { kind: "clear-campaign", campaignId: "jing-yi" }, unlock: { campaignId: ID } },
    { id: "u-lu-meng", condition: { kind: "reach-depth", campaignId: ID, depth: 6 }, unlock: { characterId: "lu-meng" } },
    { id: "u-yiling-clear", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { achievement: "이릉대전 생환" } },
  ],
};
