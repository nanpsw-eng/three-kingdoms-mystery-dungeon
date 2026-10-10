import { ACTION_DELAY_BASE } from "./balance.js";
export { ACTION_DELAY_BASE };
const EPSILON = 1e-9;
function assertPositiveFinite(label, value) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new RangeError(`${label} must be a positive finite number.`);
    }
}
export function computeActionDelay(spd, actionSpeedModifier = 1) {
    assertPositiveFinite("SPD", spd);
    assertPositiveFinite("Action speed modifier", actionSpeedModifier);
    return (ACTION_DELAY_BASE / spd) * actionSpeedModifier;
}
function eventPriority(kind) {
    switch (kind) {
        case "interrupt": return 0;
        case "extra": return 1;
        case "normal": return 2;
    }
}
export class SpdTimeline {
    #time = 0;
    #sequence = 0;
    #actors = new Map();
    #events = [];
    get time() { return this.#time; }
    get size() { return this.#events.length; }
    registerActor(actor, initialActionSpeedModifier = 1) {
        if (actor.id.trim().length === 0)
            throw new RangeError("Timeline actor id must not be empty.");
        assertPositiveFinite("SPD", actor.spd);
        if (this.#actors.has(actor.id))
            throw new Error(`Timeline actor already registered: ${actor.id}`);
        const frozen = Object.freeze({ ...actor });
        this.#actors.set(actor.id, frozen);
        this.#enqueue(actor.id, this.#time + computeActionDelay(actor.spd, initialActionSpeedModifier), "normal");
    }
    hasActor(actorId) { return this.#actors.has(actorId); }
    removeActor(actorId) {
        this.#actors.delete(actorId);
        for (let index = this.#events.length - 1; index >= 0; index -= 1) {
            if (this.#events[index]?.actorId === actorId)
                this.#events.splice(index, 1);
        }
    }
    takeNext() {
        this.#sortEvents();
        const event = this.#events.shift();
        if (event === undefined)
            return undefined;
        this.#time = Math.max(this.#time, event.readyAt);
        return event;
    }
    scheduleAfterAction(actorId, actionSpeedModifier = 1) {
        const actor = this.#requireActor(actorId);
        return this.#enqueue(actorId, this.#time + computeActionDelay(actor.spd, actionSpeedModifier), "normal");
    }
    scheduleExtraAction(actorId, offset = 0) {
        this.#requireActor(actorId);
        if (!Number.isFinite(offset) || offset < 0)
            throw new RangeError("Extra-action offset must be a non-negative finite number.");
        return this.#enqueue(actorId, this.#time + offset, "extra");
    }
    scheduleInterrupt(actorId) {
        this.#requireActor(actorId);
        return this.#enqueue(actorId, this.#time, "interrupt");
    }
    shiftNextNormalAction(actorId, delta) {
        this.#requireActor(actorId);
        if (!Number.isFinite(delta))
            throw new RangeError("Timeline shift must be finite.");
        let targetIndex = -1;
        let target;
        for (let index = 0; index < this.#events.length; index += 1) {
            const candidate = this.#events[index];
            if (candidate?.actorId !== actorId || candidate.kind !== "normal")
                continue;
            if (target === undefined || candidate.readyAt < target.readyAt - EPSILON || (Math.abs(candidate.readyAt - target.readyAt) <= EPSILON && candidate.sequence < target.sequence)) {
                target = candidate;
                targetIndex = index;
            }
        }
        if (target === undefined || targetIndex < 0)
            throw new Error(`No scheduled normal action for actor: ${actorId}`);
        const shifted = Object.freeze({ ...target, readyAt: Math.max(this.#time, target.readyAt + delta) });
        this.#events[targetIndex] = shifted;
        return shifted;
    }
    peek() {
        this.#sortEvents();
        return this.#events.map((event) => ({ ...event }));
    }
    #requireActor(actorId) {
        const actor = this.#actors.get(actorId);
        if (actor === undefined)
            throw new Error(`Unknown timeline actor: ${actorId}`);
        return actor;
    }
    #enqueue(actorId, readyAt, kind) {
        const event = Object.freeze({ actorId, readyAt, kind, sequence: this.#sequence });
        this.#sequence += 1;
        this.#events.push(event);
        return event;
    }
    #sortEvents() {
        this.#events.sort((left, right) => {
            const readyDelta = left.readyAt - right.readyAt;
            if (Math.abs(readyDelta) > EPSILON)
                return readyDelta;
            const priorityDelta = eventPriority(left.kind) - eventPriority(right.kind);
            if (priorityDelta !== 0)
                return priorityDelta;
            return left.sequence - right.sequence;
        });
    }
}
//# sourceMappingURL=timeline.js.map