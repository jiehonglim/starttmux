import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createSimSession } from '../frontend/js/sim/sim-session.js';
import {
  startCommand,
  tickProcess,
  killProcess,
  countRunningAgents,
  submitAgentInput,
  isAgentAcceptingInput,
} from '../frontend/js/sim/processes.js';
import { agentReadyLine } from '../frontend/js/sim/agents.js';

test('startCommand: grok agent runs', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'grok-build');
  assert.equal(pane.shell.process?.kind, 'agent');
  assert.equal(pane.shell.process?.agent, 'grok');
  assert.equal(pane.shell.process?.phase, 'ready');
  assert.ok(pane.shell.lines.some((l) => l.includes('Grok Build')));
  assert.ok(pane.shell.lines.some((l) => l.includes('accepting input')));
});

test('startCommand: hermes shows banner and accepts input', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'hermes');
  assert.ok(pane.shell.lines.some((l) => l.includes('Hermes')));
  assert.ok(pane.shell.lines.at(-1)?.includes('accepting input'));
  assert.equal(isAgentAcceptingInput(pane), true);
});

test('startCommand: hermes twice shows already running', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'hermes');
  const linesBefore = pane.shell.lines.length;
  startCommand(pane, 'hermes');
  assert.ok(pane.shell.lines.at(-1)?.includes('already running'));
  assert.equal(pane.shell.lines.length, linesBefore + 1);
});

test('submitAgentInput: hermes acknowledges task', () => {
  const session = createSimSession();
  const pane = session.windows[0].panes[0];
  startCommand(pane, 'hermes');
  submitAgentInput(pane, 'fix the tests');
  assert.ok(pane.shell.lines.some((l) => l.includes('received')));
  assert.ok(pane.shell.lines.some((l) => l.includes(agentReadyLine('hermes')) === false || l.includes('working')));
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