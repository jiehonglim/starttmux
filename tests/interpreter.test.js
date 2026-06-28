import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createSession, snapshot } from '../frontend/js/state.js';
import { replaySequence, keyFromEvent, isModifierOnly } from '../frontend/js/interpreter.js';
import { PUZZLES, goalSnapshot } from '../frontend/js/puzzles.js';

test('keyFromEvent: Shift alone is ignored', () => {
  assert.equal(isModifierOnly({ key: 'Shift' }), true);
  assert.equal(keyFromEvent({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }), null);
});

test('keyFromEvent: Shift+5 maps to %', () => {
  assert.equal(keyFromEvent({ key: '%', code: 'Digit5', shiftKey: true }), '%');
  assert.equal(keyFromEvent({ key: '5', code: 'Digit5', shiftKey: true }), '%');
  assert.equal(keyFromEvent({ key: '5', code: 'Digit5', shiftKey: false }), '5');
});

for (const puzzle of PUZZLES) {
  test(`puzzle ${puzzle.id}: ${puzzle.title} — accepted solutions reach goal`, () => {
    for (const solution of puzzle.acceptedSolutions) {
      const session = createSession(puzzle.start);
      replaySequence(session, solution);
      const got = snapshot(session);
      const want = goalSnapshot(puzzle);
      assert.deepEqual(got, want, `solution ${solution.join(' ')}`);
    }
  });
}

test('split vertical creates two panes', () => {
  const puzzle = PUZZLES[0];
  const session = createSession(puzzle.start);
  replaySequence(session, ['prefix', '%']);
  assert.equal(session.windows[0].panes.length, 2);
});