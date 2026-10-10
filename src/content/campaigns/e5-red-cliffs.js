import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import { uniqueTraits } from "../module.js";
import { active, allyOne, allyUpTo, cleanse, enemyOne, enemyUpTo, energy, heal, physical, shift, status, strategy, ultimate } from "../skills.js";
const ID = "red-cliffs";
const characters = defineCharacters([
    ["lu-su", "노숙", "general", "support", ["지원", "회복", "외교"], [100, 74, 94, 98, 114], ["ls-alliance", "ls-supply", "ls-grand-plan"], ["t-ls-alliance", "t-ls-generous", "t-ls-sincere"]],
    ["huang-gai", "황개", "general", "infantry", ["화공", "공격", "생존"], [116, 108, 108, 92, 84], ["hg-iron-whip", "hg-ruse", "hg-fire-ships"], ["t-hg-veteran", "t-hg-sacrifice", "t-hg-loyal"]],
    ["pang-tong", "방통", "general", "strategist", ["제어", "화공", "디버프"], [86, 76, 84, 100, 122], ["pt-chain", "pt-phoenix", "pt-chained-ships"], ["t-pt-phoenix", "t-pt-chain", "t-pt-genius"]],
    ["cheng-pu", "정보", "general", "infantry", ["탱커", "지원"], [118, 104, 114, 90, 88], ["cp-snake-spear", "cp-elder", "cp-veteran-wall"], ["t-cp-elder", "t-cp-snake", "t-cp-steady"]],
]);
const skills = [
    active("ls-alliance", 30, allyUpTo(2), [heal(18), energy(10)]),
    active("ls-supply", 25, allyOne(), [heal(30), cleanse()]),
    ultimate("ls-grand-plan", allyUpTo(5), [heal(24), energy(15)]),
    active("hg-iron-whip", 35, enemyOne("front"), [physical(38)]),
    active("hg-ruse", 30, enemyOne(), [physical(26), status("burn", 2, { magnitude: 5 })]),
    ultimate("hg-fire-ships", enemyUpTo(5), [strategy(40, { modifier: 0.72 }), status("burn", 2, { stacks: 2, magnitude: 5 })]),
    active("pt-chain", 35, enemyUpTo(2), [status("timeline-delay", 1, { magnitude: 25 }), strategy(18)]),
    active("pt-phoenix", 35, enemyUpTo(2), [strategy(30, { modifier: 0.85 }), status("burn", 2, { magnitude: 4 })]),
    ultimate("pt-chained-ships", enemyUpTo(5), [strategy(36, { modifier: 0.7 }), status("confusion", 1)]),
    active("cp-snake-spear", 35, enemyOne("front"), [physical(36)]),
    active("cp-elder", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(14, "actor")]),
    ultimate("cp-veteran-wall", allyUpTo(5), [heal(22)]),
    // enemies
    active("cc-e-command", 40, enemyUpTo(3), [strategy(28, { modifier: 0.8 }), shift(15)]),
    ultimate("cc-e-armada", enemyUpTo(5), [physical(40, { modifier: 0.7 })]),
    active("hy-blade", 35, enemyOne(), [physical(40, { critChance: 0.2 })]),
    active("navy-ram", 35, enemyOne("front"), [physical(34), shift(10)]),
    active("cai-mao-drill", 35, enemyUpTo(3), [physical(26, { modifier: 0.8 })]),
];
const skillNames = {
    "ls-alliance": "손유 동맹", "ls-supply": "군량 지원", "ls-grand-plan": "탑상책",
    "hg-iron-whip": "철편", "hg-ruse": "고육계", "hg-fire-ships": "화선 돌격",
    "pt-chain": "연환계", "pt-phoenix": "봉추", "pt-chained-ships": "연환선",
    "cp-snake-spear": "철척사모", "cp-elder": "정공", "cp-veteran-wall": "노장의 방진",
    "cc-e-command": "패왕의 호령", "cc-e-armada": "백만 대군", "hy-blade": "청강검",
    "navy-ram": "몽충 충돌", "cai-mao-drill": "수군 조련",
};
const traits = uniqueTraits([
    ["t-ls-alliance", "lu-su", "동맹", "INT +10%", ["지원"], { statPercent: { int: 0.1 } }],
    ["t-ls-generous", "lu-su", "지균", "회복 아이템 효과 +35%", ["회복"], { healItemBonus: 0.35 }],
    ["t-ls-sincere", "lu-su", "성실", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
    ["t-hg-veteran", "huang-gai", "삼대 노장", "HP +12%", ["생존"], { statPercent: { maxHp: 0.12 } }],
    ["t-hg-sacrifice", "huang-gai", "고육지책", "ATK +15%, DEF -8%", ["공격", "화공"], { statPercent: { atk: 0.15, def: -0.08 } }],
    ["t-hg-loyal", "huang-gai", "충정", "전투 시작 기력 +25", ["화공"], { entryEnergy: 25 }],
    ["t-pt-phoenix", "pang-tong", "봉추", "INT +12%", ["화공", "제어"], { statPercent: { int: 0.12 } }],
    ["t-pt-chain", "pang-tong", "연환", "SPD +8%", ["제어", "속도"], { statPercent: { spd: 0.08 } }],
    ["t-pt-genius", "pang-tong", "기재", "전투 시작 기력 +25", ["디버프"], { entryEnergy: 25 }],
    ["t-cp-elder", "cheng-pu", "숙장", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
    ["t-cp-snake", "cheng-pu", "사모", "ATK +10%", ["공격"], { statPercent: { atk: 0.1 } }],
    ["t-cp-steady", "cheng-pu", "노련", "HP +12%", ["생존"], { statPercent: { maxHp: 0.12 } }],
]);
const A = {
    inf: { name: "조조군 보병", stats: [78, 88, 80, 88, 60], reach: "melee", skills: ["dong-halberd"] },
    qingzhou: { name: "청주병", stats: [84, 90, 82, 86, 58], reach: "melee", skills: ["yt-stab"] },
    tiger: { name: "호표기", stats: [80, 96, 76, 110, 58], reach: "melee", skills: ["xiliang-charge"] },
    marine: { name: "형주 수군", stats: [72, 82, 72, 96, 72], reach: "ranged", skills: ["water-surge"] },
    ship: { name: "몽충", stats: [100, 90, 100, 82, 56], reach: "melee", skills: ["navy-ram"] },
    archer: { name: "조조군 궁병", stats: [64, 88, 64, 92, 62], reach: "ranged", skills: ["hb-crossbow"] },
};
const u = (key, slot, scale) => scaledUnit(A[key].name, A[key].stats, A[key].reach, A[key].skills, slot, scale);
const T1 = 0.86;
const T2 = 1.22;
const T3 = 1.6;
const enemyGroups = [
    { id: "rc-vanguard", name: "조조군 선봉", exp: 12, gold: 8, units: [u("inf", "front-left", T1), u("archer", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
    { id: "rc-riders", name: "호표기 척후", exp: 15, gold: 11, units: [u("tiger", "front-left", T1), u("tiger", "front-right", T1)], loot: [{ id: "swift-boots", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.3 },
    { id: "rc-qingzhou", name: "청주병", exp: 14, gold: 10, units: [u("qingzhou", "front-left", T1), u("qingzhou", "front-right", T1), u("archer", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
    { id: "rc-marines", name: "형주 항복 수군", exp: 27, gold: 20, units: [u("marine", "rear-left", T2), u("marine", "rear-right", T2), u("ship", "front-center", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "war-fan", weight: 1 }], lootChance: 0.35 },
    { id: "rc-ships", name: "몽충 선단", exp: 28, gold: 22, units: [u("ship", "front-left", T2), u("ship", "front-right", T2), u("archer", "rear-left", T2)], loot: [{ id: "scale-armor", weight: 1 }, { id: "rice-sack", weight: 1 }], lootChance: 0.35 },
    { id: "rc-north", name: "북방 대군", exp: 28, gold: 20, units: [u("inf", "front-left", T2), u("qingzhou", "front-right", T2), u("archer", "rear-left", T2), u("archer", "rear-right", T2)], loot: [{ id: "long-spear", weight: 1 }, { id: "herb", weight: 2 }], lootChance: 0.35 },
    { id: "rc-chained", name: "연환선 수비대", exp: 47, gold: 30, units: [u("ship", "front-left", T3), u("ship", "front-center", T3), u("ship", "front-right", T3), u("marine", "rear-left", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
    { id: "rc-burning", name: "불타는 선단", exp: 45, gold: 28, units: [u("marine", "rear-left", T3), u("marine", "rear-right", T3), u("qingzhou", "front-center", T3)], loot: [{ id: "elixir", weight: 2 }, { id: "fire-pot", weight: 1 }], lootChance: 0.4 },
    { id: "rc-tigers", name: "호표기 본대", exp: 48, gold: 32, units: [u("tiger", "front-left", T3), u("tiger", "front-center", T3), u("tiger", "front-right", T3)], loot: [{ id: "ancient-blade", weight: 1 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
    // bosses
    { id: "boss-xiahou-en", name: "장판파 하후은", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 },
        units: [boss("하후은", [290, 104, 96, 104, 70], "melee", ["hy-blade"], "front-center"), u("tiger", "front-left", T1 * 1.1), u("archer", "rear-left", T1 * 1.1)], loot: [{ id: "ancient-blade", weight: 1 }], lootChance: 1 },
    { id: "boss-cai-mao", name: "수군도독 채모·장윤", boss: true, exp: 140, gold: 100,
        units: [boss("채모", [360, 100, 104, 98, 100], "ranged", ["cai-mao-drill", "water-surge"], "rear-left"), boss("장윤", [260, 104, 100, 100, 80], "melee", ["navy-ram"], "front-center"), u("ship", "front-left", T2), u("marine", "rear-right", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
    { id: "boss-cao-fleet", name: "조조 함대", boss: true, exp: 60, gold: 40, nextPhase: "boss-huarong",
        units: [boss("조조", [460, 110, 116, 100, 118], "ranged", ["cc-e-command", "cc-e-armada"], "rear-left"), u("ship", "front-left", T3), u("ship", "front-right", T3), u("marine", "rear-right", T3)] },
    { id: "boss-huarong", name: "화용도의 조조", boss: true, exp: 0, gold: 0, phaseScene: "rc-huarong",
        units: [boss("조조", [280, 112, 110, 104, 120], "ranged", ["cc-e-command", "cc-e-armada"], "rear-left"), boss("허저", [300, 118, 110, 86, 60], "melee", ["dong-halberd"], "front-center")] },
];
const scenes = [
    { id: "rc-intro", title: "백만 대군 남하",
        lines: [
            { name: "해설", text: "건안 13년, 북방을 평정한 조조가 형주를 삼키고 장강을 따라 내려온다." },
            { name: "해설", text: "당양 장판에서 피난민과 뒤섞인 유비군이 무너지고, 조조의 기병이 그 뒤를 쫓는다." },
        ],
        variants: {
            "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "백성을 버리고 갈 수는 없다… 자룡, 아두를 부탁한다!" }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "형주를 얻었으니 강동은 손바닥 안이다. 손권에게 사냥하자고 전하라." }],
            "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "항복이냐 결전이냐… 이 책상처럼 될 자는 누구인가!" }, { name: "해설", text: "손권이 칼로 책상 모서리를 베었다. 강동은 결전을 택했다." }],
        } },
    { id: "rc-f1", title: "장판파",
        lines: [{ name: "해설", text: "조조의 추격대가 바짝 따라붙는다. 머뭇거리면 증원이 계속 몰려온다. (상단 '추격')" }] },
    { id: "rc-xiahou-en-down", title: "청강검",
        lines: [{ name: "해설", text: "하후은이 쓰러지고 조조의 보검 청강검이 떨어졌다. 장판교 위에서 장비가 고함친다." }, { speaker: "zhang-fei", name: "장비", text: "연인 장익덕이 여기 있다! 누가 나와 죽기로 싸우겠느냐!" }] },
    { id: "rc-f6", title: "화살 십만 개",
        lines: [{ name: "해설", text: "짙은 안개가 강을 덮었다. 볏짚 실은 배를 조조 진영으로 보내면 화살을 얻을 수 있을지도 모른다." }],
        choices: [
            { label: "초선차전 — 볏짚 배를 띄운다", effects: [{ kind: "item", itemId: "fire-pot" }, { kind: "exp", amount: 30 }] },
            { label: "안개를 틈타 쉰다", effects: [{ kind: "heal", ratio: 0.3 }] },
        ] },
    { id: "rc-cai-mao-down", title: "반간계",
        lines: [{ name: "해설", text: "조조는 채모·장윤이 내통했다는 거짓 편지를 믿고 두 수군도독을 베었다. 북군의 수전은 이제 서툴다." }] },
    { id: "rc-f11", title: "동남풍",
        lines: [
            { speaker: "zhou-yu", name: "주유", text: "만사가 갖추어졌으나, 동풍이 부족하구나." },
            { name: "해설", text: "칠성단에 바람이 바뀌었다. 황개의 화선이 연환선에 불을 붙이고, 불길이 강 위로 번진다. (상단 '화염')" },
        ] },
    { id: "rc-huarong", title: "화용도",
        lines: [{ speaker: "조조", name: "조조", text: "하하, 주유와 제갈량도 별것 아니구나. 여기에 복병을 두었다면…" }, { name: "해설", text: "말이 끝나기도 전에 함성과 함께 길목이 막혔다." }] },
    { id: "rc-cao-down", title: "의리와 은혜",
        lines: [
            { speaker: "guan-yu", name: "관우", text: "…지난날의 은혜를 오늘 갚겠소. 가시오." },
            { name: "해설", text: "패잔병을 이끈 조조는 북으로 달아났다. 적벽의 불길은 천하를 셋으로 나누었다." },
        ],
        choices: [
            { label: "길을 열어 준다 (의리)", effects: [{ kind: "exp", amount: 60 }] },
            { label: "끝까지 추격한다 (전리품)", effects: [{ kind: "gold", amount: 120 }] },
        ] },
    { id: "rc-outro", title: "천하삼분",
        lines: [{ name: "해설", text: "적벽의 패배로 조조의 남하는 멈췄다. 형주를 둘러싼 새로운 다툼이 시작된다." }],
        variants: {
            "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "이제야 발 디딜 땅이 생겼다. 공명, 다음 수는 무엇이오?" }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "곽봉효가 살아 있었다면… 이번 패배는 잊지 않겠다." }],
            "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "강동을 지켰다. 그러나 형주는 누구의 것인가." }],
        } },
];
const events = [
    { id: "ev-rc-refugees", title: "장판의 피난민", text: "유비를 따라온 수만 명의 백성이 길을 메웠다.", choices: [
            { label: "함께 간다", effects: [{ kind: "food", amount: -10 }, { kind: "exp", amount: 40 }] },
            { label: "길을 나눈다", effects: [{ kind: "food", amount: 10 }] }
        ] },
    { id: "ev-rc-kurou", title: "고육계", text: "노장 황개가 곤장을 맞아 거짓 항복의 신뢰를 얻겠다고 한다.", choices: [
            { label: "허락한다", effects: [{ kind: "damage", ratio: 0.12 }, { kind: "exp", amount: 45 }] },
            { label: "만류한다", effects: [{ kind: "heal", ratio: 0.15 }] }
        ] },
    { id: "ev-rc-fog", title: "강 위의 안개", text: "짙은 안개 속에서 길 잃은 보급선을 만났다.", choices: [
            { label: "물자를 옮긴다", effects: [{ kind: "food", amount: 20 }] },
            { label: "약을 챙긴다", effects: [{ kind: "item", itemId: "medicine" }] }
        ] },
];
const EVENTS = [{ id: "ev-rc-refugees", weight: 2 }, { id: "ev-rc-kurou", weight: 1 }, { id: "ev-rc-fog", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }];
const PURSUIT = { type: "pursuit", params: { interval: 35, grace: 25 } };
const FIRE = { type: "spreading-fire", params: { start: 100, interval: 12, ratio: 0.03 } };
const RIVER = [{ id: "fog", weight: 3 }, { id: "strong-wind", weight: 2 }, { id: "rain", weight: 1 }];
const BLAZE = [{ id: "strong-wind", weight: 3 }, { id: "smoke", weight: 2 }, { id: "dry", weight: 1 }];
function rcFloor(depth) {
    const withEvents = (items, count, recruit, event) => objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
    if (depth === 5)
        return { depth, enemyGroups: [{ id: "rc-qingzhou", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-xiahou-en", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
    if (depth === 10)
        return { depth, enemyGroups: [{ id: "rc-ships", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-cai-mao", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0), modifierChance: 0.5, modifiers: RIVER };
    if (depth === 15)
        return { depth, enemyGroups: [{ id: "rc-chained", weight: 1 }, { id: "rc-burning", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-cao-fleet", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0), mechanics: [{ type: "spreading-fire", params: { start: 110, interval: 12, ratio: 0.03 } }], modifierChance: 0.6, modifiers: BLAZE };
    const tier = depth <= 4 ? 1 : depth <= 9 ? 2 : 3;
    const groups = tier === 1
        ? (depth <= 2 ? [{ id: "rc-vanguard", weight: 3 }, { id: "rc-qingzhou", weight: 1 }] : [{ id: "rc-vanguard", weight: 2 }, { id: "rc-qingzhou", weight: 2 }, { id: "rc-riders", weight: 2 }])
        : tier === 2 ? [{ id: "rc-marines", weight: 2 }, { id: "rc-ships", weight: 2 }, { id: "rc-north", weight: 2 }]
            : [{ id: "rc-chained", weight: 2 }, { id: "rc-burning", weight: 2 }, { id: "rc-tigers", weight: 2 }];
    return {
        depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
        objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 12 ? 0.3 : 0, 0.35),
        ...(tier === 1 ? { mechanics: [PURSUIT], modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }
            : tier === 2 ? { modifierChance: 0.5, modifiers: RIVER }
                : { mechanics: [FIRE], modifierChance: 0.6, modifiers: BLAZE }),
    };
}
export const E5_RED_CLIFFS = {
    campaign: {
        id: ID, name: "적벽대전", order: 5, era: "208",
        summary: "장판파의 추격을 뚫고, 안개 낀 강에서 수군을 꺾고, 동남풍의 화공으로 백만 대군을 불태운다.",
        scenes: {
            intro: "rc-intro", outro: "rc-outro", floorEnter: { 1: "rc-f1", 6: "rc-f6", 11: "rc-f11" },
            bossDefeated: { "boss-xiahou-en": "rc-xiahou-en-down", "boss-cai-mao": "rc-cai-mao-down", "boss-huarong": "rc-cao-down" },
        },
        floors: Array.from({ length: 15 }, (_, index) => rcFloor(index + 1)),
        shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 2 }, { id: "elixir", weight: 1 }],
        shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "silk-robe", weight: 1 }, { id: "swift-boots", weight: 1 }, { id: "ancient-blade", weight: 1 }],
    },
    characters, skills, skillNames, traits, enemyGroups, events, scenes,
    unlocks: [
        { id: "u-red-cliffs", condition: { kind: "clear-campaign", campaignId: "guandu" }, unlock: { campaignId: ID } },
        { id: "u-cheng-pu", condition: { kind: "reach-depth", campaignId: ID, depth: 5 }, unlock: { characterId: "cheng-pu" } },
        { id: "u-huang-gai", condition: { kind: "defeat-group", groupId: "boss-cai-mao" }, unlock: { characterId: "huang-gai", achievement: "반간계" } },
        { id: "u-lu-su", condition: { kind: "reach-depth", campaignId: ID, depth: 12 }, unlock: { characterId: "lu-su" } },
        { id: "u-pang-tong", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { characterId: "pang-tong", achievement: "적벽대전 승리" } },
    ],
};
//# sourceMappingURL=e5-red-cliffs.js.map