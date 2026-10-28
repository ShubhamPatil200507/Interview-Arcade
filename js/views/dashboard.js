/**
 * Interview Arcade — Game 10: Progress Dashboard & Learning Roadmap
 * Real-time analytics, honest accuracy metrics, Bayesian skill mastery,
 * role-targeted structured roadmaps, and verified achievements.
 */

import { progress, ACHIEVEMENT_DEFINITIONS } from '../services/progress.js';
import { storage } from '../services/storage.js';
import { audio } from '../services/audio.js';
import { api } from '../services/api-client.js';
import { mistakes } from '../services/mistakes.js';

export function createDashboardView(params, container) {
  let serverLearningPath = null;
  let serverRecommendation = null;
  let currentUser = null;

  async function init() {
    renderLoading();
    try {
      if (api.token) {
        currentUser = await api.getCurrentUser().catch(() => null);
        serverLearningPath = await api.getLearningPath().catch(() => null);
        serverRecommendation = await api.getRecommendation().catch(() => null);
      }
    } catch (e) {
      console.warn('Dashboard running in local-only mode:', e);
    }
    render();
    bindEvents();
  }

  function renderLoading() {
    container.innerHTML = `
      <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
        <div class="loading-spinner" aria-label="Loading student records...">🕹️</div>
        <p style="margin-top: var(--space-sm);">Compiling arcade metrics and Bayesian mastery...</p>
      </div>
    `;
  }

  function render() {
    const metrics = progress.getMetrics();
    const unlockedAchievements = new Set(progress.getUnlockedAchievements());
    const mistakeStats = mistakes.getStats();
    const hasData = metrics.totalSessions > 0 || (currentUser && currentUser.xp > 0);

    const activeRole = currentUser?.target_role || localStorage.getItem('arcade_target_role') || 'backend';

    container.innerHTML = `
      <div class="content-container">
        <!-- Dashboard Header -->
        <div class="game-header-bar" style="margin-bottom: var(--space-md);">
          <div class="game-title-group">
            <span class="badge badge-accent">Chamber 10</span>
            <h2>Arcade Progress & Placement Roadmap</h2>
          </div>
          <div class="game-controls-bar">
            ${hasData ? `
              <button type="button" id="export-data-btn" class="btn btn-sm btn-subtle">Export Data (JSON)</button>
              <button type="button" id="reset-progress-btn" class="btn btn-sm btn-danger">Reset Progress</button>
            ` : ''}
          </div>
        </div>

        <!-- Profile & Track Switcher Banner -->
        <div class="card" style="margin-bottom: var(--space-lg); padding: var(--space-md) var(--space-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
          <div>
            <div style="display: flex; gap: var(--space-xs); align-items: center; margin-bottom: 4px;">
              <span class="badge badge-primary">
                ${currentUser ? `Student: ${currentUser.username}` : 'Local Guest Profile'}
              </span>
              <span class="badge badge-accent">
                ${currentUser ? `Level ${currentUser.level} (${currentUser.xp} XP)` : 'Client Mode'}
              </span>
            </div>
            <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
              Target Track: <strong>${activeRole.toUpperCase()}</strong>
              ${currentUser ? ' • Cloud Synced (FastAPI + SQLite)' : ' • Local Storage (Sign in to sync across devices)'}
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-xs);">
            <label for="track-select" style="font-size: var(--font-size-xs); font-weight: bold;">Change Track:</label>
            <select id="track-select" class="feedback-input" style="padding: 4px 8px; font-size: var(--font-size-xs); background: var(--color-surface);">
              <option value="backend" ${activeRole === 'backend' ? 'selected' : ''}>Core Backend (OOP, SQL, DSA)</option>
              <option value="systems" ${activeRole === 'systems' ? 'selected' : ''}>Systems & C++ (Memory, DSA)</option>
              <option value="fullstack" ${activeRole === 'fullstack' ? 'selected' : ''}>Full Stack (Web, SQL, OOP)</option>
              <option value="data" ${activeRole === 'data' ? 'selected' : ''}>Data Engineering (SQL, DSA)</option>
            </select>
          </div>
        </div>

        <!-- Personalized Recommendation Banner -->
        ${renderRecommendationBanner(serverRecommendation, activeRole)}

        ${!hasData ? renderEmptyState() : renderDashboardContent(metrics, unlockedAchievements, mistakeStats)}
      </div>
    `;
  }

  function renderRecommendationBanner(rec, activeRole) {
    if (!rec) {
      return `
        <div style="background: rgba(224, 86, 38, 0.08); border: 2px solid var(--color-ink); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
          <div>
            <div style="display: flex; gap: var(--space-xs); align-items: center; margin-bottom: 4px;">
              <span class="badge badge-accent">Recommended Action</span>
              <strong>Calibrate Your Skills</strong>
            </div>
            <p style="font-size: var(--font-size-sm); margin: 0; color: var(--color-ink);">
              Take the 3-minute Diagnostic Assessment to establish baseline mastery across OOP, SQL, DSA, and Systems.
            </p>
          </div>
          <a href="#/assessment" class="btn btn-primary btn-sm">Take Diagnostic Test ➔</a>
        </div>
      `;
    }

    return `
      <div style="background: rgba(224, 86, 38, 0.08); border: 2px solid var(--color-ink); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
        <div>
          <div style="display: flex; gap: var(--space-xs); align-items: center; margin-bottom: 4px;">
            <span class="badge badge-accent">Priority Recommendation</span>
            <strong>${rec.game_title} (${rec.recommended_difficulty.toUpperCase()})</strong>
          </div>
          <p style="font-size: var(--font-size-sm); margin: 0; color: var(--color-ink);">
            ${rec.reason}
          </p>
        </div>
        <a href="#/game/${rec.top_priority_game}" class="btn btn-primary btn-sm">Practice This Chamber ➔</a>
      </div>
    `;
  }

  function renderEmptyState() {
    return `
      <div class="card text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center; max-width: 680px; margin: 0 auto;">
        <span style="font-size: 3.5rem;">🪙</span>
        <h2 style="margin: var(--space-sm) 0;">No Arcade Practice Sessions Yet</h2>
        <p style="margin-bottom: var(--space-lg); color: var(--color-ink-muted);">
          Your progress dashboard calculates genuine accuracy, personal bests, and milestone badges purely from your actual gameplay. Jump into any chamber to record your first session!
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
          <a href="#/assessment" class="btn btn-primary">Take Initial Assessment</a>
          <a href="#/game/tictactoe" class="btn btn-subtle">Play Tic Tac Toe + OOP</a>
          <a href="#/" class="btn btn-subtle">Explore Game Library</a>
        </div>
      </div>
    `;
  }

  function renderDashboardContent(metrics, unlockedAchievements, mistakeStats) {
    const formattedTime = formatDuration(metrics.totalTimeSeconds);

    return `
      <!-- Top Metrics Tiles -->
      <div class="grid-cards" style="grid-template-columns: repeat(4, 1fr); margin-bottom: var(--space-lg);">
        <div class="stat-tile">
          <span class="stat-label">Total Sessions</span>
          <span class="stat-value" style="color: var(--color-accent);">${metrics.totalSessions}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Overall Accuracy</span>
          <span class="stat-value" style="color: var(--color-success);">${metrics.overallAccuracy}%</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Questions Solved</span>
          <span class="stat-value">${metrics.totalQuestionsAnswered}</span>
        </div>
        <div class="stat-tile">
          <span class="stat-label">Time Practicing</span>
          <span class="stat-value" style="font-size: var(--font-size-lg);">${formattedTime}</span>
        </div>
      </div>

      <!-- Bayesian Skill Mastery Breakdown -->
      ${renderMasterySection()}

      <!-- Structured Learning Path Steps -->
      ${renderRoadmapSteps()}

      <!-- Mistakes Notebook Quick Access Banner -->
      <div class="card" style="margin-bottom: var(--space-2xl); padding: var(--space-md) var(--space-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); background: var(--color-surface); border: 2px solid var(--color-ink);">
        <div>
          <h4 style="margin: 0 0 4px;">📖 Mistakes & Error Notebook</h4>
          <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
            ${mistakeStats.pendingCount > 0 ? `${mistakeStats.pendingCount} mistakes need review across your arcade sessions.` : 'All recorded mistakes currently mastered or none logged yet.'}
          </p>
        </div>
        <div style="display: flex; gap: var(--space-xs); align-items: center;">
          <span class="badge ${mistakeStats.pendingCount > 0 ? 'badge-primary' : 'badge-accent'}">
            ${mistakeStats.pendingCount} Pending / ${mistakeStats.total} Logged
          </span>
          <a href="#/mistakes" class="btn btn-sm btn-primary">Open Notebook ➔</a>
        </div>
      </div>

      <!-- Per-Game Performance Breakdown -->
      <div style="margin-bottom: var(--space-2xl);">
        <h3 style="margin-bottom: var(--space-sm);">Per-Game Performance</h3>
        <div class="activity-table-wrap">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Game Module</th>
                <th>Sessions Played</th>
                <th>Personal Best</th>
                <th>Accuracy</th>
                <th>Last Played</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(metrics.gameStats).map(gameId => {
                const g = metrics.gameStats[gameId];
                const gameAccuracy = g.totalQuestions > 0 ? Math.round((g.totalCorrect / g.totalQuestions) * 100) : 'N/A';
                return `
                  <tr>
                    <td><strong>${g.gameTitle}</strong></td>
                    <td>${g.sessionsCount}</td>
                    <td><span class="badge badge-accent">${g.bestScore} pts</span></td>
                    <td>${gameAccuracy !== 'N/A' ? `${gameAccuracy}%` : 'N/A'}</td>
                    <td>${new Date(g.lastPlayed).toLocaleDateString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Real Unlocked Achievements -->
      <div style="margin-bottom: var(--space-2xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
          <h3>Milestone Achievements</h3>
          <span class="badge badge-accent">
            ${unlockedAchievements.size} of ${ACHIEVEMENT_DEFINITIONS.length} Unlocked
          </span>
        </div>
        <div class="achievements-grid">
          ${ACHIEVEMENT_DEFINITIONS.map(ach => {
            const isUnlocked = unlockedAchievements.has(ach.id);
            return `
              <div class="achievement-card ${isUnlocked ? '' : 'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div>
                  <h4 style="font-size: var(--font-size-sm); margin-bottom: 2px;">
                    ${ach.title} ${isUnlocked ? '✓' : '🔒'}
                  </h4>
                  <p style="font-size: var(--font-size-xs); margin: 0; color: var(--color-ink-muted);">
                    ${ach.description}
                  </p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Recent Sessions Activity Table -->
      <div>
        <h3 style="margin-bottom: var(--space-sm);">Recent Practice Sessions</h3>
        <div class="activity-table-wrap">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Game</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Correct / Answered</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.recentSessions.map(s => `
                <tr>
                  <td>${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><strong>${s.gameTitle}</strong></td>
                  <td>
                    <span class="badge ${s.difficulty === 'hard' ? 'badge-hard' : s.difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
                      ${s.difficulty.toUpperCase()}
                    </span>
                  </td>
                  <td><span class="badge badge-accent">${s.score} pts</span></td>
                  <td>${s.correctAnswers} / ${s.questionsAnswered}</td>
                  <td>${s.durationSeconds}s</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderMasterySection() {
    const items = serverLearningPath?.mastery_breakdown || [
      { skill_id: 'oop', skill_name: 'Object-Oriented Programming', mastery_percent: 0, evidence_level: 'Local Mode' },
      { skill_id: 'sql', skill_name: 'Relational Databases & SQL', mastery_percent: 0, evidence_level: 'Local Mode' },
      { skill_id: 'dsa', skill_name: 'Data Structures & Big-O', mastery_percent: 0, evidence_level: 'Local Mode' },
      { skill_id: 'systems', skill_name: 'Systems & Memory Safety', mastery_percent: 0, evidence_level: 'Local Mode' },
      { skill_id: 'aptitude', skill_name: 'Quantitative Aptitude', mastery_percent: 0, evidence_level: 'Local Mode' }
    ];

    return `
      <div style="margin-bottom: var(--space-2xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
          <h3>Evidence-Weighted Skill Mastery</h3>
          <span style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">
            Formula: min(100, Accuracy × min(1.0, Questions / 5))
          </span>
        </div>
        <div class="grid-cards" style="grid-template-columns: repeat(5, 1fr); gap: var(--space-sm);">
          ${items.map(m => `
            <div class="card" style="padding: var(--space-sm); text-align: center;">
              <span style="font-size: var(--font-size-xs); font-weight: bold; display: block; margin-bottom: 4px;">
                ${m.skill_name.split(' ')[0]}
              </span>
              <div style="font-size: 1.5rem; font-weight: 900; color: ${m.mastery_percent >= 70 ? 'var(--color-success)' : m.mastery_percent > 0 ? 'var(--color-accent)' : 'var(--color-ink-muted)'};">
                ${m.mastery_percent}%
              </div>
              <div style="width: 100%; height: 6px; background: var(--color-canvas); border-radius: 3px; overflow: hidden; margin: 6px 0;">
                <div style="height: 100%; width: ${m.mastery_percent}%; background: var(--color-accent);"></div>
              </div>
              <span style="font-size: 0.65rem; color: var(--color-ink-muted);">
                ${m.evidence_level}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderRoadmapSteps() {
    const steps = serverLearningPath?.steps || [
      { step_number: 1, title: 'Tic Tac Toe + OOP Quiz', target_skill: 'oop', recommended_difficulty: 'easy', status: 'in_progress', reason: 'Master dynamic dispatch and encapsulation' },
      { step_number: 2, title: 'SQL Fill in the Blanks', target_skill: 'sql', recommended_difficulty: 'medium', status: 'todo', reason: 'Practice aggregate filtering and JOINs' },
      { step_number: 3, title: 'DSA Match the Following', target_skill: 'dsa', recommended_difficulty: 'medium', status: 'todo', reason: 'Solidify Big-O complexity intuition' },
      { step_number: 4, title: 'Debug the Code (C++)', target_skill: 'systems', recommended_difficulty: 'medium', status: 'todo', reason: 'Identify dangling pointers and buffer overruns' },
      { step_number: 5, title: 'Placement Interview Simulator', target_skill: 'general', recommended_difficulty: 'hard', status: 'todo', reason: 'Capstone simulation with STAR behavioral rounds' }
    ];

    return `
      <div style="margin-bottom: var(--space-2xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
          <h3>Target Track Roadmap Steps</h3>
          <span class="badge badge-accent">${serverLearningPath?.target_role_title || 'Core Backend Track'}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
          ${steps.map(s => `
            <div class="card" style="padding: var(--space-sm) var(--space-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
              <div style="display: flex; gap: var(--space-sm); align-items: center;">
                <span class="badge badge-primary">Step ${s.step_number}</span>
                <div>
                  <strong>${s.title}</strong>
                  <div style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">${s.reason}</div>
                </div>
              </div>
              <div style="display: flex; gap: var(--space-xs); align-items: center;">
                <span class="badge ${s.status === 'completed' ? 'badge-accent' : s.status === 'in_progress' ? 'badge-primary' : 'badge-subtle'}">
                  ${s.status === 'completed' ? '✓ Completed' : s.status === 'in_progress' ? '⚡ In Progress' : '🔒 Planned'}
                </span>
                <a href="#/game/${s.game_id || 'tictactoe'}" class="btn btn-sm btn-subtle">Play</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}m ${remainingSecs}s`;
  }

  function bindEvents() {
    const exportBtn = container.querySelector('#export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = storage.exportData();
        if (jsonStr) {
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `interview_arcade_progress_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          audio.correct();
        }
      });
    }

    const resetBtn = container.querySelector('#reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you certain you want to clear your local Interview Arcade progress logs and unlocked badges? This action cannot be undone.')) {
          progress.resetProgress();
          audio.move();
          render();
          bindEvents();
        }
      });
    }

    const trackSelect = container.querySelector('#track-select');
    if (trackSelect) {
      trackSelect.addEventListener('change', async (e) => {
        const newTrack = e.target.value;
        audio.click();
        localStorage.setItem('arcade_target_role', newTrack);
        if (api.token) {
          try {
            await api.updateTargetRole(newTrack);
            serverLearningPath = await api.getLearningPath().catch(() => null);
            serverRecommendation = await api.getRecommendation().catch(() => null);
          } catch (err) {
            console.warn('Track update failed on server:', err);
          }
        }
        render();
        bindEvents();
      });
    }
  }

  init();

  return {
    destroy: () => {}
  };
}
