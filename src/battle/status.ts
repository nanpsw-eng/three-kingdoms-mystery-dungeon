export const STACKABLE_STATUS_MAX = 3 as const;
export type StatusType = "poison" | "burn" | "bleed" | "confusion" | "stun" | "taunt" | "defense-down" | "timeline-delay";
export interface StatusApplication { readonly type: StatusType; readonly durationRounds: number; readonly stacks?: number; readonly magnitude?: number; readonly sourceId?: string; }
export interface StatusInstance { readonly type: StatusType; readonly remainingRounds: number; readonly stacks: number; readonly magnitude: number; readonly sourceId?: string; }
const STACKABLE = new Set<StatusType>(["poison", "burn", "bleed"]);
function assertPositiveInteger(label: string, value: number): void { if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${label} must be a positive safe integer.`); }
function normalizeApplication(application: StatusApplication): StatusInstance {
  assertPositiveInteger("Status duration", application.durationRounds);
  const stacks = application.stacks ?? 1; assertPositiveInteger("Status stacks", stacks);
  const magnitude = application.magnitude ?? 1; if (!Number.isFinite(magnitude) || magnitude <= 0) throw new RangeError("Status magnitude must be a positive finite number.");
  const normalizedStacks = STACKABLE.has(application.type) ? Math.min(STACKABLE_STATUS_MAX, stacks) : 1;
  const base = { type: application.type, remainingRounds: application.durationRounds, stacks: normalizedStacks, magnitude } as const;
  return application.sourceId === undefined ? base : { ...base, sourceId: application.sourceId };
}
export class StatusStore {
  readonly #statuses = new Map<StatusType, StatusInstance>();
  get size(): number { return this.#statuses.size; }
  has(type: StatusType): boolean { return this.#statuses.has(type); }
  get(type: StatusType): StatusInstance | undefined { const status=this.#statuses.get(type); return status===undefined?undefined:{...status}; }
  apply(application: StatusApplication): StatusInstance {
    const incoming=normalizeApplication(application); const existing=this.#statuses.get(incoming.type); let merged: StatusInstance;
    if (existing===undefined) merged=incoming;
    else if (STACKABLE.has(incoming.type)) merged={...incoming,stacks:Math.min(STACKABLE_STATUS_MAX,existing.stacks+incoming.stacks),remainingRounds:Math.max(existing.remainingRounds,incoming.remainingRounds),magnitude:Math.max(existing.magnitude,incoming.magnitude)};
    else merged={...incoming,stacks:1,remainingRounds:Math.max(existing.remainingRounds,incoming.remainingRounds),magnitude:Math.max(existing.magnitude,incoming.magnitude)};
    this.#statuses.set(merged.type,Object.freeze(merged)); return {...merged};
  }
  remove(type: StatusType): boolean { return this.#statuses.delete(type); }
  clear(statusTypes?: readonly StatusType[]): readonly StatusInstance[] {
    const targets = statusTypes ?? [...this.#statuses.keys()];
    const removed: StatusInstance[] = [];
    for (const type of targets) {
      const status = this.#statuses.get(type);
      if (status === undefined) continue;
      removed.push({ ...status });
      this.#statuses.delete(type);
    }
    return removed.sort((left, right) => left.type.localeCompare(right.type));
  }
  tickRound(): readonly StatusInstance[] { const expired:StatusInstance[]=[]; for(const [type,status] of this.#statuses){const remainingRounds=status.remainingRounds-1;if(remainingRounds<=0){expired.push({...status,remainingRounds:0});this.#statuses.delete(type);}else this.#statuses.set(type,Object.freeze({...status,remainingRounds}));}return expired; }
  snapshot(): readonly StatusInstance[] { return [...this.#statuses.values()].map((status)=>({...status})).sort((left,right)=>left.type.localeCompare(right.type)); }
}
