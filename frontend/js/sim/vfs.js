/** @typedef {{ type: 'dir', name: string, children: Record<string, Node> }} DirNode */
/** @typedef {{ type: 'file', name: string, content: string }} FileNode */
/** @typedef {DirNode | FileNode} Node */

const ROOT = /** @type {DirNode} */ ({
  type: 'dir',
  name: '/',
  children: {
    home: {
      type: 'dir',
      name: 'home',
      children: {
        you: {
          type: 'dir',
          name: 'you',
          children: {
            startup: {
              type: 'dir',
              name: 'startup',
              children: {
                'package.json': {
                  type: 'file',
                  name: 'package.json',
                  content: '{\n  "name": "startup",\n  "scripts": {\n    "test": "vitest run",\n    "deploy": "./scripts/deploy.sh"\n  }\n}\n',
                },
                src: {
                  type: 'dir',
                  name: 'src',
                  children: {
                    'app.js': {
                      type: 'file',
                      name: 'app.js',
                      content: "export function greet(name) {\n  return `hello ${name}`;\n}\n",
                    },
                  },
                },
                tests: {
                  type: 'dir',
                  name: 'tests',
                  children: {
                    'app.test.js': {
                      type: 'file',
                      name: 'app.test.js',
                      content: "import { greet } from '../src/app.js';\n\ntest('greets', () => expect(greet('tmux')).toBe('hello tmux'));\n",
                    },
                  },
                },
                logs: {
                  type: 'dir',
                  name: 'logs',
                  children: {
                    'deploy.log': {
                      type: 'file',
                      name: 'deploy.log',
                      content: '[deploy] last run: success\n[deploy] rsync complete\n',
                    },
                  },
                },
                scripts: {
                  type: 'dir',
                  name: 'scripts',
                  children: {
                    'deploy.sh': {
                      type: 'file',
                      name: 'deploy.sh',
                      content: '#!/bin/bash\nnpm run build\nrsync -av frontend/ vps:/var/www/app/\n',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export const DEFAULT_CWD = '/home/you/startup';

/** @param {string} cwd */
export function resolvePath(cwd, input) {
  const parts = input.startsWith('/')
    ? input.split('/').filter(Boolean)
    : [...cwd.split('/').filter(Boolean), ...input.split('/').filter(Boolean)];

  const resolved = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return '/' + resolved.join('/');
}

/** @param {string} path */
export function getNode(path) {
  const parts = path.split('/').filter(Boolean);
  let node = /** @type {Node} */ (ROOT);
  for (const part of parts) {
    if (node.type !== 'dir' || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

/** @param {string} cwd @param {string} target */
export function getNodeAt(cwd, target) {
  return getNode(resolvePath(cwd, target));
}

/** @param {DirNode} dir */
function listEntries(dir, long = false) {
  const names = Object.keys(dir.children).sort();
  if (!long) return names.join('  ');
  return names.map((name) => {
    const child = dir.children[name];
    const kind = child.type === 'dir' ? 'd' : '-';
    return `${kind}rwxr-xr-x  you  ${name}`;
  }).join('\n');
}

/** @param {string} cwd @param {string[]} argv */
export function runVfsCommand(cwd, argv) {
  const [cmd, ...args] = argv;
  if (!cmd) return { cwd, lines: [] };

  if (cmd === 'pwd') {
    return { cwd, lines: [cwd] };
  }

  if (cmd === 'clear') {
    return { cwd, lines: [], clear: true };
  }

  if (cmd === 'help') {
    return {
      cwd,
      lines: [
        'Commands: pwd, ls, cd, cat, clear, help',
        'Agents: grok, grok-build, hermes, claude, claude-code',
        'Jobs: npm test, tail -f logs/deploy.log, ./scripts/deploy.sh',
        'Tmux: ⌃ b then % " arrows c n p x z ,',
      ],
    };
  }

  if (cmd === 'ls') {
    const long = args.includes('-la') || args.includes('-l');
    const target = args.find((a) => !a.startsWith('-')) ?? '.';
    const node = getNodeAt(cwd, target);
    if (!node) return { cwd, lines: [`ls: ${target}: No such file or directory`] };
    if (node.type === 'file') return { cwd, lines: [node.name] };
    return { cwd, lines: [listEntries(node, long)] };
  }

  if (cmd === 'cd') {
    const target = args[0] ?? '/home/you';
    const node = getNodeAt(cwd, target);
    if (!node || node.type !== 'dir') {
      return { cwd, lines: [`cd: ${target}: No such file or directory`] };
    }
    return { cwd: resolvePath(cwd, target), lines: [] };
  }

  if (cmd === 'cat') {
    const target = args[0];
    if (!target) return { cwd, lines: ['cat: missing operand'] };
    const node = getNodeAt(cwd, target);
    if (!node || node.type !== 'file') {
      return { cwd, lines: [`cat: ${target}: No such file or directory`] };
    }
    return { cwd, lines: node.content.trimEnd().split('\n') };
  }

  return { cwd, lines: [`${cmd}: command not found (try help)`] };
}