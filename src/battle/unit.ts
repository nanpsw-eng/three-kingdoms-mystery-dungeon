export const MAX_ENERGY = 100 as const;

export type BattleSide = "ally" | "enemy";

export interface CoreStats {
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
  readonly spd: number;
  readonly int: number;
}

export interface BattleUnitDefinition {
  readonly id: string;
  readonly side: BattleSide;
  readonly stats: CoreStats;
}

/** Battle-entry state carried in from the Dungeon/Run layer. Defaults: full HP, 0 energy. */
export interface BattleUnitEntryState {
  readonly hp?: number;
  readonly energy?: number;
}

export interface BattleUnitSnapshot {
  readonly id: string;
  readonly side: BattleSide;
  readonly stats: CoreStats;
  readonly hp: number;
  readonly energy: number;
  readonly knockedOut: boolean;
}

const STAT_KEYS = ["maxHp", "atk", "def", "spd", "int"] as const;

type StatKey = (typeof STAT_KEYS)[number];

function assertPositiveFiniteStat(key: StatKey, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${key} must be a positive finite number.`);
  }
}

function validateDefinition(definition: BattleUnitDefinition): void {
  if (definition.id.trim().length === 0) {
    throw new RangeError("Battle unit id must not be empty.");
  }
  for (const key of STAT_KEYS) {
    assertPositiveFiniteStat(key, definition.stats[key]);
  }
}

function assertNonNegativeFiniteAmount(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number.`);
  }
}

export class BattleUnit {
  readonly id: string;
  readonly side: BattleSide;
  readonly stats: CoreStats;

  #hp: number;
  #energy: number;

  constructor(definition: BattleUnitDefinition, entry: BattleUnitEntryState = {}) {
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

  get hp(): number {
    return this.#hp;
  }

  get energy(): number {
    return this.#energy;
  }

  get knockedOut(): boolean {
    return this.#hp <= 0;
  }

  takeDamage(amount: number): number {
    assertNonNegativeFiniteAmount("Damage", amount);
    if (amount === 0 || this.knockedOut) return 0;

    const applied = Math.min(this.#hp, amount);
    this.#hp -= applied;
    return applied;
  }

  heal(amount: number): number {
    assertNonNegativeFiniteAmount("Heal", amount);
    if (amount === 0 || this.knockedOut) return 0;

    const applied = Math.min(this.stats.maxHp - this.#hp, amount);
    this.#hp += applied;
    return applied;
  }

  revive(hp: number): void {
    assertNonNegativeFiniteAmount("Revive HP", hp);
    if (!this.knockedOut) {
      throw new Error("Only a knocked-out unit can be revived.");
    }
    if (hp <= 0) {
      throw new RangeError("Revive HP must be greater than zero.");
    }
    this.#hp = Math.min(this.stats.maxHp, hp);
  }

  gainEnergy(amount: number): number {
    assertNonNegativeFiniteAmount("Energy gain", amount);
    const applied = Math.min(MAX_ENERGY - this.#energy, amount);
    this.#energy += applied;
    return applied;
  }

  spendEnergy(amount: number): boolean {
    assertNonNegativeFiniteAmount("Energy cost", amount);
    if (amount > this.#energy) return false;
    this.#energy -= amount;
    return true;
  }

  resetEnergy(): void {
    this.#energy = 0;
  }

  snapshot(): BattleUnitSnapshot {
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
