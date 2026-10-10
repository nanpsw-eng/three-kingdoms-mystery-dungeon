import { MAX_ENERGY } from "./balance.js";
export { MAX_ENERGY };
const STAT_KEYS = ["maxHp", "atk", "def", "spd", "int"];
function assertPositiveFiniteStat(key, value) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new RangeError(`${key} must be a positive finite number.`);
    }
}
function validateDefinition(definition) {
    if (definition.id.trim().length === 0) {
        throw new RangeError("Battle unit id must not be empty.");
    }
    for (const key of STAT_KEYS) {
        assertPositiveFiniteStat(key, definition.stats[key]);
    }
}
function assertNonNegativeFiniteAmount(label, value) {
    if (!Number.isFinite(value) || value < 0) {
        throw new RangeError(`${label} must be a non-negative finite number.`);
    }
}
export class BattleUnit {
    id;
    side;
    stats;
    #hp;
    #energy;
    constructor(definition, entry = {}) {
        validateDefinition(definition);
        this.id = definition.id;
        this.side = definition.side;
        this.stats = Object.freeze({ ...definition.stats });
        const hp = entry.hp ?? this.stats.maxHp;
        if (!Number.isSafeInteger(hp) || hp < 0 || hp > this.stats.maxHp) {
            throw new RangeError("Entry HP must be a safe integer between 0 and maxHp.");
        }
        const energy = entry.energy ?? 0;
        if (!Number.isSafeInteger(energy) || energy < 0 || energy > MAX_ENERGY) {
            throw new RangeError(`Entry energy must be a safe integer between 0 and ${MAX_ENERGY}.`);
        }
        this.#hp = hp;
        this.#energy = energy;
    }
    get hp() {
        return this.#hp;
    }
    get energy() {
        return this.#energy;
    }
    get knockedOut() {
        return this.#hp <= 0;
    }
    takeDamage(amount) {
        assertNonNegativeFiniteAmount("Damage", amount);
        if (amount === 0 || this.knockedOut)
            return 0;
        const applied = Math.min(this.#hp, amount);
        this.#hp -= applied;
        return applied;
    }
    heal(amount) {
        assertNonNegativeFiniteAmount("Heal", amount);
        if (amount === 0 || this.knockedOut)
            return 0;
        const applied = Math.min(this.stats.maxHp - this.#hp, amount);
        this.#hp += applied;
        return applied;
    }
    revive(hp) {
        assertNonNegativeFiniteAmount("Revive HP", hp);
        if (!this.knockedOut) {
            throw new Error("Only a knocked-out unit can be revived.");
        }
        if (hp <= 0) {
            throw new RangeError("Revive HP must be greater than zero.");
        }
        this.#hp = Math.min(this.stats.maxHp, hp);
    }
    gainEnergy(amount) {
        assertNonNegativeFiniteAmount("Energy gain", amount);
        const applied = Math.min(MAX_ENERGY - this.#energy, amount);
        this.#energy += applied;
        return applied;
    }
    spendEnergy(amount) {
        assertNonNegativeFiniteAmount("Energy cost", amount);
        if (amount > this.#energy)
            return false;
        this.#energy -= amount;
        return true;
    }
    resetEnergy() {
        this.#energy = 0;
    }
    snapshot() {
        return {
            id: this.id,
            side: this.side,
            stats: this.stats,
            hp: this.#hp,
            energy: this.#energy,
            knockedOut: this.knockedOut,
        };
    }
}
//# sourceMappingURL=unit.js.map