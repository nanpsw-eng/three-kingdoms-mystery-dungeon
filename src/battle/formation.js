export const FORMATION_SLOTS = [
    "front-left",
    "front-center",
    "front-right",
    "rear-left",
    "rear-right",
];
export function formationRow(slot) {
    return slot.startsWith("front-") ? "front" : "rear";
}
export class Formation {
    side;
    #slotToUnit = new Map();
    #unitToSlot = new Map();
    constructor(side) {
        this.side = side;
    }
    place(unitId, slot) {
        if (unitId.trim().length === 0)
            throw new RangeError("Formation unit id must not be empty.");
        if (this.#unitToSlot.has(unitId))
            throw new Error(`Unit already placed: ${unitId}`);
        if (this.#slotToUnit.has(slot))
            throw new Error(`Formation slot already occupied: ${slot}`);
        this.#unitToSlot.set(unitId, slot);
        this.#slotToUnit.set(slot, unitId);
    }
    remove(unitId) {
        const slot = this.#unitToSlot.get(unitId);
        if (slot === undefined)
            return false;
        this.#unitToSlot.delete(unitId);
        this.#slotToUnit.delete(slot);
        return true;
    }
    slotOf(unitId) {
        return this.#unitToSlot.get(unitId);
    }
    unitAt(slot) {
        return this.#slotToUnit.get(slot);
    }
    moveOrSwap(unitId, targetSlot) {
        const originSlot = this.#unitToSlot.get(unitId);
        if (originSlot === undefined)
            throw new Error(`Unit is not in formation: ${unitId}`);
        if (originSlot === targetSlot)
            return;
        const targetUnit = this.#slotToUnit.get(targetSlot);
        this.#slotToUnit.delete(originSlot);
        if (targetUnit !== undefined) {
            this.#unitToSlot.set(targetUnit, originSlot);
            this.#slotToUnit.set(originSlot, targetUnit);
        }
        this.#unitToSlot.set(unitId, targetSlot);
        this.#slotToUnit.set(targetSlot, unitId);
    }
    unitsInRow(row) {
        return FORMATION_SLOTS
            .filter((slot) => formationRow(slot) === row)
            .map((slot) => this.#slotToUnit.get(slot))
            .filter((unitId) => unitId !== undefined);
    }
    snapshot() {
        return FORMATION_SLOTS.flatMap((slot) => {
            const unitId = this.#slotToUnit.get(slot);
            return unitId === undefined ? [] : [{ slot, unitId }];
        });
    }
}
//# sourceMappingURL=formation.js.map