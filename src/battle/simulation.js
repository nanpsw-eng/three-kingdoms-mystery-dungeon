import { chooseBasicSmartCommand, chooseSmartCommand, } from "./auto.js";
import { BattleEngine, } from "./battle.js";
function simulate(definition, chooser, maxActions) {
    if (!Number.isSafeInteger(maxActions) || maxActions <= 0) {
        throw new RangeError("maxActions must be a positive safe integer.");
    }
    const battle = new BattleEngine(definition);
    let actions = 0;
    while (battle.outcome === "ongoing") {
        if (actions >= maxActions) {
            throw new Error("Auto battle exceeded maxActions=" + maxActions + ".");
        }
        const turn = battle.nextTurn();
        if (turn === null) {
            throw new Error("Battle has no next turn while outcome is ongoing.");
        }
        battle.execute(chooser(battle));
        actions += 1;
    }
    const outcome = battle.outcome;
    return { outcome, actions, finalStateHash: battle.stateHash() };
}
/** Runs a battle to completion with any command chooser (Manual scripts, All Attack, Repeat, Smart Auto). */
export function simulateAutoBattle(definition, chooser, options = {}) {
    return simulate(definition, chooser, options.maxActions ?? 1_000);
}
export function simulateBasicAutoBattle(definition, options = {}) {
    const chooser = options.policy === undefined
        ? (battle) => chooseBasicSmartCommand(battle)
        : (battle) => chooseBasicSmartCommand(battle, options.policy);
    return simulate(definition, chooser, options.maxActions ?? 1_000);
}
export function simulateSmartBattle(definition, options = {}) {
    const chooser = options.policy === undefined
        ? (battle) => chooseSmartCommand(battle)
        : (battle) => chooseSmartCommand(battle, options.policy);
    return simulate(definition, chooser, options.maxActions ?? 1_000);
}
//# sourceMappingURL=simulation.js.map