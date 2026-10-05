import {
  MVP_CONTENT, RunEngine, RepeatAutoController, applyRunToMeta, chooseAllAttackCommand, chooseSmartCommand, initialMeta, FORMATION_SLOTS,
  type AbilityTargeting, type BattleCommand, type Direction, type FormationSlot, type MetaState, type RunCommand, type RunEvent, type RunOptions,
} from "../../src/index.js";
import { drawMap, tileAt } from "./map.js";
import { loadAssets } from "./assets.js";
import { portraitUrl } from "./portraits.js";
import { figureUrl, iconUrl, spriteImg } from "./sprites.js";
import { isStoryPhase, storySheet } from "./story.js";
import { CLASS_NAMES, DANGER_NAMES, MODIFIER_NAMES, SLOT_NAMES, STATUS_NAMES, contentName, describeRunEvent } from "./text.js";

const content = MVP_CONTENT;
const META_KEY = "tkmd.meta.v1";
const SAVE_KEY = "tkmd.save.v1";
type AutoMode = "manual" | "smart" | "all-attack" | "repeat";
interface SaveData { readonly version: 1; readonly options: RunOptions; readonly log: RunCommand[] }

// ---------- storage (per-device convenience; wrapped in try/catch) ----------
function load<T>(key: string): T | null { try { const raw = localStorage.getItem(key); return raw === null ? null : JSON.parse(raw) as T; } catch { return null; } }
function store(key: string, value: unknown): void { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } }
function remove(key: string): void { try { localStorage.removeItem(key); } catch { /* ignore */ } }

// ---------- state ----------
const app = document.getElementById("app")!;
let meta: MetaState = load<MetaState>(META_KEY) ?? initialMeta(content);
let run: RunEngine | null = null;
let save: SaveData | null = null;
let log: string[] = [];
let modal: null | "bag" | "party" = null;
let autoMode: AutoMode = "manual";
let speed = 1;
let autoTimer: number | null = null;
let repeat = new RepeatAutoController();
let selection: null | { kind: "attack" } | { kind: "skill"; skillId: string; targeting: AbilityTargeting; targets: string[] } | { kind: "item"; itemId: string; targeting: AbilityTargeting; targets: string[] } | { kind: "formation" } = null;
let pickTarget: null | { label: string; options: { id: string; label: string }[]; onPick: (id: string) => void } = null;
let unlockedBefore: string[] = [];
const title = { campaignId: "yellow-turban", rulerId: "liu-bei", generals: [] as string[] };

// ---------- tiny DOM helper ----------
type Child = Node | string | null | undefined | false;
function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value as EventListener);
    else if (key === "class") el.className = String(value);
    else if (key === "style") el.setAttribute("style", String(value));
    else if (key === "disabled") (el as HTMLButtonElement).disabled = Boolean(value);
    else el.setAttribute(key, String(value));
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) el.append(child);
  return el;
}
const button = (label: string, onclick: () => void, extra: Record<string, unknown> = {}): HTMLButtonElement => h("button", { onclick, ...extra }, label);
const bar = (value: number, max: number, cls = ""): HTMLElement => h("div", { class: "bar " + cls }, h("i", { style: `width:${Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))}%` }));

function put(...children: Child[]): void {
  for (const child of children) if (child !== null && child !== undefined && child !== false) app.append(child);
}

const pic = (key: string, size: number, alt = ""): HTMLImageElement => spriteImg(portraitUrl(key), size, alt, "px portrait");
const icon = (id: string, size = 28): HTMLImageElement => spriteImg(iconUrl(id), size, "", "px icon");
let hitIds = new Set<string>();

function say(message: string): void { log = [message, ...log].slice(0, 60); }

// ---------- run control ----------
function startRun(options: RunOptions, replay: RunCommand[] = []): void {
  run = new RunEngine(content, { ...options, meta, battleMode: "manual" });
  save = { version: 1, options, log: [] };
  log = [];
  repeat = new RepeatAutoController();
  unlockedBefore = [...meta.unlockedCharacters, ...meta.unlockedCampaigns];
  for (const command of replay) {
    try { run.act(command); save.log.push(command); if (command.type === "battle") repeat.record(command.command); }
    catch { break; }
  }
  say(run.depth + "층. 원정을 시작한다." + (replay.length ? " (이어하기)" : ""));
  store(SAVE_KEY, save);
  render();
}

function act(command: RunCommand, quiet = false): RunEvent[] {
  if (run === null) return [];
  let events: RunEvent[] = [];
  try {
    events = run.act(command);
  } catch (error) {
    say("⚠ " + (error instanceof Error ? error.message : String(error)));
    render();
    return [];
  }
  save?.log.push(command);
  if (command.type === "battle") repeat.record(command.command);
  if (!quiet) sayEvents(events);
  if (run.phase === "cleared" || run.phase === "failed") {
    meta = applyRunToMeta(meta, run.summary(), content);
    store(META_KEY, meta);
    remove(SAVE_KEY);
  } else if (save !== null) store(SAVE_KEY, save);
  return events;
}

function sayEvents(events: readonly RunEvent[]): void {
  if (run === null) return;
  for (const event of events) { const text = describeRunEvent(run, event); if (text) say(text); }
}

function scheduleAuto(): void {
  if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null; }
  if (run === null || run.phase !== "battle" || autoMode === "manual") return;
  autoTimer = window.setTimeout(() => {
    autoTimer = null;
    const battle = run?.battle;
    if (!run || !battle || run.phase !== "battle" || autoMode === "manual") return;
    const command = autoMode === "smart" ? chooseSmartCommand(battle) : autoMode === "all-attack" ? chooseAllAttackCommand(battle) : repeat.choose(battle);
    narrateBattle(command);
    render();
  }, [0, 650, 350, 160][speed] ?? 350);
}

function unitName(id: string): string {
  if (run === null) return id;
  if (!id.includes("#")) { try { return run.character(id).name; } catch { return id; } }
  const index = Number(id.split("#")[1]);
  return run.encounter ? run.group(run.encounter.groupId)?.units[index]?.name ?? id : id;
}

/** Executes one battle command and logs the HP changes it caused (incl. triggered enemy turns) before the result events. */
function narrateBattle(command: BattleCommand): void {
  const battle = run?.battle ?? null;
  const before = new Map(battle?.snapshot().units.map((u) => [u.id, u.hp]) ?? []);
  const actor = unitName(command.actorId);
  const verb = command.type === "attack" ? "공격" : command.type === "guard" ? "방어" : command.type === "formation" ? "위치 변경"
    : command.type === "retreat" ? "퇴각 시도" : command.type === "item" ? contentName(run!, command.itemId)
    : content.skillNames[command.skillId] ?? command.skillId;
  const names = new Map([...before.keys()].map((id) => [id, unitName(id)]));
  const events = act({ type: "battle", command }, true);
  const after = battle?.snapshot().units ?? [];
  const changes = after.map((u) => {
    const prev = before.get(u.id);
    if (prev === undefined || prev === u.hp) return null;
    return (names.get(u.id) ?? u.id) + (u.hp < prev ? " -" + (prev - u.hp) : " +" + (u.hp - prev)) + (u.knockedOut ? "(KO)" : "");
  }).filter(Boolean);
  hitIds = new Set(after.filter((u) => { const prev = before.get(u.id); return prev !== undefined && u.hp < prev; }).map((u) => u.id));
  say(actor + " · " + verb + (changes.length ? " → " + changes.join(", ") : ""));
  sayEvents(events);
}

// ---------- screens ----------
function render(): void {
  app.replaceChildren();
  if (run === null) renderTitle();
  else if (run.phase === "cleared" || run.phase === "failed") renderEnd();
  else if (run.phase === "battle") { renderBattle(); hitIds = new Set(); }
  else if (run.phase === "safe-zone") renderSafeZone();
  else renderDungeon();
  if (run !== null && isStoryPhase(run.phase)) sheet(...storySheet({ run, act: (command) => { act(command); }, render, portrait: (key, size, alt) => pic(key, size, alt) }, run.pending()[0]!));
  else if (run !== null && (run.phase === "trait-choice" || run.phase === "recruit" || run.phase === "event")) renderDecision();
  else if (modal === "bag") renderBag();
  else if (modal === "party") renderParty();
  if (pickTarget !== null) renderPicker();
  scheduleAuto();
}

function renderTitle(): void {
  const unlockedChars = new Set(meta.unlockedCharacters);
  const rulers = content.characters.filter((c) => c.kind === "ruler");
  const generals = content.characters.filter((c) => c.kind === "general");
  const saved = load<SaveData>(SAVE_KEY);
  title.generals = title.generals.filter((id) => unlockedChars.has(id));
  put(
    h("header", { class: "title-banner" },
      h("div", { class: "title-row" }, ...rulers.map((c) => pic(c.id, 56, c.name))),
      h("h1", {}, "삼국지 미스터리 던전"),
      h("p", { class: "subtitle" }, "군주와 장수를 골라 원정을 떠나라. 원정이 끝나면 레벨·장비는 사라지고, 새 장수와 전역만 남는다.")),
    saved ? h("div", { class: "panel row" }, h("span", { class: "grow" }, "진행 중인 원정이 있다."), button("이어하기", () => startRun(saved.options, saved.log), { class: "primary" }), button("포기", () => { remove(SAVE_KEY); render(); })) : null,
    h("div", { class: "panel" }, h("h2", {}, "전역"), h("div", { class: "row" }, ...content.campaigns.map((c) => {
      const locked = !meta.unlockedCampaigns.includes(c.id);
      return button((locked ? "🔒 " : "") + c.name, () => { title.campaignId = c.id; render(); }, { class: title.campaignId === c.id ? "selected" : "", disabled: locked });
    }))),
    h("div", { class: "panel" }, h("h2", {}, "군주"), h("div", { class: "grid3" }, ...rulers.map((c) =>
      h("button", { class: "pick " + (title.rulerId === c.id ? "selected" : ""), onclick: () => { title.rulerId = c.id; render(); } }, pic(c.id, 64, c.name), h("span", {}, c.name))))),
    h("div", { class: "panel" }, h("h2", {}, "자유 장수 (2명)"), h("div", { class: "grid3" }, ...generals.map((c) => {
      const locked = !unlockedChars.has(c.id);
      const chosen = title.generals.includes(c.id);
      return h("button", {
        class: "pick " + (chosen ? "selected" : "") + (locked ? " locked" : ""), disabled: locked, title: CLASS_NAMES[c.characterClass] + " · " + c.roleTags.join("/"),
        onclick: () => { title.generals = chosen ? title.generals.filter((id) => id !== c.id) : [...title.generals, c.id].slice(-2); render(); },
      }, pic(c.id, 48, c.name), h("span", {}, locked ? "🔒" : c.name), h("small", {}, locked ? "미해금" : CLASS_NAMES[c.characterClass] ?? ""));
    }))),
    button("원정 시작", () => {
      if (title.generals.length !== 2) { say("장수를 2명 선택하라."); return; }
      startRun({ seed: Date.now().toString(36), campaignId: title.campaignId, rulerId: title.rulerId, generalIds: title.generals });
    }, { class: "primary", disabled: title.generals.length !== 2 }),
    h("div", { class: "panel" }, h("h2", {}, "기록"),
      h("p", {}, `원정 ${meta.runs}회 · 평정 ${meta.clears}회 · 해금 장수 ${meta.unlockedCharacters.length}/${content.characters.length}`),
      h("p", {}, "도감: 적 " + meta.codex.enemies.length + " · 물품 " + meta.codex.items.length),
      meta.achievements.length ? h("p", {}, "업적: " + meta.achievements.join(", ")) : null),
  );
}

function hud(): HTMLElement {
  const r = run!;
  const dungeon = r.dungeon;
  const modifier = dungeon.floor.modifier;
  return h("div", { class: "hud" },
    h("span", {}, h("b", {}, r.depth + "F"), " ", r.campaign.name),
    h("span", {}, "턴 ", h("b", {}, String(dungeon.turn))),
    h("span", {}, "군량 ", h("b", {}, String(r.food))),
    h("span", { class: "danger-" + dungeon.danger }, DANGER_NAMES[dungeon.danger] ?? ""),
    h("span", {}, "Lv ", h("b", {}, String(r.level))),
    h("span", {}, "금 ", h("b", {}, String(r.gold))),
    modifier ? h("span", {}, "[" + (MODIFIER_NAMES[modifier] ?? modifier) + "]") : null,
    ...dungeon.mechanicStatus().map((status) => h("span", { class: status.urgent ? "mechanic urgent" : "mechanic" }, status.label + " ", h("b", {}, status.value))),
  );
}

function partyBars(): HTMLElement {
  return h("div", { class: "panel party" }, ...run!.party().map((m) => h("div", { class: "member" + (m.hp <= 0 ? " ko" : "") },
    pic(m.characterId, 32, m.name),
    h("div", { class: "member-info" }, h("div", { class: "row tight" }, h("span", { class: "grow" }, m.name), h("span", { class: "num" }, m.hp <= 0 ? "KO" : m.hp + "/" + m.maxHp)), bar(m.hp, m.maxHp)))));
}

const PAD: (Direction | null)[] = ["nw", "n", "ne", "w", null, "e", "sw", "s", "se"];
const ARROWS: Record<string, string> = { nw: "↖", n: "↑", ne: "↗", w: "←", e: "→", sw: "↙", s: "↓", se: "↘" };

function move(direction: Direction): void { act({ type: "dungeon", command: { type: "move", direction } }); render(); }

function travelTo(target: { x: number; y: number }): void {
  if (run === null) return;
  for (let steps = 0; steps < 30 && run.phase === "dungeon"; steps += 1) {
    const dungeon = run.dungeon;
    if (dungeon.position.x === target.x && dungeon.position.y === target.y) break;
    const direction = dungeon.travelDirection(target);
    if (direction === null) break;
    const events = act({ type: "dungeon", command: { type: "move", direction } });
    const notable = events.some((e) => e.type !== "dungeon" || !["moved", "food"].includes(e.event.type));
    if (notable || run.phase !== "dungeon" || run.dungeon.visibleEnemies().length > 0) break;
  }
  render();
}

function renderDungeon(): void {
  const r = run!;
  const canvas = h("canvas", { id: "map", "aria-label": "던전 지도" });
  canvas.addEventListener("pointerup", (event) => travelTo(tileAt(canvas, r.dungeon, event.clientX, event.clientY)));
  const onStairs = r.dungeon.position.x === r.dungeon.floor.stairs.x && r.dungeon.position.y === r.dungeon.floor.stairs.y;
  put(
    hud(), canvas, partyBars(),
    h("div", { class: "row", style: "align-items:flex-start" },
      h("div", { class: "pad" }, ...PAD.map((d) => d === null
        ? button("·", () => { act({ type: "dungeon", command: { type: "wait" } }); render(); }, { title: "대기 (1턴)" })
        : button(ARROWS[d]!, () => move(d), { "aria-label": d }))),
      h("div", { class: "grid2 grow" },
        button("자동 탐색", () => { act({ type: "auto-explore" }); render(); }, { class: "primary" }),
        button("주변 탐색", () => { act({ type: "dungeon", command: { type: "search" } }); render(); }),
        button("조사", () => { act({ type: "dungeon", command: { type: "interact" } }); render(); }),
        button("계단 ▼", () => { act({ type: "dungeon", command: { type: "descend" } }); render(); }, { disabled: !onStairs }),
        button("가방 (" + r.inventory().length + "/10)", () => { modal = "bag"; render(); }),
        button("부대", () => { modal = "party"; render(); }),
      )),
    h("div", { class: "panel log" }, ...log.slice(0, 12).map((line) => h("div", {}, line))),
  );
  const enemyKey = (groupId: string): string => {
    const units = r.group(groupId)?.units ?? [];
    return (units.find((u) => !u.name.includes(" ")) ?? units[0])?.name ?? "";
  };
  requestAnimationFrame(() => drawMap(canvas, r.dungeon, { playerKey: r.party()[0]?.characterId ?? "liu-bei", enemyKey }));
}

// ---------- battle ----------
function renderBattle(): void {
  const r = run!;
  const battle = r.battle!;
  const snap = battle.snapshot();
  const active = snap.activeTurn;
  const activeAlly = active !== null && !active.actorId.includes("#");
  const statuses = new Map(snap.statuses.map((s) => [s.unitId, s.statuses]));
  let legal = new Set<string>();
  if (activeAlly && selection !== null) {
    if (selection.kind === "attack") legal = new Set(battle.legalBasicTargets(active.actorId));
    else if (selection.kind === "skill" || selection.kind === "item") legal = new Set(battle.legalAbilityTargets(active.actorId, selection.targeting));
  }
  const onUnit = (id: string): void => {
    if (!activeAlly || selection === null || !legal.has(id)) return;
    if (selection.kind === "attack") { const command: BattleCommand = { type: "attack", actorId: active.actorId, targetId: id }; selection = null; narrateBattle(command); render(); return; }
    if (selection.kind === "skill" || selection.kind === "item") {
      const targets = selection.targets.includes(id) ? selection.targets.filter((t) => t !== id) : [...selection.targets, id].slice(-selection.targeting.maxTargets);
      selection = { ...selection, targets };
      if (selection.targeting.maxTargets === 1) confirmSelection();
      else render();
    }
  };
  const card = (side: "ally" | "enemy", slot: FormationSlot): HTMLElement => {
    const formation = side === "ally" ? snap.allyFormation : snap.enemyFormation;
    const occupant = formation.find((entry) => entry.slot === slot);
    const koId = snap.koSlots.find((entry) => entry.slot === slot && snap.units.find((u) => u.id === entry.unitId)?.side === side)?.unitId;
    const id = occupant?.unitId ?? koId;
    if (id === undefined) {
      if (side === "ally" && activeAlly && selection?.kind === "formation") {
        return button("이동", () => { const command: BattleCommand = { type: "formation", actorId: active.actorId, targetSlot: slot }; selection = null; narrateBattle(command); render(); }, { class: "unit targetable" });
      }
      return h("div", { class: "slot" });
    }
    const unit = snap.units.find((u) => u.id === id)!;
    const chosen = selection !== null && "targets" in selection && selection.targets.includes(id);
    const cls = ["unit", side, unit.knockedOut ? "ko" : "", active?.actorId === id ? "active" : "", legal.has(id) ? "targetable" : "", chosen ? "selected" : ""].join(" ");
    return button("", () => {
      if (side === "ally" && activeAlly && selection?.kind === "formation" && id !== active.actorId) {
        const command: BattleCommand = { type: "formation", actorId: active.actorId, targetSlot: slot }; selection = null; narrateBattle(command); render(); return;
      }
      onUnit(id);
    }, { class: cls + (hitIds.has(id) ? " hit" : "") }).appendChild(h("div", { class: "unit-head" }, pic(id.includes("#") ? unitName(id) : id, 40, unitName(id)),
      h("div", { class: "unit-meta" }, h("b", {}, unitName(id)), h("span", { class: "num" }, unit.hp + "/" + unit.stats.maxHp)))).parentElement!
      .appendChild(bar(unit.hp, unit.stats.maxHp)).parentElement!
      .appendChild(bar(unit.energy, 100, "energy")).parentElement!
      .appendChild(h("span", { class: "tags" }, ...(statuses.get(id) ?? []).map((s) => h("span", { class: "tag" }, (STATUS_NAMES[s.type] ?? s.type) + (s.stacks > 1 ? "×" + s.stacks : ""))))).parentElement!;
  };
  const rows = (side: "ally" | "enemy"): HTMLElement[] => {
    const front = h("div", { class: "formation" }, card(side, "front-left"), card(side, "front-center"), card(side, "front-right"));
    const rear = h("div", { class: "formation" }, card(side, "rear-left"), h("div", { class: "slot", style: "border:none" }), card(side, "rear-right"));
    return side === "enemy" ? [rear, front] : [front, rear];
  };
  const timeline = h("div", { class: "timeline" }, ...[...(active ? [active] : []), ...snap.timeline].slice(0, 8).map((event, index) =>
    h("span", { class: (event.actorId.includes("#") ? "enemy" : "ally") + (index === 0 && active ? " now" : "") }, spriteImg(figureUrl(event.actorId.includes("#") ? unitName(event.actorId) : event.actorId), 16, "", "px"), unitName(event.actorId))));
  const controls: HTMLElement[] = [];
  if (activeAlly && autoMode === "manual") {
    const actor = snap.units.find((u) => u.id === active.actorId)!;
    const skills = battle.ownedSkills(active.actorId);
    const items = [...new Set(snap.inventories.ally)];
    controls.push(h("div", { class: "grid3" },
      button("공격", () => { selection = { kind: "attack" }; render(); }, { class: selection?.kind === "attack" ? "selected" : "" }),
      button("방어", () => { const command: BattleCommand = { type: "guard", actorId: active.actorId }; selection = null; narrateBattle(command); render(); }),
      button("진형", () => { selection = { kind: "formation" }; render(); }, { class: selection?.kind === "formation" ? "selected" : "" }),
      ...skills.map((skill) => button((skill.kind === "ultimate" ? "★" : "") + (content.skillNames[skill.id] ?? skill.id) + " " + skill.energyCost, () => {
        selection = { kind: "skill", skillId: skill.id, targeting: skill.targeting, targets: [] };
        if (skill.targeting.team === "self") { selection.targets = [active.actorId]; confirmSelection(); return; }
        render();
      }, { class: "small " + (selection?.kind === "skill" && selection.skillId === skill.id ? "selected" : ""), disabled: actor.energy < skill.energyCost })),
      ...items.map((itemId) => button(contentName(r, itemId), () => {
        const definition = r.item(itemId)?.battle;
        if (definition) { selection = { kind: "item", itemId, targeting: definition.targeting, targets: [] }; render(); }
      }, { class: "small" })),
      r.encounter?.retreatAllowed ? button("퇴각", () => { const command: BattleCommand = { type: "retreat", actorId: active.actorId }; narrateBattle(command); render(); }, { class: "small" }) : null,
    ));
    if (selection !== null && "targets" in selection && selection.targeting.maxTargets > 1) {
      controls.push(h("div", { class: "row" }, h("span", { class: "grow muted" }, `대상 ${selection.targets.length}/${selection.targeting.maxTargets}`),
        button("실행", confirmSelection, { class: "primary", disabled: selection.targets.length < selection.targeting.minTargets })));
    }
  }
  put(
    h("div", { class: "hud" }, h("span", {}, h("b", {}, r.depth + "F 전투")), r.encounter?.boss ? h("span", { class: "danger-danger" }, "보스") : null,
      r.encounter?.surprise ? h("span", {}, r.encounter.surprise === "ally" ? "아군 기습" : "적의 기습") : null),
    h("div", { class: "field" }, ...rows("enemy"), timeline, ...rows("ally")),
    h("div", { class: "modes" },
      ...(["manual", "smart", "all-attack", "repeat"] as const).map((mode) => button({ manual: "수동", smart: "스마트", "all-attack": "전체공격", repeat: "반복" }[mode], () => { autoMode = mode; selection = null; render(); }, { class: "small " + (autoMode === mode ? "selected" : "") })),
      ...[1, 2, 3].map((value) => button("×" + value, () => { speed = value; render(); }, { class: "small " + (speed === value ? "selected" : "") }))),
    ...controls,
    h("div", { class: "panel log" }, ...log.slice(0, 10).map((line) => h("div", {}, line))),
  );
}

function confirmSelection(): void {
  const r = run!;
  const active = r.battle?.snapshot().activeTurn;
  if (!active || selection === null || !("targets" in selection)) return;
  const chosen = selection;
  const command: BattleCommand = chosen.kind === "skill"
    ? { type: r.battle!.ownedSkills(active.actorId).find((s) => s.id === chosen.skillId)?.kind === "ultimate" ? "ultimate" : "skill", actorId: active.actorId, skillId: chosen.skillId, targetIds: chosen.targets }
    : { type: "item", actorId: active.actorId, itemId: chosen.itemId, targetIds: chosen.targets };
  selection = null;
  narrateBattle(command);
  render();
}

// ---------- decisions / modals ----------
function sheet(...children: Child[]): void {
  put(h("div", { class: "modal" }, h("div", { class: "sheet" }, ...children)));
}

function renderDecision(): void {
  const r = run!;
  const pending = r.pending()[0]!;
  if (pending.kind === "trait") {
    sheet(h("div", { class: "row" }, pic(pending.characterId, 64), h("h2", {}, `Lv.${pending.level} 특성 — ${r.character(pending.characterId).name}`)),
      ...pending.options.map((id) => { const trait = r.trait(id); return button("", () => { act({ type: "choose-trait", traitId: id }); render(); }, { class: "choice" }).appendChild(h("span", {}, h("b", {}, trait.name), h("small", {}, trait.description + (trait.ownerId ? " · 고유" : " · 공용")))).parentElement!; }),
      button(`다시 뽑기 (${r.rerolls})`, () => { act({ type: "reroll-traits" }); render(); }, { disabled: r.rerolls <= 0 }));
  } else if (pending.kind === "recruit") {
    const c = r.character(pending.characterId);
    sheet(h("div", { class: "center" }, pic(c.id, 128, c.name)), h("h2", { class: "center" }, "장수 조우: " + c.name), h("p", {}, `${CLASS_NAMES[c.characterClass]} · ${c.roleTags.join(" / ")} — HP ${c.stats.maxHp} ATK ${c.stats.atk} DEF ${c.stats.def} SPD ${c.stats.spd} INT ${c.stats.int}`),
      h("div", { class: "grid2" }, button("영입한다", () => { act({ type: "recruit", accept: true }); render(); }, { class: "primary" }), button("보낸다", () => { act({ type: "recruit", accept: false }); render(); })));
  } else if (pending.kind === "event") {
    const event = r.event(pending.eventId)!;
    sheet(h("h2", {}, event.title), h("p", {}, event.text), ...event.choices.map((choice, index) => button(choice.label, () => { act({ type: "event-choice", index }); render(); }, { class: "choice" })));
  }
}

function renderPicker(): void {
  const picker = pickTarget!;
  sheet(h("h2", {}, picker.label), ...picker.options.map((option) => button(option.label, () => { pickTarget = null; picker.onPick(option.id); }, { class: "choice" })), button("취소", () => { pickTarget = null; render(); }));
}

function renderBag(): void {
  const r = run!;
  const usable = r.phase === "dungeon" || r.phase === "safe-zone";
  const members = r.party();
  const rows = r.inventory().map((entry) => {
    if (entry.kind === "item") {
      const item = r.item(entry.itemId)!;
      const use = (): void => {
        const kind = item.use.kind;
        if (kind === "heal" && item.use.target === "one") pickTarget = { label: item.name + " — 대상", options: members.filter((m) => m.hp > 0).map((m) => ({ id: m.characterId, label: `${m.name} ${m.hp}/${m.maxHp}` })), onPick: (id) => { act({ type: "use-item", uid: entry.uid, targetId: id }); render(); } };
        else if (kind === "treat") pickTarget = { label: item.name + " — KO 장수", options: members.filter((m) => m.hp <= 0).map((m) => ({ id: m.characterId, label: m.name })), onPick: (id) => { act({ type: "use-item", uid: entry.uid, targetId: id }); render(); } };
        else if (kind === "identify") {
          const unknown = r.inventory().filter((e) => e.kind === "equipment" && !e.equipment.identified).map((e) => ({ id: e.uid, label: "미식별 " + (r.equipmentDef((e as { equipment: { equipmentId: string } }).equipment.equipmentId)?.slot ?? "") }));
          pickTarget = { label: "감정할 장비", options: unknown, onPick: (id) => { act({ type: "use-item", uid: entry.uid, targetId: id }); render(); } };
        } else act({ type: "use-item", uid: entry.uid });
        render();
      };
      return h("div", { class: "row item-row" }, icon(item.id), h("span", { class: "grow" }, item.name), item.use.kind !== "battle" ? button("사용", use, { class: "small", disabled: !usable }) : h("span", { class: "muted" }, "전투용"),
        button("버림", () => { act({ type: "discard", uid: entry.uid }); render(); }, { class: "small" }));
    }
    const definition = r.equipmentDef(entry.equipment.equipmentId)!;
    const name = entry.equipment.identified ? definition.name + (entry.equipment.enhance ? " +" + entry.equipment.enhance : "") : "미식별 장비 (" + definition.slot + ")";
    const stats = entry.equipment.identified ? Object.entries(definition.stats).map(([k, v]) => k.toUpperCase() + (v! > 0 ? "+" : "") + v).join(" ") : "?";
    return h("div", { class: "row item-row" }, entry.equipment.identified ? icon(definition.id) : h("span", { class: "icon unknown" }, "?"), h("span", { class: "grow" }, name, h("small", { class: "muted" }, " " + stats)),
      button("장착", () => { pickTarget = { label: name + " — 장착할 장수", options: members.map((m) => ({ id: m.characterId, label: m.name })), onPick: (id) => { act({ type: "equip", characterId: id, uid: entry.uid }); render(); } }; render(); }, { class: "small", disabled: !usable }),
      button("버림", () => { act({ type: "discard", uid: entry.uid }); render(); }, { class: "small" }));
  });
  sheet(h("h2", {}, `가방 ${r.inventory().length}/10`), ...(rows.length ? rows : [h("p", {}, "비어 있다.")]), h("p", {}, "던전에서 아이템 사용·장비 변경은 1턴을 소모한다."), button("닫기", () => { modal = null; render(); }));
}

function renderParty(): void {
  const r = run!;
  sheet(h("h2", {}, `부대 Lv.${r.level} (EXP ${r.exp})`), ...r.party().map((m) => {
    const c = r.character(m.characterId);
    return h("div", { class: "panel" },
      h("div", { class: "row" }, pic(m.characterId, 64, m.name), h("div", { class: "grow" }, h("b", {}, m.name + " · " + CLASS_NAMES[c.characterClass]), h("div", { class: "muted" }, SLOT_NAMES[m.slot] ?? m.slot))),
      h("p", {}, `HP ${m.hp}/${m.maxHp} ATK ${m.stats.atk} DEF ${m.stats.def} SPD ${m.stats.spd} INT ${m.stats.int}`),
      h("p", {}, "스킬: " + m.skillIds.map((id) => content.skillNames[id] ?? id).join(", ")),
      m.traits.length ? h("p", {}, "특성: " + m.traits.map((id) => r.trait(id).name).join(", ")) : null,
      h("p", {}, "장비: " + (Object.values(m.equipment).map((e) => e ? contentName(r, e.equipmentId) + (e.enhance ? "+" + e.enhance : "") : "").filter(Boolean).join(", ") || "없음")),
      h("div", { class: "row" }, ...FORMATION_SLOTS.map((slot) => button(SLOT_NAMES[slot]!, () => { act({ type: "set-formation", characterId: m.characterId, slot }); render(); }, { class: "small " + (m.slot === slot ? "selected" : "") }))));
  }), button("닫기", () => { modal = null; render(); }));
}

function renderSafeZone(): void {
  const r = run!;
  const equipped = r.party().flatMap((m) => (["weapon", "armor", "treasure"] as const).filter((slot) => m.equipment[slot]).map((slot) => ({ m, slot, e: m.equipment[slot]! })));
  put(
    h("h1", {}, "안전 정비구역"), h("p", {}, "부대가 완전히 회복되었다. 정비를 마치면 다음 층으로 향한다."),
    h("div", { class: "hud" }, h("span", {}, "금 ", h("b", {}, String(r.gold))), h("span", {}, "가방 " + r.inventory().length + "/10")),
    h("div", { class: "panel" }, h("h2", {}, "상점"), ...r.shop().map((offer, index) => h("div", { class: "row" },
      icon(offer.contentId), h("span", { class: "grow" }, contentName(r, offer.contentId)), h("span", { class: "muted num" }, offer.price + "금"),
      button(offer.sold ? "품절" : "구매", () => { act({ type: "shop-buy", offerIndex: index }); render(); }, { class: "small", disabled: offer.sold || r.gold < offer.price })))),
    h("div", { class: "panel" }, h("h2", {}, "강화 (최대 +3)"), ...(equipped.length ? equipped.map(({ m, slot, e }) => h("div", { class: "row" },
      h("span", { class: "grow" }, m.name + " · " + contentName(r, e.equipmentId) + (e.enhance ? " +" + e.enhance : "")),
      button("강화 " + 40 * (e.enhance + 1) + "금", () => { act({ type: "enhance", characterId: m.characterId, slot }); render(); }, { class: "small", disabled: e.enhance >= 3 || r.gold < 40 * (e.enhance + 1) }))) : [h("p", {}, "장착한 장비가 없다.")])),
    h("div", { class: "row" }, button("가방", () => { modal = "bag"; render(); }), button("부대", () => { modal = "party"; render(); }), h("span", { class: "grow" }), button("출발", () => { act({ type: "leave-safe-zone" }); render(); }, { class: "primary" })),
    h("div", { class: "panel log" }, ...log.slice(0, 6).map((line) => h("div", {}, line))),
  );
}

function renderEnd(): void {
  const r = run!;
  const summary = r.summary();
  const before = new Set(unlockedBefore);
  const fresh = [...meta.unlockedCharacters, ...meta.unlockedCampaigns].filter((id) => !before.has(id));
  put(
    h("h1", {}, r.phase === "cleared" ? "전역 평정!" : "원정 실패"),
    h("div", { class: "panel" },
      h("p", {}, `${r.campaign.name} · 도달 ${summary.depthReached}층 · Lv.${summary.level} · 전투 ${summary.battles}회 · ${summary.turns}턴`),
      h("p", {}, "격파: " + (summary.defeatedGroups.map((id) => r.group(id)?.name ?? id).join(", ") || "없음"))),
    fresh.length ? h("div", { class: "panel" }, h("h2", {}, "새로 해금"), h("p", {}, fresh.map((id) => content.characters.find((c) => c.id === id)?.name ?? content.campaigns.find((c) => c.id === id)?.name ?? id).join(", "))) : null,
    h("p", {}, "레벨·특성·장비·금은 초기화되었다. 해금된 장수와 전역은 유지된다."),
    button("타이틀로", () => { run = null; save = null; modal = null; render(); }, { class: "primary" }),
  );
}

// ---------- keyboard (desktop) ----------
const KEYS: Record<string, Direction> = {
  ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e", w: "n", x: "s", a: "w", d: "e", q: "nw", e: "ne", z: "sw", c: "se",
  "8": "n", "2": "s", "4": "w", "6": "e", "7": "nw", "9": "ne", "1": "sw", "3": "se",
};
window.addEventListener("keydown", (event) => {
  if (run === null || run.phase !== "dungeon" || modal !== null || pickTarget !== null) return;
  const direction = KEYS[event.key];
  if (direction) { event.preventDefault(); move(direction); return; }
  if (event.key === "." || event.key === "5" || event.key === "s") { act({ type: "dungeon", command: { type: "wait" } }); render(); }
  if (event.key === "f") { act({ type: "dungeon", command: { type: "search" } }); render(); }
  if (event.key === "Enter") { act({ type: "auto-explore" }); render(); }
  if (event.key === ">") { act({ type: "dungeon", command: { type: "descend" } }); render(); }
});
window.addEventListener("resize", () => render());

// Read-only hook for automated UI smoke tests (no state mutation).
(window as unknown as { __tkmd: unknown }).__tkmd = {
  state: () => run === null ? { phase: "title" } : {
    phase: run.phase, depth: run.depth, turn: run.phase === "dungeon" ? run.dungeon.turn : null,
    enemies: run.phase === "dungeon" ? run.dungeon.visibleEnemies().map((e) => ({ dx: e.pos.x - run!.dungeon.position.x, dy: e.pos.y - run!.dungeon.position.y })) : [],
  },
};

render();
void loadAssets(() => render());
