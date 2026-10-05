import type { BattleSide } from "./unit.js";

export const FORMATION_SLOTS = [
  "front-left",
  "front-center",
  "front-right",
  "rear-left",
  "rear-right",
] as const;

export type FormationSlot = (typeof FORMATION_SLOTS)[number];
export type FormationRow = "front" | "rear";

export function formationRow(slot: FormationSlot): FormationRow {
  return slot.startsWith("front-") ? "front" : "rear";
}

export class Formation {
  readonly side: BattleSide;
  readonly #slotToUnit = new Map<FormationSlot, string>();
  readonly #unitToSlot = new Map<string, FormationSlot>();

  constructor(side: BattleSide) {
    this.side = side;
  }

  place(unitId: string, slot: FormationSlot): void {
    if (unitId.trim().length === 0) throw new RangeError("Formation unit id must not be empty.");
    if (this.#unitToSlot.has(unitId)) throw new Error(`Unit already placed: ${unitId}`);
    if (this.#slotToUnit.has(slot)) throw new Error(`Formation slot already occupied: ${slot}`);
    this.#unitToSlot.set(unitId, slot);
    this.#slotToUnit.set(slot, unitId);
  }

  remove(unitId: string): boolean {
    const slot = this.#unitToSlot.get(unitId);
    if (slot === undefined) return false;
    this.#unitToSlot.delete(unitId);
    this.#slotToUnit.delete(slot);
    return true;
  }

  slotOf(unitId: string): FormationSlot | undefined {
    return this.#unitToSlot.get(unitId);
  }

  unitAt(slot: FormationSlot): string | undefined {
    return this.#slotToUnit.get(slot);
  }

  moveOrSwap(unitId: string, targetSlot: FormationSlot): void {
    const originSlot = this.#unitToSlot.get(unitId);
    if (originSlot === undefined) throw new Error(`Unit is not in formation: ${unitId}`);
    if (originSlot === targetSlot) return;

    const targetUnit = this.#slotToUnit.get(targetSlot);
    this.#slotToUnit.delete(originSlot);
    if (targetUnit !== undefined) {
      this.#unitToSlot.set(targetUnit, originSlot);
      this.#slotToUnit.set(originSlot, targetUnit);
    }

    this.#unitToSlot.set(unitId, targetSlot);
    this.#slotToUnit.set(targetSlot, unitId);
  }

  unitsInRow(row: FormationRow): readonly string[] {
    return FORMATION_SLOTS
      .filter((slot) => formationRow(slot) === row)
      .map((slot) => this.#slotToUnit.get(slot))
      .filter((unitId): unitId is string => unitId !== undefined);
  }

  snapshot(): readonly Readonly<{ slot: FormationSlot; unitId: string }>[] {
    return FORMATION_SLOTS.flatMap((slot) => {
      const unitId = this.#slotToUnit.get(slot);
      return unitId === undefined ? [] : [{ slot, unitId }];
    });
  }
}
