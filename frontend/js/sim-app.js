import { createSimSession } from './sim/sim-session.js';
import { attachSimInput } from './sim/sim-input.js';
import { attachSimTouch } from './sim/sim-touch.js';
import { tickProcess, countRunningAgents } from './sim/processes.js';
import { isEasterEggUnlocked } from './sim/easter-egg.js';
import { isMobileMode } from './device.js';

function boot() {
  const root = document.querySelector('[data-terminal]');
  const touchPanel = document.querySelector('[data-touch-panel]');
  const scriptDock = document.querySelector('[data-script-dock]');
  const eggBadge = document.querySelector('[data-egg-badge]');
  const mobile = isMobileMode();

  if (!root) return;

  document.body.classList.add(mobile ? 'mode-mobile' : 'mode-desktop');

  const session = createSimSession();
  let tripleShown = false;
  let inputApi = null;
  let touchApi = null;

  function updateEggBadge() {
    if (eggBadge) eggBadge.hidden = !isEasterEggUnlocked();
  }

  function checkTripleAgent() {
    if (tripleShown) return;
    if (countRunningAgents(session).size >= 3) {
      tripleShown = true;
      inputApi?.setTripleShown(true);
      touchApi?.render();
    }
  }

  if (mobile) {
    if (touchPanel) touchPanel.hidden = false;
    touchApi = attachSimTouch({
      root,
      session,
      panel: touchPanel,
      dock: scriptDock,
      onEasterEgg: updateEggBadge,
      onTripleAgent: checkTripleAgent,
    });
  } else {
    if (touchPanel) touchPanel.hidden = true;
    inputApi = attachSimInput({
      root,
      session,
      onEasterEgg: updateEggBadge,
      onTripleAgent: checkTripleAgent,
    });
  }

  updateEggBadge();

  const ticker = window.setInterval(() => {
    let changed = false;
    for (const win of session.windows) {
      for (const pane of win.panes) {
        if (pane.shell.process) {
          tickProcess(pane);
          changed = true;
        }
      }
    }
    if (changed) {
      if (mobile) touchApi?.render();
      else inputApi?.render();
    }
  }, 1500);

  window.addEventListener('beforeunload', () => {
    window.clearInterval(ticker);
    inputApi?.destroy();
    touchApi?.destroy();
  });
}

boot();