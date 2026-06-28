import { runVfsCommand } from './vfs.js';
import { appendEcho } from './sim-session.js';
import { startCommand, pushLines, submitAgentInput, isAgentAcceptingInput } from './processes.js';
import { agentPromptLabel } from './agents.js';
import { checkEasterEgg, easterEggLines, unlockEasterEgg } from './easter-egg.js';

/** @param {import('./sim-session.js').SimPane} pane @param {string} line */
export function runShellLine(pane, line) {
  const trimmed = line.trim();

  if (isAgentAcceptingInput(pane) && pane.shell.process?.agent) {
    const label = agentPromptLabel(pane.shell.process.agent);
    pane.shell.lines.push(`${label} ${line}`);
    if (pane.shell.lines.length > 200) pane.shell.lines.shift();
    submitAgentInput(pane, line);
    return { easterEgg: false };
  }

  appendEcho(pane, line);

  if (!trimmed) return { easterEgg: false };

  if (checkEasterEgg(trimmed)) {
    pushLines(pane, easterEggLines());
    unlockEasterEgg();
    return { easterEgg: true };
  }

  const started = startCommand(pane, trimmed);
  if (started.started) return { easterEgg: false };

  const argv = trimmed.split(/\s+/);
  const result = runVfsCommand(pane.shell.cwd, argv);
  pane.shell.cwd = result.cwd;
  if (result.clear) {
    pane.shell.lines = [];
    return { easterEgg: false };
  }
  if (result.lines.length) pushLines(pane, result.lines);
  return { easterEgg: false };
}