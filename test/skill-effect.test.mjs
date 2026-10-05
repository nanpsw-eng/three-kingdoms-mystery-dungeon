import assert from "node:assert/strict";
import test from "node:test";
import { BattleEngine } from "../dist/battle/battle.js";

function p(id,side,slot,stats,reach="melee",skillIds=[]){return{unit:{id,side,stats},slot,basicAttackReach:reach,skillIds};}
const base={maxHp:100,atk:100,def:100,spd:100,int:100};

test("data-driven skill applies damage and status",()=>{
  const fire={id:"fire",kind:"active",energyCost:0,targeting:{team:"enemy",access:"any",minTargets:1,maxTargets:1},effects:[{type:"damage",recipient:"targets",kind:"strategy",power:30,critChance:0},{type:"status",recipient:"targets",statusType:"burn",durationRounds:2,stacks:1,magnitude:5}]};
  const b=new BattleEngine({seed:"skill",skills:[fire],participants:[p("caster","ally","rear-left",{...base,spd:120,int:120},"ranged",["fire"]),p("enemy","enemy","front-center",{...base,spd:80})]});
  assert.equal(b.nextTurn()?.actorId,"caster"); const r=b.execute({type:"skill",actorId:"caster",skillId:"fire",targetIds:["enemy"]});
  assert.equal(r.effects.length,2); assert.ok((r.effects[0]?.amount??0)>0);
  assert.equal(b.snapshot().statuses.find(x=>x.unitId==="enemy")?.statuses[0]?.type,"burn");
});

test("timeline-shift delays a scheduled enemy action",()=>{
  const delay={id:"delay",kind:"active",energyCost:0,targeting:{team:"enemy",access:"any",minTargets:1,maxTargets:1},effects:[{type:"timeline-shift",recipient:"targets",amount:50}]};
  const b=new BattleEngine({seed:"delay",skills:[delay],participants:[p("fast","ally","front-center",{...base,spd:120},"melee",["delay"]),p("enemy","enemy","front-center",{...base,spd:100})]});
  assert.equal(b.nextTurn()?.actorId,"fast"); const before=b.snapshot().timeline.find(x=>x.actorId==="enemy")?.readyAt??0;
  b.execute({type:"skill",actorId:"fast",skillId:"delay",targetIds:["enemy"]});
  const after=b.snapshot().timeline.find(x=>x.actorId==="enemy")?.readyAt??0; assert.equal(after-before,50);
});

test("formation-swap moves actor into selected ally slot",()=>{
  const swap={id:"swap",kind:"active",energyCost:0,targeting:{team:"ally",access:"any",minTargets:1,maxTargets:1},effects:[{type:"formation-swap",recipient:"targets"}]};
  const b=new BattleEngine({seed:"swap",skills:[swap],participants:[p("actor","ally","front-left",{...base,spd:120},"melee",["swap"]),p("ally","ally","rear-left",{...base,spd:80}),p("enemy","enemy","front-center",{...base,spd:70})]});
  assert.equal(b.nextTurn()?.actorId,"actor"); b.execute({type:"skill",actorId:"actor",skillId:"swap",targetIds:["ally"]});
  assert.deepEqual(b.snapshot().allyFormation,[{slot:"front-left",unitId:"ally"},{slot:"rear-left",unitId:"actor"}]);
});

test("taunt restricts next single-target basic target",()=>{
  const taunt={id:"taunt",kind:"active",energyCost:0,targeting:{team:"enemy",access:"any",minTargets:1,maxTargets:1},effects:[{type:"status",recipient:"targets",statusType:"taunt",durationRounds:2}]};
  const b=new BattleEngine({seed:"taunt",skills:[taunt],participants:[p("tank","ally","front-center",{...base,spd:120},"melee",["taunt"]),p("ally2","ally","front-left",{...base,spd:80}),p("enemy","enemy","front-center",{...base,spd:100})]});
  assert.equal(b.nextTurn()?.actorId,"tank"); b.execute({type:"skill",actorId:"tank",skillId:"taunt",targetIds:["enemy"]});
  assert.equal(b.nextTurn()?.actorId,"enemy"); assert.deepEqual(b.legalBasicTargets("enemy"),["tank"]);
});

test("battle item is consumed after effect execution",()=>{
  const item={id:"potion",targeting:{team:"self",access:"self",minTargets:1,maxTargets:1},effects:[{type:"energy",recipient:"actor",amount:25}]};
  const b=new BattleEngine({seed:"item",items:[item],inventories:{ally:["potion"]},participants:[p("actor","ally","front-center",{...base,spd:120}),p("enemy","enemy","front-center",{...base,spd:80})]});
  assert.equal(b.nextTurn()?.actorId,"actor"); b.execute({type:"item",actorId:"actor",itemId:"potion",targetIds:["actor"]});
  assert.equal(b.snapshot().units.find(x=>x.id==="actor")?.energy,25); assert.deepEqual(b.snapshot().inventories.ally,[]);
});

test("ultimate requires 100 energy and consumes it",()=>{
  const charge={id:"charge",kind:"active",energyCost:0,targeting:{team:"self",access:"self",minTargets:1,maxTargets:1},effects:[{type:"energy",recipient:"actor",amount:100}]};
  const ult={id:"ult",kind:"ultimate",energyCost:100,targeting:{team:"enemy",access:"any",minTargets:1,maxTargets:1},effects:[{type:"damage",recipient:"targets",kind:"physical",power:50,critChance:0}]};
  const b=new BattleEngine({seed:"ult",skills:[charge,ult],participants:[p("actor","ally","front-center",{...base,spd:120},"melee",["charge","ult"]),p("enemy","enemy","front-center",{...base,maxHp:300,spd:60})]});
  assert.equal(b.nextTurn()?.actorId,"actor"); assert.throws(()=>b.execute({type:"ultimate",actorId:"actor",skillId:"ult",targetIds:["enemy"]}),/Insufficient energy/);
  b.execute({type:"skill",actorId:"actor",skillId:"charge",targetIds:["actor"]});
  while(b.outcome==="ongoing"){const t=b.nextTurn();assert.ok(t);if(t.actorId==="actor"){b.execute({type:"ultimate",actorId:"actor",skillId:"ult",targetIds:["enemy"]});assert.equal(b.snapshot().units.find(x=>x.id==="actor")?.energy,0);break;}b.execute({type:"guard",actorId:t.actorId});}
});

test("retreat resolves after the next opponent action",()=>{
  const b=new BattleEngine({seed:"retreat",participants:[p("actor","ally","front-center",{...base,spd:120}),p("enemy","enemy","front-center",{...base,spd:100})]});
  assert.equal(b.nextTurn()?.actorId,"actor"); b.execute({type:"retreat",actorId:"actor"});
  assert.equal(b.nextTurn()?.actorId,"enemy"); b.execute({type:"guard",actorId:"enemy"}); assert.equal(b.outcome,"ally-retreated");
});

test("mixed skill/basic replay remains deterministic",()=>{
  const skill={id:"strike",kind:"active",energyCost:0,targeting:{team:"enemy",access:"any",minTargets:1,maxTargets:1},effects:[{type:"damage",recipient:"targets",kind:"physical",power:25,critChance:0},{type:"timeline-shift",recipient:"targets",amount:20}]};
  const play=()=>{const b=new BattleEngine({seed:"mixed-replay",skills:[skill],participants:[p("a","ally","front-center",{...base,atk:120,spd:120},"melee",["strike"]),p("e","enemy","front-center",{...base,maxHp:250,spd:100})]});for(let i=0;i<5&&b.outcome==="ongoing";i++){const t=b.nextTurn();assert.ok(t);if(t.actorId==="a"&&i===0)b.execute({type:"skill",actorId:"a",skillId:"strike",targetIds:["e"]});else b.execute({type:"attack",actorId:t.actorId,targetId:t.actorId==="a"?"e":"a"});}return b.stateHash();}; assert.equal(play(),play());
});
