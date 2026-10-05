import assert from "node:assert/strict";
import test from "node:test";
import { BattleUnit, MAX_ENERGY } from "../dist/battle/unit.js";
const zhaoYun=()=>new BattleUnit({id:"zhao-yun",side:"ally",stats:{maxHp:104,atk:108,def:100,spd:120,int:90}});
test("battle unit starts at full HP with zero energy",()=>{const unit=zhaoYun();assert.equal(unit.hp,104);assert.equal(unit.energy,0);assert.equal(unit.knockedOut,false);});
test("damage clamps at zero and KO prevents normal healing",()=>{const unit=zhaoYun();assert.equal(unit.takeDamage(200),104);assert.equal(unit.hp,0);assert.equal(unit.knockedOut,true);assert.equal(unit.heal(50),0);assert.equal(unit.hp,0);});
test("revive restores a KO unit and clamps to max HP",()=>{const unit=zhaoYun();unit.takeDamage(999);unit.revive(999);assert.equal(unit.hp,104);assert.equal(unit.knockedOut,false);});
test("energy gain clamps to 100 and spending is transactional",()=>{const unit=zhaoYun();assert.equal(unit.gainEnergy(120),MAX_ENERGY);assert.equal(unit.energy,MAX_ENERGY);assert.equal(unit.spendEnergy(60),true);assert.equal(unit.energy,40);assert.equal(unit.spendEnergy(50),false);assert.equal(unit.energy,40);unit.resetEnergy();assert.equal(unit.energy,0);});
test("invalid core stats are rejected",()=>{assert.throws(()=>new BattleUnit({id:"invalid",side:"enemy",stats:{maxHp:100,atk:100,def:100,spd:0,int:100}}),/spd must be a positive finite number/);});
