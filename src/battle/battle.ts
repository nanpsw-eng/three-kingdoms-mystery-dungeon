import { rollDamage } from "./damage.js";
import { Formation, type FormationSlot } from "./formation.js";
import { SpdTimeline, type TimelineEvent } from "./timeline.js";
import { BattleUnit, type BattleSide, type BattleUnitDefinition } from "./unit.js";
import { SeededRng, type RngSnapshot, type Seed } from "../core/rng.js";

export const BASIC_ATTACK_POWER = 18 as const;
export const BASIC_ATTACK_ENERGY = 18 as const;
export const HIT_RECEIVED_ENERGY = 8 as const;
export const KILL_ENERGY = 12 as const;
export const CRITICAL_ENERGY = 5 as const;
export const GUARD_ENERGY = 20 as const;
export const GUARD_DAMAGE_MULTIPLIER = 0.7 as const;

export type BasicAttackReach = "melee" | "ranged";
export type BattleOutcome = "ongoing" | "ally-victory" | "enemy-victory";
export interface BattleParticipantDefinition { readonly unit: BattleUnitDefinition; readonly slot: FormationSlot; readonly basicAttackReach: BasicAttackReach; }
export interface BattleDefinition { readonly seed: Seed; readonly participants: readonly BattleParticipantDefinition[]; }
export type BattleCommand = Readonly<{ type: "attack"; actorId: string; targetId: string }> | Readonly<{ type: "guard"; actorId: string }> | Readonly<{ type: "formation"; actorId: string; targetSlot: FormationSlot }>;
export interface BattleActionResult { readonly actorId: string; readonly command: BattleCommand; readonly targetId?: string; readonly damage?: number; readonly critical?: boolean; readonly targetKo?: boolean; readonly outcome: BattleOutcome; }
export interface BattleSnapshot { readonly rng: RngSnapshot; readonly time: number; readonly turnIndex: number; readonly outcome: BattleOutcome; readonly activeTurn: TimelineEvent | null; readonly units: readonly ReturnType<BattleUnit["snapshot"]>[]; readonly allyFormation: ReturnType<Formation["snapshot"]>; readonly enemyFormation: ReturnType<Formation["snapshot"]>; readonly timeline: readonly TimelineEvent[]; readonly guarding: readonly string[]; }
function oppositeSide(side: BattleSide): BattleSide { return side === "ally" ? "enemy" : "ally"; }
function hashStringFNV1a(value: string): string { let hash=0x811c9dc5; for(let index=0;index<value.length;index+=1){hash^=value.charCodeAt(index);hash=Math.imul(hash,0x01000193);} return (hash>>>0).toString(16).padStart(8,"0"); }

export class BattleEngine {
  readonly #rng: SeededRng; readonly #timeline=new SpdTimeline(); readonly #units=new Map<string,BattleUnit>(); readonly #reach=new Map<string,BasicAttackReach>();
  readonly #formations:Record<BattleSide,Formation>={ally:new Formation("ally"),enemy:new Formation("enemy")}; readonly #guarding=new Set<string>();
  #activeTurn:TimelineEvent|null=null; #turnIndex=0; #outcome:BattleOutcome="ongoing";
  constructor(definition:BattleDefinition){
    this.#rng=new SeededRng(definition.seed).fork("battle"); const sideCount:Record<BattleSide,number>={ally:0,enemy:0};
    for(const participant of definition.participants){const id=participant.unit.id;if(this.#units.has(id))throw new Error(`Duplicate battle unit id: ${id}`);sideCount[participant.unit.side]+=1;if(sideCount[participant.unit.side]>5)throw new RangeError(`Battle side exceeds five units: ${participant.unit.side}`);const unit=new BattleUnit(participant.unit);this.#units.set(id,unit);this.#reach.set(id,participant.basicAttackReach);this.#formations[participant.unit.side].place(id,participant.slot);}
    const timelineOrder=this.#rng.fork("initial-timeline-order").shuffle(definition.participants); for(const participant of timelineOrder){const unit=this.#requireUnit(participant.unit.id);this.#timeline.registerActor({id:unit.id,spd:unit.stats.spd});}
    if(sideCount.ally===0||sideCount.enemy===0)throw new RangeError("Battle requires at least one ally and one enemy.");
  }
  get outcome():BattleOutcome{return this.#outcome;}
  nextTurn():TimelineEvent|null{if(this.#outcome!=="ongoing")return null;if(this.#activeTurn!==null)throw new Error("Current turn must be resolved before taking the next turn.");const event=this.#timeline.takeNext();if(event===undefined)return null;const unit=this.#requireUnit(event.actorId);if(unit.knockedOut)throw new Error(`KO actor remained on timeline: ${event.actorId}`);if(event.kind==="normal")this.#guarding.delete(event.actorId);this.#activeTurn=event;this.#turnIndex+=1;return{...event};}
  legalBasicTargets(actorId:string):readonly string[]{const actor=this.#requireLivingUnit(actorId);const enemyFormation=this.#formations[oppositeSide(actor.side)];const reach=this.#reach.get(actorId);if(reach===undefined)throw new Error(`Missing basic attack reach: ${actorId}`);if(reach==="ranged")return[...enemyFormation.unitsInRow("front"),...enemyFormation.unitsInRow("rear")];const front=enemyFormation.unitsInRow("front");return front.length>0?front:enemyFormation.unitsInRow("rear");}
  execute(command:BattleCommand):BattleActionResult{if(this.#outcome!=="ongoing")throw new Error("Battle is already resolved.");const active=this.#activeTurn;if(active===null)throw new Error("No active turn. Call nextTurn() first.");if(command.actorId!==active.actorId)throw new Error(`Command actor does not own the active turn: ${command.actorId}`);let result:BattleActionResult;switch(command.type){case"attack":result=this.#executeAttack(command);break;case"guard":result=this.#executeGuard(command);break;case"formation":result=this.#executeFormation(command);break;}this.#finishActiveTurn();return result;}
  snapshot():BattleSnapshot{const units=[...this.#units.values()].map((unit)=>unit.snapshot()).sort((left,right)=>left.id.localeCompare(right.id));return{rng:this.#rng.snapshot(),time:this.#timeline.time,turnIndex:this.#turnIndex,outcome:this.#outcome,activeTurn:this.#activeTurn===null?null:{...this.#activeTurn},units,allyFormation:this.#formations.ally.snapshot(),enemyFormation:this.#formations.enemy.snapshot(),timeline:this.#timeline.peek(),guarding:[...this.#guarding].sort()};}
  stateHash():string{return hashStringFNV1a(JSON.stringify(this.snapshot()));}
  #executeAttack(command:Extract<BattleCommand,{type:"attack"}>):BattleActionResult{const actor=this.#requireLivingUnit(command.actorId);const target=this.#requireLivingUnit(command.targetId);if(target.side===actor.side)throw new Error("Basic attack target must be an enemy.");const legalTargets=this.legalBasicTargets(command.actorId);if(!legalTargets.includes(command.targetId))throw new Error(`Illegal basic attack target: ${command.targetId}`);const guardedModifier=this.#guarding.has(target.id)?GUARD_DAMAGE_MULTIPLIER:1;const roll=rollDamage(this.#rng,{kind:"physical",skillPower:BASIC_ATTACK_POWER,attackerAtk:actor.stats.atk,attackerInt:actor.stats.int,targetDef:target.stats.def,targetInt:target.stats.int,modifier:guardedModifier});const damage=target.takeDamage(roll.damage);actor.gainEnergy(BASIC_ATTACK_ENERGY);if(roll.critical)actor.gainEnergy(CRITICAL_ENERGY);if(!target.knockedOut)target.gainEnergy(HIT_RECEIVED_ENERGY);if(target.knockedOut){actor.gainEnergy(KILL_ENERGY);this.#timeline.removeActor(target.id);this.#formations[target.side].remove(target.id);this.#guarding.delete(target.id);}this.#updateOutcome();return{actorId:actor.id,command,targetId:target.id,damage,critical:roll.critical,targetKo:target.knockedOut,outcome:this.#outcome};}
  #executeGuard(command:Extract<BattleCommand,{type:"guard"}>):BattleActionResult{const actor=this.#requireLivingUnit(command.actorId);this.#guarding.add(actor.id);actor.gainEnergy(GUARD_ENERGY);return{actorId:actor.id,command,outcome:this.#outcome};}
  #executeFormation(command:Extract<BattleCommand,{type:"formation"}>):BattleActionResult{const actor=this.#requireLivingUnit(command.actorId);this.#formations[actor.side].moveOrSwap(actor.id,command.targetSlot);return{actorId:actor.id,command,outcome:this.#outcome};}
  #finishActiveTurn():void{const active=this.#activeTurn;if(active===null)throw new Error("No active turn to finish.");if(this.#outcome==="ongoing"&&active.kind==="normal"){const actor=this.#units.get(active.actorId);if(actor!==undefined&&!actor.knockedOut)this.#timeline.scheduleAfterAction(actor.id);}this.#activeTurn=null;}
  #updateOutcome():void{const livingAllies=[...this.#units.values()].some((unit)=>unit.side==="ally"&&!unit.knockedOut);const livingEnemies=[...this.#units.values()].some((unit)=>unit.side==="enemy"&&!unit.knockedOut);if(!livingEnemies)this.#outcome="ally-victory";else if(!livingAllies)this.#outcome="enemy-victory";}
  #requireUnit(unitId:string):BattleUnit{const unit=this.#units.get(unitId);if(unit===undefined)throw new Error(`Unknown battle unit: ${unitId}`);return unit;}
  #requireLivingUnit(unitId:string):BattleUnit{const unit=this.#requireUnit(unitId);if(unit.knockedOut)throw new Error(`Battle unit is KO: ${unitId}`);return unit;}
}
