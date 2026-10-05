import type { EquipmentDefinition, ItemDefinition } from "../run/types.js";
import { allyOne, enemyUpTo, heal, shift, strategy, status } from "./skills.js";

export const ITEMS: readonly ItemDefinition[] = [
  { id: "bun", name: "만두", price: 12, use: { kind: "food", amount: 30 } },
  { id: "rice-sack", name: "군량 자루", price: 25, use: { kind: "food", amount: 60 } },
  { id: "herb", name: "약초", price: 15, use: { kind: "heal", ratio: 0.4, target: "one" } },
  { id: "medicine", name: "금창약", price: 35, use: { kind: "heal", ratio: 0.25, target: "party" } },
  { id: "treatment-kit", name: "치료 도구", price: 45, use: { kind: "treat", ratio: 0.3 } },
  { id: "identify-scroll", name: "감정서", price: 15, use: { kind: "identify" } },
  { id: "scout-map", name: "척후 지도", price: 30, use: { kind: "reveal-traps" } },
  {
    id: "fire-pot", name: "화약 단지", price: 30, use: { kind: "battle" },
    battle: { id: "fire-pot", targeting: enemyUpTo(3), effects: [strategy(30, { modifier: 0.8 }), status("burn", 2, { magnitude: 4 })] },
  },
  {
    id: "smoke-bomb", name: "연막탄", price: 25, use: { kind: "battle" },
    battle: { id: "smoke-bomb", targeting: enemyUpTo(5), effects: [shift(25)] },
  },
  {
    id: "elixir", name: "영약", price: 40, use: { kind: "battle" },
    battle: { id: "elixir", targeting: allyOne(), effects: [heal(45)] },
  },
];

type E = [id: string, name: string, slot: EquipmentDefinition["slot"], stats: EquipmentDefinition["stats"], price: number, unidentified?: boolean];
const ROWS: E[] = [
  ["iron-sword", "철검", "weapon", { atk: 6 }, 40],
  ["long-spear", "장창", "weapon", { atk: 8, spd: -2 }, 50],
  ["horn-bow", "각궁", "weapon", { atk: 7, spd: 1 }, 55],
  ["war-fan", "백우선", "weapon", { int: 8 }, 55],
  ["ancient-blade", "고검", "weapon", { atk: 12 }, 90, true],
  ["leather-armor", "가죽 갑옷", "armor", { def: 6, maxHp: 6 }, 40],
  ["scale-armor", "어린갑", "armor", { def: 10, spd: -2 }, 60],
  ["silk-robe", "비단 도포", "armor", { def: 4, int: 5 }, 50],
  ["dragon-armor", "용린갑", "armor", { def: 12, maxHp: 12 }, 110, true],
  ["jade-seal", "옥새 조각", "treasure", { int: 5, maxHp: 5 }, 60, true],
  ["swift-boots", "질풍화", "treasure", { spd: 6 }, 60],
  ["tiger-tally", "호부", "treasure", { atk: 5, def: 3 }, 65, true],
];

export const EQUIPMENT: readonly EquipmentDefinition[] = ROWS.map(([id, name, slot, stats, price, unidentified]) => ({
  id, name, slot, stats, price, ...(unidentified ? { unidentified } : {}),
}));
