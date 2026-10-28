/**
 * Interview Arcade — Game 6: Visual Logic Riddles
 * Vector SVG diagrams, spatial sequence reasoning, pattern deduction,
 * dynamic question delivery, repetition elimination, and mistake revision.
 */

import { VISUAL_RIDDLES } from '../data/visual-riddles.js';
import { QuestionClient } from '../services/question-client.js';
import { progress } from '../services/progress.js';
import { mistakes } from '../services/mistakes.js';
import { audio } from '../services/audio.js';

export function createVisualRiddlesView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let practiceMode = 'fresh'; // 'fresh', 'revision'
  let riddles = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let showHint = false;
  let isAnswered = false;
  let selectedOption = null;
  let sessionStartTime = Date.now();
  let deliveryStats = null;
  let lastVerification = null;

  async function init() {
    await loadRiddles();
    render();
    bindEvents();
  }

  async function loadRiddles() {
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    showHint = false;
    isAnswered = false;
    selectedOption = null;
    lastVerification = null;

    const diffFilter = difficulty === 'all' ? null : difficulty;

    const res = await QuestionClient.fetchQuestions({
      gameId: 'visual-riddles',
      topic: null,
      difficulty: diffFilter,
      count: 4,
      mode: practiceMode,
      fallbackBank: VISUAL_RIDDLES
    });

    riddles = res.questions || [];
    deliveryStats = res;

    if (riddles.length === 0) {
      let pool = [...VISUAL_RIDDLES];
      if (difficulty !== 'all') {
        pool = pool.filter(r => r.difficulty === difficulty);
      }
      riddles = pool;
    }
  }

  function render() {
    if (currentIndex >= riddles.length) {
      renderSummary();
      return;
    }

    const currentR = riddles[currentIndex];
    const rTitle = currentR.title || currentR.prompt || 'Visual Logic Puzzle';
    const rDiff = (currentR.difficulty || difficulty).toUpperCase();
    const rOptions = currentR.options || [];

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Aptitude & Logic</span>
              <h2>Visual Pattern Recognition</h2>
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

          <!-- Practice Configuration Bar -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs); background: var(--color-bg-subtle); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: var(--space-sm);">
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
              <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-ink-muted);">Mode:</span>
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

          <!-- Riddle Card -->
          <div class="riddle-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <span class="badge badge-accent">${rTitle}</span>
                <span class="badge ${rDiff === 'HARD' ? 'badge-hard' : rDiff === 'MEDIUM' ? 'badge-medium' : 'badge-easy'}">
                  ${rDiff}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                Riddle ${currentIndex + 1} of ${riddles.length}
              </span>
            </div>

            <p style="font-weight: var(--font-weight-medium); margin-top: var(--space-xs);">
              ${currentR.instructions || currentR.prompt || 'Deduce the missing element in the visual sequence:'}
            </p>

            <!-- Vector Diagram Display -->
            ${currentR.svgDiagram ? `
              <div class="riddle-svg-container" aria-label="Visual puzzle diagram">
                ${currentR.svgDiagram}
              </div>
            ` : ''}

            ${showHint && currentR.hint ? `
              <div class="apt-hint-box" style="margin-top: var(--space-xs);">
                <strong>💡 Pattern Hint:</strong> ${currentR.hint}
              </div>
            ` : ''}

            <!-- Options List -->
            <div class="riddle-options-list" style="margin-top: var(--space-sm);">
              ${rOptions.map((opt, i) => {
                let statusClass = '';
                const correctIdx = currentR.correctIndex ?? 0;
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

            <!-- Riddle Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md); border-top: var(--border-width-sm) solid var(--color-border); padding-top: var(--space-sm);">
              ${currentR.hint ? `
                <button type="button" id="hint-toggle-riddle-btn" class="btn btn-subtle btn-sm">
                  ${showHint ? 'Hide Hint' : '💡 Show Pattern Hint'}
                </button>
              ` : '<div></div>'}

              ${isAnswered ? `
                <button type="button" id="next-riddle-btn" class="btn btn-primary btn-sm">
                  ${currentIndex + 1 < riddles.length ? 'Next Riddle →' : 'See Results'}
                </button>
              ` : ''}
            </div>

            ${isAnswered ? `
              <div class="notice-box notice-info" style="margin-top: var(--space-sm); font-size: var(--font-size-sm);">
                <strong>Deduction Breakdown:</strong> ${lastVerification?.explanation || currentR.explanation || 'Visual symmetry and progression verified.'}
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
            <h2>Visual Puzzles Completed!</h2>
            <button type="button" id="play-riddles-again" class="btn btn-primary btn-sm">Try Another Set</button>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-top: var(--space-md);">
            <div class="stat-tile">
              <span class="stat-label">Spatial Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${score} pts</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Puzzles Solved</span>
              <span class="stat-value" style="color: var(--color-success);">${correctCount} / ${riddles.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">${accuracy}%</span>
            </div>
          </div>

          <div style="margin-top: var(--space-lg); text-align: center;">
            <p>Spatial pattern matching evaluates non-verbal deductive reasoning frequently tested in top engineering screening rounds.</p>
            <a href="#/dashboard" class="btn btn-subtle" style="margin-top: var(--space-xs);">View in Progress Dashboard</a>
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-riddles-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', async () => {
        await loadRiddles();
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
        await loadRiddles();
        render();
        bindEvents();
      });
    });

    container.querySelectorAll('.diff-btn[data-practice]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        practiceMode = e.target.getAttribute('data-practice');
        audio.click();
        await loadRiddles();
        render();
        bindEvents();
      });
    });

    const restartBtn = container.querySelector('#restart-riddles-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', async () => {
        audio.click();
        await loadRiddles();
        render();
        bindEvents();
      });
    }

    const hintBtn = container.querySelector('#hint-toggle-riddle-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        showHint = !showHint;
        audio.click();
        render();
        bindEvents();
      });
    }

    container.querySelectorAll('.riddle-option-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (isAnswered) return;
        const optIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        await handleAnswer(optIdx);
      });
    });

    const nextBtn = container.querySelector('#next-riddle-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex += 1;
        isAnswered = false;
        selectedOption = null;
        showHint = false;
        lastVerification = null;

        if (currentIndex >= riddles.length) {
          handleCompletion();
        } else {
          render();
          bindEvents();
        }
      });
    }
  }

  async function handleAnswer(optIdx) {
    const currentR = riddles[currentIndex];
    selectedOption = optIdx;
    isAnswered = true;

    const verification = await QuestionClient.verifyAnswer({
      gameId: 'visual-riddles',
      challengeId: currentR.id,
      selectedOptionIndex: optIdx,
      localQuestion: currentR
    });
    lastVerification = verification;

    const isCorrect = verification.isCorrect;

    if (isCorrect) {
      correctCount += 1;
      const pts = (currentR.difficulty || difficulty) === 'hard' ? 35 : (currentR.difficulty || difficulty) === 'medium' ? 25 : 15;
      score += pts;
      audio.correct();
    } else {
      audio.wrong();
      // Record mistake
      mistakes.recordMistake({
        gameId: 'visual-riddles',
        challengeId: currentR.id || `vis_${Date.now()}`,
        category: 'Spatial Reasoning',
        question: currentR.title || currentR.prompt || 'Visual Pattern',
        userAnswer: currentR.options ? currentR.options[optIdx] : String(optIdx),
        correctAnswer: verification.correctAnswer || (currentR.options ? currentR.options[currentR.correctIndex ?? 0] : 'Correct Pattern'),
        explanation: verification.explanation || currentR.explanation || 'Review spatial progression rules.',
        timestamp: Date.now()
      });
    }

    render();
    bindEvents();
  }

  function handleCompletion() {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    progress.recordSession({
      gameId: 'visual-riddles',
      gameTitle: 'Visual Pattern Recognition',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore: riddles.length * 30,
      questionsAnswered: riddles.length,
      correctAnswers: correctCount,
      incorrectAnswers: riddles.length - correctCount,
      tags: ['Logic', 'Visual', 'Spatial', 'Pattern']
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
