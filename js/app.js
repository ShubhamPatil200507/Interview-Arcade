/**
 * Interview Arcade — Main Application Bootstrap
 * Connects router, services, sound effects, and accessible announcer.
 */

import { router } from './router.js';
import { audio } from './services/audio.js';
import { api } from './services/api-client.js';
import { createHomeView } from './views/home.js';
import { createDashboardView } from './views/dashboard.js';
import { createFeedbackView } from './views/feedback.js';
import { createAboutView } from './views/about.js';

// Mini-Game View Controllers
import { createTicTacToeView } from './games/tictactoe.js';
import { createMemoryView } from './games/memory.js';
import { createAptitudeView } from './games/aptitude.js';
import { createSQLView } from './games/sql-blanks.js';
import { createVisualRiddlesView } from './games/visual-riddles.js';
import { createDSAMatchView } from './games/dsa-match.js';
import { createDebuggerView } from './games/debugger.js';
import { createInterviewView } from './games/interview-sim.js';
import { createAssessmentView } from './games/assessment.js';
import { createMistakesView } from './views/mistakes.js';

async function initApp() {
  setupSoundToggle();
  setupMobileDrawer();
  await setupAuthUI();
  registerRoutes();
  router.init('app-view');
}

function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const closeBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      audio.click();
    });
  }

  function closeDrawer() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

async function setupAuthUI() {
  const container = document.getElementById('auth-status-container');
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('auth-modal-btn');
  const closeBtn = document.getElementById('close-auth-modal-btn');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabReg = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginErr = document.getElementById('login-error-msg');
  const regErr = document.getElementById('reg-error-msg');

  // Try fetching current user from backend
  const user = await api.getCurrentUser();
  updateAuthHeader(user);

  function updateAuthHeader(currentUser) {
    if (!container) return;
    if (currentUser) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <span class="badge badge-accent" title="Current Level & Track">
            Lvl ${currentUser.level} • ${currentUser.target_role.toUpperCase()}
          </span>
          <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-ink);">
            ${currentUser.username} (${currentUser.xp} XP)
          </span>
          <button id="logout-btn" type="button" class="btn btn-sm btn-subtle" style="padding: 2px 6px; font-size: 0.75rem;">
            Logout
          </button>
        </div>
      `;
      const logoutBtn = container.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await api.logout();
          audio.click();
          updateAuthHeader(null);
          showToast('Logged out of server sync. Practicing in local storage mode.');
        });
      }
    } else {
      container.innerHTML = `
        <button id="auth-modal-btn" type="button" class="btn btn-sm btn-subtle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Sign In / Track</span>
        </button>
      `;
      const btn = container.querySelector('#auth-modal-btn');
      if (btn) btn.addEventListener('click', () => openModal());
    }
  }

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      audio.click();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (tabLogin && tabReg && loginForm && regForm) {
    tabLogin.addEventListener('click', () => {
      tabLogin.className = 'btn btn-sm btn-primary';
      tabReg.className = 'btn btn-sm btn-subtle';
      loginForm.style.display = 'flex';
      regForm.style.display = 'none';
      if (loginErr) loginErr.style.display = 'none';
    });

    tabReg.addEventListener('click', () => {
      tabReg.className = 'btn btn-sm btn-primary';
      tabLogin.className = 'btn btn-sm btn-subtle';
      loginForm.style.display = 'none';
      regForm.style.display = 'flex';
      if (regErr) regErr.style.display = 'none';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const loginId = (document.getElementById('login-email').value || '').trim();
      const pwd = document.getElementById('login-password').value || '';
      if (loginErr) loginErr.style.display = 'none';
      try {
        const res = await api.login(loginId, pwd);
        audio.win();
        closeModal();
        updateAuthHeader(res.user);
        showToast(`Welcome back, ${res.user.username}! Progress is synced.`);
      } catch (err) {
        audio.wrong();
        if (loginErr) {
          loginErr.textContent = err.message || 'Login failed. Please check your credentials.';
          loginErr.style.display = 'block';
        }
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (document.getElementById('reg-username').value || '').trim().replace(/\s+/g, '_');
      const email = (document.getElementById('reg-email').value || '').trim().toLowerCase();
      const pwd = document.getElementById('reg-password').value || '';
      const role = document.getElementById('reg-role').value;
      if (regErr) regErr.style.display = 'none';
      try {
        const res = await api.register(username, email, pwd, role);
        audio.win();
        closeModal();
        updateAuthHeader(res.user);
        showToast(`Account created for ${res.user.username}! Target track: ${role}.`);
      } catch (err) {
        audio.wrong();
        if (regErr) {
          regErr.textContent = err.message || 'Account creation failed.';
          regErr.style.display = 'block';
        }
      }
    });
  }
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
  router.register('/assessment', createAssessmentView);
  router.register('/interview', createInterviewView);
  router.register('/mistakes', createMistakesView);
  router.register('/dashboard', createDashboardView);
  router.register('/feedback', createFeedbackView);
  router.register('/about', createAboutView);

  // Dedicated Game Routes
  router.register('/game/tictactoe', createTicTacToeView);
  router.register('/game/memory', createMemoryView);
  router.register('/game/aptitude', createAptitudeView);
  router.register('/game/sql', createSQLView);
  router.register('/game/riddles', createVisualRiddlesView);
  router.register('/game/dsa', createDSAMatchView);
  router.register('/game/debugger', createDebuggerView);
  router.register('/game/interview', createInterviewView);
  router.register('/game/assessment', createAssessmentView);
  router.register('/game/mistakes', createMistakesView);
  router.register('/game/feedback', createFeedbackView);
  router.register('/game/dashboard', createDashboardView);

  // Dynamic Parameterized Fallback for /game/:id
  router.register('/game/:id', (params, container) => {
    const id = params.id;
    switch (id) {
      case 'tictactoe': return createTicTacToeView(params, container);
      case 'memory': return createMemoryView(params, container);
      case 'aptitude': return createAptitudeView(params, container);
      case 'sql': return createSQLView(params, container);
      case 'riddles': return createVisualRiddlesView(params, container);
      case 'dsa': return createDSAMatchView(params, container);
      case 'debugger': return createDebuggerView(params, container);
      case 'interview': return createInterviewView(params, container);
      case 'assessment': return createAssessmentView(params, container);
      case 'mistakes': return createMistakesView(params, container);
      case 'feedback': return createFeedbackView(params, container);
      case 'dashboard': return createDashboardView(params, container);
      default:
        container.innerHTML = `
          <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
            <h2>Challenge Not Found</h2>
            <p style="color: var(--color-ink-muted); margin: var(--space-xs) 0 var(--space-md);">The requested problem or challenge "${id}" is not available.</p>
            <a href="#/" class="btn btn-primary">Browse Practice Problems</a>
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
