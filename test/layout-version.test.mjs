import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { generateFloor, RunEngine } from "../dist/index.js";
import { MVP_CONTENT } from "../dist/content/index.js";
import { TEST_CONTENT, START, walkTo } from "./fixtures/run-content.mjs";
const hashes=JSON.parse(readFileSync(new URL("./fixtures/legacy-floor-hashes.json",import.meta.url)));
test("unversioned and explicit legacy maps retain pre-change golden hashes",()=>{
  for(const {spec,sha256} of hashes) for(const options of [spec,{...spec,layoutVersion:"legacy-v1"}]) {
    assert.equal(createHash("sha256").update(JSON.stringify(generateFloor(options))).digest("hex"),sha256);
  }
});
test("compact generation covers every campaign plan, bounds rooms and is deterministic",()=>{
  for(const c of MVP_CONTENT.campaigns) for(const p of c.floors) {
    const spec={seed:"compact-validation::"+c.id,depth:p.depth,layoutVersion:"compact-v2",enemyGroups:p.enemyGroups,enemyCount:p.enemyCount,traps:p.traps,trapCount:p.trapCount,objects:p.objects??[],
      ...(p.bossGroupId?{boss:{groupId:p.bossGroupId}}:{}),mechanics:{...(p.gateDefenderGroupId?{gates:{defenderGroupId:p.gateDefenderGroupId}}:{}),sorceryFormations:p.sorceryFormations??0}};
    const floor=generateFloor(spec);assert.deepEqual(floor,generateFloor(spec));
    const main=floor.rooms.filter((_,i)=>i!==floor.secretRoom);assert.ok(main.length>=5&&main.length<=9);
    for(const room of main) assert.ok(room.width>=4&&room.width<=6&&room.height>=4&&room.height<=6);
    if(p.bossGroupId)assert.ok(floor.enemies.some(e=>e.boss&&e.groupId===p.bossGroupId));
  }
});
test("saved layout option survives replay and persists on the next floor",()=>{
  for(const version of [undefined,"legacy-v1","compact-v2"]){
    const options={...START,...(version?{dungeonLayout:version}:{})};
    // Remove content encounters in this fixture to isolate multi-floor save compatibility.
    const pack={...TEST_CONTENT,campaigns:[{...TEST_CONTENT.campaigns.find(c=>c.id===START.campaignId),floors:[1,2,3].map(depth=>({depth,enemyGroups:[],enemyCount:[0,0],traps:[],trapCount:[0,0],objects:[],secretRoomChance:0}))}]};
    const original=new RunEngine(pack,options),log=[],act=original.act.bind(original);
    original.act=command=>{log.push(structuredClone(command));return act(command);};
    walkTo(original,original.dungeon.floor.stairs);original.act({type:"dungeon",command:{type:"descend"}});
    for(let i=0;i<5;i++)original.act({type:"dungeon",command:{type:"wait"}});
    const restored=new RunEngine(pack,JSON.parse(JSON.stringify(options)));for(const command of log)restored.act(command);
    assert.equal(restored.depth,2);assert.equal(restored.stateHash(),original.stateHash());
    const widths=restored.dungeon.floor.rooms.map(r=>r.width);
    if(version==="compact-v2")assert.ok(widths.every(w=>w<=6));
    else assert.deepEqual(restored.dungeon.floor,generateFloor({seed:START.seed+"::"+START.campaignId,depth:2,enemyGroups:[],enemyCount:[0,0],traps:[],trapCount:[0,0],objects:[],secretRoomChance:0,mechanics:{},layoutVersion:"legacy-v1"}));
  }
});
test("unknown layout versions fail explicitly",()=>{
  assert.throws(()=>generateFloor({...hashes[0].spec,layoutVersion:"future"}),/Unknown dungeon layout/);
  assert.throws(()=>new RunEngine(TEST_CONTENT,{...START,dungeonLayout:"future"}),/Unknown dungeon layout/);
});
