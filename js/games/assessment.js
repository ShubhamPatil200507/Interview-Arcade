/**
 * Interview Arcade — Diagnostic Skill Assessment Chamber
 * Rapid 5-question multi-domain assessment calibrating student baseline mastery,
 * generating skill radar breakdown, and recommending career tracks.
 */

import { DIAGNOSTIC_QUESTIONS } from '../data/diagnostic-questions.js';
import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';
import { api } from '../services/api-client.js';
import { mistakes } from '../services/mistakes.js';

export function createAssessmentView(params, container) {
  let currentIndex = 0;
  let selectedOptionIndex = null;
  let sessionStartTime = Date.now();
  let timerInterval = null;
  let timeLeft = 180; // 3 minutes
  let studentSubmissions = [];
  let userAnswers = []; // stores indices or -1
  let loggedMistakes = [];

  function init() {
    currentIndex = 0;
    selectedOptionIndex = null;
    studentSubmissions = [];
    userAnswers = [];
    loggedMistakes = [];
    sessionStartTime = Date.now();
    startTimer();
    renderQuestion();
  }

  function startTimer() {
    stopTimer();
    timeLeft = 180;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        autoSubmitRemaining();
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
    const timerEl = container.querySelector('#diag-timer');
    if (timerEl) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      timerEl.textContent = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
      if (timeLeft <= 30) {
        timerEl.style.color = 'var(--color-error)';
        timerEl.style.fontWeight = 'bold';
      }
    }
  }

  function autoSubmitRemaining() {
    audio.wrong();
    while (currentIndex < DIAGNOSTIC_QUESTIONS.length) {
      const q = DIAGNOSTIC_QUESTIONS[currentIndex];
      userAnswers.push(-1);
      studentSubmissions.push({
        challenge_id: q.id,
        selected_option_index: -1
      });
      const mistake = {
        challengeId: q.id,
        category: q.domain,
        title: `Diagnostic: ${q.domain}`,
        prompt: q.prompt,
        studentAnswer: 'Unanswered / Time Expired',
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation
      };
      loggedMistakes.push(mistake);
      mistakes.recordMistake(mistake);
      currentIndex++;
    }
    renderReportCard();
  }

  function renderQuestion() {
    const q = DIAGNOSTIC_QUESTIONS[currentIndex];
    const totalCount = DIAGNOSTIC_QUESTIONS.length;
    const progressPercent = Math.round(((currentIndex) / totalCount) * 100);
    selectedOptionIndex = null;

    container.innerHTML = `
      <div class="content-container assessment-container">
        <!-- Header Bar -->
        <div class="game-header-bar" style="margin-bottom: var(--space-sm);">
          <div class="game-title-group">
            <span class="badge badge-accent">Evaluation</span>
            <h2>Diagnostic Skill Assessment</h2>
          </div>
          <div class="game-controls-bar">
            <span id="diag-timer" class="badge" aria-label="Time Remaining">⏱️ 3:00</span>
            <span class="badge badge-subtle">Question ${currentIndex + 1} of ${totalCount}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="diag-progress-bar-wrap" aria-label="Assessment Progress">
          <div class="diag-progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>

        <!-- Question Card -->
        <div class="diag-question-card">
          <span class="diag-domain-badge">${q.domain}</span>
          <h3 style="font-size: var(--font-size-md); line-height: 1.6; margin-top: var(--space-xs);">
            ${q.prompt}
          </h3>

          <div class="diag-options-list" role="radiogroup" aria-label="Diagnostic answer options">
            ${q.options.map((opt, idx) => `
              <button type="button" class="diag-option-btn" data-index="${idx}" role="radio" aria-checked="false">
                <span class="option-key-badge">${['A', 'B', 'C', 'D'][idx]}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: var(--space-xl);">
            <button type="button" id="diag-submit-btn" class="btn btn-primary" disabled>
              ${currentIndex + 1 < totalCount ? 'Next Question ➔' : 'Complete Assessment & Calibrate ➔'}
            </button>
          </div>
        </div>
      </div>
    `;

    bindQuestionEvents();
  }

  function bindQuestionEvents() {
    const optionBtns = container.querySelectorAll('.diag-option-btn');
    const submitBtn = container.querySelector('#diag-submit-btn');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        selectedOptionIndex = idx;
        audio.click();

        optionBtns.forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');

        if (submitBtn) submitBtn.disabled = false;
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (selectedOptionIndex === null) return;
        handleQuestionSubmit();
      });
    }

    // Keyboard support: 1-4 or A-D
    const handleKeyDown = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (optionBtns[idx]) optionBtns[idx].click();
      } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
        const map = { a: 0, b: 1, c: 2, d: 3 };
        const idx = map[e.key.toLowerCase()];
        if (optionBtns[idx]) optionBtns[idx].click();
      } else if (e.key === 'Enter' && selectedOptionIndex !== null) {
        handleQuestionSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { once: true });
  }

  function handleQuestionSubmit() {
    const q = DIAGNOSTIC_QUESTIONS[currentIndex];
    const isCorrect = selectedOptionIndex === q.correctIndex;
    userAnswers.push(selectedOptionIndex);

    studentSubmissions.push({
      challenge_id: q.id,
      selected_option_index: selectedOptionIndex
    });

    if (!isCorrect) {
      const mistake = {
        challengeId: q.id,
        category: q.domain,
        title: `Diagnostic: ${q.domain}`,
        prompt: q.prompt,
        studentAnswer: selectedOptionIndex >= 0 ? q.options[selectedOptionIndex] : 'None',
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation
      };
      loggedMistakes.push(mistake);
      mistakes.recordMistake(mistake);
    }

    if (currentIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      currentIndex++;
      renderQuestion();
    } else {
      stopTimer();
      renderReportCard();
    }
  }

  function renderReportCard() {
    stopTimer();
    const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    let correctCount = 0;
    const domainScores = {};

    DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const isCorrect = ans === q.correctIndex;
      if (isCorrect) correctCount++;
      domainScores[q.skill] = isCorrect ? 100 : 0;
    });

    const totalScore = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100);

    // Determine Role Recommendation based on genuine domain strengths
    let recommendedRole = 'backend';
    let roleTitle = 'Core Backend & Distributed Systems';
    let roleReason = 'Demonstrated strong aptitude in database architecture, dynamic dispatch, and algorithmic reasoning.';

    if (domainScores.systems === 100 && domainScores.dsa === 100) {
      recommendedRole = 'systems';
      roleTitle = 'Systems & Embedded Software Engineer';
      roleReason = 'High proficiency in C++ memory management, low-level pointers, and algorithmic runtime bounds.';
    } else if (domainScores.sql === 100 && domainScores.aptitude === 100) {
      recommendedRole = 'data';
      roleTitle = 'Data Engineering & Analytics';
      roleReason = 'Exceptional grasp of relational grouping, aggregate filtering, and quantitative mathematics.';
    } else if (domainScores.oop === 100 && domainScores.sql === 100) {
      recommendedRole = 'backend';
      roleTitle = 'Core Backend & Distributed Systems';
      roleReason = 'Strong foundational alignment with server architectures, relational schema design, and OOP principles.';
    } else {
      recommendedRole = 'fullstack';
      roleTitle = 'Full Stack Application Engineer';
      roleReason = 'Balanced multi-domain versatility across OOP components, SQL queries, and general logic.';
    }

    if (totalScore >= 60) {
      audio.win();
    } else {
      audio.wrong();
    }

    // Persist session and sync with backend
    progress.recordSession({
      gameId: 'assessment',
      gameTitle: 'Diagnostic Skill Assessment',
      difficulty: 'medium',
      durationSeconds: duration,
      score: totalScore,
      maxScore: 100,
      questionsAnswered: DIAGNOSTIC_QUESTIONS.length,
      correctAnswers: correctCount,
      incorrectAnswers: DIAGNOSTIC_QUESTIONS.length - correctCount,
      tags: ['Diagnostic', 'Assessment', 'Placement'],
      answers: studentSubmissions,
      mistakes: loggedMistakes
    });

    container.innerHTML = `
      <div class="content-container assessment-container">
        <div class="card" style="text-align: center; padding: var(--space-2xl) var(--space-lg); max-width: 740px; margin: 0 auto;">
          <span style="font-size: 3.5rem;">📊</span>
          <h2 style="margin: var(--space-sm) 0;">Diagnostic Calibration Complete</h2>
          <p style="color: var(--color-ink-muted); margin-bottom: var(--space-lg);">
            Completed in ${Math.floor(duration / 60)}m ${duration % 60}s. Your baseline competency profile has been established.
          </p>

          <!-- Overall Score Tile -->
          <div class="grid-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: var(--space-lg);">
            <div class="stat-tile">
              <span class="stat-label">Baseline Score</span>
              <span class="stat-value" style="color: var(--color-accent);">${totalScore}%</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Verified Correct</span>
              <span class="stat-value">${correctCount} / ${DIAGNOSTIC_QUESTIONS.length}</span>
            </div>
            <div class="stat-tile">
              <span class="stat-label">Mistakes Logged</span>
              <span class="stat-value" style="color: var(--color-error);">${loggedMistakes.length}</span>
            </div>
          </div>

          <!-- Domain Competency Breakdown -->
          <h3 style="margin-bottom: var(--space-xs); text-align: left;">Domain Competency Breakdown</h3>
          <div class="diag-radar-grid">
            <div class="diag-radar-col">
              <span style="font-size: var(--font-size-xs); font-weight: bold;">OOP Design</span>
              <div style="font-size: var(--font-size-lg); font-weight: 900; color: ${domainScores.oop ? 'var(--color-success)' : 'var(--color-error)'};">
                ${domainScores.oop ? '100%' : '0%'}
              </div>
            </div>
            <div class="diag-radar-col">
              <span style="font-size: var(--font-size-xs); font-weight: bold;">SQL / DB</span>
              <div style="font-size: var(--font-size-lg); font-weight: 900; color: ${domainScores.sql ? 'var(--color-success)' : 'var(--color-error)'};">
                ${domainScores.sql ? '100%' : '0%'}
              </div>
            </div>
            <div class="diag-radar-col">
              <span style="font-size: var(--font-size-xs); font-weight: bold;">DSA & Big-O</span>
              <div style="font-size: var(--font-size-lg); font-weight: 900; color: ${domainScores.dsa ? 'var(--color-success)' : 'var(--color-error)'};">
                ${domainScores.dsa ? '100%' : '0%'}
              </div>
            </div>
            <div class="diag-radar-col">
              <span style="font-size: var(--font-size-xs); font-weight: bold;">Aptitude</span>
              <div style="font-size: var(--font-size-lg); font-weight: 900; color: ${domainScores.aptitude ? 'var(--color-success)' : 'var(--color-error)'};">
                ${domainScores.aptitude ? '100%' : '0%'}
              </div>
            </div>
            <div class="diag-radar-col">
              <span style="font-size: var(--font-size-xs); font-weight: bold;">Systems / C++</span>
              <div style="font-size: var(--font-size-lg); font-weight: 900; color: ${domainScores.systems ? 'var(--color-success)' : 'var(--color-error)'};">
                ${domainScores.systems ? '100%' : '0%'}
              </div>
            </div>
          </div>

          <!-- Target Role Recommendation Box -->
          <div style="background: var(--color-surface); border: 2px solid var(--color-ink); box-shadow: var(--shadow-tactile-sm); border-radius: var(--radius-md); padding: var(--space-md); text-align: left; margin-bottom: var(--space-xl);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
              <span class="badge badge-accent">Recommended Career Track</span>
              <span class="badge badge-subtle">Algorithmic Match</span>
            </div>
            <h3 style="margin: 4px 0 var(--space-xs); color: var(--color-ink);">${roleTitle}</h3>
            <p style="font-size: var(--font-size-sm); line-height: 1.5; color: var(--color-ink); margin-bottom: var(--space-md);">
              ${roleReason}
            </p>
            <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap;">
              <button type="button" id="adopt-track-btn" class="btn btn-primary btn-sm">
                🎯 Set as My Active Target Track
              </button>
              <span id="track-adopted-status" style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-success); display: none;">
                ✓ Target Track Saved!
              </span>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
            <a href="#/dashboard" class="btn btn-primary">Go to Personalized Roadmap ➔</a>
            ${loggedMistakes.length > 0 ? `<a href="#/mistakes" class="btn btn-subtle">Review Diagnostic Mistakes (${loggedMistakes.length})</a>` : ''}
            <button type="button" id="retake-diag-btn" class="btn btn-subtle">Retake Diagnostic</button>
          </div>
        </div>
      </div>
    `;

    const adoptBtn = container.querySelector('#adopt-track-btn');
    const adoptedStatus = container.querySelector('#track-adopted-status');
    if (adoptBtn) {
      adoptBtn.addEventListener('click', async () => {
        audio.click();
        if (api.token) {
          try {
            await api.updateTargetRole(recommendedRole);
            if (adoptedStatus) {
              adoptedStatus.textContent = '✓ Target Track Synced to Server!';
              adoptedStatus.style.display = 'inline-block';
            }
          } catch (e) {
            console.warn('Could not sync target role to API:', e);
          }
        } else {
          // Store preference locally
          localStorage.setItem('arcade_target_role', recommendedRole);
          if (adoptedStatus) {
            adoptedStatus.textContent = '✓ Target Track Saved Locally!';
            adoptedStatus.style.display = 'inline-block';
          }
        }
        adoptBtn.disabled = true;
      });
    }

    const retakeBtn = container.querySelector('#retake-diag-btn');
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
