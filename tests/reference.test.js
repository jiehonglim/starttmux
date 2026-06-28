import { test } from 'node:test';
import assert from 'node:assert/strict';

import { goldenPathSteps, levelUpSteps, nextPathLevel, nextPlayableLevel } from '../frontend/js/reference.js';
import { winNavigation } from '../frontend/js/renderer.js';
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

test('level up has 5 unique steps in order 1–5', () => {
  const steps = levelUpSteps(PUZZLES);
  assert.equal(steps.length, 5);
  assert.deepEqual(steps.map((s) => s.levelId), [6, 7, 8, 9, 10]);
});

test('listPuzzlesByPath matches golden path level order', () => {
  const ordered = listPuzzlesByPath();
  assert.deepEqual(
    ordered.map((p) => p.id),
    [1, 2, 4, 3, 5],
  );
});

test('listPuzzlesByPath levelup track', () => {
  const ordered = listPuzzlesByPath(PUZZLES, 'levelup');
  assert.deepEqual(ordered.map((p) => p.id), [6, 7, 8, 9, 10]);
});

test('nextPathLevel follows golden path not numeric id', () => {
  const afterStep2 = nextPathLevel(PUZZLES, 2);
  assert.ok(afterStep2);
  assert.equal(afterStep2.id, 4);
  assert.equal(afterStep2.pathOrder, 3);

  const afterStep5 = nextPathLevel(PUZZLES, 5);
  assert.equal(afterStep5, null);
});

test('nextPlayableLevel bridges golden path to level up', () => {
  const afterGolden = nextPlayableLevel(PUZZLES, 5);
  assert.ok(afterGolden);
  assert.equal(afterGolden.id, 6);
});

test('winNavigation follows golden path order', () => {
  const step2 = winNavigation(PUZZLES.find((p) => p.id === 2));
  assert.ok(step2.next);
  assert.equal(step2.next.id, 4);
  assert.equal(step2.nextHref, 'play.html?level=4&mode=desktop');

  const step5 = winNavigation(PUZZLES.find((p) => p.id === 5));
  assert.equal(step5.next.id, 6);
  assert.equal(step5.nextHref, 'play.html?level=6&mode=desktop');

  const step10 = winNavigation(PUZZLES.find((p) => p.id === 10));
  assert.equal(step10.nextHref, 'simulator.html');
  assert.equal(step10.nextLabel, 'Open simulator');
});

test('every puzzle has path metadata', () => {
  for (const puzzle of PUZZLES) {
    assert.ok(puzzle.pathOrder >= 1 && puzzle.pathOrder <= 5);
    assert.ok(puzzle.pathTitle);
    assert.ok(puzzle.agentTip);
    assert.ok(puzzle.shortcut);
    assert.ok(puzzle.track);
  }
});