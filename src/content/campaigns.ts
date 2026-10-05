import type { FloorModifier, FloorObjectSpec, TrapType, Weighted } from "../dungeon/floor.js";
import type { CampaignDefinition, EventDefinition, FloorPlan, UnlockRule } from "../run/types.js";

const MODIFIERS: readonly Weighted<FloorModifier>[] = [
  { id: "fog", weight: 2 }, { id: "night", weight: 2 }, { id: "strong-wind", weight: 1 }, { id: "dry", weight: 1 }, { id: "rain", weight: 1 }, { id: "smoke", weight: 1 },
];
const BASIC_TRAPS: readonly Weighted<TrapType>[] = [
  { id: "rockfall", weight: 3 }, { id: "poison-needle", weight: 2 }, { id: "pit", weight: 2 }, { id: "food-loss", weight: 1 },
  { id: "confusion-circle", weight: 1 }, { id: "teleport-circle", weight: 1 }, { id: "fire-circle", weight: 1 }, { id: "alarm-bell", weight: 1 },
];
// Yellow Turban expedition mechanic: alarm network → alarm bells are common.
const YT_TRAPS: readonly Weighted<TrapType>[] = [...BASIC_TRAPS.filter((t) => t.id !== "alarm-bell"), { id: "alarm-bell", weight: 4 }];

const ITEM_POOL_EARLY: readonly Weighted[] = [
  { id: "bun", weight: 5 }, { id: "herb", weight: 4 }, { id: "identify-scroll", weight: 1 }, { id: "iron-sword", weight: 1 },
  { id: "leather-armor", weight: 1 }, { id: "smoke-bomb", weight: 1 }, { id: "scout-map", weight: 1 },
];
const ITEM_POOL_MID: readonly Weighted[] = [
  { id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 1 },
  { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "identify-scroll", weight: 1 }, { id: "ancient-blade", weight: 1 },
  { id: "silk-robe", weight: 1 }, { id: "swift-boots", weight: 1 }, { id: "tiger-tally", weight: 1 },
];
const ITEM_POOL_LATE: readonly Weighted[] = [
  { id: "rice-sack", weight: 3 }, { id: "medicine", weight: 3 }, { id: "treatment-kit", weight: 2 }, { id: "elixir", weight: 2 },
  { id: "fire-pot", weight: 1 }, { id: "dragon-armor", weight: 1 }, { id: "jade-seal", weight: 1 }, { id: "ancient-blade", weight: 1 },
];
const EVENTS: readonly Weighted[] = [
  { id: "ev-villagers", weight: 2 }, { id: "ev-wounded", weight: 2 }, { id: "ev-shrine", weight: 2 },
  { id: "ev-caravan", weight: 1 }, { id: "ev-armory", weight: 1 }, { id: "ev-scripture", weight: 1 },
];

function objects(items: readonly Weighted[], itemCount: readonly [number, number], recruitChance: number, eventChance: number): FloorObjectSpec[] {
  return [
    { kind: "item", pool: items, count: itemCount },
    { kind: "recruit", pool: [{ id: "random", weight: 1 }], count: [1, 1], chance: recruitChance },
    { kind: "event", pool: EVENTS, count: [1, 1], chance: eventChance },
  ];
}

function ytFloor(depth: number): FloorPlan {
  if (depth === 5) return { depth, enemyGroups: [{ id: "yt-rabble", weight: 1 }, { id: "yt-band", weight: 1 }], enemyCount: [2, 3], traps: YT_TRAPS, trapCount: [1, 2], bossGroupId: "boss-zhang-bao", safeZoneAfter: true, objects: objects(ITEM_POOL_EARLY, [1, 2], 0, 0), alarmNetwork: true };
  if (depth === 10) return { depth, enemyGroups: [{ id: "yt-elite", weight: 1 }, { id: "yt-cult", weight: 1 }], enemyCount: [2, 3], traps: YT_TRAPS, trapCount: [1, 2], bossGroupId: "boss-zhang-liang", safeZoneAfter: true, objects: objects(ITEM_POOL_MID, [1, 2], 0, 0), alarmNetwork: true, sorceryFormations: 1 };
  if (depth === 15) return { depth, enemyGroups: [{ id: "yt-vanguard", weight: 1 }, { id: "yt-zealots", weight: 1 }], enemyCount: [2, 3], traps: YT_TRAPS, trapCount: [1, 2], bossGroupId: "boss-zhang-jiao", objects: objects(ITEM_POOL_LATE, [1, 2], 0, 0), alarmNetwork: true, sorceryFormations: 1 };
  const tier = depth <= 4 ? 1 : depth <= 9 ? 2 : 3;
  const groups: Weighted[] = tier === 1
    ? [{ id: "yt-rabble", weight: 3 }, { id: "yt-band", weight: 2 }, { id: "yt-raiders", weight: 2 }]
    : tier === 2 ? [{ id: "yt-elite", weight: 2 }, { id: "yt-cult", weight: 2 }, { id: "yt-warband", weight: 2 }]
    : [{ id: "yt-vanguard", weight: 2 }, { id: "yt-zealots", weight: 2 }, { id: "yt-host", weight: 1 }];
  return {
    depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: YT_TRAPS, trapCount: [2, 2 + tier],
    objects: objects(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 12 ? 0.3 : 0, 0.35),
    modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS, alarmNetwork: true, sorceryFormations: tier === 1 ? 0 : tier === 2 ? 1 : 2,
  };
}

export const YELLOW_TURBAN: CampaignDefinition = {
  id: "yellow-turban",
  name: "황건적의 난",
  floors: Array.from({ length: 15 }, (_, index) => ytFloor(index + 1)),
  shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "scout-map", weight: 1 }],
  shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "silk-robe", weight: 1 }, { id: "swift-boots", weight: 1 }],
};

// Hulao Gate preview (3-5F vertical slice): gates + stationary defenders, boss 화웅.
const HULAO_GROUPS: readonly Weighted[] = [{ id: "dong-soldiers", weight: 2 }, { id: "xiliang-cavalry", weight: 2 }];
export const HULAO_PREVIEW: CampaignDefinition = {
  id: "hulao-gate",
  name: "호로관 (Preview)",
  preview: true,
  floors: [
    { depth: 1, enemyGroups: HULAO_GROUPS, enemyCount: [3, 4], traps: BASIC_TRAPS, trapCount: [2, 3], objects: objects(ITEM_POOL_MID, [2, 3], 0.4, 0.3), gateDefenderGroupId: "dong-gate-guard" },
    { depth: 2, enemyGroups: HULAO_GROUPS, enemyCount: [3, 5], traps: BASIC_TRAPS, trapCount: [2, 3], objects: objects(ITEM_POOL_MID, [2, 3], 0.4, 0.3), gateDefenderGroupId: "dong-gate-guard", modifierChance: 0.3, modifiers: MODIFIERS, safeZoneAfter: true },
    { depth: 3, enemyGroups: HULAO_GROUPS, enemyCount: [3, 5], traps: BASIC_TRAPS, trapCount: [2, 4], objects: objects(ITEM_POOL_LATE, [2, 3], 0.3, 0.3), gateDefenderGroupId: "dong-gate-guard", modifierChance: 0.3, modifiers: MODIFIERS },
    { depth: 4, enemyGroups: HULAO_GROUPS, enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], objects: objects(ITEM_POOL_LATE, [1, 2], 0, 0), bossGroupId: "boss-hua-xiong" },
  ],
  shopItems: YELLOW_TURBAN.shopItems,
  shopEquipment: [{ id: "ancient-blade", weight: 1 }, { id: "dragon-armor", weight: 1 }, { id: "tiger-tally", weight: 1 }, { id: "swift-boots", weight: 1 }],
};

export const EVENTS_DATA: readonly EventDefinition[] = [
  { id: "ev-villagers", title: "피난민 마을", text: "황건적을 피해 숨은 마을 사람들이 군량을 나누겠다고 한다.", choices: [
    { label: "감사히 받는다", effects: [{ kind: "food", amount: 20 }] },
    { label: "오히려 금을 건넨다", effects: [{ kind: "gold", amount: -15 }, { kind: "exp", amount: 20 }] }] },
  { id: "ev-wounded", title: "부상병", text: "쓰러진 관군 병사가 도움을 청한다.", choices: [
    { label: "군량을 나눠 치료한다", effects: [{ kind: "food", amount: -10 }, { kind: "exp", amount: 30 }] },
    { label: "지나친다", effects: [] }] },
  { id: "ev-shrine", title: "낡은 사당", text: "향이 아직 남아 있는 사당이 있다.", choices: [
    { label: "참배한다", effects: [{ kind: "heal", ratio: 0.3 }] },
    { label: "공물을 챙긴다", effects: [{ kind: "gold", amount: 40 }, { kind: "damage", ratio: 0.1 }] }] },
  { id: "ev-caravan", title: "상단", text: "길을 잃은 상단이 물건을 팔겠다고 한다.", choices: [
    { label: "약초를 산다 (30금)", effects: [{ kind: "gold", amount: -30 }, { kind: "item", itemId: "medicine" }] },
    { label: "그냥 보낸다", effects: [] }] },
  { id: "ev-armory", title: "버려진 무기고", text: "황건적이 버리고 간 무기고다.", choices: [
    { label: "뒤져본다", effects: [{ kind: "equipment", equipmentId: "tiger-tally" }, { kind: "damage", ratio: 0.05 }] },
    { label: "함정일지 모른다", effects: [] }] },
  { id: "ev-scripture", title: "태평요술서", text: "불길한 기운의 경전이 놓여 있다.", choices: [
    { label: "불태운다", effects: [{ kind: "exp", amount: 25 }] },
    { label: "읽어본다", effects: [{ kind: "damage", ratio: 0.15 }, { kind: "gold", amount: 60 }] }] },
];

export const UNLOCK_RULES: readonly UnlockRule[] = [
  { id: "u-zhao-yun", condition: { kind: "reach-depth", campaignId: "yellow-turban", depth: 5 }, unlock: { characterId: "zhao-yun" } },
  { id: "u-huang-zhong", condition: { kind: "defeat-group", groupId: "boss-zhang-bao" }, unlock: { characterId: "huang-zhong", achievement: "장보 격파" } },
  { id: "u-jia-xu", condition: { kind: "reach-depth", campaignId: "yellow-turban", depth: 10 }, unlock: { characterId: "jia-xu" } },
  { id: "u-hua-tuo", condition: { kind: "defeat-group", groupId: "boss-zhang-liang" }, unlock: { characterId: "hua-tuo", achievement: "장량 격파" } },
  { id: "u-zhou-yu", condition: { kind: "runs", count: 3 }, unlock: { characterId: "zhou-yu" } },
  { id: "u-zhuge-liang", condition: { kind: "clear-campaign", campaignId: "yellow-turban" }, unlock: { characterId: "zhuge-liang", campaignId: "hulao-gate", achievement: "황건적의 난 평정" } },
  { id: "u-hulao-clear", condition: { kind: "clear-campaign", campaignId: "hulao-gate" }, unlock: { achievement: "화웅 격파" } },
];
