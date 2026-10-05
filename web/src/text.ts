import type { DungeonEvent, RunEngine, RunEvent } from "../../src/index.js";

export const TRAP_NAMES: Record<string, string> = {
  rockfall: "낙석", "poison-needle": "독침", "fire-circle": "화염진", pit: "구덩이", "alarm-bell": "경보종",
  "food-loss": "군량 손실", "confusion-circle": "혼란진", "teleport-circle": "전이진",
};
export const MODIFIER_NAMES: Record<string, string> = { fog: "안개", night: "야간", "strong-wind": "강풍", dry: "건조", rain: "우천", smoke: "연막" };
export const DANGER_NAMES: Record<string, string> = { stable: "안정", caution: "경계", danger: "위험" };
export const STATUS_NAMES: Record<string, string> = {
  poison: "독", burn: "화상", bleed: "출혈", confusion: "혼란", stun: "기절", taunt: "도발", "defense-down": "방어↓", "timeline-delay": "지연",
};
export const SLOT_NAMES: Record<string, string> = { "front-left": "전열 좌", "front-center": "전열 중", "front-right": "전열 우", "rear-left": "후열 좌", "rear-right": "후열 우" };
export const CLASS_NAMES: Record<string, string> = { infantry: "보병", cavalry: "기병", archer: "궁병", strategist: "군사", support: "지원" };

export function contentName(run: RunEngine, id: string): string {
  return run.item(id)?.name ?? run.equipmentDef(id)?.name ?? id;
}

function memberName(run: RunEngine, id: string): string {
  try { return run.character(id).name; } catch { return id; }
}

export function describeDungeonEvent(run: RunEngine, event: DungeonEvent): string | null {
  switch (event.type) {
    case "blocked": return event.reason === "stairs-locked" ? "보스를 쓰러뜨려야 계단을 내려갈 수 있다." : event.reason === "stuck" ? "구덩이에 빠져 움직일 수 없다." : null;
    case "trap": {
      if (event.target !== "player") return "적이 " + (TRAP_NAMES[event.trap] ?? event.trap) + "에 걸렸다!";
      const total = event.damage.reduce((sum, d) => sum + d.amount, 0);
      return (TRAP_NAMES[event.trap] ?? event.trap) + " 함정!" + (total > 0 ? " 부대 피해 " + total : "");
    }
    case "trap-found": return "함정을 발견했다.";
    case "secret-found": return "숨겨진 통로를 찾았다!";
    case "secret-hint": return "벽에서 이상한 바람이 느껴진다…";
    case "enemy-alert": return "적이 아군을 발견했다!";
    case "reinforcement": return "어디선가 적 증원이 나타났다.";
    case "danger": return "층 위험도: " + (DANGER_NAMES[event.level] ?? event.level);
    case "starvation": return "군량이 떨어져 부대가 굶주린다!";
    case "teleported": return "전이진에 의해 다른 곳으로 이동했다.";
    case "gate-opened": return "관문이 열렸다!";
    case "sorcery-destroyed": return "술법진을 파괴했다.";
    case "party-defeated": return "부대가 전멸했다…";
    case "descended": return "계단을 내려갔다.";
    case "food": return null;
    default: return null;
  }
}

export function describeRunEvent(run: RunEngine, event: RunEvent): string | null {
  switch (event.type) {
    case "dungeon": return describeDungeonEvent(run, event.event);
    case "floor-entered": return event.depth + "층에 진입했다." + (event.modifier ? " [" + (MODIFIER_NAMES[event.modifier] ?? event.modifier) + "]" : "");
    case "battle-started": return event.groupName + "과(와) 교전! " + (event.encounter.surprise === "ally" ? "(아군 기습)" : event.encounter.surprise === "enemy" ? "(적의 기습)" : "") + (event.encounter.empowered ? " 술법진의 힘이 적을 감싼다." : "");
    case "battle-ended":
      return event.outcome === "victory" ? "승리! EXP +" + event.exp + ", 금 +" + event.gold + (event.loot.length ? ", 전리품: " + event.loot.map((id) => contentName(run, id)).join(", ") : "")
        : event.outcome === "retreat" ? "퇴각에 성공했다." : "패배했다…";
    case "level-up": return "부대 레벨 " + event.level + "!";
    case "trait-chosen": return memberName(run, event.characterId) + " 특성 습득: " + run.trait(event.traitId).name;
    case "recruited": return memberName(run, event.characterId) + "이(가) 합류했다!";
    case "picked-up": return contentName(run, event.contentId) + "을(를) 얻었다.";
    case "bag-full": return "가방이 가득 찼다: " + contentName(run, event.contentId);
    case "item-used": return contentName(run, event.itemId) + " 사용.";
    case "equipped": return memberName(run, event.characterId) + " 장착: " + contentName(run, event.equipmentId);
    case "event-resolved": return null;
    case "safe-zone": return "안전 정비구역에 도착했다. 부대가 회복되었다.";
    case "purchased": return contentName(run, event.contentId) + " 구매.";
    case "run-cleared": return "전역을 평정했다!";
    case "run-failed": return event.cause === "starvation" ? "군량이 바닥나 원정이 끝났다." : "원정이 실패로 끝났다.";
  }
}
