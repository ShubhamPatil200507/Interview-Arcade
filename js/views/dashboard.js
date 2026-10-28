/**
 * Interview Arcade — Game 10: Progress Dashboard
 * Real-time analytics, honest accuracy metrics, verified achievements, and data reset.
 */

import { progress, ACHIEVEMENT_DEFINITIONS } from '../services/progress.js';
import { storage } from '../services/storage.js';
import { audio } from '../services/audio.js';

export function createDashboardView(params, container) {
  function init() {
    render();
    bindEvents();
  }

  function render() {
    const metrics = progress.getMetrics();
    const unlockedAchievements = new Set(progress.getUnlockedAchievements());

    const hasData = metrics.totalSessions > 0;

    container.innerHTML = `
      <div class="content-container">
        <!-- Dashboard Header -->
        <div class="game-header-bar" style="margin-bottom: var(--space-lg);">
          <div class="game-title-group">
            <span class="badge badge-accent">Module 10</span>
            <h2>Arcade Progress & Analytics</h2>
          </div>
          <div class="game-controls-bar">
            ${hasData ? `
              <button type="button" id="export-data-btn" class="btn btn-sm btn-subtle">Export Progress (JSON)</button>
              <button type="button" id="reset-progress-btn" class="btn btn-sm btn-danger">Reset Progress</button>
            ` : ''}
          </div>
        </div>

        ${!hasData ? renderEmptyState() : renderDashboardContent(metrics, unlockedAchievements)}
      </div>
    `;
  }

  function renderEmptyState() {
    return `
      <div class="card text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center; max-width: 680px; margin: 0 auto;">
        <span style="font-size: 3.5rem;">🪙</span>
        <h2 style="margin: var(--space-sm) 0;">No Arcade Practice Sessions Yet</h2>
        <p style="margin-bottom: var(--space-lg);">
          Your progress dashboard calculates genuine accuracy, personal bests, and milestone badges purely from your actual gameplay. Jump into any chamber to record your first session!
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-sm);">
          <a href="#/game/tictactoe" class="btn btn-primary">Play Tic Tac Toe + OOP</a>
          <a href="#/" class="btn btn-subtle">Explore Game Library</a>
        </div>
      </div>
    `;
  }

  function renderDashboardContent(metrics, unlockedAchievements) {
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
  }

  init();

  return {
    destroy: () => {}
  };
}
