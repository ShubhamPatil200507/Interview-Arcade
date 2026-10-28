/**
 * Interview Arcade — Game 3: Quantitative Aptitude Quiz
 * Placement assessment standards with dynamic question generation,
 * repetition elimination, formula hints, and mistake revision.
 */

import { APTITUDE_QUESTIONS } from '../data/aptitude-bank.js';
import { QuestionClient } from '../services/question-client.js';
import { progress } from '../services/progress.js';
import { mistakes } from '../services/mistakes.js';
import { audio } from '../services/audio.js';

export function createAptitudeView(params, container) {
  let difficulty = 'all'; // 'all', 'easy', 'medium', 'hard'
  let practiceMode = 'fresh'; // 'fresh', 'revision'
  let selectedCategory = 'all';
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let correctCount = 0;
  let userAnswers = []; // { question, selectedIdx, isCorrect, explanation }
  let showHint = false;
  let timerInterval = null;
  let remainingSeconds = 60;
  let isTimed = false;
  let isComplete = false;
  let sessionStartTime = Date.now();
  let deliveryStats = null;

  const CATEGORIES = [
    'all',
    'Number Series',
    'Percentages',
    'Logical Reasoning',
    'Ratios & Averages',
    'Time & Work',
    'Probability & Permutations',
    'Profit & Loss'
  ];

  async function init() {
    await loadQuestions();
    render();
    bindEvents();
  }

  async function loadQuestions() {
    clearInterval(timerInterval);
    sessionStartTime = Date.now();
    currentIndex = 0;
    score = 0;
    correctCount = 0;
    userAnswers = [];
    showHint = false;
    isComplete = false;

    const diffFilter = difficulty === 'all' ? null : difficulty;
    const catFilter = selectedCategory === 'all' ? null : selectedCategory;

    // Filter fallback bank by category if selected
    let bank = [...APTITUDE_QUESTIONS];
    if (catFilter) {
      bank = bank.filter(q => q.category === catFilter);
      if (bank.length === 0) bank = [...APTITUDE_QUESTIONS];
    }

    const res = await QuestionClient.fetchQuestions({
      gameId: 'aptitude',
      topic: catFilter,
      difficulty: diffFilter,
      count: 5,
      mode: practiceMode,
      fallbackBank: bank
    });

    questions = res.questions || [];
    deliveryStats = res;

    // Ensure questions have options and correct indices
    if (questions.length === 0) {
      questions = [...APTITUDE_QUESTIONS].slice(0, 5);
    }

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

    const qTitle = currentQ.question || currentQ.prompt || '';
    const qCat = currentQ.category || currentQ.topic || 'Quantitative Aptitude';
    const qDiff = (currentQ.difficulty || difficulty).toUpperCase();
    const qOptions = currentQ.options || [];

    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame">
          <!-- Game Header -->
          <div class="game-header-bar">
            <div class="game-title-group">
              <span class="badge badge-accent">Aptitude & Logic</span>
              <h2>Quantitative Aptitude</h2>
            </div>
            <div class="game-controls-bar">
              <div class="difficulty-selector" role="group" aria-label="Game Difficulty">
                <button type="button" class="diff-btn ${difficulty === 'all' ? 'active' : ''}" data-diff="all">All</button>
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

          <!-- Practice Configuration Bar -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-xs); background: var(--color-bg-subtle); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: var(--space-sm);">
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap;">
              <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-ink-muted);">Topic:</span>
              <select id="apt-category-select" style="font-size: var(--font-size-xs); padding: 2px 6px; border-radius: var(--radius-xs); border: 1px solid var(--color-border); background: var(--color-surface);">
                ${CATEGORIES.map(c => `
                  <option value="${c}" ${selectedCategory === c ? 'selected' : ''}>${c === 'all' ? 'All Math Categories' : c}</option>
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

          <!-- Question Card -->
          <div class="aptitude-card">
            <div class="apt-question-header">
              <div>
                <span class="badge badge-accent">${qCat}</span>
                <span class="badge ${qDiff === 'HARD' ? 'badge-hard' : qDiff === 'MEDIUM' ? 'badge-medium' : 'badge-easy'}">
                  ${qDiff}
                </span>
              </div>
              <span style="font-family: var(--font-mono); font-size: var(--font-size-sm); color: var(--color-ink-muted);">
                Question ${currentIndex + 1} of ${questions.length}
              </span>
            </div>

            <div class="apt-question-text">${qTitle}</div>

            ${showHint && currentQ.hint ? `
              <div class="apt-hint-box" role="note">
                <strong>💡 Hint:</strong> ${currentQ.hint}
              </div>
            ` : ''}

            <!-- Options Grid -->
            <div class="apt-options-grid">
              ${qOptions.map((opt, i) => `
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
                    ${ans.question.category || ans.question.topic || 'Aptitude'}
                  </span>
                </div>
                <p><strong>${idx + 1}. ${ans.question.question || ans.question.prompt}</strong></p>
                <p style="font-size: var(--font-size-sm); margin-top: var(--space-2xs);">
                  <strong>Your Answer:</strong> ${ans.question.options ? (ans.question.options[ans.selectedIdx] || 'None (Timed Out)') : ans.selectedIdx}
                </p>
                ${!ans.isCorrect ? `
                  <p style="font-size: var(--font-size-sm); color: var(--color-success);">
                    <strong>Correct Answer:</strong> ${ans.correctAnswerText || (ans.question.options ? ans.question.options[ans.question.correctIndex] : 'Verified Correct Answer')}
                  </p>
                ` : ''}
                <div class="notice-box notice-info" style="margin-top: var(--space-xs); font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-sm);">
                  <span><strong>Explanation:</strong> ${ans.explanation || ans.question.explanation || 'Step-by-step mathematical reasoning verified.'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const playAgainBtn = container.querySelector('#play-apt-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', async () => {
        await loadQuestions();
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
        await loadQuestions();
        render();
        bindEvents();
      });
    });

    container.querySelectorAll('.diff-btn[data-practice]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        practiceMode = e.target.getAttribute('data-practice');
        audio.click();
        await loadQuestions();
        render();
        bindEvents();
      });
    });

    const categorySelect = container.querySelector('#apt-category-select');
    if (categorySelect) {
      categorySelect.addEventListener('change', async (e) => {
        selectedCategory = e.target.value;
        audio.click();
        await loadQuestions();
        render();
        bindEvents();
      });
    }

    const toggleTimerBtn = container.querySelector('#toggle-timer-btn');
    if (toggleTimerBtn) {
      toggleTimerBtn.addEventListener('click', async () => {
        isTimed = !isTimed;
        audio.click();
        await loadQuestions();
        render();
        bindEvents();
      });
    }

    const restartBtn = container.querySelector('#restart-apt-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', async () => {
        audio.click();
        await loadQuestions();
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
      btn.addEventListener('click', async (e) => {
        const selectedIdx = parseInt(e.currentTarget.getAttribute('data-opt-idx'), 10);
        await handleAnswer(selectedIdx);
      });
    });
  }

  async function handleAnswer(selectedIdx) {
    const currentQ = questions[currentIndex];
    const verification = await QuestionClient.verifyAnswer({
      gameId: 'aptitude',
      challengeId: currentQ.id,
      selectedOptionIndex: selectedIdx,
      localQuestion: currentQ
    });

    const isCorrect = verification.isCorrect;
    const explanation = verification.explanation || currentQ.explanation || '';
    const correctAnswerText = verification.correctAnswer || (currentQ.options ? currentQ.options[currentQ.correctIndex] : '');

    userAnswers.push({
      question: currentQ,
      selectedIdx,
      isCorrect,
      explanation,
      correctAnswerText
    });

    if (isCorrect) {
      correctCount += 1;
      const pts = (currentQ.difficulty || difficulty) === 'hard' ? 30 : (currentQ.difficulty || difficulty) === 'medium' ? 20 : 10;
      score += pts;
      audio.correct();
    } else {
      audio.wrong();
      // Record in candidate Mistake Notebook
      mistakes.recordMistake({
        gameId: 'aptitude',
        challengeId: currentQ.id || `apt_${Date.now()}`,
        category: currentQ.category || currentQ.topic || 'Quantitative Aptitude',
        question: currentQ.question || currentQ.prompt || 'Math Problem',
        userAnswer: currentQ.options ? currentQ.options[selectedIdx] : String(selectedIdx),
        correctAnswer: correctAnswerText || (currentQ.options ? currentQ.options[currentQ.correctIndex ?? 0] : 'Correct Solution'),
        explanation: explanation || 'Review quantitative formula.',
        timestamp: Date.now()
      });
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
