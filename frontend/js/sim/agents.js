/** @typedef {'grok' | 'hermes' | 'claude'} AgentKind */

/** @param {AgentKind} kind */
export function agentBanner(kind) {
  if (kind === 'grok') return ['Grok Build · coding agent', 'Type Ctrl+C to stop'];
  if (kind === 'hermes') return ['Hermes agent · task runner', 'Ctrl+C to stop'];
  return ['Claude Code · planning + edits', 'Ctrl+C to stop'];
}

/** @param {AgentKind} kind @param {number} tick */
export function agentTickLine(kind, tick) {
  if (kind === 'grok') {
    const lines = [
      '→ Reading src/app.js',
      '→ Editing tests/app.test.js',
      '→ Running npm test',
      '✓ Applied patch (simulated)',
      '… waiting for your review',
    ];
    return lines[tick % lines.length];
  }
  if (kind === 'hermes') {
    const lines = [
      'hermes: queued job #42',
      'hermes: fetching context',
      'hermes: writing response chunk',
      'hermes: idle',
    ];
    return lines[tick % lines.length];
  }
  const lines = [
    'Planning: split pane layout refactor',
    'Tool: Read package.json',
    'Tool: Write src/app.js',
    'Tests look green — ready for deploy',
  ];
  return lines[tick % lines.length];
}

/** @param {string} cmd */
export function matchAgentCommand(cmd) {
  const lower = cmd.toLowerCase();
  if (lower === 'grok' || lower === 'grok-build') return 'grok';
  if (lower === 'hermes') return 'hermes';
  if (lower === 'claude' || lower === 'claude-code') return 'claude';
  return null;
}