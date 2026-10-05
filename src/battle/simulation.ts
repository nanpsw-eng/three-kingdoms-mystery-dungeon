import {
  chooseBasicSmartCommand,
  chooseSmartCommand,
  type BasicSmartAutoPolicy,
  type SmartAutoPolicy,
} from "./auto.js";
import {
  BattleEngine,
  type BattleCommand,
  type BattleDefinition,
  type BattleOutcome,
} from "./battle.js";

export interface AutoBattleSimulationResult {
  readonly outcome: Exclude<BattleOutcome, "ongoing">;
  readonly actions: number;
  readonly finalStateHash: string;
}

type AutoCommandChooser = (battle: BattleEngine) => BattleCommand;

function simulate(
  definition: BattleDefinition,
  chooser: AutoCommandChooser,
  maxActions: number,
): AutoBattleSimulationResult {
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

  const outcome: Exclude<BattleOutcome, "ongoing"> = battle.outcome;
  return { outcome, actions, finalStateHash: battle.stateHash() };
}

export function simulateBasicAutoBattle(
  definition: BattleDefinition,
  options: Readonly<{ maxActions?: number; policy?: BasicSmartAutoPolicy }> = {},
): AutoBattleSimulationResult {
  const chooser: AutoCommandChooser = options.policy === undefined
    ? (battle) => chooseBasicSmartCommand(battle)
    : (battle) => chooseBasicSmartCommand(battle, options.policy as BasicSmartAutoPolicy);
  return simulate(definition, chooser, options.maxActions ?? 1_000);
}

export function simulateSmartBattle(
  definition: BattleDefinition,
  options: Readonly<{ maxActions?: number; policy?: SmartAutoPolicy }> = {},
): AutoBattleSimulationResult {
  const chooser: AutoCommandChooser = options.policy === undefined
    ? (battle) => chooseSmartCommand(battle)
    : (battle) => chooseSmartCommand(battle, options.policy as SmartAutoPolicy);
  return simulate(definition, chooser, options.maxActions ?? 1_000);
}
