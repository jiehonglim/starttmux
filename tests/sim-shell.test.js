import { test } from 'node:test';
import assert from 'node:assert/strict';

import { runVfsCommand, resolvePath, DEFAULT_CWD } from '../frontend/js/sim/vfs.js';
import { createSimSession } from '../frontend/js/sim/sim-session.js';
import { runShellLine } from '../frontend/js/sim/shell.js';
import { checkEasterEgg } from '../frontend/js/sim/easter-egg.js';

test('resolvePath handles relative cd', () => {
  assert.equal(resolvePath(DEFAULT_CWD, 'src'), '/home/you/startup/src');
  assert.equal(resolvePath(DEFAULT_CWD, '..'), '/home/you');
});

test('runVfsCommand: ls and cat', () => {
  const ls = runVfsCommand(DEFAULT_CWD, ['ls']);
  assert.match(ls.lines[0], /package\.json/);

  const cat = runVfsCommand(DEFAULT_CWD, ['cat', 'package.json']);
  assert.match(cat.lines.join('\n'), /"name": "startup"/);
});

test('runVfsCommand: cd and pwd', () => {
  const cd = runVfsCommand(DEFAULT_CWD, ['cd', 'src']);
  assert.equal(cd.cwd, '/home/you/startup/src');
  const pwd = runVfsCommand(cd.cwd, ['pwd']);
  assert.equal(pwd.lines[0], '/home/you/startup/src');
});

test('runShellLine: unknown command hints help', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  runShellLine(pane, 'wat');
  assert.match(pane.shell.lines.at(-1), /command not found/);
});

test('runShellLine: npm test prints vitest output', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  runShellLine(pane, 'npm test');
  assert.ok(pane.shell.lines.some((l) => l.includes('passed')));
});

test('easter egg trigger', () => {
  assert.equal(checkEasterEgg('cow say tmux'), true);
  assert.equal(checkEasterEgg('cowsay tmux'), true);
  assert.equal(checkEasterEgg('ls'), false);
});