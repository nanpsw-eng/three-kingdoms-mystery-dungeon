import { STACKABLE_STATUS_MAX } from "./balance.js";
export { STACKABLE_STATUS_MAX };
const STACKABLE = new Set(["poison", "burn", "bleed"]);
function assertPositiveInteger(label, value) { if (!Number.isSafeInteger(value) || value <= 0)
    throw new RangeError(`${label} must be a positive safe integer.`); }
function normalizeApplication(application) {
    assertPositiveInteger("Status duration", application.durationRounds);
    const stacks = application.stacks ?? 1;
    assertPositiveInteger("Status stacks", stacks);
    const magnitude = application.magnitude ?? 1;
    if (!Number.isFinite(magnitude) || magnitude <= 0)
        throw new RangeError("Status magnitude must be a positive finite number.");
    const normalizedStacks = STACKABLE.has(application.type) ? Math.min(STACKABLE_STATUS_MAX, stacks) : 1;
    const base = { type: application.type, remainingRounds: application.durationRounds, stacks: normalizedStacks, magnitude };
    return application.sourceId === undefined ? base : { ...base, sourceId: application.sourceId };
}
export class StatusStore {
    #statuses = new Map();
    get size() { return this.#statuses.size; }
    has(type) { return this.#statuses.has(type); }
    get(type) { const status = this.#statuses.get(type); return status === undefined ? undefined : { ...status }; }
    apply(application) {
        const incoming = normalizeApplication(application);
        const existing = this.#statuses.get(incoming.type);
        let merged;
        if (existing === undefined)
            merged = incoming;
        else if (STACKABLE.has(incoming.type))
            merged = { ...incoming, stacks: Math.min(STACKABLE_STATUS_MAX, existing.stacks + incoming.stacks), remainingRounds: Math.max(existing.remainingRounds, incoming.remainingRounds), magnitude: Math.max(existing.magnitude, incoming.magnitude) };
        else
            merged = { ...incoming, stacks: 1, remainingRounds: Math.max(existing.remainingRounds, incoming.remainingRounds), magnitude: Math.max(existing.magnitude, incoming.magnitude) };
        this.#statuses.set(merged.type, Object.freeze(merged));
        return { ...merged };
    }
    remove(type) { return this.#statuses.delete(type); }
    clear(statusTypes) {
        const targets = statusTypes ?? [...this.#statuses.keys()];
        const removed = [];
        for (const type of targets) {
            const status = this.#statuses.get(type);
            if (status === undefined)
                continue;
            removed.push({ ...status });
            this.#statuses.delete(type);
        }
        return removed.sort((left, right) => left.type.localeCompare(right.type));
    }
    tickRound() { const expired = []; for (const [type, status] of this.#statuses) {
        const remainingRounds = status.remainingRounds - 1;
        if (remainingRounds <= 0) {
            expired.push({ ...status, remainingRounds: 0 });
            this.#statuses.delete(type);
        }
        else
            this.#statuses.set(type, Object.freeze({ ...status, remainingRounds }));
    } return expired; }
    snapshot() { return [...this.#statuses.values()].map((status) => ({ ...status })).sort((left, right) => left.type.localeCompare(right.type)); }
}
//# sourceMappingURL=status.js.map