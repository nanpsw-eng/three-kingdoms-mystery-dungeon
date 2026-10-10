export const RNG_ALGORITHM = "mulberry32-v1";
const UINT32_RANGE = 0x1_0000_0000;
const STEP = 0x6d2b79f5;
function normalizeSeed(seed) {
    if (typeof seed === "number") {
        if (!Number.isFinite(seed)) {
            throw new RangeError("Numeric RNG seed must be finite.");
        }
        return `n:${seed}`;
    }
    if (seed.length === 0) {
        throw new RangeError("String RNG seed must not be empty.");
    }
    return `s:${seed}`;
}
/** Stable FNV-1a hash with an avalanche finalizer. */
function hashSeed(seedKey) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < seedKey.length; index += 1) {
        hash ^= seedKey.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
    hash = Math.imul(hash, 0x846ca68b);
    hash ^= hash >>> 16;
    return hash >>> 0;
}
export class SeededRng {
    #seedKey;
    #state;
    constructor(seed) {
        this.#seedKey = normalizeSeed(seed);
        this.#state = hashSeed(this.#seedKey);
    }
    static fromSnapshot(snapshot) {
        if (snapshot.algorithm !== RNG_ALGORITHM) {
            throw new RangeError(`Unsupported RNG algorithm: ${snapshot.algorithm}`);
        }
        if (!Number.isInteger(snapshot.state) || snapshot.state < 0 || snapshot.state >= UINT32_RANGE) {
            throw new RangeError("RNG snapshot state must be an unsigned 32-bit integer.");
        }
        // Private fields cannot be assigned on an uninitialized object, so restore through
        // a deterministic constructor and then apply the snapshot state.
        const restored = new SeededRng(snapshot.seedKey.startsWith("s:") ? snapshot.seedKey.slice(2) : Number(snapshot.seedKey.slice(2)));
        restored.#state = snapshot.state >>> 0;
        return restored;
    }
    get seedKey() {
        return this.#seedKey;
    }
    nextUint32() {
        this.#state = (this.#state + STEP) >>> 0;
        let value = this.#state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return (value ^ (value >>> 14)) >>> 0;
    }
    nextFloat() {
        return this.nextUint32() / UINT32_RANGE;
    }
    nextInt(minInclusive, maxExclusive) {
        if (!Number.isSafeInteger(minInclusive) || !Number.isSafeInteger(maxExclusive)) {
            throw new TypeError("nextInt bounds must be safe integers.");
        }
        if (maxExclusive <= minInclusive) {
            throw new RangeError("nextInt requires maxExclusive > minInclusive.");
        }
        const span = maxExclusive - minInclusive;
        if (span > UINT32_RANGE) {
            throw new RangeError("nextInt range must be <= 2^32.");
        }
        const limit = UINT32_RANGE - (UINT32_RANGE % span);
        let value;
        do {
            value = this.nextUint32();
        } while (value >= limit);
        return minInclusive + (value % span);
    }
    chance(probability) {
        if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
            throw new RangeError("chance probability must be between 0 and 1 inclusive.");
        }
        if (probability === 0)
            return false;
        if (probability === 1)
            return true;
        return this.nextFloat() < probability;
    }
    pick(items) {
        if (items.length === 0) {
            throw new RangeError("Cannot pick from an empty collection.");
        }
        return items[this.nextInt(0, items.length)];
    }
    shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = this.nextInt(0, index + 1);
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }
    /**
     * Creates a deterministic independent stream without consuming the parent stream.
     * This lets battle, dungeon, loot, and AI use isolated RNG namespaces.
     */
    fork(label) {
        if (label.length === 0) {
            throw new RangeError("RNG fork label must not be empty.");
        }
        return new SeededRng(`${this.#seedKey}::${label}`);
    }
    snapshot() {
        return {
            algorithm: RNG_ALGORITHM,
            seedKey: this.#seedKey,
            state: this.#state,
        };
    }
}
//# sourceMappingURL=rng.js.map