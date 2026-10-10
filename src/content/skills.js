// Builders keep the content tables short. Powers follow BALANCE_SEED ranges:
// light 26-32, standard 32-38, heavy 38-44, ultimate 42-55, AoE per-target ×0.70-0.85.
export const enemyOne = (access = "any") => ({ team: "enemy", access, minTargets: 1, maxTargets: 1 });
export const enemyUpTo = (max, access = "any") => ({ team: "enemy", access, minTargets: 1, maxTargets: max });
export const allyOne = (state) => ({ team: "ally", access: "any", minTargets: 1, maxTargets: 1, ...(state ? { state } : {}) });
export const allyUpTo = (max, state) => ({ team: "ally", access: "any", minTargets: 1, maxTargets: max, ...(state ? { state } : {}) });
export const self = { team: "self", access: "self", minTargets: 1, maxTargets: 1 };
export const physical = (power, extra = {}) => ({ type: "damage", recipient: "targets", kind: "physical", power, ...extra });
export const strategy = (power, extra = {}) => ({ type: "damage", recipient: "targets", kind: "strategy", power, ...extra });
export const status = (statusType, durationRounds, extra = {}) => ({ type: "status", recipient: "targets", statusType, durationRounds, ...extra });
export const heal = (baseHeal, recipient = "targets") => ({ type: "heal", recipient, baseHeal });
export const energy = (amount, recipient = "targets") => ({ type: "energy", recipient, amount });
export const shift = (amount, recipient = "targets") => ({ type: "timeline-shift", recipient, amount });
export const extraAction = (recipient = "actor", mode = "extra") => ({ type: "extra-action", recipient, mode });
export const cleanse = (statusTypes) => (statusTypes ? { type: "cleanse", recipient: "targets", statusTypes } : { type: "cleanse", recipient: "targets" });
export const revive = (hpRatio) => ({ type: "revive", recipient: "targets", hpRatio });
export function active(id, energyCost, targeting, effects) {
    return { id, kind: "active", energyCost, targeting, effects };
}
export function ultimate(id, targeting, effects) {
    return { id, kind: "ultimate", energyCost: 100, targeting, effects };
}
//# sourceMappingURL=skills.js.map