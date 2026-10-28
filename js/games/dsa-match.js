/**
 * Interview Arcade — Game 7: DSA Match the Following
 * Interactive column matching for Big-O time, space, and algorithmic properties.
 */

import { DSA_SETS } from '../data/dsa-topics.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createDSAMatchView(params, container) {
  let difficulty = 'easy'; // 'easy', 'medium', 'hard'
  let leftItems = [];   // Concepts
  let rightItems = [];  // Complexities
  let selectedLeftId = null;
  let matches = {};     // leftId -> rightId
  let evaluated = false;
  let score = 0;
  let sessionStartTime = Date.now();

  const PAIR_COLORS = ['#E05626', '#2563EB', '#15803D', '#7C3AED'];
  const PAIR_LABELS = ['[1]', '[2]', '[3]', '[4]'];

  function init() {
    setupSet();
    render();
    bindEvents();
  }

  function setupSet() {
    sessionStartTime = Date.now();
    selectedLeftId = null;
    matches = {};
    evaluated = false;
    score = 0;

    const set = DSA_SETS[difficulty] || DSA_SETS.easy;
    leftItems = set.map(item => ({ id: item.id, text: item.concept, itemData: item }));
    // Shuffle left items
    leftItems.sort(() => Math.random() - 0.5);

    // Right items are shuffled complexities
    rightItems = set.map(item => ({ id: item.id, text: item.correctMatch, itemData: item }));
    rightItems.sort(() => Math.random() - 0.5);
  }

  function render() {
    const isAllPaired = leftItems.length > 0 && Object.keys(matches).length === leftItems.length;

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Game 07</span>
              <h2>DSA Match the Following</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
              <button type="button" id="reset-dsa-btn" class="btn btn-sm btn-subtle">Reset Pairs</button>
            </div>
          </div>

          <!-- Instructions Card -->
          <div class="notice-box notice-info" style="margin-bottom: var(--space-xs);">
            <div>
              <strong>Matching Interaction:</strong> Click a concept in the left column, then click its corresponding complexity/use case in the right column to link them.
            </div>
          </div>

          <!-- Two Column Matching Arena -->
          <div class="dsa-columns-wrap">
            <!-- Left Column: Concepts -->
            <div class="dsa-column" aria-label="Column 1: Data Structures and Algorithms">
              <span class="stat-label">Concepts & Operations</span>
              ${leftItems.map((item, idx) => {
                const isSelected = selectedLeftId === item.id;
                const pairedRightId = matches[item.id];
                let cardClass = '';
                let badgeText = '';

                if (evaluated) {
                  const isCorrect = pairedRightId === item.id;
                  cardClass = isCorrect ? 'paired-correct' : 'paired-wrong';
                } else if (pairedRightId) {
                  cardClass = 'paired';
                  const pairIdx = Object.keys(matches).indexOf(item.id);
                  badgeText = PAIR_LABELS[pairIdx] || 'Linked';
                } else if (isSelected) {
                  cardClass = 'active-selected';
                }

                return `
                  <button type="button" class="dsa-match-card ${cardClass}" data-left-id="${item.id}" ${evaluated ? 'disabled' : ''}>
                    <span><strong>${item.text}</strong></span>
                    ${badgeText ? `<span class="badge badge-accent">${badgeText}</span>` : ''}
                    ${evaluated ? (pairedRightId === item.id ? '<span style="color: var(--color-success);">✓</span>' : '<span style="color: var(--color-error);">✗</span>') : ''}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Right Column: Complexities -->
            <div class="dsa-column" aria-label="Column 2: Big-O Complexities">
              <span class="stat-label">Big-O Complexities & Properties</span>
              ${rightItems.map((item) => {
                // Find if any left item matched with this right item
                const linkedLeftId = Object.keys(matches).find(lId => matches[lId] === item.id);
                let cardClass = '';
                let badgeText = '';

                if (evaluated) {
                  const isCorrect = linkedLeftId === item.id;
                  cardClass = isCorrect ? 'paired-correct' : linkedLeftId ? 'paired-wrong' : '';
                } else if (linkedLeftId) {
                  cardClass = 'paired';
                  const pairIdx = Object.keys(matches).indexOf(linkedLeftId);
                  badgeText = PAIR_LABELS[pairIdx] || 'Linked';
                }

                return `
                  <button type="button" class="dsa-match-card ${cardClass}" data-right-id="${item.id}" ${evaluated ? 'disabled' : ''}>
                    <span>${item.text}</span>
                    ${badgeText ? `<span class="badge badge-accent">${badgeText}</span>` : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Action Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
            <div>
              <span style="font-size: var(--font-size-sm); color: var(--color-ink-muted);">
                ${Object.keys(matches).length} of ${leftItems.length} pairs linked
              </span>
            </div>
            <div>
              ${evaluated ? `
                <button type="button" id="dsa-next-btn" class="btn btn-primary">Try Another Set</button>
              ` : `
                <button type="button" id="dsa-check-btn" class="btn btn-primary" ${!isAllPaired ? 'disabled' : ''}>
                  Check Matches
                </button>
              `}
            </div>
          </div>

          <!-- Explanations & Review Container (shown after evaluation) -->
          ${evaluated ? `
            <div style="margin-top: var(--space-lg);">
              <div class="stat-tile" style="margin-bottom: var(--space-md);">
                <span class="stat-label">Final Score</span>
                <span class="stat-value" style="color: var(--color-accent);">${score} / 100 pts</span>
              </div>

              <h3>Big-O Complexity Explanations</h3>
              <div style="display: flex; flex-direction: column; gap: var(--space-xs); margin-top: var(--space-sm);">
                ${leftItems.map(item => `
                  <div class="card" style="padding: var(--space-sm) var(--space-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <strong>${item.text} → <code>${item.itemData.correctMatch}</code></strong>
                      <span class="badge ${matches[item.id] === item.id ? 'badge-easy' : 'badge-hard'}">
                        ${matches[item.id] === item.id ? '✓ Correct' : '✗ Missed'}
                      </span>
                    </div>
                    <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">${item.itemData.explanation}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        difficulty = e.target.getAttribute('data-diff');
        audio.click();
        setupSet();
        render();
        bindEvents();
      });
    });

    const resetBtn = container.querySelector('#reset-dsa-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        audio.click();
        setupSet();
        render();
        bindEvents();
      });
    }

    // Left card clicks
    container.querySelectorAll('[data-left-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (evaluated) return;
        const leftId = e.currentTarget.getAttribute('data-left-id');
        selectedLeftId = leftId;
        audio.click();
        render();
        bindEvents();
      });
    });

    // Right card clicks
    container.querySelectorAll('[data-right-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (evaluated) return;
        const rightId = e.currentTarget.getAttribute('data-right-id');
        if (selectedLeftId) {
          // Check if right item already used by another left
          for (const k in matches) {
            if (matches[k] === rightId) delete matches[k];
          }
          matches[selectedLeftId] = rightId;
          selectedLeftId = null;
          audio.move();
          render();
          bindEvents();
        }
      });
    });

    const checkBtn = container.querySelector('#dsa-check-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', evaluateMatches);
    }

    const nextBtn = container.querySelector('#dsa-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        setupSet();
        render();
        bindEvents();
      });
    }
  }

  function evaluateMatches() {
    evaluated = true;
    let correctMatches = 0;
    const total = leftItems.length;

    leftItems.forEach(item => {
      if (matches[item.id] === item.id) {
        correctMatches += 1;
      }
    });

    score = Math.round((correctMatches / total) * 100);
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    if (score >= 80) {
      audio.win();
    } else if (score >= 50) {
      audio.correct();
    } else {
      audio.wrong();
    }

    progress.recordSession({
      gameId: 'dsa-match',
      gameTitle: 'DSA Match the Following',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore: 100,
      questionsAnswered: total,
      correctAnswers: correctMatches,
      incorrectAnswers: total - correctMatches,
      tags: ['DSA', 'Big-O', 'Algorithms']
    });

    render();
    bindEvents();
  }

  init();

  return {
    destroy: () => {}
  };
}
