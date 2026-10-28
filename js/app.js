/**
 * Interview Arcade — Main Application Bootstrap
 * Connects router, services, sound effects, and accessible announcer.
 */

import { router } from './router.js';
import { audio } from './services/audio.js';
import { createHomeView } from './views/home.js';
import { createDashboardView } from './views/dashboard.js';
import { createFeedbackView } from './views/feedback.js';
import { createAboutView } from './views/about.js';

// Mini-Game View Controllers
import { createTicTacToeView } from './games/tictactoe.js';
import { createMemoryView } from './games/memory.js';
import { createAptitudeView } from './games/aptitude.js';
import { createResumeView } from './games/resume-matcher.js';
import { createSQLView } from './games/sql-blanks.js';
import { createVisualRiddlesView } from './games/visual-riddles.js';
import { createDSAMatchView } from './games/dsa-match.js';
import { createDebuggerView } from './games/debugger.js';

function initApp() {
  setupSoundToggle();
  registerRoutes();
  router.init('app-view');
}

function setupSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');

  function updateUI() {
    const isMuted = audio.getMuteState();
    if (isMuted) {
      soundBtn.classList.add('muted');
      soundIcon.textContent = '🔇';
      soundLabel.textContent = 'Audio Off';
    } else {
      soundBtn.classList.remove('muted');
      soundIcon.textContent = '🔊';
      soundLabel.textContent = 'Audio On';
    }
  }

  if (soundBtn) {
    updateUI();
    soundBtn.addEventListener('click', () => {
      audio.toggleMute();
      updateUI();
      if (!audio.getMuteState()) {
        audio.click();
      }
    });
  }
}

function registerRoutes() {
  // Hub & Overview
  router.register('/', createHomeView);
  router.register('/arcade', createHomeView);
  router.register('/dashboard', createDashboardView);
  router.register('/resume', createResumeView);
  router.register('/feedback', createFeedbackView);
  router.register('/about', createAboutView);

  // Dedicated Game Routes
  router.register('/game/tictactoe', createTicTacToeView);
  router.register('/game/memory', createMemoryView);
  router.register('/game/aptitude', createAptitudeView);
  router.register('/game/resume', createResumeView);
  router.register('/game/sql', createSQLView);
  router.register('/game/riddles', createVisualRiddlesView);
  router.register('/game/dsa', createDSAMatchView);
  router.register('/game/debugger', createDebuggerView);
  router.register('/game/feedback', createFeedbackView);
  router.register('/game/dashboard', createDashboardView);

  // Dynamic Parameterized Fallback for /game/:id
  router.register('/game/:id', (params, container) => {
    const id = params.id;
    switch (id) {
      case 'tictactoe': return createTicTacToeView(params, container);
      case 'memory': return createMemoryView(params, container);
      case 'aptitude': return createAptitudeView(params, container);
      case 'resume': return createResumeView(params, container);
      case 'sql': return createSQLView(params, container);
      case 'riddles': return createVisualRiddlesView(params, container);
      case 'dsa': return createDSAMatchView(params, container);
      case 'debugger': return createDebuggerView(params, container);
      case 'feedback': return createFeedbackView(params, container);
      case 'dashboard': return createDashboardView(params, container);
      default:
        container.innerHTML = `
          <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
            <h2>Unknown Arcade Chamber: "${id}"</h2>
            <p>Please select a valid game from the hub.</p>
            <a href="#/" class="btn btn-primary" style="margin-top: var(--space-md);">Return to Arcade Hub</a>
          </div>
        `;
        return { destroy: () => {} };
    }
  });
}

// Global Accessible Toast Notification
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('app-toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
