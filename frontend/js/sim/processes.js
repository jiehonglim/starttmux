import { agentBanner, agentTickLine, matchAgentCommand } from './agents.js';

/** @typedef {{
 *   kind: 'agent' | 'test' | 'tail' | 'deploy',
 *   agent?: import('./agents.js').AgentKind,
 *   tick: number,
 *   startedAt: number,
 * }} SimProcess */

const MAX_LINES = 200;

/** @param {import('./sim-session.js').SimPane} pane */
export function pushLine(pane, line) {
  pane.shell.lines.push(line);
  if (pane.shell.lines.length > MAX_LINES) {
    pane.shell.lines.splice(0, pane.shell.lines.length - MAX_LINES);
  }
}

/** @param {import('./sim-session.js').SimPane} pane @param {string[]} lines */
export function pushLines(pane, lines) {
  for (const line of lines) pushLine(pane, line);
}

/** @param {import('./sim-session.js').SimPane} pane */
export function killProcess(pane) {
  if (!pane.shell.process) return false;
  pushLine(pane, '^C');
  pushLine(pane, '[stopped]');
  pane.shell.process = null;
  return true;
}

/** @param {import('./sim-session.js').SimPane} pane @param {SimProcess} proc */
function startProcess(pane, proc) {
  pane.shell.process = proc;
}

/** @param {import('./sim-session.js').SimPane} pane @param {string} cmdLine */
export function startCommand(pane, cmdLine) {
  const trimmed = cmdLine.trim();
  if (!trimmed) return { started: false };

  const agent = matchAgentCommand(trimmed);
  if (agent) {
    startProcess(pane, { kind: 'agent', agent, tick: 0, startedAt: Date.now() });
    pushLines(pane, agentBanner(agent));
    return { started: true };
  }

  if (trimmed === 'npm test' || trimmed === 'npm run test') {
    startProcess(pane, { kind: 'test', tick: 0, startedAt: Date.now() });
    pushLines(pane, [
      '> startup@ test',
      '> vitest run',
      '',
      ' RUN  tests/app.test.js',
      ' ✓ greets',
      '',
      ' Tests  1 passed (1)',
    ]);
    pane.shell.process = null;
    return { started: true };
  }

  if (trimmed.startsWith('tail -f')) {
    startProcess(pane, { kind: 'tail', tick: 0, startedAt: Date.now() });
    pushLine(pane, `following ${trimmed.split(' ').slice(2).join(' ') || 'logs/deploy.log'}…`);
    return { started: true };
  }

  if (trimmed === './scripts/deploy.sh' || trimmed === 'npm run deploy') {
    startProcess(pane, { kind: 'deploy', tick: 0, startedAt: Date.now() });
    pushLine(pane, '[deploy] building…');
    return { started: true };
  }

  return { started: false };
}

/** @param {import('./sim-session.js').SimPane} pane */
export function tickProcess(pane) {
  const proc = pane.shell.process;
  if (!proc) return;

  proc.tick += 1;

  if (proc.kind === 'agent' && proc.agent) {
    if (proc.tick % 3 === 0) pushLine(pane, agentTickLine(proc.agent, proc.tick));
    if (proc.tick > 24) pushLine(pane, '… agent idle (still running)');
  }

  if (proc.kind === 'tail' && proc.tick % 2 === 0) {
    const ts = new Date().toISOString().slice(11, 19);
    pushLine(pane, `[${ts}] deploy: heartbeat ok`);
  }

  if (proc.kind === 'deploy') {
    if (proc.tick === 2) pushLine(pane, '[deploy] rsync frontend/ → vps');
    if (proc.tick === 4) {
      pushLine(pane, '[deploy] done ✓');
      pane.shell.process = null;
    }
  }
}

/** @param {import('./sim-session.js').SimSession} session */
export function countRunningAgents(session) {
  const kinds = new Set();
  for (const win of session.windows) {
    for (const pane of win.panes) {
      const proc = pane.shell.process;
      if (proc?.kind === 'agent' && proc.agent) kinds.add(proc.agent);
    }
  }
  return kinds;
}