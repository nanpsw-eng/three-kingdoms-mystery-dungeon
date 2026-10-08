// Presentation adapter only. Target and command legality remain owned by BattleEngine.
import type { BattleSnapshot, FormationSlot } from "../../src/index.js";
import { SLOT_NAMES, STATUS_NAMES } from "./text.js";

type Side = "ally" | "enemy";
export interface BattleFieldOptions {
  snapshot: BattleSnapshot;
  name: (id: string) => string;
  portrait: (id: string) => HTMLImageElement;
  legal: ReadonlySet<string>;
  selected: ReadonlySet<string>;
  hit: ReadonlySet<string>;
  healed: ReadonlySet<string>;
  formationPicking: boolean;
  onUnit: (id: string) => void;
  onSlot: (slot: FormationSlot) => void;
}
function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag); el.className = cls; el.append(...children); return el;
}
function meter(value: number, max: number, energy = false): HTMLElement {
  const track = node("div", "bar" + (energy ? " energy" : ""));
  const fill = document.createElement("i"); fill.style.width = Math.max(0, Math.min(100, value / Math.max(1, max) * 100)) + "%";
  track.append(fill); return track;
}
export function battleField(options: BattleFieldOptions): HTMLElement {
  const { snapshot: snap } = options;
  const activeId = snap.activeTurn?.actorId;
  const card = (side: Side, slot: FormationSlot): HTMLElement => {
    const formation = side === "ally" ? snap.allyFormation : snap.enemyFormation;
    const id = formation.find(entry => entry.slot === slot)?.unitId
      ?? snap.koSlots.find(entry => entry.slot === slot && snap.units.find(u => u.id === entry.unitId)?.side === side)?.unitId;
    const canMove = options.formationPicking && side === "ally" && id !== activeId;
    const el = node(id === undefined && !canMove ? "div" : "button", id === undefined ? "slot" : "unit " + side);
    el.dataset.slot = slot; el.dataset.side = side;
    if (id === undefined) {
      if (canMove) { el.classList.add("targetable"); el.textContent = "이동"; el.setAttribute("aria-label", SLOT_NAMES[slot] + " 이동"); el.addEventListener("click", () => options.onSlot(slot)); }
      else { el.setAttribute("aria-label", SLOT_NAMES[slot] + " 빈 자리"); }
      return el;
    }
    const unit = snap.units.find(u => u.id === id)!;
    const name = options.name(id), isTarget = canMove || options.legal.has(id);
    el.dataset.unitId = id;
    for (const [cls, enabled] of Object.entries({ ko: unit.knockedOut, guarded: snap.guarding.includes(id), active: activeId === id, targetable: isTarget,
      selected: options.selected.has(id), hit: options.hit.has(id), healed: options.healed.has(id) })) if (enabled) el.classList.add(cls);
    el.setAttribute("aria-label", `${name} · ${SLOT_NAMES[slot]} · HP ${unit.hp}/${unit.stats.maxHp} · 기력 ${unit.energy}` + (unit.knockedOut ? " · 전투불능" : ""));
    if (isTarget) el.setAttribute("aria-pressed", String(options.selected.has(id)));
    el.addEventListener("click", () => { if (canMove) options.onSlot(slot); else options.onUnit(id); });
    const portrait = options.portrait(id); portrait.alt = "";
    el.append(node("div", "unit-head", portrait, node("div", "unit-meta", node("b", "", name),
      node("div", "unit-hp num", node("b", "", unit.hp + "/" + unit.stats.maxHp)),
      node("small", "unit-state", unit.knockedOut ? "전투불능" : activeId === id ? "행동 중" : snap.guarding.includes(id) ? "방어 중" : ""))), meter(unit.hp, unit.stats.maxHp),
      node("div", "unit-energy num", node("span", "", "기력 " + unit.energy), meter(unit.energy, 100, true)));
    const tags = node("span", "tags");
    for (const status of snap.statuses.find(s => s.unitId === id)?.statuses ?? []) {
      const tag = node("span", "tag", (STATUS_NAMES[status.type] ?? status.type) + (status.stacks > 1 ? "×" + status.stacks : "")); tag.dataset.status = status.type; tags.append(tag);
    }
    if (tags.children.length) el.append(tags);
    return el;
  };
  const section = (side: Side): HTMLElement => {
    const result = node("section", "battle-side " + side); result.setAttribute("aria-label", side === "ally" ? "아군 진형" : "적군 진형");
    result.append(node("h3", "side-caption", side === "ally" ? "아군" : "적군"));
    const rows: [string, FormationSlot[]][] = side === "enemy"
      ? [["후열", ["rear-left", "rear-right"]], ["전열", ["front-left", "front-center", "front-right"]]]
      : [["전열", ["front-left", "front-center", "front-right"]], ["후열", ["rear-left", "rear-right"]]];
    for (const [label, slots] of rows) {
      const cards = slots.map(slot => card(side, slot));
      // Vacant rows appear during formation selection; occupied/KO rows always remain visible.
      if (!cards.some(c => c.dataset.unitId || c.classList.contains("targetable"))) continue;
      const row = node("div", "formation-row"); row.append(node("span", "rank-caption", label));
      const formation = node("div", "formation" + (slots.length === 2 ? " rear-formation" : ""), ...cards);
      row.append(formation); result.append(row);
    }
    return result;
  };
  return node("div", "field", section("enemy"), section("ally"));
}
