/**
 * Interview Arcade — Mistakes Notebook View
 * Categorized error log, pedagogical explanations, and interactive retesting.
 */

import { mistakes } from '../services/mistakes.js';
import { audio } from '../services/audio.js';

export function createMistakesView(params, container) {
  let activeCategory = 'all';
  let activeStatus = 'all'; // 'all', 'pending', 'mastered'

  function init() {
    render();
  }

  function render() {
    const allMistakes = mistakes.getMistakes();
    const stats = mistakes.getStats();

    // Filter items
    let filtered = allMistakes;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(m => m.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (activeStatus === 'pending') {
      filtered = filtered.filter(m => !m.mastered);
    } else if (activeStatus === 'mastered') {
      filtered = filtered.filter(m => m.mastered);
    }

    container.innerHTML = `
      <div class="content-container mistakes-container">
        <!-- Header -->
        <div class="game-header-bar" style="margin-bottom: var(--space-md);">
          <div class="game-title-group">
            <span class="badge badge-accent">Pedagogical Review</span>
            <h2>Mistakes & Error Notebook</h2>
          </div>
          <div class="game-controls-bar">
            ${allMistakes.length > 0 ? `
              <button type="button" id="export-mistakes-btn" class="btn btn-sm btn-subtle">Export (JSON)</button>
              <button type="button" id="clear-mistakes-btn" class="btn btn-sm btn-danger">Clear All</button>
            ` : ''}
          </div>
        </div>

        <!-- Metrics Overview Tiles -->
        <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: var(--space-lg);">
          <div class="stat-tile">
            <span class="stat-label">Total Mistakes Logged</span>
            <span class="stat-value">${stats.total}</span>
          </div>
          <div class="stat-tile">
            <span class="stat-label">Needs Practice</span>
            <span class="stat-value" style="color: var(--color-error);">${stats.pendingCount}</span>
          </div>
          <div class="stat-tile">
            <span class="stat-label">Concepts Mastered</span>
            <span class="stat-value" style="color: var(--color-success);">${stats.masteredCount}</span>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="mistakes-filter-bar">
          <span style="font-size: var(--font-size-xs); font-weight: bold; margin-right: 4px;">Status:</span>
          <button type="button" class="btn btn-sm ${activeStatus === 'all' ? 'btn-primary' : 'btn-subtle'}" data-status="all">All (${stats.total})</button>
          <button type="button" class="btn btn-sm ${activeStatus === 'pending' ? 'btn-primary' : 'btn-subtle'}" data-status="pending">Needs Review (${stats.pendingCount})</button>
          <button type="button" class="btn btn-sm ${activeStatus === 'mastered' ? 'btn-primary' : 'btn-subtle'}" data-status="mastered">Mastered (${stats.masteredCount})</button>

          <span style="margin: 0 var(--space-xs); color: var(--color-ink-muted);">|</span>

          <span style="font-size: var(--font-size-xs); font-weight: bold; margin-right: 4px;">Domain:</span>
          <button type="button" class="btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-subtle'}" data-cat="all">All</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'oop' ? 'btn-primary' : 'btn-subtle'}" data-cat="oop">OOP</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'sql' ? 'btn-primary' : 'btn-subtle'}" data-cat="sql">SQL</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'dsa' ? 'btn-primary' : 'btn-subtle'}" data-cat="dsa">DSA</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'aptitude' ? 'btn-primary' : 'btn-subtle'}" data-cat="aptitude">Aptitude</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'systems' ? 'btn-primary' : 'btn-subtle'}" data-cat="systems">Systems</button>
          <button type="button" class="btn btn-sm ${activeCategory === 'behavioral' ? 'btn-primary' : 'btn-subtle'}" data-cat="behavioral">Interview</button>
        </div>

        <!-- Content Area -->
        ${allMistakes.length === 0 ? renderEmptyState() : filtered.length === 0 ? renderNoFilterResults() : renderMistakeList(filtered)}
      </div>
    `;

    bindEvents();
  }

  function renderEmptyState() {
    return `
      <div class="card text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center; max-width: 680px; margin: 0 auto;">
        <span style="font-size: 3.5rem;">📖</span>
        <h2 style="margin: var(--space-sm) 0;">No Mistakes in Error Notebook</h2>
        <p style="margin-bottom: var(--space-lg); color: var(--color-ink-muted);">
          Whenever you miss a question in any mini-game, diagnostic test, or interview simulation, it is automatically cataloged here with in-depth conceptual explanations for deliberate practice.
        </p>
        <div style="display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
          <a href="#/assessment" class="btn btn-primary">Take Diagnostic Test</a>
          <a href="#/game/tictactoe" class="btn btn-subtle">Play OOP Tic Tac Toe</a>
        </div>
      </div>
    `;
  }

  function renderNoFilterResults() {
    return `
      <div class="card text-center" style="padding: var(--space-2xl) var(--space-md); text-align: center;">
        <p>No mistakes match the selected filters.</p>
        <button type="button" id="reset-filters-btn" class="btn btn-sm btn-subtle" style="margin-top: var(--space-sm);">Reset Filters</button>
      </div>
    `;
  }

  function renderMistakeList(items) {
    return `
      <div class="mistakes-list">
        ${items.map(item => `
          <div class="mistake-card ${item.mastered ? 'mastered' : 'pending'}" data-id="${item.challengeId}">
            <div class="mistake-header">
              <div style="display: flex; gap: var(--space-xs); align-items: center;">
                <span class="badge ${item.mastered ? 'badge-accent' : 'badge-primary'}">${item.category}</span>
                <span style="font-weight: bold; font-size: var(--font-size-sm);">${item.title}</span>
              </div>
              <div>
                <span class="badge ${item.mastered ? 'badge-accent' : 'badge-subtle'}">
                  ${item.mastered ? '✓ Mastered' : '⚠️ Needs Practice'}
                </span>
              </div>
            </div>

            <p style="font-size: var(--font-size-sm); line-height: 1.5; margin: var(--space-xs) 0 var(--space-sm); font-weight: 500;">
              ${item.prompt}
            </p>

            <div class="mistake-answers-grid">
              <div class="answer-tile student-choice">
                <strong>Your Selected Answer:</strong>
                <div style="margin-top: 4px; color: var(--color-error);">${item.studentAnswer}</div>
              </div>
              <div class="answer-tile correct-choice">
                <strong>Correct Solution:</strong>
                <div style="margin-top: 4px; color: var(--color-success);">${item.correctAnswer}</div>
              </div>
            </div>

            <div class="mistake-explanation-box">
              <strong>Pedagogical Analysis & Explanation:</strong>
              <div style="margin-top: 4px;">${item.explanation}</div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: var(--space-md); gap: var(--space-xs);">
              ${!item.mastered ? `
                <button type="button" class="btn btn-sm btn-primary mark-mastered-btn" data-id="${item.challengeId}">
                  ✨ Mark as Understood & Mastered
                </button>
              ` : `
                <span style="font-size: var(--font-size-xs); color: var(--color-success); font-weight: bold; align-self: center;">
                  ✓ Concept mastered on ${new Date(item.masteredAt || item.lastRecorded).toLocaleDateString()}
                </span>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function bindEvents() {
    // Status filter buttons
    container.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeStatus = e.currentTarget.getAttribute('data-status');
        audio.click();
        render();
      });
    });

    // Category filter buttons
    container.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.getAttribute('data-cat');
        audio.click();
        render();
      });
    });

    // Reset filters
    const resetFiltersBtn = container.querySelector('#reset-filters-btn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        activeCategory = 'all';
        activeStatus = 'all';
        audio.click();
        render();
      });
    }

    // Mark as Mastered buttons
    container.querySelectorAll('.mark-mastered-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        mistakes.markMastered(id);
        audio.win();
        render();
      });
    });

    // Clear All
    const clearBtn = container.querySelector('#clear-mistakes-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire Mistakes Notebook?')) {
          mistakes.clearAll();
          audio.wrong();
          render();
        }
      });
    }

    // Export JSON
    const exportBtn = container.querySelector('#export-mistakes-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = mistakes.getMistakes();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-arcade-mistakes-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        audio.click();
      });
    }
  }

  init();

  return {
    destroy: () => {}
  };
}
