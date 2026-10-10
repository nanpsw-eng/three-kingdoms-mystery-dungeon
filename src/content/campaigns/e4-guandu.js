import { BASIC_TRAPS, ITEM_POOL_EARLY, ITEM_POOL_LATE, ITEM_POOL_MID, MODIFIERS, objects } from "../campaigns.js";
import { defineCharacters } from "../characters.js";
import { boss, scaledUnit } from "../enemies.js";
import { uniqueTraits } from "../module.js";
import { active, allyOne, allyUpTo, enemyOne, enemyUpTo, energy, extraAction, heal, physical, shift, status, strategy, ultimate } from "../skills.js";
const ID = "guandu";
const characters = defineCharacters([
    ["xu-chu", "허저", "general", "infantry", ["탱커", "공격", "호위"], [122, 114, 112, 84, 70], ["xc-bare", "xc-guard", "xc-tiger"], ["t-xc-tiger", "t-xc-guard", "t-xc-bare"]],
    ["dian-wei", "전위", "general", "infantry", ["공격", "도발", "광역"], [118, 118, 106, 90, 70], ["dw-halberds", "dw-guard", "dw-last-stand"], ["t-dw-twin", "t-dw-loyal", "t-dw-giant"]],
    ["xun-yu", "순욱", "general", "strategist", ["지원", "제어", "지휘"], [88, 72, 86, 100, 122], ["xy-plan", "xy-counter", "xy-wangzuo"], ["t-xy-wangzuo", "t-xy-talent", "t-xy-incense"]],
    ["yan-liang", "안량", "general", "cavalry", ["돌파", "처형"], [110, 120, 98, 108, 70], ["yl-strike", "yl-charge", "yl-hebei"], ["t-yl-hebei", "t-yl-fierce", "t-yl-rider"]],
    ["wen-chou", "문추", "general", "cavalry", ["돌파", "광역"], [114, 116, 102, 104, 70], ["wc-spear", "wc-sweep", "wc-yanjin"], ["t-wc-hebei", "t-wc-brave", "t-wc-rider"]],
]);
const skills = [
    active("xc-bare", 35, enemyOne("front"), [physical(40, { critChance: 0.15 })]),
    active("xc-guard", 25, enemyUpTo(3, "front"), [status("taunt", 2), heal(12, "actor")]),
    ultimate("xc-tiger", enemyOne(), [physical(55, { critChance: 0.3 })]),
    active("dw-halberds", 35, enemyUpTo(2, "front"), [physical(34, { modifier: 0.85 })]),
    active("dw-guard", 25, enemyUpTo(3, "front"), [status("taunt", 2)]),
    ultimate("dw-last-stand", enemyUpTo(3), [physical(46, { modifier: 0.8 })]),
    active("xy-plan", 35, allyOne(), [extraAction("targets", "interrupt"), energy(10)]),
    active("xy-counter", 30, enemyOne(), [strategy(28), status("confusion", 1)]),
    ultimate("xy-wangzuo", allyUpTo(5), [energy(20), heal(15)]),
    active("yl-strike", 35, enemyOne(), [physical(42, { critChance: 0.2 })]),
    active("yl-charge", 30, enemyOne("front"), [physical(32), shift(20)]),
    ultimate("yl-hebei", enemyUpTo(3), [physical(46, { modifier: 0.8 })]),
    active("wc-spear", 35, enemyOne(), [physical(40)]),
    active("wc-sweep", 40, enemyUpTo(3, "front"), [physical(32, { modifier: 0.8 })]),
    ultimate("wc-yanjin", enemyUpTo(3), [physical(46, { modifier: 0.8 }), status("bleed", 2, { magnitude: 4 })]),
    // enemies
    active("hb-crossbow", 35, enemyUpTo(2), [physical(26, { modifier: 0.85 })]),
    active("hb-e-strike", 35, enemyOne(), [physical(42, { critChance: 0.2 })]),
    active("hb-e-sweep", 40, enemyUpTo(3, "front"), [physical(32, { modifier: 0.8 }), shift(15)]),
    active("ys2-rally", 35, enemyUpTo(3), [strategy(24, { modifier: 0.8 })]),
    ultimate("ys2-volley", enemyUpTo(5), [physical(38, { modifier: 0.7 })]),
    active("depot-torch", 30, enemyOne(), [physical(22), status("burn", 2, { magnitude: 4 })]),
];
const skillNames = {
    "xc-bare": "나의투전", "xc-guard": "호위", "xc-tiger": "호치",
    "dw-halberds": "쌍철극", "dw-guard": "사수", "dw-last-stand": "고악래",
    "xy-plan": "왕좌지재", "xy-counter": "구벌론", "xy-wangzuo": "영군의 향",
    "yl-strike": "하북일격", "yl-charge": "돌격", "yl-hebei": "하북 명장",
    "wc-spear": "장창", "wc-sweep": "횡소", "wc-yanjin": "연진 돌파",
    "hb-crossbow": "강노", "hb-e-strike": "하북일격", "hb-e-sweep": "횡소천군",
    "ys2-rally": "독전", "ys2-volley": "만전일제", "depot-torch": "군량고 사수",
};
const traits = uniqueTraits([
    ["t-xc-tiger", "xu-chu", "호치", "ATK +12%", ["공격"], { statPercent: { atk: 0.12 } }],
    ["t-xc-guard", "xu-chu", "호위군", "DEF/HP +8%", ["탱커", "생존"], { statPercent: { def: 0.08, maxHp: 0.08 } }],
    ["t-xc-bare", "xu-chu", "나의", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
    ["t-dw-twin", "dian-wei", "쌍극", "ATK +12%", ["공격", "광역"], { statPercent: { atk: 0.12 } }],
    ["t-dw-loyal", "dian-wei", "충용", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
    ["t-dw-giant", "dian-wei", "악래", "DEF +12%", ["탱커"], { statPercent: { def: 0.12 } }],
    ["t-xy-wangzuo", "xun-yu", "왕좌", "INT +12%", ["지휘"], { statPercent: { int: 0.12 } }],
    ["t-xy-talent", "xun-yu", "인재 천거", "SPD +8%", ["지원", "속도"], { statPercent: { spd: 0.08 } }],
    ["t-xy-incense", "xun-yu", "유향", "회복 아이템 효과 +30%", ["지원"], { healItemBonus: 0.3 }],
    ["t-yl-hebei", "yan-liang", "하북 맹장", "ATK +12%", ["처형"], { statPercent: { atk: 0.12 } }],
    ["t-yl-fierce", "yan-liang", "용맹", "전투 시작 기력 +25", ["돌파"], { entryEnergy: 25 }],
    ["t-yl-rider", "yan-liang", "기마", "SPD +8%", ["속도"], { statPercent: { spd: 0.08 } }],
    ["t-wc-hebei", "wen-chou", "하북 맹장", "ATK +10%, HP +5%", ["공격"], { statPercent: { atk: 0.1, maxHp: 0.05 } }],
    ["t-wc-brave", "wen-chou", "만용", "ATK +15%, DEF -8%", ["공격"], { statPercent: { atk: 0.15, def: -0.08 } }],
    ["t-wc-rider", "wen-chou", "기마", "SPD +8%", ["속도"], { statPercent: { spd: 0.08 } }],
]);
const A = {
    inf: { name: "하북 보병", stats: [78, 88, 80, 88, 60], reach: "melee", skills: ["dong-halberd"] },
    xbow: { name: "하북 강노병", stats: [64, 88, 64, 92, 62], reach: "ranged", skills: ["hb-crossbow"] },
    cav: { name: "하북 기병", stats: [76, 92, 72, 106, 56], reach: "melee", skills: ["xiliang-charge"] },
    gate: { name: "조조군 관문병", stats: [104, 84, 104, 80, 56], reach: "melee", skills: ["dong-halberd"] },
    depot: { name: "오소 수비병", stats: [80, 84, 84, 86, 60], reach: "melee", skills: ["depot-torch"] },
    heavy: { name: "하북 대극사", stats: [90, 96, 92, 84, 58], reach: "melee", skills: ["dong-halberd"] },
};
const u = (key, slot, scale) => scaledUnit(A[key].name, A[key].stats, A[key].reach, A[key].skills, slot, scale);
const T1 = 0.86;
const T2 = 1.26;
const T3 = 1.74;
const enemyGroups = [
    { id: "gd-scouts", name: "하북 척후", exp: 12, gold: 8, units: [u("inf", "front-left", T1), u("xbow", "rear-left", T1)], loot: [{ id: "bun", weight: 2 }, { id: "herb", weight: 2 }], lootChance: 0.3 },
    { id: "gd-squad", name: "하북 보병대", exp: 14, gold: 10, units: [u("inf", "front-left", T1), u("inf", "front-right", T1), u("xbow", "rear-left", T1)], loot: [{ id: "herb", weight: 2 }, { id: "iron-sword", weight: 1 }], lootChance: 0.3 },
    { id: "gd-riders", name: "하북 경기병", exp: 14, gold: 11, units: [u("cav", "front-left", T1), u("cav", "front-right", T1)], loot: [{ id: "bun", weight: 2 }, { id: "leather-armor", weight: 1 }], lootChance: 0.3 },
    { id: "gd-gate-1", name: "동령관 공수", exp: 26, gold: 18, units: [boss("공수", [150, 96, 100, 90, 60], "melee", ["dong-halberd"], "front-center"), u("gate", "front-left", T2 * 0.9), u("xbow", "rear-left", T2 * 0.9)], loot: [{ id: "scale-armor", weight: 1 }], lootChance: 0.5 },
    { id: "gd-gate-2", name: "낙양 한복·맹탄", exp: 26, gold: 18, units: [boss("맹탄", [150, 98, 96, 92, 60], "melee", ["dong-halberd"], "front-center"), u("gate", "front-right", T2 * 0.9), u("xbow", "rear-right", T2 * 0.9)], loot: [{ id: "medicine", weight: 1 }], lootChance: 0.5 },
    { id: "gd-gate-3", name: "사수관 변희", exp: 26, gold: 18, units: [boss("변희", [150, 100, 94, 94, 60], "melee", ["dong-halberd"], "front-center"), u("gate", "front-left", T2 * 0.9), u("xbow", "rear-left", T2 * 0.9)], loot: [{ id: "war-fan", weight: 1 }], lootChance: 0.5 },
    { id: "gd-gate-4", name: "형양 왕식", exp: 26, gold: 18, units: [boss("왕식", [150, 94, 98, 90, 70], "melee", ["dong-halberd"], "front-center"), u("gate", "front-right", T2 * 0.9), u("xbow", "rear-left", T2 * 0.9)], loot: [{ id: "horn-bow", weight: 1 }], lootChance: 0.5 },
    { id: "gd-cao-patrol", name: "조조군 추격대", exp: 27, gold: 20, units: [u("cav", "front-left", T2), u("gate", "front-center", T2), u("xbow", "rear-right", T2)], loot: [{ id: "medicine", weight: 2 }, { id: "swift-boots", weight: 1 }], lootChance: 0.35 },
    { id: "gd-hebei-host", name: "하북 본대", exp: 28, gold: 22, units: [u("inf", "front-left", T2), u("heavy", "front-right", T2), u("xbow", "rear-left", T2), u("xbow", "rear-right", T2)], loot: [{ id: "long-spear", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "bun", weight: 2 }], lootChance: 0.35 },
    { id: "gd-depot-guard", name: "오소 수비대", exp: 46, gold: 30, units: [u("depot", "front-left", T3), u("depot", "front-right", T3), u("xbow", "rear-left", T3)], loot: [{ id: "rice-sack", weight: 3 }, { id: "elixir", weight: 1 }], lootChance: 0.45 },
    { id: "gd-heavy", name: "하북 대극대", exp: 48, gold: 32, units: [u("heavy", "front-left", T3), u("heavy", "front-center", T3), u("xbow", "rear-left", T3), u("xbow", "rear-right", T3)], loot: [{ id: "dragon-armor", weight: 1 }, { id: "medicine", weight: 2 }], lootChance: 0.4 },
    { id: "gd-cavalry", name: "하북 철기", exp: 46, gold: 30, units: [u("cav", "front-left", T3), u("cav", "front-center", T3), u("cav", "front-right", T3)], loot: [{ id: "ancient-blade", weight: 1 }, { id: "treatment-kit", weight: 1 }], lootChance: 0.4 },
    // bosses
    { id: "boss-yan-liang", name: "백마 안량", boss: true, exp: 80, gold: 60, duel: { unitIndex: 0, penalty: 0.5 }, recruit: { characterId: "yan-liang", chance: 0.35 },
        units: [boss("안량", [290, 102, 96, 104, 70], "melee", ["hb-e-strike", "hb-e-sweep"], "front-center"), u("inf", "front-left", T1 * 1.1), u("xbow", "rear-left", T1 * 1.1)], loot: [{ id: "tiger-tally", weight: 1 }], lootChance: 1 },
    { id: "boss-wen-chou", name: "연진 문추", boss: true, exp: 140, gold: 100, duel: { unitIndex: 0, penalty: 0.5 }, recruit: { characterId: "wen-chou", chance: 0.35 },
        units: [boss("문추", [440, 122, 108, 108, 70], "melee", ["hb-e-sweep", "hb-e-strike"], "front-center"), u("cav", "front-left", T2), u("cav", "front-right", T2), u("xbow", "rear-left", T2)], loot: [{ id: "dragon-armor", weight: 1 }], lootChance: 1 },
    { id: "boss-yuan-shao", name: "하북의 패자 원소", boss: true, exp: 60, gold: 40, nextPhase: "boss-yuan-shao-2",
        units: [boss("원소", [460, 104, 118, 96, 116], "ranged", ["ys2-rally", "ys2-volley"], "rear-left"), u("heavy", "front-left", T3), u("heavy", "front-right", T3), u("xbow", "rear-right", T3)] },
    { id: "boss-yuan-shao-2", name: "패주하는 원소", boss: true, exp: 0, gold: 0, phaseScene: "gd-yuan-rage",
        units: [boss("원소", [300, 110, 112, 100, 118], "ranged", ["ys2-rally", "ys2-volley"], "rear-left"), u("cav", "front-center", T3)] },
];
const scenes = [
    { id: "gd-intro", title: "관도로 가는 길",
        lines: [
            { name: "해설", text: "건안 5년, 하북 4주를 차지한 원소가 10만 대군을 이끌고 남하한다." },
            { name: "해설", text: "중원의 패권을 건 결전, 관도대전이 시작된다." },
        ],
        variants: {
            "liu-bei": [{ name: "해설", text: "서주를 잃은 유비는 원소에게 몸을 의탁했고, 관우는 조조의 진영에 머물러 있다." }, { speaker: "liu-bei", name: "유비", text: "운장, 살아만 있어 다오. 반드시 다시 만나리라." }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "원소는 큰 뜻은 있으나 지혜가 부족하다. 이 싸움, 내가 이긴다." }],
            "sun-quan": [{ name: "해설", text: "강동은 손책을 잃었다. 열아홉의 손권이 뒤를 이어 북쪽의 결전을 지켜본다." }, { speaker: "sun-quan", name: "손권", text: "누가 이기든, 강동은 강동의 길을 갑니다." }],
        } },
    { id: "gd-yan-liang-down", title: "백마의 일격",
        lines: [{ name: "해설", text: "만군 속을 가르고 들어간 일격에 안량이 말에서 떨어졌다. 백마의 포위가 풀린다." }] },
    { id: "gd-f6", title: "천리행",
        lines: [
            { speaker: "guan-yu", name: "관우", text: "형님의 소식을 들었다. 길을 막는 자는 누구든 베고 지나가겠다." },
            { name: "해설", text: "다섯 관문과 여섯 장수. 관마다 수비대를 쓰러뜨려야 길이 열린다." },
        ] },
    { id: "gd-wen-chou-down", title: "연진 격파",
        lines: [{ speaker: "문추", name: "문추", text: "안량의 원수를… 갚지 못하고…" }, { name: "해설", text: "원소의 두 맹장이 모두 쓰러졌다. 이제 남은 것은 원소의 본진." }] },
    { id: "gd-f11", title: "오소 야습",
        lines: [
            { speaker: "cao-cao", name: "조조", text: "허유의 말이 사실이라면, 원소의 군량은 오소에 있다. 오늘 밤 불태운다." },
            { name: "해설", text: "날이 밝기 전에 계단에 닿아야 한다. 동이 트면 적이 경계를 강화한다. (상단 '야음')" },
        ],
        choices: [
            { label: "하마함매(소리를 죽이고 진군)", effects: [{ kind: "food", amount: -5 }, { kind: "exp", amount: 40 }] },
            { label: "군량부터 챙긴다", effects: [{ kind: "food", amount: 20 }] },
        ] },
    { id: "gd-yuan-rage", title: "원소의 분노",
        lines: [{ speaker: "원소", name: "원소", text: "오소가… 오소가 불탔다고? 전군 돌격하라! 한 놈도 남기지 마라!" }] },
    { id: "gd-yuan-down", title: "하북의 몰락",
        lines: [{ name: "해설", text: "원소는 겨우 팔백 기와 함께 황하를 건너 달아났다. 관도의 승패가 갈렸다." }] },
    { id: "gd-outro", title: "북방 통일",
        lines: [{ name: "해설", text: "관도의 승리로 중원의 주인이 정해졌다. 이제 시선은 남쪽, 형주와 강동으로 향한다." }],
        variants: {
            "liu-bei": [{ speaker: "liu-bei", name: "유비", text: "운장, 익덕… 다시 모였구나. 형주의 유표에게 가자." }, { name: "해설", text: "유비 일행은 형주로 향한다. 그곳에서 와룡을 만나게 된다." }],
            "cao-cao": [{ speaker: "cao-cao", name: "조조", text: "하북은 내 것이다. 다음은 강남이다." }, { name: "해설", text: "조조의 대군이 남쪽을 바라본다." }],
            "sun-quan": [{ speaker: "sun-quan", name: "손권", text: "조조가 북방을 얻었다. 머지않아 장강으로 내려오겠지요." }, { name: "해설", text: "강동은 다가올 폭풍을 준비한다." }],
        } },
];
const events = [
    { id: "ev-gd-xu-you", title: "허유의 밀고", text: "원소의 모사 허유가 몰래 찾아와 군량고의 위치를 알려 주겠다고 한다.", choices: [
            { label: "맨발로 맞이한다", effects: [{ kind: "exp", amount: 40 }] },
            { label: "의심한다", effects: [{ kind: "gold", amount: 30 }] }
        ] },
    { id: "ev-gd-letters", title: "내통 서신", text: "원소 진영과 내통한 편지 더미가 발견되었다.", choices: [
            { label: "불태운다", effects: [{ kind: "heal", ratio: 0.2 }, { kind: "exp", amount: 20 }] },
            { label: "읽어본다", effects: [{ kind: "gold", amount: 50 }, { kind: "damage", ratio: 0.1 }] }
        ] },
    { id: "ev-gd-granary", title: "버려진 수레", text: "하북군이 버리고 간 군량 수레다.", choices: [
            { label: "챙긴다", effects: [{ kind: "food", amount: 25 }] },
            { label: "약품만 챙긴다", effects: [{ kind: "item", itemId: "medicine" }] }
        ] },
];
const EVENTS = [{ id: "ev-gd-xu-you", weight: 1 }, { id: "ev-gd-letters", weight: 2 }, { id: "ev-gd-granary", weight: 2 }, { id: "ev-shrine", weight: 1 }, { id: "ev-caravan", weight: 1 }, { id: "ev-wounded", weight: 1 }];
const RAID = { type: "night-raid", params: { limit: 110 } };
const NIGHT = [{ id: "night", weight: 4 }, { id: "fog", weight: 1 }, { id: "smoke", weight: 1 }];
const GATES = ["gd-gate-1", "gd-gate-2", "gd-gate-3", "gd-gate-4"];
function gdFloor(depth) {
    const withEvents = (items, count, recruit, event) => objects(items, count, recruit, event).map((spec) => spec.kind === "event" ? { ...spec, pool: EVENTS } : spec);
    if (depth === 5)
        return { depth, enemyGroups: [{ id: "gd-squad", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-yan-liang", safeZoneAfter: true, objects: withEvents(ITEM_POOL_EARLY, [1, 2], 0, 0) };
    if (depth === 10)
        return { depth, enemyGroups: [{ id: "gd-hebei-host", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-wen-chou", safeZoneAfter: true, objects: withEvents(ITEM_POOL_MID, [1, 2], 0, 0) };
    if (depth === 15)
        return { depth, enemyGroups: [{ id: "gd-heavy", weight: 1 }, { id: "gd-cavalry", weight: 1 }], enemyCount: [2, 3], traps: BASIC_TRAPS, trapCount: [1, 2], bossGroupId: "boss-yuan-shao", objects: withEvents(ITEM_POOL_LATE, [1, 2], 0, 0) };
    const tier = depth <= 4 ? 1 : depth <= 9 ? 2 : 3;
    const groups = tier === 1
        ? (depth <= 2 ? [{ id: "gd-scouts", weight: 3 }, { id: "gd-squad", weight: 1 }] : [{ id: "gd-scouts", weight: 2 }, { id: "gd-squad", weight: 2 }, { id: "gd-riders", weight: 2 }])
        : tier === 2 ? [{ id: "gd-cao-patrol", weight: 2 }, { id: "gd-hebei-host", weight: 2 }]
            : [{ id: "gd-depot-guard", weight: 3 }, { id: "gd-heavy", weight: 2 }, { id: "gd-cavalry", weight: 2 }];
    return {
        depth, enemyGroups: groups, enemyCount: tier === 1 ? [3, 4] : [3, 5], traps: BASIC_TRAPS, trapCount: [2, 2 + tier],
        objects: withEvents(tier === 1 ? ITEM_POOL_EARLY : tier === 2 ? ITEM_POOL_MID : ITEM_POOL_LATE, [2, 3], depth >= 2 && depth <= 12 ? 0.3 : 0, 0.35),
        // 관우 천리행: 6–9F each end in a guarded pass (5관 — 활주 is the 연진 boss floor).
        ...(depth >= 6 && depth <= 9 ? { gateDefenderGroupId: GATES[depth - 6] } : {}),
        ...(tier === 3 ? { mechanics: [RAID], modifierChance: 0.6, modifiers: NIGHT } : { modifierChance: depth === 1 ? 0 : 0.3, modifiers: MODIFIERS }),
    };
}
export const E4_GUANDU = {
    campaign: {
        id: ID, name: "관도대전", order: 4, era: "200",
        summary: "원소의 10만 대군. 백마·연진의 맹장, 관우의 천리행, 오소 야습으로 승부를 뒤집는다.",
        scenes: {
            intro: "gd-intro", outro: "gd-outro", floorEnter: { 6: "gd-f6", 11: "gd-f11" },
            bossDefeated: { "boss-yan-liang": "gd-yan-liang-down", "boss-wen-chou": "gd-wen-chou-down", "boss-yuan-shao-2": "gd-yuan-down" },
        },
        floors: Array.from({ length: 15 }, (_, index) => gdFloor(index + 1)),
        shopItems: [{ id: "bun", weight: 3 }, { id: "rice-sack", weight: 2 }, { id: "herb", weight: 3 }, { id: "medicine", weight: 2 }, { id: "treatment-kit", weight: 2 }, { id: "fire-pot", weight: 1 }, { id: "elixir", weight: 1 }, { id: "scout-map", weight: 1 }],
        shopEquipment: [{ id: "long-spear", weight: 1 }, { id: "horn-bow", weight: 1 }, { id: "war-fan", weight: 1 }, { id: "scale-armor", weight: 1 }, { id: "tiger-tally", weight: 1 }, { id: "ancient-blade", weight: 1 }],
    },
    characters, skills, skillNames, traits, enemyGroups, events, scenes,
    unlocks: [
        { id: "u-guandu", condition: { kind: "clear-campaign", campaignId: "xuzhou" }, unlock: { campaignId: ID } },
        { id: "u-dian-wei", condition: { kind: "defeat-group", groupId: "boss-yan-liang" }, unlock: { characterId: "dian-wei" } },
        { id: "u-xu-chu", condition: { kind: "reach-depth", campaignId: ID, depth: 10 }, unlock: { characterId: "xu-chu", achievement: "천리행" } },
        { id: "u-xun-yu", condition: { kind: "clear-campaign", campaignId: ID }, unlock: { characterId: "xun-yu", achievement: "관도대전 승리" } },
    ],
};
//# sourceMappingURL=e4-guandu.js.map