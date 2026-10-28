/**
 * Interview Arcade — Game 5: SQL Fill in the Blanks
 * Relational schema tables, query blanks, syntax hints, and rigorous DB concepts.
 */

import { SQL_SCHEMAS, SQL_CHALLENGES } from '../data/sql-challenges.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createSQLView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let challenges = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let attempts = 0;
  let showHint = false;
  let isComplete = false;
  let feedback = null; // { isCorrect, message, explanation }
  let currentInputValue = '';
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
    attempts = 0;
    showHint = false;
    isComplete = false;
    feedback = null;
    currentInputValue = '';

    let pool = [...SQL_CHALLENGES];
    if (difficulty !== 'all') {
      pool = pool.filter(c => c.difficulty === difficulty);
    }
    pool.sort(() => Math.random() - 0.5);
    challenges = pool.slice(0, 4);
  }

  function render() {
    if (isComplete) {
      renderSummary();
      return;
    }

    const currentC = challenges[currentIndex];
    if (!currentC) {
      handleComplete();
      return;
    }

    const schema = SQL_SCHEMAS[currentC.schemaKey] || SQL_SCHEMAS.employees;
    const formattedQuery = currentC.queryTemplate.replace('___', `<span class="sql-blank-slot">${currentInputValue || '___'}</span>`);

    // Available quick tokens for ergonomics
    const quickTokens = ['AND', 'OR', 'HAVING', 'WHERE', 'LIMIT', 'IS', 'IS NOT', 'SELECT', 'LEFT', 'INNER'];

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Game 05</span>
              <h2>SQL Fill in the Blanks</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
              <button type="button" id="restart-sql-btn" class="btn btn-sm btn-subtle">Restart</button>
            </div>
          </div>

          <!-- Challenge Card -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-2xs);">
              <div>
                <span class="badge badge-accent">${currentC.title}</span>
                <span class="badge ${currentC.difficulty === 'hard' ? 'badge-hard' : currentC.difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
                  ${currentC.difficulty.toUpperCase()}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                Challenge ${currentIndex + 1} of ${challenges.length}
              </span>
            </div>

            <p style="margin-bottom: var(--space-sm); font-size: var(--font-size-md); font-weight: var(--font-weight-medium);">
              ${currentC.scenario}
            </p>

            <!-- Relational Schema Inspector -->
            <div style="margin-bottom: var(--space-xs);">
              <span class="stat-label">Table Schema: <code>${schema.tableName}</code></span>
            </div>
            <div class="sql-schema-table-wrap">
              <table class="sql-schema-table">
                <thead>
                  <tr>
                    ${schema.columns.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${schema.rows.map(row => `
                    <tr>
                      ${row.map(val => `<td>${val}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- SQL Code Display -->
            <div class="sql-query-display" aria-label="Query code snippet">
              ${formattedQuery}
            </div>

            <!-- Input & Token Bank -->
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap; align-items: center;">
                <label for="sql-token-input" class="sr-only">Missing SQL keyword</label>
                <input type="text" id="sql-token-input" class="sql-input-field" placeholder="Enter missing keyword..." value="${currentInputValue}" autocomplete="off">
                <button type="button" id="submit-sql-btn" class="btn btn-primary">Check Query</button>
                <button type="button" id="sql-hint-btn" class="btn btn-subtle btn-sm">
                  ${showHint ? 'Hide Hint' : '💡 Need a Hint?'}
                </button>
              </div>

              <!-- Quick Keyword Selector -->
              <div style="display: flex; align-items: center; gap: var(--space-2xs); flex-wrap: wrap;">
                <span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">Quick Tokens:</span>
                ${quickTokens.map(tok => `
                  <button type="button" class="sql-token-pill" data-tok="${tok}">${tok}</button>
                `).join('')}
              </div>

              ${showHint ? `
                <div class="apt-hint-box" style="margin-top: var(--space-xs);">
                  <strong>💡 Hint:</strong> ${currentC.hint}
                </div>
              ` : ''}

              <!-- Feedback Banner -->
              ${feedback ? `
                <div class="notice-box ${feedback.isCorrect ? 'notice-success' : 'notice-warning'}" style="margin-top: var(--space-sm);">
                  <div>
                    <h4>${feedback.isCorrect ? '✓ Query Validated!' : '✗ Syntax or Logical Discrepancy'}</h4>
                    <p style="font-size: var(--font-size-sm); margin: var(--space-2xs) 0;">${feedback.explanation}</p>
                    <button type="button" id="next-sql-btn" class="btn btn-primary btn-sm" style="margin-top: var(--space-xs);">
                      ${currentIndex + 1 < challenges.length ? 'Next Challenge →' : 'Complete SQL Round'}
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSummary() {
    const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <div class="game-header-bar">
            <h2>SQL Round Complete!</h2>
            <button type="button" id="play-sql-again" class="btn btn-primary btn-sm">Play Again</button>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-top: var(--space-md);">
            <div class="stat-tile">
              <span class="stat-label">Total Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${score} pts</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Challenges Solved</span>
              <span class="stat-value" style="color: var(--color-success);">${correctCount} / ${challenges.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Query Accuracy</span>
              <span class="stat-value">${accuracy}%</span>
            </div>
          </div>

          <div style="margin-top: var(--space-md); text-align: center;">
            <p>Your database queries were validated against relational schema constraints.</p>
            <a href="#/dashboard" class="btn btn-subtle" style="margin-top: var(--space-xs);">View Progress in Dashboard</a>
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-sql-again');
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

    const restartBtn = container.querySelector('#restart-sql-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        setupChallenges();
        render();
        bindEvents();
      });
    }

    const hintBtn = container.querySelector('#sql-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        showHint = !showHint;
        audio.click();
        render();
        bindEvents();
      });
    }

    const inputField = container.querySelector('#sql-token-input');
    if (inputField) {
      inputField.addEventListener('input', (e) => {
        currentInputValue = e.target.value;
        const blankSlot = container.querySelector('.sql-blank-slot');
        if (blankSlot) blankSlot.textContent = currentInputValue || '___';
      });

      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          evaluateInput();
        }
      });
    }

    container.querySelectorAll('.sql-token-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const tok = e.currentTarget.getAttribute('data-tok');
        currentInputValue = tok;
        audio.click();
        const input = container.querySelector('#sql-token-input');
        if (input) input.value = tok;
        const blankSlot = container.querySelector('.sql-blank-slot');
        if (blankSlot) blankSlot.textContent = tok;
      });
    });

    const submitBtn = container.querySelector('#submit-sql-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', evaluateInput);
    }

    const nextBtn = container.querySelector('#next-sql-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex += 1;
        feedback = null;
        currentInputValue = '';
        showHint = false;
        if (currentIndex >= challenges.length) {
          handleComplete();
        } else {
          render();
          bindEvents();
        }
      });
    }
  }

  function evaluateInput() {
    const currentC = challenges[currentIndex];
    const cleanedInput = currentInputValue.trim().toUpperCase();
    if (!cleanedInput) return;

    attempts += 1;
    const isMatch = currentC.acceptedAnswers.some(ans => ans.toUpperCase() === cleanedInput);

    if (isMatch) {
      correctCount += 1;
      const pts = currentC.difficulty === 'hard' ? 40 : currentC.difficulty === 'medium' ? 25 : 15;
      score += pts;
      audio.correct();
      feedback = {
        isCorrect: true,
        explanation: currentC.explanation
      };
    } else {
      audio.wrong();
      feedback = {
        isCorrect: false,
        explanation: `Expected "${currentC.acceptedAnswers[0]}". ${currentC.explanation}`
      };
    }

    render();
    bindEvents();
  }

  function handleComplete() {
    isComplete = true;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    progress.recordSession({
      gameId: 'sql-blanks',
      gameTitle: 'SQL Fill in the Blanks',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore: challenges.length * 30,
      questionsAnswered: attempts,
      correctAnswers: correctCount,
      incorrectAnswers: attempts - correctCount,
      tags: ['SQL', 'Databases', 'Queries']
    });

    if (correctCount === challenges.length && challenges.length > 0) {
      audio.win();
    }

    render();
  }

  init();

  return {
    destroy: () => {}
  };
}
