import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createSimSession } from '../frontend/js/sim/sim-session.js';
import { startCommand, tickProcess, killProcess, countRunningAgents } from '../frontend/js/sim/processes.js';

test('startCommand: grok agent runs', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'grok-build');
  assert.equal(pane.shell.process?.kind, 'agent');
  assert.equal(pane.shell.process?.agent, 'grok');
});

test('tickProcess: tail appends lines', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'tail -f logs/deploy.log');
  const before = pane.shell.lines.length;
  tickProcess(pane);
  tickProcess(pane);
  assert.ok(pane.shell.lines.length > before);
});

test('killProcess stops foreground job', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'tail -f logs/deploy.log');
  assert.ok(pane.shell.process);
  killProcess(pane);
  assert.equal(pane.shell.process, null);
});

test('countRunningAgents tracks distinct agents', () => {
  const session = createSimSession();
  startCommand(session.windows[0].panes[0], 'grok');
  const pane2 = {
    id: 'p1',
    r: 0,
    c: 50,
    h: 100,
    w: 50,
    focused: false,
    label: 'agent2',
    shell: { cwd: '/', lines: [], input: '', process: null },
  };
  session.windows[0].panes.push(pane2);
  startCommand(pane2, 'hermes');
  assert.equal(countRunningAgents(session).size, 2);
});