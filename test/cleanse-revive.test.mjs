import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";
import { chooseSmartCommand } from "../dist/battle/auto.js";
import { StatusStore } from "../dist/battle/status.js";
import { ACTION_DELAY_BASE } from "../dist/battle/timeline.js";
import { validateSkillDefinition, validateItemDefinition } from "../dist/battle/action.js";

function p(id,side,slot,stats,reach="melee",skillIds=[]){return{unit:{id,side,stats},slot,basicAttackReach:reach,skillIds};}
const base={maxHp:100,atk:100,def:100,spd:100,int:100};
const one=(team,state)=>state===undefined?{team,access:"any",minTargets:1,maxTargets:1}:{team,access:"any",minTargets:1,maxTargets:1,state};

const SKILLS={
  nuke:{id:"nuke",kind:"active",energyCost:0,targeting:one("enemy"),effects:[{type:"damage",recipient:"targets",kind:"physical",power:5000,critChance:0,evasionChance:0}]},
  hex:{id:"hex",kind:"active",energyCost:0,targeting:one("enemy"),effects:[
    {type:"status",recipient:"targets",statusType:"poison",durationRounds:3,stacks:1,magnitude:1},
    {type:"status",recipient:"targets",statusType:"defense-down",durationRounds:3,magnitude:0.2},
    {type:"status",recipient:"targets",statusType:"burn",durationRounds:3,stacks:1,magnitude:1}]},
  purify:{id:"purify",kind:"active",energyCost:0,targeting:one("ally"),effects:[{type:"cleanse",recipient:"targets",statusTypes:["poison"]}]},
  cleanseAll:{id:"cleanseAll",kind:"active",energyCost:0,targeting:one("ally"),effects:[{type:"cleanse",recipient:"targets"}]},
  raise:{id:"raise",kind:"active",energyCost:0,targeting:one("ally","ko"),effects:[{type:"revive",recipient:"targets",hpRatio:0.3}]},
  raiseAny:{id:"raiseAny",kind:"active",energyCost:0,targeting:one("ally","any"),effects:[{type:"revive",recipient:"targets",hpRatio:0.5}]},
  mend:{id:"mend",kind:"active",energyCost:0,targeting:one("ally"),effects:[{type:"heal",recipient:"targets",baseHeal:40}]},
  mendAny:{id:"mendAny",kind:"active",energyCost:0,targeting:one("ally","any"),effects:[{type:"heal",recipient:"targets",baseHeal:40}]},
};
const ALL_SKILLS=Object.values(SKILLS);
const SUPPORT=["purify","raise","mend"];

// healer acts first (spd 200), boss second (spd 150); tank/buddy are slow.
function setup(seed="phase7",extra={},healerSkills=SUPPORT){
  return new BattleEngine({seed,skills:ALL_SKILLS,...extra,participants:[
    p("healer","ally","rear-left",{...base,spd:200},"ranged",healerSkills),
    p("tank","ally","front-left",{...base,maxHp:81,spd:50}),
    p("buddy","ally","front-center",{...base,spd:60}),
    p("boss","enemy","front-center",{...base,maxHp:5000,atk:150,spd:150},"melee",["nuke","hex"]),
  ]});
}

// Advance to the next turn owned by `actorId`, guarding with every other actor (deterministic filler).
function turnOf(b,actorId){
  for(let guard=0;guard<50;guard++){
    const t=b.nextTurn(); assert.ok(t,"battle ended before "+actorId+" acted");
    if(t.actorId===actorId)return t;
    b.execute({type:"guard",actorId:t.actorId});
  }
  throw new Error("actor never acted: "+actorId);
}
function act(b,actorId,command){turnOf(b,actorId);return b.execute({actorId,...command});}
function killTank(b){const r=act(b,"boss",{type:"skill",skillId:"nuke",targetIds:["tank"]});assert.equal(r.effects[0]?.targetKo,true);}
const statusesOf=(b,id)=>b.snapshot().statuses.find((x)=>x.unitId===id)?.statuses??[];
const unitOf=(b,id)=>b.snapshot().units.find((x)=>x.id===id);

// ---------- A. Target state contract ----------

test("targeting state defaults to living and separates living / ko / any",()=>{
  const b=setup(); killTank(b); turnOf(b,"healer");
  assert.deepEqual([...b.legalAbilityTargets("healer",SKILLS.mend.targeting)].sort(),["buddy","healer"]);
  assert.deepEqual(b.legalAbilityTargets("healer",SKILLS.raise.targeting),["tank"]);
  assert.deepEqual([...b.legalAbilityTargets("healer",SKILLS.raiseAny.targeting)].sort(),["buddy","healer","tank"]);
  assert.deepEqual(b.legalAbilityTargets("healer",{team:"self",access:"self",minTargets:1,maxTargets:1,state:"ko"}),[]);
  assert.ok(!b.legalBasicTargets("healer").includes("tank"));
  assert.throws(()=>b.execute({type:"skill",actorId:"healer",skillId:"mend",targetIds:["tank"]}),/Illegal ability target/);
});

test("enemy attacks and skills keep living-only targeting after a KO",()=>{
  const b=setup(); killTank(b);
  const t=turnOf(b,"boss"); assert.equal(t.actorId,"boss");
  assert.ok(!b.legalBasicTargets("boss").includes("tank"));
  assert.ok(!b.legalAbilityTargets("boss",SKILLS.nuke.targeting).includes("tank"));
  assert.throws(()=>b.execute({type:"skill",actorId:"boss",skillId:"nuke",targetIds:["tank"]}),/Illegal ability target|KO|knocked/i);
});

test("revive definitions are validated against target team and state",()=>{
  assert.throws(()=>validateSkillDefinition({...SKILLS.raise,targeting:one("ally")}),/state=ko or state=any/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.raise,targeting:one("enemy","ko")}),/must target allies/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.raise,effects:[{type:"revive",recipient:"targets",hpRatio:0}]}),/hpRatio/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.raise,effects:[{type:"revive",recipient:"targets",hpRatio:1.1}]}),/hpRatio/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.mend,targeting:{team:"self",access:"self",minTargets:1,maxTargets:1,state:"ko"}}),/Self targeting cannot require a KO/);
  assert.throws(()=>validateItemDefinition({id:"bad",targeting:one("ally"),effects:[{type:"revive",recipient:"targets",hpRatio:0.2}]}),/state=ko or state=any/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.purify,effects:[{type:"cleanse",recipient:"targets",statusTypes:[]}]}),/at least one status/);
  assert.throws(()=>validateSkillDefinition({...SKILLS.purify,effects:[{type:"cleanse",recipient:"targets",statusTypes:["poison","poison"]}]}),/unique/);
});

// ---------- B. Cleanse ----------

test("cleanse removes only the listed status and keeps snapshot ordering",()=>{
  const b=setup(); act(b,"boss",{type:"skill",skillId:"hex",targetIds:["buddy"]});
  assert.deepEqual(statusesOf(b,"buddy").map((s)=>s.type),["burn","defense-down","poison"]);
  const r=act(b,"healer",{type:"skill",skillId:"purify",targetIds:["buddy"]});
  assert.deepEqual(r.effects,[{effectType:"cleanse",targetId:"buddy",applied:true,amount:1}]);
  assert.deepEqual(statusesOf(b,"buddy").map((s)=>s.type),["burn","defense-down"]);
});

test("cleanse without statusTypes removes every status",()=>{
  const b=setup("phase7",{},["cleanseAll"]); act(b,"boss",{type:"skill",skillId:"hex",targetIds:["buddy"]});
  const r=act(b,"healer",{type:"skill",skillId:"cleanseAll",targetIds:["buddy"]});
  assert.equal(r.effects[0]?.amount,3); assert.deepEqual(statusesOf(b,"buddy"),[]);
});

test("cleanse with nothing to remove is a deterministic no-op",()=>{
  const run=()=>{const b=setup("noop");turnOf(b,"healer");const before=JSON.stringify(b.snapshot().statuses);
    const r=b.execute({type:"skill",actorId:"healer",skillId:"purify",targetIds:["buddy"]});
    assert.deepEqual(r.effects,[{effectType:"cleanse",targetId:"buddy",applied:false,amount:0}]);
    assert.equal(JSON.stringify(b.snapshot().statuses),before);return b.stateHash();};
  assert.equal(run(),run());
});

test("StatusStore.clear returns removed statuses in sorted order and skips missing types",()=>{
  const s=new StatusStore();
  s.apply({type:"stun",durationRounds:1});s.apply({type:"bleed",durationRounds:2});s.apply({type:"confusion",durationRounds:2});
  assert.deepEqual(s.clear(["stun","poison","bleed"]).map((x)=>x.type),["bleed","stun"]);
  assert.deepEqual(s.snapshot().map((x)=>x.type),["confusion"]);
  assert.deepEqual(s.clear(["poison"]),[]);
  assert.deepEqual(s.clear().map((x)=>x.type),["confusion"]); assert.equal(s.size,0);
});

// ---------- C. Revive ----------

test("KO records the original slot and removes the unit from formation and timeline",()=>{
  const b=setup(); killTank(b); const snap=b.snapshot();
  assert.deepEqual(snap.koSlots,[{unitId:"tank",slot:"front-left"}]);
  assert.ok(!snap.allyFormation.some((x)=>x.unitId==="tank"));
  assert.ok(!snap.timeline.some((x)=>x.actorId==="tank"));
  assert.ok(!snap.guarding.includes("tank"));
});

test("revive restores HP = round(maxHp * hpRatio), original slot, and timeline registration",()=>{
  const b=setup(); killTank(b); turnOf(b,"healer"); const time=b.snapshot().time;
  const r=b.execute({type:"skill",actorId:"healer",skillId:"raise",targetIds:["tank"]});
  assert.deepEqual(r.effects,[{effectType:"revive",targetId:"tank",applied:true,amount:Math.round(81*0.3)}]);
  const snap=b.snapshot(); const tank=unitOf(b,"tank");
  assert.equal(tank.hp,24); assert.equal(tank.knockedOut,false);
  assert.deepEqual(snap.koSlots,[]);
  assert.ok(snap.allyFormation.some((x)=>x.unitId==="tank"&&x.slot==="front-left"));
  assert.ok(!snap.guarding.includes("tank"));
  const entries=snap.timeline.filter((x)=>x.actorId==="tank");
  assert.equal(entries.length,1); assert.equal(entries[0].kind,"normal");
  assert.ok(Math.abs(entries[0].readyAt-(time+ACTION_DELAY_BASE/50))<1e-9);
  assert.ok(b.legalBasicTargets("healer").length>0);
  // revived unit takes a real turn later
  const t=turnOf(b,"tank"); assert.equal(t.actorId,"tank");
});

test("revived unit is targetable again by enemies and leaves KO targeting",()=>{
  const b=setup(); killTank(b); act(b,"healer",{type:"skill",skillId:"raise",targetIds:["tank"]});
  turnOf(b,"boss");
  assert.ok(b.legalBasicTargets("boss").includes("tank"));
  assert.deepEqual(b.legalAbilityTargets("boss",{...SKILLS.nuke.targeting,state:"ko"}),[]);
});

test("revive falls back to the first free FORMATION_SLOTS slot when the original is occupied",()=>{
  const b=setup(); killTank(b);
  act(b,"buddy",{type:"formation",targetSlot:"front-left"});
  assert.ok(b.snapshot().allyFormation.some((x)=>x.unitId==="buddy"&&x.slot==="front-left"));
  act(b,"healer",{type:"skill",skillId:"raise",targetIds:["tank"]});
  // front-left=buddy, front-center now empty -> first free slot in FORMATION_SLOTS order
  assert.ok(b.snapshot().allyFormation.some((x)=>x.unitId==="tank"&&x.slot==="front-center"));
});

test("plain heal never revives a KO unit even when the targeting allows KO",()=>{
  const b=setup("phase7",{},["mendAny"]); killTank(b);
  const r=act(b,"healer",{type:"skill",skillId:"mendAny",targetIds:["tank"]});
  assert.deepEqual(r.effects,[{effectType:"heal",targetId:"tank",applied:false}]);
  const snap=b.snapshot();
  assert.equal(unitOf(b,"tank").hp,0); assert.equal(unitOf(b,"tank").knockedOut,true);
  assert.deepEqual(snap.koSlots,[{unitId:"tank",slot:"front-left"}]);
  assert.ok(!snap.timeline.some((x)=>x.actorId==="tank"));
});

test("revive on a living target selected through state=any is a deterministic no-op",()=>{
  const b=setup("phase7",{},["raiseAny"]); turnOf(b,"healer"); const hp=unitOf(b,"buddy").hp;
  const r=b.execute({type:"skill",actorId:"healer",skillId:"raiseAny",targetIds:["buddy"]});
  assert.deepEqual(r.effects,[{effectType:"revive",targetId:"buddy",applied:false}]);
  assert.equal(unitOf(b,"buddy").hp,hp);
});

test("revive item consumes inventory and restores the KO unit",()=>{
  const feather={id:"feather",targeting:one("ally","ko"),effects:[{type:"revive",recipient:"targets",hpRatio:0.1}]};
  const b=setup("item",{items:[feather],inventories:{ally:["feather"]}}); killTank(b);
  const r=act(b,"healer",{type:"item",itemId:"feather",targetIds:["tank"]});
  assert.equal(r.effects[0]?.amount,Math.round(81*0.1));
  assert.deepEqual(b.snapshot().inventories.ally,[]);
});

// ---------- Smart Auto integration ----------

test("Smart Auto picks revive for a KO ally and never heals a KO target",()=>{
  const b=setup(); killTank(b); turnOf(b,"healer");
  const cmd=chooseSmartCommand(b);
  assert.equal(cmd.type,"skill"); assert.equal(cmd.skillId,"raise"); assert.deepEqual(cmd.targetIds,["tank"]);
});

test("Smart Auto cleanses a heavily debuffed ally over idle options",()=>{
  const b=new BattleEngine({seed:"auto-cleanse",skills:ALL_SKILLS,participants:[
    p("healer","ally","rear-left",{...base,spd:200},"ranged",["cleanseAll"]),
    p("buddy","ally","front-center",{...base,spd:60}),
    p("boss","enemy","front-center",{...base,maxHp:5000,def:5000,int:5000,spd:150},"melee",["hex"]),
  ]});
  act(b,"boss",{type:"skill",skillId:"hex",targetIds:["buddy"]}); turnOf(b,"healer");
  const cmd=chooseSmartCommand(b);
  assert.deepEqual(cmd,{type:"skill",actorId:"healer",skillId:"cleanseAll",targetIds:["buddy"]});
});

// ---------- Mixed replay determinism ----------

const MIXED_REPLAY_GOLDEN_HASH="40a9763c";
function mixedReplay(){
  const b=setup("phase7-mixed-replay"); const log=[];
  log.push(act(b,"healer",{type:"attack",targetId:"boss"}));                       // basic attack
  log.push(act(b,"boss",{type:"skill",skillId:"hex",targetIds:["buddy"]}));        // status skill
  log.push(act(b,"healer",{type:"skill",skillId:"purify",targetIds:["buddy"]}));   // cleanse
  log.push(act(b,"boss",{type:"skill",skillId:"nuke",targetIds:["tank"]}));        // KO
  log.push(act(b,"healer",{type:"skill",skillId:"raise",targetIds:["tank"]}));     // revive
  log.push(act(b,"tank",{type:"attack",targetId:"boss"}));                         // revived unit timeline action
  log.push(act(b,"healer",{type:"skill",skillId:"mend",targetIds:["tank"]}));      // another skill
  return {hash:b.stateHash(),log:JSON.stringify(log),turnIndex:b.snapshot().turnIndex};
}

test("mixed attack/status/cleanse/KO/revive/skill replay is deterministic and matches golden hash",()=>{
  const first=mixedReplay(); const second=mixedReplay();
  assert.deepEqual(first,second);
  assert.equal(first.hash,MIXED_REPLAY_GOLDEN_HASH);
});
