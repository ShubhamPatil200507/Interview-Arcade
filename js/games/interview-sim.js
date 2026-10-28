/**
 * Interview Arcade — Placement Interview Simulator Chamber
 * Features behavioral STAR methodology & technical system design scenarios,
 * instant rubric feedback, mistake cataloging, and server-side scoring sync.
 */

import { INTERVIEW_SCENARIOS } from '../data/interview-scenarios.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';
import { mistakes } from '../services/mistakes.js';

export function createInterviewView(params, container) {
  let currentIndex = 0;
  let selectedOptionIndex = null;
  let isAnswerSubmitted = false;
  let sessionStartTime = Date.now();
  let timerInterval = null;
  let timeLeft = 120;
  let totalScoreEarned = 0;
  let scenarioSubmissions = [];
  let loggedMistakes = [];

  function init() {
    currentIndex = 0;
    selectedOptionIndex = null;
    isAnswerSubmitted = false;
    totalScoreEarned = 0;
    scenarioSubmissions = [];
    loggedMistakes = [];
    sessionStartTime = Date.now();
    renderScenario();
  }

  function startTimer() {
    stopTimer();
    const currentScenario = INTERVIEW_SCENARIOS[currentIndex];
    timeLeft = currentScenario.timeLimitSeconds || 120;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        if (!isAnswerSubmitted) {
          handleTimeExpired();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const timerEl = container.querySelector('#scenario-timer');
    if (timerEl) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      timerEl.textContent = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
      if (timeLeft <= 20) {
        timerEl.style.color = 'var(--color-error)';
        timerEl.style.fontWeight = 'bold';
      } else {
        timerEl.style.color = 'inherit';
      }
    }
  }

  function handleTimeExpired() {
    audio.wrong();
    selectedOptionIndex = -1; // No answer selected
    submitAnswer(true);
  }

  function renderScenario() {
    const scenario = INTERVIEW_SCENARIOS[currentIndex];
    const totalCount = INTERVIEW_SCENARIOS.length;
    selectedOptionIndex = null;
    isAnswerSubmitted = false;

    container.innerHTML = `
      <div class="content-container interview-chamber">
        <!-- Header Bar -->
        <div class="game-header-bar" style="margin-bottom: var(--space-md);">
          <div class="game-title-group">
            <span class="badge badge-accent">Mock Interview</span>
            <h2>Behavioral & System Design Simulator</h2>
          </div>
          <div class="game-controls-bar">
            <span id="scenario-timer" class="badge" aria-label="Time Remaining">⏱️ 2:00</span>
            <span class="badge badge-subtle">Scenario ${currentIndex + 1} of ${totalCount}</span>
            <button type="button" id="restart-interview-btn" class="btn btn-sm btn-subtle">Restart</button>
          </div>
        </div>

        <!-- Scenario Brief -->
        <div class="scenario-brief-card">
          <div class="scenario-badge-row">
            <span class="badge badge-primary">${scenario.type === 'behavioral' ? 'STAR Behavioral Round' : 'System Design Round'}</span>
            <span class="badge badge-subtle">${scenario.category}</span>
          </div>
          <h3 style="margin: var(--space-xs) 0 var(--space-sm);">${scenario.title}</h3>
          
          <div class="scenario-situation-box">
            <strong>Situation Brief:</strong><br>
            ${scenario.situation}
          </div>

          <p style="font-weight: bold; font-size: var(--font-size-md); margin-top: var(--space-md); color: var(--color-ink);">
            ${scenario.prompt}
          </p>

          <!-- STAR Rubric Focus Summary -->
          <div class="star-rubric-summary">
            <div class="star-pillar-tag">
              <span class="star-pillar-letter">S</span><strong>Situation:</strong> ${scenario.starRubric.situation.slice(0, 48)}...
            </div>
            <div class="star-pillar-tag">
              <span class="star-pillar-letter">T</span><strong>Task:</strong> ${scenario.starRubric.task.slice(0, 48)}...
            </div>
            <div class="star-pillar-tag">
              <span class="star-pillar-letter">A</span><strong>Action:</strong> ${scenario.starRubric.action.slice(0, 48)}...
            </div>
            <div class="star-pillar-tag">
              <span class="star-pillar-letter">R</span><strong>Result:</strong> ${scenario.starRubric.result.slice(0, 48)}...
            </div>
          </div>
        </div>

        <!-- Candidate Action Options -->
        <div class="scenario-options-grid" role="radiogroup" aria-label="Candidate Strategic Decisions">
          ${scenario.options.map((opt, idx) => `
            <button type="button" class="scenario-option-btn" data-index="${idx}" role="radio" aria-checked="false">
              <span class="option-key-badge">${opt.id}</span>
              <div>
                <div>${opt.text}</div>
              </div>
            </button>
          `).join('')}
        </div>

        <!-- Action Submit Row -->
        <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-bottom: var(--space-xl);">
          <button type="button" id="submit-scenario-btn" class="btn btn-primary" disabled>
            Lock Response (Enter)
          </button>
        </div>

        <!-- Feedback Container (populated upon submission) -->
        <div id="scenario-feedback-area"></div>
      </div>
    `;

    bindScenarioEvents();
    startTimer();
  }

  function bindScenarioEvents() {
    const optionBtns = container.querySelectorAll('.scenario-option-btn');
    const submitBtn = container.querySelector('#submit-scenario-btn');
    const restartBtn = container.querySelector('#restart-interview-btn');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isAnswerSubmitted) return;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        selectedOptionIndex = idx;
        audio.click();

        optionBtns.forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');

        if (submitBtn) {
          submitBtn.disabled = false;
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (selectedOptionIndex !== null && !isAnswerSubmitted) {
          submitAnswer(false);
        }
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        audio.click();
        init();
      });
    }

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (isAnswerSubmitted) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (optionBtns[idx]) optionBtns[idx].click();
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        const map = { a: 0, b: 1, c: 2, d: 3 };
        const idx = map[e.key.toLowerCase()];
        if (optionBtns[idx]) optionBtns[idx].click();
      } else if (e.key === 'Enter' && selectedOptionIndex !== null) {
        submitAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
  }

  function submitAnswer(isTimeout = false) {
    stopTimer();
    isAnswerSubmitted = true;
    const scenario = INTERVIEW_SCENARIOS[currentIndex];
    const isCorrect = selectedOptionIndex === scenario.correctIndex;
    const chosenOption = selectedOptionIndex >= 0 ? scenario.options[selectedOptionIndex] : null;
    const pointsAwarded = chosenOption ? chosenOption.score : 0;
    totalScoreEarned += pointsAwarded;

    // Track submission for server verification
    scenarioSubmissions.push({
      challenge_id: scenario.id,
      selected_option_index: selectedOptionIndex >= 0 ? selectedOptionIndex : -1
    });

    if (isCorrect) {
      audio.correct();
    } else {
      audio.wrong();
      // Record in Mistakes Notebook
      const mistakeRecord = {
        challengeId: scenario.id,
        category: scenario.type === 'behavioral' ? 'Behavioral Interview' : 'System Design',
        title: scenario.title,
        prompt: scenario.situation + '\n\n' + scenario.prompt,
        studentAnswer: chosenOption ? chosenOption.text : 'Time Expired / No Response',
        correctAnswer: scenario.options[scenario.correctIndex].text,
        explanation: scenario.explanation + (chosenOption ? `\nCritique of your choice: ${chosenOption.critique}` : '')
      };
      loggedMistakes.push(mistakeRecord);
      mistakes.recordMistake(mistakeRecord);
    }

    // Update option button styles
    const optionBtns = container.querySelectorAll('.scenario-option-btn');
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === scenario.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedOptionIndex) {
        btn.classList.add('incorrect');
      }
    });

    const submitBtn = container.querySelector('#submit-scenario-btn');
    if (submitBtn) submitBtn.style.display = 'none';

    // Render detailed pedagogical feedback
    const feedbackArea = container.querySelector('#scenario-feedback-area');
    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="scenario-feedback-card ${isCorrect ? 'success-card' : 'error-card'}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
            <h4>${isCorrect ? '✨ Exemplary Engineering Decision (+100 pts)' : `⚠️ Suboptimal Approach (${pointsAwarded} pts)`}</h4>
            <span class="badge ${isCorrect ? 'badge-accent' : 'badge-subtle'}">
              Score: ${pointsAwarded} / 100
            </span>
          </div>

          <p style="margin-bottom: var(--space-md); line-height: 1.6;">
            ${chosenOption ? chosenOption.critique : 'Time expired before response was submitted.'}
          </p>

          <div style="background: var(--color-bg-subtle); padding: var(--space-md); border-radius: var(--radius-sm); margin-bottom: var(--space-md); border: 1px solid var(--color-border);">
            <strong>Interview Strategy & Key Takeaways:</strong>
            <p style="margin-top: 4px; font-size: var(--font-size-sm);">${scenario.explanation}</p>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="button" id="next-scenario-btn" class="btn btn-primary">
              ${currentIndex + 1 < INTERVIEW_SCENARIOS.length ? 'Next Scenario ➔' : 'Complete Interview & View Scorecard ➔'}
            </button>
          </div>
        </div>
      `;

      const nextBtn = feedbackArea.querySelector('#next-scenario-btn');
      if (nextBtn) {
        nextBtn.focus();
        nextBtn.addEventListener('click', () => {
          audio.click();
          if (currentIndex + 1 < INTERVIEW_SCENARIOS.length) {
            currentIndex++;
            renderScenario();
          } else {
            renderFinalScorecard();
          }
        });
      }
    }
  }

  function renderFinalScorecard() {
    stopTimer();
    const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const totalPossible = INTERVIEW_SCENARIOS.length * 100;
    const percentage = Math.round((totalScoreEarned / totalPossible) * 100);
    const correctCount = INTERVIEW_SCENARIOS.length - loggedMistakes.length;

    // Determine Placement Hire Rating
    let ratingTier = 'Needs Technical Preparation';
    let ratingBadgeClass = 'badge-subtle';
    if (percentage >= 85) {
      ratingTier = 'Strong Hire (Senior / L5 Readiness)';
      ratingBadgeClass = 'badge-accent';
    } else if (percentage >= 70) {
      ratingTier = 'Hire (Mid-Level / L4 Placement)';
      ratingBadgeClass = 'badge-primary';
    } else if (percentage >= 50) {
      ratingTier = 'Borderline / Leaning Hire (Associate)';
      ratingBadgeClass = 'badge-subtle';
    }

    if (percentage >= 70) {
      audio.win();
    } else {
      audio.wrong();
    }

    // Persist session to local engine and trigger server sync
    progress.recordSession({
      gameId: 'interview',
      gameTitle: 'Placement Interview Simulator',
      difficulty: 'hard',
      durationSeconds: duration,
      score: totalScoreEarned,
      maxScore: totalPossible,
      questionsAnswered: INTERVIEW_SCENARIOS.length,
      correctAnswers: correctCount,
      incorrectAnswers: loggedMistakes.length,
      tags: ['Behavioral', 'System Design', 'STAR'],
      answers: scenarioSubmissions,
      mistakes: loggedMistakes
    });

    container.innerHTML = `
      <div class="content-container interview-chamber">
        <div class="card" style="text-align: center; padding: var(--space-2xl) var(--space-lg); max-width: 720px; margin: 0 auto;">
          <span style="font-size: 3.5rem;">🎙️</span>
          <h2 style="margin: var(--space-sm) 0;">Interview Simulation Complete</h2>
          <p style="margin-bottom: var(--space-md); color: var(--color-ink-muted);">
            Evaluation complete across ${INTERVIEW_SCENARIOS.length} behavioral and architectural design scenarios.
          </p>

          <div style="margin: var(--space-lg) 0;">
            <span class="badge ${ratingBadgeClass}" style="font-size: var(--font-size-md); padding: var(--space-xs) var(--space-md);">
              ${ratingTier}
            </span>
          </div>

          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: var(--space-xl);">
            <div class="stat-tile">
              <span class="stat-label">Interview Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${percentage}%</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Scenarios Solved</span>
              <span class="stat-value">${correctCount} / ${INTERVIEW_SCENARIOS.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Total Duration</span>
              <span class="stat-value">${Math.floor(duration / 60)}m ${duration % 60}s</span>
            </div>
          </div>

          ${loggedMistakes.length > 0 ? `
            <div style="background: rgba(224, 86, 38, 0.08); border: 1px solid var(--color-accent); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-lg); text-align: left;">
              <strong>📝 ${loggedMistakes.length} Review Items Saved</strong>
              <p style="font-size: var(--font-size-sm); margin-top: 4px;">
                Your suboptimal choices have been cataloged in your <strong>Mistake Notebook</strong> so you can retest concepts and strengthen your interview responses.
              </p>
            </div>
          ` : `
            <div style="background: rgba(34, 139, 34, 0.08); border: 1px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-lg);">
              <strong>🌟 Flawless Simulation Round!</strong>
              <p style="font-size: var(--font-size-sm); margin-top: 4px;">
                You demonstrated exemplary senior engineering maturity and architectural reasoning.
              </p>
            </div>
          `}

          <div style="display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
            <button type="button" id="retake-interview-btn" class="btn btn-primary">Retake Simulation</button>
            <a href="#/mistakes" class="btn btn-subtle">Review Mistakes (${loggedMistakes.length})</a>
            <a href="#/dashboard" class="btn btn-subtle">View Updated Mastery</a>
          </div>
        </div>
      </div>
    `;

    const retakeBtn = container.querySelector('#retake-interview-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        audio.click();
        init();
      });
    }
  }

  init();

  return {
    destroy: () => {
      stopTimer();
    }
  };
}
