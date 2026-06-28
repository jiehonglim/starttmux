import { test } from 'node:test';
import assert from 'node:assert/strict';

import { goldenPathSteps, nextPathLevel } from '../frontend/js/reference.js';
import { PUZZLES, listPuzzlesByPath } from '../frontend/js/puzzles.js';

test('golden path has 5 unique steps in order 1–5', () => {
  const steps = goldenPathSteps(PUZZLES);
  assert.equal(steps.length, 5);
  assert.deepEqual(
    steps.map((s) => s.pathOrder),
    [1, 2, 3, 4, 5],
  );
  assert.equal(new Set(steps.map((s) => s.levelId)).size, 5);
});

test('listPuzzlesByPath matches golden path level order', () => {
  const ordered = listPuzzlesByPath();
  assert.deepEqual(
    ordered.map((p) => p.id),
    [1, 2, 4, 3, 5],
  );
});

test('nextPathLevel follows golden path not numeric id', () => {
  const afterStep2 = nextPathLevel(PUZZLES, 2);
  assert.ok(afterStep2);
  assert.equal(afterStep2.id, 4);
  assert.equal(afterStep2.pathOrder, 3);

  const afterStep5 = nextPathLevel(PUZZLES, 5);
  assert.equal(afterStep5, null);
});

test('every puzzle has golden path metadata', () => {
  for (const puzzle of PUZZLES) {
    assert.ok(puzzle.pathOrder >= 1 && puzzle.pathOrder <= 5);
    assert.ok(puzzle.pathTitle);
    assert.ok(puzzle.agentTip);
    assert.ok(puzzle.shortcut);
  }
});