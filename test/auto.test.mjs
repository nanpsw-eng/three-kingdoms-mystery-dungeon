import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";
import { chooseBasicSmartCommand } from "../dist/battle/auto.js";
function p(id,side,slot,stats,basicAttackReach="melee"){return{unit:{id,side,stats},slot,basicAttackReach};}const base={maxHp:100,atk:100,def:100,spd:100,int:100};
test("basic Smart Auto prioritizes a legal lethal target",()=>{const battle=new BattleEngine({seed:"auto-lethal",participants:[p("archer","ally","rear-left",{...base,atk:150,spd:120},"ranged"),p("front","enemy","front-center",{...base,spd:80}),p("rear","enemy","rear-left",{...base,maxHp:10,def:50,spd:70})]});assert.equal(battle.nextTurn()?.actorId,"archer");assert.deepEqual(chooseBasicSmartCommand(battle),{type:"attack",actorId:"archer",targetId:"rear"});});
test("basic Smart Auto guards a low-HP actor when no legal lethal target exists",()=>{const battle=new BattleEngine({seed:"auto-guard",participants:[p("ally","ally","front-center",{...base,maxHp:20,spd:120}),p("enemy","enemy","front-center",{...base,maxHp:500,def:200,spd:100})]});assert.equal(battle.nextTurn()?.actorId,"ally");assert.deepEqual(chooseBasicSmartCommand(battle,{lowHpGuardThreshold:1}),{type:"guard",actorId:"ally"});});
