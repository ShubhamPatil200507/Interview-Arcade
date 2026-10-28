/**
 * Interview Arcade — Game 8: Debug the Code (C++)
 * Syntax-highlighted code snippets, bug localization, RAII/memory fixes,
 * dynamic question generation, repetition elimination, and mistake revision.
 */

import { DEBUG_CHALLENGES } from '../data/debug-challenges.js';
import { QuestionClient } from '../services/question-client.js';
import { progress } from '../services/progress.js';
import { mistakes } from '../services/mistakes.js';
import { audio } from '../services/audio.js';

export function createDebuggerView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let practiceMode = 'fresh'; // 'fresh', 'revision'
  let selectedCategory = 'all';
  let challenges = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let selectedOption = null;
  let isAnswered = false;
  let sessionStartTime = Date.now();
  let deliveryStats = null;
  let lastVerification = null;

  const CATEGORIES = [
    'all',
    'Boundary Condition',
    'Memory Management',
    'Object Lifecycle & Polymorphism',
    'Concurrency & Mutex'
  ];

  async function init() {
    await loadChallenges();
    render();
    bindEvents();
  }

  async function loadChallenges() {
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    selectedOption = null;
    isAnswered = false;
    lastVerification = null;

    const diffFilter = difficulty === 'all' ? null : difficulty;
    const catFilter = selectedCategory === 'all' ? null : selectedCategory;

    let bank = [...DEBUG_CHALLENGES];
    if (catFilter) {
      bank = bank.filter(c => c.category === catFilter);
      if (bank.length === 0) bank = [...DEBUG_CHALLENGES];
    }

    const res = await QuestionClient.fetchQuestions({
      gameId: 'debugger',
      topic: catFilter,
      difficulty: diffFilter,
      count: 4,
      mode: practiceMode,
      fallbackBank: bank
    });

    challenges = res.questions || [];
    deliveryStats = res;

    if (challenges.length === 0) {
      challenges = [...DEBUG_CHALLENGES];
    }
  }

  function render() {
    if (currentIndex >= challenges.length) {
      renderSummary();
      return;
    }

    const currentC = challenges[currentIndex];
    const codeSnippet = currentC.code || currentC.prompt || '// No code snippet';

    // Format code block
    const codeLines = codeSnippet.split('\n');
    const renderedCode = codeLines.map((line, idx) => {
      const lineNum = idx + 1;
      const isBuggy = isAnswered && lineNum === (currentC.buggyLine || currentC.buggy_line || 3);
      return `<span class="${isBuggy ? 'code-line-highlight' : ''}">${escapeHtml(line)}</span>`;
    }).join('\n');

    const cTitle = currentC.title || currentC.topic || 'C++ Defect Diagnosis';
    const cCategory = currentC.category || currentC.topic || 'Systems & C++';
    const cDiff = (currentC.difficulty || difficulty).toUpperCase();
    const cOptions = currentC.options || [];

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

          <!-- Practice Configuration Bar -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs); background: var(--color-bg-subtle); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: var(--space-sm);">
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
              <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-ink-muted);">Defect Category:</span>
              <select id="dbg-category-select" style="font-size: var(--font-size-xs); padding: 2px 6px; border-radius: var(--radius-xs); border: 1px solid var(--color-border); background: var(--color-surface);">
                ${CATEGORIES.map(c => `
                  <option value="${c}" ${selectedCategory === c ? 'selected' : ''}>${c === 'all' ? 'All Defect Types' : c}</option>
                `).join('')}
              </select>

              <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-ink-muted); margin-left: var(--space-xs);">Mode:</span>
              <div class="difficulty-selector" style="margin: 0;">
                <button type="button" class="diff-btn ${practiceMode === 'fresh' ? 'active' : ''}" data-practice="fresh">Fresh (Unseen)</button>
                <button type="button" class="diff-btn ${practiceMode === 'revision' ? 'active' : ''}" data-practice="revision">Revision (Mistakes)</button>
              </div>
            </div>

            <div>
              <span class="badge ${deliveryStats?.isGenerated ? 'badge-accent' : 'badge-subtle'}" style="font-size: var(--font-size-xs);">
                ${deliveryStats ? (deliveryStats.isGenerated ? `✨ AI Questions Active (${deliveryStats.generatedCount} generated)` : `🏛️ Verified Bank (${deliveryStats.deliveredCount} available)`) : '⚡ Adaptive Delivery'}
              </span>
            </div>
          </div>

          <!-- Challenge Card -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-xs);">
              <div>
                <span class="badge badge-accent">${cCategory}</span>
                <span class="badge ${cDiff === 'HARD' ? 'badge-hard' : cDiff === 'MEDIUM' ? 'badge-medium' : 'badge-easy'}">
                  ${cDiff}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                Bug ${currentIndex + 1} of ${challenges.length}
              </span>
            </div>

            <h3 style="margin-bottom: var(--space-xs);">${cTitle}</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted); margin-bottom: var(--space-sm);">
              Analyze the C++ snippet below. Identify which line causes the defect and its underlying root cause:
            </p>

            <!-- Code Viewer -->
            <div class="code-viewer-container" aria-label="C++ Code snippet with bug">
              <pre class="code-block-mono"><code>${renderedCode}</code></pre>
            </div>

            <!-- Bug Options -->
            <div style="display: flex; flex-direction: column; gap: var(--space-xs); margin-top: var(--space-sm);">
              ${cOptions.map((opt, i) => {
                let statusClass = '';
                const correctIdx = currentC.correctOptionIndex ?? currentC.correctIndex;
                if (isAnswered) {
                  if (i === correctIdx) statusClass = 'selected-correct';
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
                  <p style="font-size: var(--font-size-sm); margin: var(--space-2xs) 0;">
                    ${lastVerification?.explanation || currentC.explanation || 'Verified C++ memory model explanation.'}
                  </p>
                  
                  ${currentC.fixSnippet ? `
                    <h4 style="margin-top: var(--space-sm); color: var(--color-success);">Recommended Verified Fix</h4>
                    <div class="fix-snippet-box">${escapeHtml(currentC.fixSnippet)}</div>
                  ` : ''}

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
            <p>Code inspection and memory leak diagnosis form a critical part of systems engineering interviews.</p>
            <a href="#/dashboard" class="btn btn-subtle" style="margin-top: var(--space-xs);">View in Progress Dashboard</a>
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-dbg-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', async () => {
        await loadChallenges();
        render();
        bindEvents();
      });
    }
  }

  function bindEvents() {
    container.querySelectorAll('.diff-btn[data-diff]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        difficulty = e.target.getAttribute('data-diff');
        audio.click();
        await loadChallenges();
        render();
        bindEvents();
      });
    });

    container.querySelectorAll('.diff-btn[data-practice]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        practiceMode = e.target.getAttribute('data-practice');
        audio.click();
        await loadChallenges();
        render();
        bindEvents();
      });
    });

    const categorySelect = container.querySelector('#dbg-category-select');
    if (categorySelect) {
      categorySelect.addEventListener('change', async (e) => {
        selectedCategory = e.target.value;
        audio.click();
        await loadChallenges();
        render();
        bindEvents();
      });
    }

    const restartBtn = container.querySelector('#restart-dbg-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', async () => {
        audio.click();
        await loadChallenges();
        render();
        bindEvents();
      });
    }

    container.querySelectorAll('.riddle-option-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (isAnswered) return;
        const optIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        await handleSelectBug(optIdx);
      });
    });

    const nextBtn = container.querySelector('#next-dbg-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex += 1;
        isAnswered = false;
        selectedOption = null;
        lastVerification = null;

        if (currentIndex >= challenges.length) {
          handleCompletion();
        } else {
          render();
          bindEvents();
        }
      });
    }
  }

  async function handleSelectBug(optIdx) {
    const currentC = challenges[currentIndex];
    selectedOption = optIdx;
    isAnswered = true;

    const verification = await QuestionClient.verifyAnswer({
      gameId: 'debugger',
      challengeId: currentC.id,
      selectedOptionIndex: optIdx,
      localQuestion: currentC
    });
    lastVerification = verification;

    const isCorrect = verification.isCorrect;

    if (isCorrect) {
      correctCount += 1;
      const pts = (currentC.difficulty || difficulty) === 'hard' ? 40 : (currentC.difficulty || difficulty) === 'medium' ? 25 : 15;
      score += pts;
      audio.correct();
    } else {
      audio.wrong();
      // Record mistake to Notebook
      mistakes.recordMistake({
        gameId: 'debugger',
        challengeId: currentC.id || `dbg_${Date.now()}`,
        category: currentC.category || currentC.topic || 'C++ Systems',
        question: currentC.title || currentC.question || 'C++ Bug Diagnosis',
        userAnswer: currentC.options ? currentC.options[optIdx] : String(optIdx),
        correctAnswer: verification.correctAnswer || (currentC.options ? currentC.options[currentC.correctOptionIndex ?? currentC.correctIndex ?? 0] : 'Correct Diagnosis'),
        explanation: verification.explanation || currentC.explanation || 'Review C++ memory model.',
        timestamp: Date.now()
      });
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
    if (!text) return '';
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
