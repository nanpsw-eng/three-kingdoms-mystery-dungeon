import assert from "node:assert/strict";
import test from "node:test";

import { RNG_ALGORITHM, SeededRng } from "../dist/core/rng.js";

test("same seed produces the same sequence", () => {
  const first = new SeededRng("yellow-turban");
  const second = new SeededRng("yellow-turban");

  const a = Array.from({ length: 20 }, () => first.nextUint32());
  const b = Array.from({ length: 20 }, () => second.nextUint32());

  assert.deepEqual(a, b);
});



test("golden vector pins the RNG algorithm version", () => {
  const rng = new SeededRng("yellow-turban");
  const actual = Array.from({ length: 8 }, () => rng.nextUint32());

  assert.deepEqual(actual, [
    2585531676,
    1892752690,
    3974188266,
    3999138998,
    1534598603,
    1823638969,
    1384678365,
    2076606681,
  ]);
});

test("different seeds produce a different sequence", () => {
  const first = new SeededRng("yellow-turban");
  const second = new SeededRng("hulao-gate");

  const a = Array.from({ length: 8 }, () => first.nextUint32());
  const b = Array.from({ length: 8 }, () => second.nextUint32());

  assert.notDeepEqual(a, b);
});

test("snapshot and restore reproduce the continuation", () => {
  const original = new SeededRng("battle-001");
  Array.from({ length: 7 }, () => original.nextUint32());

  const snapshot = original.snapshot();
  const expected = Array.from({ length: 12 }, () => original.nextUint32());
  const restored = SeededRng.fromSnapshot(snapshot);
  const actual = Array.from({ length: 12 }, () => restored.nextUint32());

  assert.equal(snapshot.algorithm, RNG_ALGORITHM);
  assert.deepEqual(actual, expected);
});

test("forks are stable and do not consume the parent stream", () => {
  const parentA = new SeededRng("run-42");
  const parentB = new SeededRng("run-42");

  const battleA = parentA.fork("battle");
  const battleB = parentB.fork("battle");
  const loot = parentA.fork("loot");

  assert.deepEqual(
    Array.from({ length: 10 }, () => battleA.nextUint32()),
    Array.from({ length: 10 }, () => battleB.nextUint32()),
  );
  assert.notDeepEqual(
    Array.from({ length: 5 }, () => parentA.fork("battle-compare").nextUint32()),
    Array.from({ length: 5 }, () => loot.nextUint32()),
  );
  assert.equal(parentA.nextUint32(), parentB.nextUint32());
});

test("nextInt stays inside the requested half-open range", () => {
  const rng = new SeededRng(20261005);
  for (let index = 0; index < 10_000; index += 1) {
    const value = rng.nextInt(-7, 13);
    assert.ok(value >= -7 && value < 13);
  }
});

test("shuffle is deterministic and does not mutate input", () => {
  const input = ["liu-bei", "guan-yu", "zhang-fei", "zhao-yun", "zhuge-liang"];
  const first = new SeededRng("formation").shuffle(input);
  const second = new SeededRng("formation").shuffle(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, ["liu-bei", "guan-yu", "zhang-fei", "zhao-yun", "zhuge-liang"]);
  assert.deepEqual([...first].sort(), [...input].sort());
});

test("chance handles boundaries without consuming randomness", () => {
  const a = new SeededRng("chance");
  const b = new SeededRng("chance");

  assert.equal(a.chance(0), false);
  assert.equal(a.chance(1), true);
  assert.equal(a.nextUint32(), b.nextUint32());
});
