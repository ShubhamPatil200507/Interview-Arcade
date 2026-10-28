/**
 * Interview Arcade — Game 8: Debug the Code (C++)
 * Syntax-highlighted code snippets, bug localization, RAII/memory fixes.
 */

import { DEBUG_CHALLENGES } from '../data/debug-challenges.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createDebuggerView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let challenges = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let selectedOption = null;
  let isAnswered = false;
  let sessionStartTime = Date.now();

  function init() {
    setupChallenges();
    render();
    bindEvents();
  }

  function setupChallenges() {
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    selectedOption = null;
    isAnswered = false;

    let pool = [...DEBUG_CHALLENGES];
    if (difficulty !== 'all') {
      pool = pool.filter(c => c.difficulty === difficulty);
    }
    challenges = pool;
  }

  function render() {
    if (currentIndex >= challenges.length) {
      renderSummary();
      return;
    }

    const currentC = challenges[currentIndex];

    // Format code block
    const codeLines = currentC.code.split('\n');
    const renderedCode = codeLines.map((line, idx) => {
      const lineNum = idx + 1;
      const isBuggy = isAnswered && lineNum === currentC.buggyLine;
      return `<span class="${isBuggy ? 'code-line-highlight' : ''}">${escapeHtml(line)}</span>`;
    }).join('\n');

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Systems & C++</span>
              <h2>Debug the Code (C++)</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
              <button type="button" id="restart-dbg-btn" class="btn btn-sm btn-subtle">Restart</button>
            </div>
          </div>

          <!-- Challenge Card -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-xs);">
              <div>
                <span class="badge badge-accent">${currentC.category}</span>
                <span class="badge ${currentC.difficulty === 'hard' ? 'badge-hard' : currentC.difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
                  ${currentC.difficulty.toUpperCase()}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                Bug ${currentIndex + 1} of ${challenges.length}
              </span>
            </div>

            <h3 style="margin-bottom: var(--space-xs);">${currentC.title}</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted); margin-bottom: var(--space-sm);">
              Analyze the C++ snippet below. Identify which line causes the defect and its underlying root cause:
            </p>

            <!-- Code Viewer -->
            <div class="code-viewer-container" aria-label="C++ Code snippet with bug">
              <pre class="code-block-mono"><code>${renderedCode}</code></pre>
            </div>

            <!-- Bug Options -->
            <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
              ${currentC.options.map((opt, i) => {
                let statusClass = '';
                if (isAnswered) {
                  if (i === currentC.correctOptionIndex) statusClass = 'selected-correct';
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

            <!-- Explanations & Fix Preview (when answered) -->
            ${isAnswered ? `
              <div class="notice-box notice-info" style="margin-top: var(--space-md);">
                <div style="width: 100%;">
                  <h4>Root Cause Breakdown</h4>
                  <p style="font-size: var(--font-size-sm); margin: var(--space-2xs) 0;">${currentC.explanation}</p>
                  
                  <h4 style="margin-top: var(--space-sm); color: var(--color-success);">Recommended Verified Fix</h4>
                  <div class="fix-snippet-box">${escapeHtml(currentC.fixSnippet)}</div>

                  <div style="margin-top: var(--space-md); text-align: right;">
                    <button type="button" id="next-dbg-btn" class="btn btn-primary btn-sm">
                      ${currentIndex + 1 < challenges.length ? 'Next Snippet →' : 'See Score'}
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderSummary() {
    const accuracy = challenges.length > 0 ? Math.round((correctCount / challenges.length) * 100) : 0;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <div class="game-header-bar">
            <h2>Debugging Challenge Complete!</h2>
            <button type="button" id="play-dbg-again" class="btn btn-primary btn-sm">Play Again</button>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-top: var(--space-md);">
            <div class="stat-tile">
              <span class="stat-label">Debugging Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${score} pts</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Bugs Exterminated</span>
              <span class="stat-value" style="color: var(--color-success);">${correctCount} / ${challenges.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">${accuracy}%</span>
            </div>
          </div>

          <div style="margin-top: var(--space-lg); text-align: center;">
            <p>Code inspection skills form a crucial part of live technical interview rounds.</p>
            <a href="#/dashboard" class="btn btn-subtle" style="margin-top: var(--space-xs);">View in Progress Dashboard</a>
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-dbg-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        setupChallenges();
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
        setupChallenges();
        render();
        bindEvents();
      });
    });

    const restartBtn = container.querySelector('#restart-dbg-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        setupChallenges();
        render();
        bindEvents();
      });
    }

    container.querySelectorAll('.riddle-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isAnswered) return;
        const optIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        handleSelectBug(optIdx);
      });
    });

    const nextBtn = container.querySelector('#next-dbg-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex += 1;
        isAnswered = false;
        selectedOption = null;

        if (currentIndex >= challenges.length) {
          handleCompletion();
        } else {
          render();
          bindEvents();
        }
      });
    }
  }

  function handleSelectBug(optIdx) {
    const currentC = challenges[currentIndex];
    selectedOption = optIdx;
    isAnswered = true;

    if (optIdx === currentC.correctOptionIndex) {
      correctCount += 1;
      const pts = currentC.difficulty === 'hard' ? 40 : currentC.difficulty === 'medium' ? 25 : 15;
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
      gameId: 'debugger',
      gameTitle: 'Debug the Code (C++)',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore: challenges.length * 35,
      questionsAnswered: challenges.length,
      correctAnswers: correctCount,
      incorrectAnswers: challenges.length - correctCount,
      tags: ['C++', 'Debugging', 'RAII', 'Memory']
    });

    if (correctCount === challenges.length && challenges.length > 0) {
      audio.win();
    }

    render();
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init();

  return {
    destroy: () => {}
  };
}
