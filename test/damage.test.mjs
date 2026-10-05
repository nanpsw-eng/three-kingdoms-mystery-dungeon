import assert from "node:assert/strict";
import test from "node:test";
import { BASE_CRIT_CHANCE, BASE_CRIT_MULTIPLIER, computeBaseDamage, computeStrategyDefense, rollDamage } from "../dist/battle/damage.js";
import { SeededRng } from "../dist/core/rng.js";
test("strategy defense is the approved DEF/INT 50:50 blend",()=>{assert.equal(computeStrategyDefense(80,120),100);assert.equal(computeStrategyDefense(120,80),100);});
test("base damage follows the approved exponent formula",()=>{assert.equal(computeBaseDamage(18,100,100),18);assert.ok(computeBaseDamage(18,120,100)>18);assert.ok(computeBaseDamage(18,80,100)<18);});
test("seeded damage rolls are deterministic",()=>{const input={kind:"physical",skillPower:18,attackerAtk:116,attackerInt:90,targetDef:100,targetInt:90};const a=rollDamage(new SeededRng("guan-yu-basic"),input);const b=rollDamage(new SeededRng("guan-yu-basic"),input);assert.deepEqual(a,b);assert.ok(a.variance>=0.95&&a.variance<1.05);assert.ok(a.damage>=1);});
test("critical defaults remain pinned to the balance seed",()=>{assert.equal(BASE_CRIT_CHANCE,0.05);assert.equal(BASE_CRIT_MULTIPLIER,1.5);});
test("critical and non-critical paths can be forced for deterministic tests",()=>{const base={kind:"strategy",skillPower:32,attackerAtk:80,attackerInt:120,targetDef:100,targetInt:100};const normal=rollDamage(new SeededRng("crit-test"),{...base,critChance:0});const critical=rollDamage(new SeededRng("crit-test"),{...base,critChance:1});assert.equal(normal.critical,false);assert.equal(critical.critical,true);assert.equal(critical.variance,normal.variance);assert.ok(critical.damage>normal.damage);});
