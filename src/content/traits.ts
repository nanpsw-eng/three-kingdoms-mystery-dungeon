import type { SkillDefinition } from "../battle/action.js";
import type { TraitDefinition } from "../run/types.js";
import { active, allyOne, enemyOne, enemyUpTo, extraAction, heal, physical, status, strategy } from "./skills.js";

// DEC-011: unique ~70-80% + common ~20-30%, related-tag weight ×1.75 (run/balance.ts).
type U = [id: string, owner: string, name: string, description: string, tags: string[], effect: TraitDefinition["effect"]];

const UNIQUE: U[] = [
  ["t-liu-virtue", "liu-bei", "덕망", "위기 아군 지원 강화: INT +12%", ["지원"], { statPercent: { int: 0.12 } }],
  ["t-liu-benevolence", "liu-bei", "인의", "회복 아이템 효과 +30%", ["지원", "회복"], { healItemBonus: 0.3 }],
  ["t-liu-oath", "liu-bei", "도원결의", "스킬 '도원의 맹세' 습득", ["결속"], { grantSkillId: "oath-pledge" }],
  ["t-cao-artofwar", "cao-cao", "병법", "기습 강화: 전투 시작 기력 +20", ["지휘", "기습"], { entryEnergy: 20 }],
  ["t-cao-ambition", "cao-cao", "간웅", "ATK/INT +8%", ["지휘"], { statPercent: { atk: 0.08, int: 0.08 } }],
  ["t-cao-employ", "cao-cao", "용인", "SPD +6%", ["지휘", "속도"], { statPercent: { spd: 0.06 } }],
  ["t-sun-guard", "sun-quan", "견수", "DEF/HP +10%", ["방어"], { statPercent: { def: 0.1, maxHp: 0.1 } }],
  ["t-sun-wealth", "sun-quan", "부국", "회복 아이템 효과 +25%", ["지원"], { healItemBonus: 0.25 }],
  ["t-sun-jiangdong", "sun-quan", "강동경영", "함정 감지 30%", ["탐색"], { passiveTrapDetection: 0.3 }],
  ["t-guan-blade", "guan-yu", "청룡언월도", "ATK +12%", ["공격", "처형"], { statPercent: { atk: 0.12 } }],
  ["t-guan-pride", "guan-yu", "위풍", "전투 시작 기력 +25", ["공격"], { entryEnergy: 25 }],
  ["t-guan-loyal", "guan-yu", "충의", "HP +12%", ["생존"], { statPercent: { maxHp: 0.12 } }],
  ["t-zf-roar", "zhang-fei", "포효", "스킬 '대갈일성' 습득", ["도발", "기절"], { grantSkillId: "great-shout" }],
  ["t-zf-iron", "zhang-fei", "철골", "DEF +15%", ["탱커"], { statPercent: { def: 0.15 } }],
  ["t-zf-fury", "zhang-fei", "격노", "ATK +10%, DEF -5%", ["공격"], { statPercent: { atk: 0.1, def: -0.05 } }],
  ["t-zy-dragon", "zhao-yun", "용담", "ATK/SPD +6%", ["돌파", "속도"], { statPercent: { atk: 0.06, spd: 0.06 } }],
  ["t-zy-swift", "zhao-yun", "백마", "전투 시작 기력 +30", ["연속행동"], { entryEnergy: 30 }],
  ["t-zy-guardian", "zhao-yun", "호위", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
  ["t-hz-eagle", "huang-zhong", "응시", "ATK +12%", ["치명타", "후열저격"], { statPercent: { atk: 0.12 } }],
  ["t-hz-veteran", "huang-zhong", "노장", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
  ["t-hz-steady", "huang-zhong", "정조준", "스킬 '관통사' 습득", ["처형"], { grantSkillId: "piercing-shot" }],
  ["t-zg-wind", "zhuge-liang", "차동풍", "INT +12%", ["화공"], { statPercent: { int: 0.12 } }],
  ["t-zg-insight", "zhuge-liang", "신산", "SPD +8%", ["제어", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-zg-bagua", "zhuge-liang", "팔괘", "함정 감지 40%", ["탐색"], { passiveTrapDetection: 0.4 }],
  ["t-zl-raid", "zhang-liao", "급습", "전투 시작 기력 +25", ["기습"], { entryEnergy: 25 }],
  ["t-zl-charge", "zhang-liao", "선봉", "ATK +10%", ["돌파"], { statPercent: { atk: 0.1 } }],
  ["t-zl-terror", "zhang-liao", "요래요래", "SPD +8%", ["협공", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-xd-wall", "xiahou-dun", "불굴", "DEF +15%", ["탱커"], { statPercent: { def: 0.15 } }],
  ["t-xd-onefeye", "xiahou-dun", "발시담정", "ATK +10%", ["반격"], { statPercent: { atk: 0.1 } }],
  ["t-xd-endure", "xiahou-dun", "인내", "HP +15%", ["생존"], { statPercent: { maxHp: 0.15 } }],
  ["t-jx-venom", "jia-xu", "독사", "INT +12%", ["독"], { statPercent: { int: 0.12 } }],
  ["t-jx-schemer", "jia-xu", "모사", "스킬 '반간계' 습득", ["혼란", "디버프"], { grantSkillId: "sow-discord" }],
  ["t-jx-survivor", "jia-xu", "보신", "HP/DEF +8%", ["생존"], { statPercent: { maxHp: 0.08, def: 0.08 } }],
  ["t-tc-volley", "taishi-ci", "속사", "SPD +8%", ["연사", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-tc-duel", "taishi-ci", "일기토", "ATK +10%", ["공격"], { statPercent: { atk: 0.1 } }],
  ["t-tc-faith", "taishi-ci", "신의", "전투 시작 기력 +20", ["공격"], { entryEnergy: 20 }],
  ["t-zhy-fire", "zhou-yu", "화신", "INT +12%", ["화공"], { statPercent: { int: 0.12 } }],
  ["t-zhy-elegance", "zhou-yu", "미주랑", "SPD +6%, INT +4%", ["제어"], { statPercent: { spd: 0.06, int: 0.04 } }],
  ["t-zhy-command", "zhou-yu", "도독", "전투 시작 기력 +25", ["광역"], { entryEnergy: 25 }],
  ["t-gn-pirate", "gan-ning", "금범적", "ATK +10%", ["치명타"], { statPercent: { atk: 0.1 } }],
  ["t-gn-plunder", "gan-ning", "약탈", "SPD +8%", ["약탈", "속도"], { statPercent: { spd: 0.08 } }],
  ["t-gn-night", "gan-ning", "백기야습", "전투 시작 기력 +30", ["기습"], { entryEnergy: 30 }],
  ["t-ht-mafei", "hua-tuo", "마비산", "INT +12%", ["회복"], { statPercent: { int: 0.12 } }],
  ["t-ht-five", "hua-tuo", "오금희", "HP/SPD +6%", ["생존"], { statPercent: { maxHp: 0.06, spd: 0.06 } }],
  ["t-ht-herbal", "hua-tuo", "본초", "회복 아이템 효과 +40%", ["회복", "지원"], { healItemBonus: 0.4 }],
];

type C = [id: string, name: string, description: string, tags: string[], classes: TraitDefinition["classes"], effect: TraitDefinition["effect"]];
const COMMON: C[] = [
  ["c-vigor", "강건", "HP +8%", ["생존"], undefined, { statPercent: { maxHp: 0.08 } }],
  ["c-drill", "조련", "ATK +6%", ["공격"], undefined, { statPercent: { atk: 0.06 } }],
  ["c-armor", "중갑", "DEF +8%", ["방어", "탱커"], ["infantry"], { statPercent: { def: 0.08 } }],
  ["c-horse", "명마", "SPD +6%", ["속도", "돌파"], ["cavalry"], { statPercent: { spd: 0.06 } }],
  ["c-quiver", "화살통", "ATK +8%", ["후열저격"], ["archer"], { statPercent: { atk: 0.08 } }],
  ["c-scroll", "병법서", "INT +8%", ["제어", "화공"], ["strategist", "support"], { statPercent: { int: 0.08 } }],
  ["c-morale", "사기", "전투 시작 기력 +15", ["공격"], undefined, { entryEnergy: 15 }],
  ["c-scout", "척후", "함정 감지 20%", ["탐색"], undefined, { passiveTrapDetection: 0.2 }],
  ["c-medic", "구급", "회복 아이템 효과 +20%", ["회복"], ["support", "strategist", "infantry"], { healItemBonus: 0.2 }],
  ["c-focus", "집중", "SPD +4%, ATK +4%", ["속도"], undefined, { statPercent: { spd: 0.04, atk: 0.04 } }],
  ["c-wall", "견벽", "HP/DEF +5%", ["생존", "방어"], undefined, { statPercent: { maxHp: 0.05, def: 0.05 } }],
  ["c-sage", "책사", "INT +6%, SPD +3%", ["제어"], ["strategist", "support"], { statPercent: { int: 0.06, spd: 0.03 } }],
];

export const TRAITS: readonly TraitDefinition[] = [
  ...UNIQUE.map(([id, ownerId, name, description, tags, effect]) => ({ id, ownerId, name, description, tags, effect })),
  ...COMMON.map(([id, name, description, tags, classes, effect]) => ({ id, name, description, tags, effect, ...(classes ? { classes } : {}) })),
];

export const TRAIT_SKILLS: readonly SkillDefinition[] = [
  active("oath-pledge", 40, allyOne(), [heal(20), extraAction("targets", "interrupt")]),
  active("great-shout", 40, enemyUpTo(3, "front"), [status("stun", 1)]),
  active("piercing-shot", 40, enemyUpTo(2), [physical(36, { modifier: 0.85, evasionChance: 0 })]),
  active("sow-discord", 35, enemyUpTo(2), [strategy(22), status("confusion", 1)]),
];

export const TRAIT_SKILL_NAMES: Readonly<Record<string, string>> = {
  "oath-pledge": "도원의 맹세", "great-shout": "대갈일성", "piercing-shot": "관통사", "sow-discord": "반간계",
};
