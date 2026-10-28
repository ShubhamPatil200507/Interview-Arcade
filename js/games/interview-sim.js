/**
 * Interview Arcade — Placement Interview Simulator Chamber
 * Features candidate-authored STAR responses, deep AI rubric evaluation,
 * strengths & omission detection, benchmark mentor exemplars, and learning path linkages.
 */

import { INTERVIEW_SCENARIOS } from '../data/interview-scenarios.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';
import { mistakes } from '../services/mistakes.js';
import { api } from '../services/api-client.js';

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
  let lastAiEvaluation = null;

  function init() {
    currentIndex = 0;
    selectedOptionIndex = null;
    isAnswerSubmitted = false;
    totalScoreEarned = 0;
    scenarioSubmissions = [];
    loggedMistakes = [];
    lastAiEvaluation = null;
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
    selectedOptionIndex = -1;
    submitAnswer(true);
  }

  function renderScenario() {
    const scenario = INTERVIEW_SCENARIOS[currentIndex];
    const totalCount = INTERVIEW_SCENARIOS.length;
    selectedOptionIndex = null;
    isAnswerSubmitted = false;
    lastAiEvaluation = null;

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
        </div>

        <!-- Strategic Direction Options -->
        <div style="margin-top: var(--space-md); margin-bottom: var(--space-xs);">
          <label style="font-weight: bold; font-size: var(--font-size-sm); color: var(--color-ink);">
            Option A-D: Select Strategic Approach
          </label>
        </div>
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

        <!-- Candidate Voice & Open-Ended Drafting Box -->
        <div class="card" style="margin-top: var(--space-md); margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: 4px;">
            <label for="candidate-draft-text" style="font-weight: bold; font-size: var(--font-size-sm); color: var(--color-ink);">
              🎙️ Candidate Voice: Elaborate or Draft Your Answer
            </label>
            <span class="badge badge-subtle" style="font-size: var(--font-size-xs);">Evaluated by AI Rubric</span>
          </div>
          <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin-bottom: var(--space-xs); line-height: 1.4;">
            Articulate your engineering actions, metrics, and trade-offs. You can edit this text or select an option above to prefill.
          </p>
          <textarea id="candidate-draft-text" rows="4" style="width: 100%; box-sizing: border-box; padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: var(--font-size-sm); resize: vertical; line-height: 1.5;" placeholder="Draft your response using the STAR framework: Situation, Task, Action, and quantifiable Result (e.g., latency reduction, zero data loss)..."></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-xs);">
            <span id="draft-word-count" style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">0 words</span>
            <span style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">Tip: Cite specific numbers, tools, and trade-offs.</span>
          </div>
        </div>

        <!-- Action Submit Row -->
        <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-bottom: var(--space-xl); flex-wrap: wrap;">
          <button type="button" id="submit-scenario-btn" class="btn btn-primary" disabled>
            ✨ Submit & Evaluate with AI
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
    const draftTextarea = container.querySelector('#candidate-draft-text');
    const wordCountSpan = container.querySelector('#draft-word-count');

    function updateWordCount() {
      if (!draftTextarea || !wordCountSpan) return;
      const text = draftTextarea.value.trim();
      const count = text ? text.split(/\s+/).length : 0;
      wordCountSpan.textContent = `${count} word${count === 1 ? '' : 's'}`;
      if (count >= 3 && submitBtn && !isAnswerSubmitted) {
        submitBtn.disabled = false;
      }
    }

    if (draftTextarea) {
      draftTextarea.addEventListener('input', updateWordCount);
    }

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
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

        // Prefill draft text if empty or previous option text
        const scenario = INTERVIEW_SCENARIOS[currentIndex];
        const chosen = scenario.options[idx];
        if (draftTextarea && chosen) {
          draftTextarea.value = chosen.text;
          updateWordCount();
        }

        if (submitBtn) {
          submitBtn.disabled = false;
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!isAnswerSubmitted) {
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
  }

  async function submitAnswer(isTimeout = false) {
    stopTimer();
    isAnswerSubmitted = true;
    const scenario = INTERVIEW_SCENARIOS[currentIndex];
    const draftTextarea = container.querySelector('#candidate-draft-text');
    const userText = draftTextarea ? draftTextarea.value.trim() : '';

    const isCorrect = selectedOptionIndex === scenario.correctIndex;
    const chosenOption = selectedOptionIndex >= 0 ? scenario.options[selectedOptionIndex] : null;
    const pointsAwarded = chosenOption ? chosenOption.score : (userText.length > 50 ? 70 : 30);
    totalScoreEarned += pointsAwarded;

    // Track submission for server verification
    scenarioSubmissions.push({
      challenge_id: scenario.id,
      selected_option_index: selectedOptionIndex >= 0 ? selectedOptionIndex : -1
    });

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
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.display = 'none';
    }

    const feedbackArea = container.querySelector('#scenario-feedback-area');
    if (feedbackArea) {
      feedbackArea.innerHTML = `
        <div class="card" style="padding: var(--space-lg); text-align: center; border: 1px solid var(--color-border);">
          <div style="display: inline-block; margin-bottom: var(--space-xs);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          </div>
          <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted);">AI Evaluation Engine analyzing response structure, technical depth, and omissions...</p>
        </div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
      `;
    }

    // Call real AI evaluation endpoint
    let aiEvaluation = null;
    try {
      aiEvaluation = await api.evaluateResponse({
        scenario_id: scenario.id,
        scenario_title: scenario.title,
        scenario_type: scenario.type,
        prompt: scenario.prompt,
        user_response: userText || (chosenOption ? chosenOption.text : 'No response provided (timed out).')
      });
      lastAiEvaluation = aiEvaluation;
    } catch (err) {
      console.warn('AI evaluation endpoint fallback:', err);
      // Fallback object in case server is unreachable
      aiEvaluation = {
        scenario_id: scenario.id,
        scenario_title: scenario.title,
        overall_score: pointsAwarded,
        evaluation_mode: 'client_fallback',
        technical_accuracy: isCorrect ? 90 : 50,
        communication_clarity: 70,
        rubric_scores: { "Approach": pointsAwarded },
        strengths: isCorrect ? ["Chose the optimal engineering strategy."] : ["Attempted the challenge."],
        omissions_and_gaps: isCorrect ? [] : ["Could strengthen data-backed metrics and architectural trade-offs."],
        improvement_advice: scenario.explanation,
        exemplar_answer: scenario.options[scenario.correctIndex].text,
        target_competency: scenario.category,
        recommended_next_action: "Review recommended modules on your dashboard."
      };
    }

    if (isCorrect || (aiEvaluation && aiEvaluation.overall_score >= 70)) {
      audio.correct();
    } else {
      audio.wrong();
      // Record in Mistakes Notebook
      const mistakeRecord = {
        challengeId: scenario.id,
        category: scenario.type === 'behavioral' ? 'Behavioral Interview' : 'System Design',
        title: scenario.title,
        prompt: scenario.situation + '\n\n' + scenario.prompt,
        studentAnswer: userText || (chosenOption ? chosenOption.text : 'Time Expired / No Response'),
        correctAnswer: scenario.options[scenario.correctIndex].text,
        explanation: scenario.explanation + (aiEvaluation.omissions_and_gaps.length > 0 ? `\nCritical Gaps: ${aiEvaluation.omissions_and_gaps.join('; ')}` : '')
      };
      loggedMistakes.push(mistakeRecord);
      mistakes.recordMistake(mistakeRecord);
    }

    renderFeedbackCard(aiEvaluation, scenario, chosenOption, isCorrect, pointsAwarded);
  }

  function renderFeedbackCard(aiEval, scenario, chosenOption, isCorrect, pointsAwarded) {
    const feedbackArea = container.querySelector('#scenario-feedback-area');
    if (!feedbackArea) return;

    const isLlm = aiEval.evaluation_mode === 'gemini_llm';

    feedbackArea.innerHTML = `
      <div class="scenario-feedback-card ${aiEval.overall_score >= 70 ? 'success-card' : 'error-card'}" style="margin-top: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); background: var(--color-surface); box-shadow: var(--shadow-tactile-sm);">
        <!-- Header Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="badge ${isLlm ? 'badge-accent' : 'badge-subtle'}" style="margin-bottom: 4px;">
              ${isLlm ? '✨ Gemini AI Evaluation' : '⚙️ Semantic Heuristic Evaluation'}
            </span>
            <h3 style="margin: 4px 0 0; color: var(--color-ink);">
              ${aiEval.overall_score >= 80 ? '🌟 Strong Placement Answer' : aiEval.overall_score >= 60 ? '⚡ Good Baseline, Gaps Identified' : '⚠️ Suboptimal Response'}
            </h3>
          </div>
          <div style="text-align: right;">
            <span style="font-size: var(--font-size-2xl); font-weight: 900; color: ${aiEval.overall_score >= 70 ? 'var(--color-success)' : 'var(--color-accent)'};">
              ${aiEval.overall_score} / 100
            </span>
            <div style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">Assessment Score</div>
          </div>
        </div>

        <!-- Strengths Section -->
        <div style="margin-bottom: var(--space-sm);">
          <strong style="color: var(--color-success); font-size: var(--font-size-sm);">✓ Demonstrated Strengths:</strong>
          <ul style="margin: 4px 0 0 var(--space-md); font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-ink);">
            ${aiEval.strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <!-- Critical Omissions & Gaps -->
        ${aiEval.omissions_and_gaps.length > 0 ? `
          <div style="margin-bottom: var(--space-md); background: rgba(224, 86, 38, 0.05); padding: var(--space-sm); border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent);">
            <strong style="color: var(--color-accent); font-size: var(--font-size-sm);">⚠️ Critical Gaps & Missing Trade-Offs:</strong>
            <ul style="margin: 4px 0 0 var(--space-md); font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-ink);">
              ${aiEval.omissions_and_gaps.map(g => `<li>${g}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Actionable Improvement Coaching -->
        <div style="background: var(--color-bg-subtle); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-sm); margin-bottom: var(--space-md); border: 1px solid var(--color-border);">
          <strong style="font-size: var(--font-size-sm);">Coach's Takeaway:</strong>
          <p style="margin: 4px 0 0; font-size: var(--font-size-sm); color: var(--color-ink); line-height: 1.5;">${aiEval.improvement_advice}</p>
        </div>

        <!-- Collapsible Mentor Benchmark Exemplar -->
        <details style="margin-bottom: var(--space-lg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-sm); background: var(--color-surface);">
          <summary style="font-weight: bold; font-size: var(--font-size-sm); cursor: pointer; color: var(--color-primary);">
            💡 View Mentor Benchmark Exemplar Answer (Click to Expand)
          </summary>
          <div style="margin-top: var(--space-sm); font-size: var(--font-size-sm); line-height: 1.6; white-space: pre-line; color: var(--color-ink); background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-xs);">
            ${aiEval.exemplar_answer}
          </div>
        </details>

        <!-- Recommended Next Action Strip -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--color-border);">
          <div style="font-size: var(--font-size-xs); color: var(--color-ink-muted); max-width: 400px;">
            <strong>Target Competency:</strong> ${aiEval.target_competency}<br>
            <strong>Recommended Next:</strong> ${aiEval.recommended_next_action}
          </div>
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

  function renderFinalScorecard() {
    stopTimer();
    const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    const totalPossible = INTERVIEW_SCENARIOS.length * 100;
    const percentage = Math.round((totalScoreEarned / totalPossible) * 100);
    const correctCount = INTERVIEW_SCENARIOS.length - loggedMistakes.length;

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
      tags: ['Behavioral', 'System Design', 'STAR', 'AI-Evaluated'],
      answers: scenarioSubmissions,
      mistakes: loggedMistakes
    });

    container.innerHTML = `
      <div class="content-container interview-chamber">
        <div class="card" style="text-align: center; padding: var(--space-2xl) var(--space-lg); max-width: 720px; margin: 0 auto; border: 1px solid var(--color-border); box-shadow: var(--shadow-tactile-sm);">
          <span style="font-size: 3.5rem;">🎙️</span>
          <h2 style="margin: var(--space-sm) 0;">Interview Simulation Complete</h2>
          <p style="margin-bottom: var(--space-md); color: var(--color-ink-muted);">
            Evaluation complete across ${INTERVIEW_SCENARIOS.length} behavioral and architectural design rounds.
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
              <span class="stat-label">Rounds Cleared</span>
              <span class="stat-value">${correctCount} / ${INTERVIEW_SCENARIOS.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Total Duration</span>
              <span class="stat-value">${Math.floor(duration / 60)}m ${duration % 60}s</span>
            </div>
          </div>

          ${loggedMistakes.length > 0 ? `
            <div style="background: rgba(224, 86, 38, 0.08); border: 1px solid var(--color-accent); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-lg); text-align: left;">
              <strong>📝 ${loggedMistakes.length} Review Items Saved to Notebook</strong>
              <p style="font-size: var(--font-size-sm); margin-top: 4px; color: var(--color-ink);">
                Suboptimal decisions have been logged in your <strong>Mistakes Notebook</strong> with model critiques and mentor exemplars so you can review before your real interview.
              </p>
            </div>
          ` : `
            <div style="background: rgba(34, 139, 34, 0.08); border: 1px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--space-md); margin-bottom: var(--space-lg);">
              <strong>🌟 Flawless Simulation Round!</strong>
              <p style="font-size: var(--font-size-sm); margin-top: 4px; color: var(--color-ink);">
                Exemplary performance across architecture trade-offs, crisis management, and STAR communication.
              </p>
            </div>
          `}

          <div style="display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
            <button type="button" id="retake-interview-btn" class="btn btn-primary">Retake Simulation</button>
            <a href="#/dashboard" class="btn btn-subtle">View Personalized Learning Roadmap ➔</a>
            ${loggedMistakes.length > 0 ? `<a href="#/mistakes" class="btn btn-subtle">Review Mistakes (${loggedMistakes.length})</a>` : ''}
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
