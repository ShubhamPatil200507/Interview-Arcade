/**
 * Interview Arcade — Game 6: Visual Logic Riddles
 * Vector SVG diagrams, spatial sequence reasoning, and pattern deduction.
 */

import { VISUAL_RIDDLES } from '../data/visual-riddles.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createVisualRiddlesView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let riddles = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let showHint = false;
  let isAnswered = false;
  let selectedOption = null;
  let sessionStartTime = Date.now();

  function init() {
    setupRiddles();
    render();
    bindEvents();
  }

  function setupRiddles() {
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    showHint = false;
    isAnswered = false;
    selectedOption = null;

    let pool = [...VISUAL_RIDDLES];
    if (difficulty !== 'all') {
      pool = pool.filter(r => r.difficulty === difficulty);
    }
    riddles = pool;
  }

  function render() {
    if (currentIndex >= riddles.length) {
      renderSummary();
      return;
    }

    const currentR = riddles[currentIndex];

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Game 06</span>
              <h2>Visual Logic Riddles</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
              <button type="button" id="restart-riddles-btn" class="btn btn-sm btn-subtle">Restart</button>
            </div>
          </div>

          <!-- Riddle Card -->
          <div class="riddle-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <span class="badge badge-accent">${currentR.title}</span>
                <span class="badge ${currentR.difficulty === 'hard' ? 'badge-hard' : currentR.difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
                  ${currentR.difficulty.toUpperCase()}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                Riddle ${currentIndex + 1} of ${riddles.length}
              </span>
            </div>

            <p style="font-weight: var(--font-weight-medium);">${currentR.instructions}</p>

            <!-- Vector Diagram Display -->
            <div class="riddle-svg-container" aria-label="Visual puzzle diagram">
              ${currentR.svgDiagram}
            </div>

            ${showHint ? `
              <div class="apt-hint-box">
                <strong>💡 Pattern Hint:</strong> ${currentR.hint}
              </div>
            ` : ''}

            <!-- Options List -->
            <div class="riddle-options-list">
              ${currentR.options.map((opt, i) => {
                let statusClass = '';
                if (isAnswered) {
                  if (i === currentR.correctIndex) statusClass = 'selected-correct';
                  else if (i === selectedOption) statusClass = 'selected-wrong';
                }
                return `
                  <button type="button" class="riddle-option-btn ${statusClass}" data-opt-idx="${i}" ${isAnswered ? 'disabled' : ''}>
                    <span class="badge" style="background-color: var(--color-surface);">${String.fromCharCode(65 + i)}</span>
                    <span>${opt}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Action Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-sm); border-top: var(--border-width-sm) solid var(--color-border); padding-top: var(--space-sm);">
              <button type="button" id="toggle-riddle-hint-btn" class="btn btn-subtle btn-sm">
                ${showHint ? 'Hide Hint' : '💡 Show Deduction Hint'}
              </button>

              ${isAnswered ? `
                <button type="button" id="next-riddle-btn" class="btn btn-primary btn-sm">
                  ${currentIndex + 1 < riddles.length ? 'Next Riddle →' : 'See Results'}
                </button>
              ` : `
                <span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">Score: ${score} pts</span>
              `}
            </div>

            <!-- Detailed Explanation when answered -->
            ${isAnswered ? `
              <div class="notice-box notice-info" style="margin-top: var(--space-xs);">
                <div>
                  <strong>Deduction Breakdown:</strong>
                  <p style="font-size: var(--font-size-sm); margin-top: 4px;">${currentR.explanation}</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderSummary() {
    const accuracy = riddles.length > 0 ? Math.round((correctCount / riddles.length) * 100) : 0;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <div class="game-header-bar">
            <h2>Visual Logic Complete!</h2>
            <button type="button" id="play-riddles-again" class="btn btn-primary btn-sm">Start Over</button>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-top: var(--space-md);">
            <div class="stat-tile">
              <span class="stat-label">Total Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${score} pts</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Patterns Solved</span>
              <span class="stat-value" style="color: var(--color-success);">${correctCount} / ${riddles.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">${accuracy}%</span>
            </div>
          </div>

          <div style="margin-top: var(--space-lg); text-align: center;">
            <p>Spatial reasoning exercises strengthen non-verbal pattern recognition in engineering assessments.</p>
            <a href="#/dashboard" class="btn btn-subtle" style="margin-top: var(--space-xs);">Inspect in Dashboard</a>
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-riddles-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        setupRiddles();
        render();
        bindEvents();
      });
    }
  }

  function bindEvents() {
    container.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        difficulty = e.target.getAttribute('data-diff');
        audio.click();
        setupRiddles();
        render();
        bindEvents();
      });
    });

    const restartBtn = container.querySelector('#restart-riddles-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        setupRiddles();
        render();
        bindEvents();
      });
    }

    const hintBtn = container.querySelector('#toggle-riddle-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        showHint = !showHint;
        audio.click();
        render();
        bindEvents();
      });
    }

    container.querySelectorAll('.riddle-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isAnswered) return;
        const optIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        handleSelectOption(optIdx);
      });
    });

    const nextBtn = container.querySelector('#next-riddle-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex += 1;
        isAnswered = false;
        showHint = false;
        selectedOption = null;

        if (currentIndex >= riddles.length) {
          handleCompletion();
        } else {
          render();
          bindEvents();
        }
      });
    }
  }

  function handleSelectOption(optIdx) {
    const currentR = riddles[currentIndex];
    selectedOption = optIdx;
    isAnswered = true;

    if (optIdx === currentR.correctIndex) {
      correctCount += 1;
      const pts = currentR.difficulty === 'hard' ? 35 : currentR.difficulty === 'medium' ? 25 : 15;
      score += pts;
      audio.correct();
    } else {
      audio.wrong();
    }

    render();
    bindEvents();
  }

  function handleCompletion() {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    progress.recordSession({
      gameId: 'visual-riddles',
      gameTitle: 'Visual Logic Riddles',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore: riddles.length * 30,
      questionsAnswered: riddles.length,
      correctAnswers: correctCount,
      incorrectAnswers: riddles.length - correctCount,
      tags: ['Logic', 'Patterns', 'Visual']
    });

    if (correctCount === riddles.length && riddles.length > 0) {
      audio.win();
    }

    render();
  }

  init();

  return {
    destroy: () => {}
  };
}
