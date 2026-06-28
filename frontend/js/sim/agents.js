/** @typedef {'grok' | 'hermes' | 'claude'} AgentKind */

/** @param {AgentKind} kind */
export function agentBanner(kind) {
  if (kind === 'grok') {
    return [
      '┌─ Grok Build ─────────────────────┐',
      '│  coding agent · simulator        │',
      '└──────────────────────────────────┘',
    ];
  }
  if (kind === 'hermes') {
    return [
      '┌─ Hermes ─────────────────────────┐',
      '│  task runner · simulator         │',
      '└──────────────────────────────────┘',
    ];
  }
  return [
    '┌─ Claude Code ────────────────────┐',
    '│  planning + edits · simulator    │',
    '└──────────────────────────────────┘',
  ];
}

/** @param {AgentKind} kind */
export function agentBootLines(kind) {
  if (kind === 'grok') {
    return [
      '→ indexing workspace',
      '→ loading tools',
      '→ ready',
    ];
  }
  if (kind === 'hermes') {
    return [
      'hermes: loading workspace',
      'hermes: fetching context',
      'hermes: ready',
    ];
  }
  return [
    'Scanning project layout',
    'Loading edit tools',
    'Ready',
  ];
}

/** @param {AgentKind} kind */
export function agentReadyLine(kind) {
  const name = kind === 'grok' ? 'grok' : kind === 'hermes' ? 'hermes' : 'claude';
  return `› ${name} accepting input — ⌃b to switch panes`;
}

/** @param {AgentKind} kind */
export function agentPromptLabel(kind) {
  if (kind === 'grok') return 'grok ›';
  if (kind === 'hermes') return 'hermes ›';
  return 'claude ›';
}

/** @param {AgentKind} kind @param {string} line */
export function agentInputResponse(kind, line) {
  const trimmed = line.trim();
  if (!trimmed) return [`${agentPromptLabel(kind)} (empty — type a task)`];

  if (kind === 'hermes') {
    return [
      `hermes: received — "${trimmed}"`,
      'hermes: queued job #43',
      'hermes: working… (⌃b away anytime)',
    ];
  }
  if (kind === 'grok') {
    return [
      `→ Task: ${trimmed}`,
      '→ Planning edits…',
      '… still running — ⌃b to check other panes',
    ];
  }
  return [
    `Task: ${trimmed}`,
    'Reading relevant files…',
    '… still running — ⌃b to check other panes',
  ];
}

/** @param {AgentKind} kind */
export function agentAlreadyRunningLine(kind) {
  const name = kind === 'grok' ? 'grok-build' : kind === 'hermes' ? 'hermes' : 'claude-code';
  return `${name}: already running — Ctrl+C to stop · ⌃b to switch panes`;
}

/** @param {string} cmd */
export function matchAgentCommand(cmd) {
  const lower = cmd.toLowerCase();
  if (lower === 'grok' || lower === 'grok-build') return 'grok';
  if (lower === 'hermes') return 'hermes';
  if (lower === 'claude' || lower === 'claude-code') return 'claude';
  return null;
}