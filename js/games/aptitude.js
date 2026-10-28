/**
 * Interview Arcade — Game 3: Quantitative Aptitude Quiz
 * Timed/untimed placement assessment with hints, math explanations, and session logging.
 */

import { APTITUDE_QUESTIONS } from '../data/aptitude-bank.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export function createAptitudeView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let userAnswers = []; // { question, selectedIdx, isCorrect }
  let showHint = false;
  let timerInterval = null;
  let remainingSeconds = 60;
  let isTimed = false;
  let isComplete = false;
  let sessionStartTime = Date.now();

  function init() {
    setupQuiz();
    render();
    bindEvents();
  }

  function setupQuiz() {
    clearInterval(timerInterval);
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    userAnswers = [];
    showHint = false;
    isComplete = false;

    let pool = [...APTITUDE_QUESTIONS];
    if (difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }
    // Shuffle pool and select up to 5 questions
    pool.sort(() => Math.random() - 0.5);
    questions = pool.slice(0, 5);

    if (isTimed) {
      remainingSeconds = questions.length * 30; // 30s per question
      startTimer();
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds -= 1;
      const timerEl = container.querySelector('#apt-timer-val');
      if (timerEl) {
        timerEl.textContent = `${remainingSeconds}s`;
        if (remainingSeconds <= 10) {
          timerEl.style.color = 'var(--color-error)';
        }
      }
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        handleQuizComplete();
      }
    }, 1000);
  }

  function render() {
    if (isComplete) {
      renderSummary();
      return;
    }

    const currentQ = questions[currentIndex];
    if (!currentQ) {
      handleQuizComplete();
      return;
    }

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Game 03</span>
              <h2>Quantitative Aptitude</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'all' ? 'active' : ''}" data-diff="all">All Levels</button>
                <button type="button" class="diff-btn ${difficulty === 'easy' ? 'active' : ''}" data-diff="easy">Easy</button>
                <button type="button" class="diff-btn ${difficulty === 'medium' ? 'active' : ''}" data-diff="medium">Medium</button>
                <button type="button" class="diff-btn ${difficulty === 'hard' ? 'active' : ''}" data-diff="hard">Hard</button>
              </div>
              <button type="button" id="toggle-timer-btn" class="btn btn-sm btn-subtle">
                ${isTimed ? 'Timer: ON (' + remainingSeconds + 's)' : 'Timer: OFF (Practice)'}
              </button>
              <button type="button" id="restart-apt-btn" class="btn btn-sm btn-subtle">Restart</button>
            </div>
          </div>

          <!-- Question Card -->
          <div class="aptitude-card">
            <div class="apt-question-header">
              <div>
                <span class="badge badge-accent">${currentQ.category}</span>
                <span class="badge ${currentQ.difficulty === 'hard' ? 'badge-hard' : currentQ.difficulty === 'medium' ? 'badge-medium' : 'badge-easy'}">
                  ${currentQ.difficulty.toUpperCase()}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-sm); color: var(--color-ink-muted);">
                Question ${currentIndex + 1} of ${questions.length}
              </span>
            </div>

            <div class="apt-question-text">${currentQ.question}</div>

            ${showHint ? `
              <div class="apt-hint-box" role="note">
                <strong>💡 Hint:</strong> ${currentQ.hint}
              </div>
            ` : ''}

            <!-- Options Grid -->
            <div class="apt-options-grid">
              ${currentQ.options.map((opt, i) => `
                <button type="button" class="apt-option-btn" data-opt-idx="${i}">
                  <span class="badge" style="background-color: var(--color-surface);">${String.fromCharCode(65 + i)}</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>

            <!-- Card Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-sm); border-top: var(--border-width-sm) solid var(--color-border); padding-top: var(--space-sm);">
              <button type="button" id="hint-toggle-btn" class="btn btn-subtle btn-sm">
                ${showHint ? 'Hide Hint' : '💡 Show Formula Hint'}
              </button>
              <span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">
                Current Score: ${score} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSummary() {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <div class="game-header-bar">
            <h2>Aptitude Round Summary</h2>
            <button type="button" id="play-apt-again" class="btn btn-primary btn-sm">Start New Round</button>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-top: var(--space-md);">
            <div class="stat-tile">
              <span class="stat-label">Final Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${score} pts</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value" style="color: var(--color-success);">${accuracy}%</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Correct Answers</span>
              <span class="stat-value">${correctCount} / ${questions.length}</span>
            </div>
          </div>

          <div style="margin-top: var(--space-lg);">
            <h3 style="margin-bottom: var(--space-sm);">Detailed Review & Solutions</h3>
            ${userAnswers.map((ans, idx) => `
              <div class="card" style="margin-bottom: var(--space-sm); border-color: ${ans.isCorrect ? 'var(--color-success)' : 'var(--color-error)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xs);">
                  <span class="badge ${ans.isCorrect ? 'badge-easy' : 'badge-hard'}">
                    ${ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                    ${ans.question.category}
                  </span>
                </div>
                <p><strong>${idx + 1}. ${ans.question.question}</strong></p>
                <p style="font-size: var(--font-size-sm); margin-top: var(--space-2xs);">
                  <strong>Your Answer:</strong> ${ans.question.options[ans.selectedIdx] || 'None (Timed Out)'}
                </p>
                ${!ans.isCorrect ? `
                  <p style="font-size: var(--font-size-sm); color: var(--color-success);">
                    <strong>Correct Answer:</strong> ${ans.question.options[ans.question.correctIndex]}
                  </p>
                ` : ''}
                <div class="notice-box notice-info" style="margin-top: var(--space-xs); font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-sm);">
                  <span><strong>Explanation:</strong> ${ans.question.explanation}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-apt-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        setupQuiz();
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
        setupQuiz();
        render();
        bindEvents();
      });
    });

    const toggleTimerBtn = container.querySelector('#toggle-timer-btn');
    if (toggleTimerBtn) {
      toggleTimerBtn.addEventListener('click', () => {
        isTimed = !isTimed;
        audio.click();
        setupQuiz();
        render();
        bindEvents();
      });
    }

    const restartBtn = container.querySelector('#restart-apt-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        setupQuiz();
        render();
        bindEvents();
      });
    }

    const hintBtn = container.querySelector('#hint-toggle-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        showHint = !showHint;
        audio.click();
        render();
        bindEvents();
      });
    }

    container.querySelectorAll('.apt-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        handleAnswer(selectedIdx);
      });
    });
  }

  function handleAnswer(selectedIdx) {
    const currentQ = questions[currentIndex];
    const isCorrect = selectedIdx === currentQ.correctIndex;

    userAnswers.push({
      question: currentQ,
      selectedIdx,
      isCorrect
    });

    if (isCorrect) {
      correctCount += 1;
      const pts = currentQ.difficulty === 'hard' ? 30 : currentQ.difficulty === 'medium' ? 20 : 10;
      score += pts;
      audio.correct();
    } else {
      audio.wrong();
    }

    currentIndex += 1;
    showHint = false;

    if (currentIndex >= questions.length) {
      handleQuizComplete();
    } else {
      render();
      bindEvents();
    }
  }

  function handleQuizComplete() {
    clearInterval(timerInterval);
    isComplete = true;
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);
    const maxScore = questions.length * 20;

    progress.recordSession({
      gameId: 'aptitude',
      gameTitle: 'Quantitative Aptitude',
      difficulty,
      durationSeconds: duration,
      score,
      maxScore,
      questionsAnswered: userAnswers.length,
      correctAnswers: correctCount,
      incorrectAnswers: userAnswers.length - correctCount,
      tags: ['Aptitude', 'Math', 'Reasoning']
    });

    if (correctCount === questions.length && questions.length > 0) {
      audio.win();
    }

    render();
  }

  init();

  return {
    destroy: () => {
      clearInterval(timerInterval);
    }
  };
}
