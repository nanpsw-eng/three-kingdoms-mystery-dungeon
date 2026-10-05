import assert from "node:assert/strict";
import test from "node:test";
import { validateItemDefinition, validateSkillDefinition } from "../dist/battle/action.js";

test("skill definitions enforce the active/ultimate energy baseline", () => {
  assert.throws(() => validateSkillDefinition({
    id: "bad-ultimate",
    kind: "ultimate",
    energyCost: 80,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 40 }],
  }), /Ultimate baseline energy cost must be 100/);

  assert.throws(() => validateSkillDefinition({
    id: "bad-active",
    kind: "active",
    energyCost: 100,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "damage", recipient: "targets", kind: "physical", power: 30 }],
  }), /Active skill baseline energy cost must be below 100/);
});

test("targeting and effect validation reject malformed data", () => {
  assert.throws(() => validateItemDefinition({
    id: "bad-self",
    targeting: { team: "self", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "energy", recipient: "actor", amount: 20 }],
  }), /Self targeting requires/);

  assert.throws(() => validateSkillDefinition({
    id: "bad-shift",
    kind: "active",
    energyCost: 0,
    targeting: { team: "enemy", access: "any", minTargets: 1, maxTargets: 1 },
    effects: [{ type: "timeline-shift", recipient: "targets", amount: 0 }],
  }), /Timeline shift amount/);
});
