import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createSession, snapshot } from '../frontend/js/state.js';
import { replaySequence } from '../frontend/js/interpreter.js';
import { PUZZLES, goalSnapshot } from '../frontend/js/puzzles.js';

for (const puzzle of PUZZLES) {
  test(`mobile steps puzzle ${puzzle.id}: ${puzzle.title}`, () => {
    assert.ok(puzzle.mobile?.steps?.length, 'mobile config required');
    const session = createSession(puzzle.start);
    const renameName = puzzle.goal.windows[puzzle.goal.activeWindow ?? 0]?.name;
    replaySequence(session, puzzle.mobile.steps, { renameName });
    assert.deepEqual(snapshot(session), goalSnapshot(puzzle));
  });
}