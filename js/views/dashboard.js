/**
 * Interview Arcade — Game 10: Progress Dashboard & Learning Roadmap
 * Editorial Placement Preparation Platform
 * 5-Second Comprehension: Current Status, Next Action, Skills Needing Attention, Practice Access
 */

import { progress, ACHIEVEMENT_DEFINITIONS } from '../services/progress.js';
import { storage } from '../services/storage.js';
import { audio } from '../services/audio.js';
import { api } from '../services/api-client.js';
import { mistakes } from '../services/mistakes.js';

export function createDashboardView(params, container) {
  let serverLearningPath = null;
  let serverRecommendation = null;
  let currentUser = null;

  async function init() {
    renderLoading();
    try {
      if (api.token) {
        currentUser = await api.getCurrentUser().catch(() => null);
        serverLearningPath = await api.getLearningPath().catch(() => null);
        serverRecommendation = await api.getRecommendation().catch(() => null);
      }
    } catch (e) {
      console.warn('Dashboard running in local storage mode:', e);
    }
    render();
    bindEvents();
  }

  function renderLoading() {
    container.innerHTML = `
      <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
        <div style="display: inline-block; margin-bottom: var(--space-md);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        </div>
        <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted);">Compiling student placement metrics and skill calibrations...</p>
      </div>
      <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;
  }

  function render() {
    const metrics = progress.getMetrics();
    const unlockedAchievements = new Set(progress.getUnlockedAchievements());
    const mistakeStats = mistakes.getStats();
    const hasData = metrics.totalSessions > 0 || (currentUser && currentUser.xp > 0);
    const activeRole = currentUser?.target_role || localStorage.getItem('arcade_target_role') || 'backend';

    const roleTitles = {
      backend: 'Core Backend & Systems',
      systems: 'Systems & Embedded C++',
      fullstack: 'Full Stack Web & Services',
      data: 'Data Engineering & Analytics'
    };

    container.innerHTML = `
      <div class="content-container">
        <!-- 1. Header Strip: Welcome, Contextual Subtitle, and Track Switcher -->
        <div class="dash-header-strip">
          <div class="dash-welcome-text">
            <h1>${currentUser ? `Welcome back, ${currentUser.username}` : 'Student Placement Dashboard'}</h1>
            <div class="dash-context-subtitle">
              <span>Track: <strong>${roleTitles[activeRole] || activeRole.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Stage 1: Core Technical Foundations</span>
              <span>•</span>
              <span>${Object.keys(metrics.gameStats).length} of 12 chambers attempted</span>
              ${currentUser ? `<span class="badge badge-accent">Lvl ${currentUser.level} (${currentUser.xp} XP)</span>` : '<span class="badge badge-subtle">Local Mode</span>'}
            </div>
          </div>

          <div class="dash-track-switcher">
            <label for="track-select">Target Track:</label>
            <select id="track-select" class="dash-track-select">
              <option value="backend" ${activeRole === 'backend' ? 'selected' : ''}>Core Backend (OOP, SQL, DSA)</option>
              <option value="systems" ${activeRole === 'systems' ? 'selected' : ''}>Systems & C++ (Memory, DSA)</option>
              <option value="fullstack" ${activeRole === 'fullstack' ? 'selected' : ''}>Full Stack (Web, SQL, OOP)</option>
              <option value="data" ${activeRole === 'data' ? 'selected' : ''}>Data Engineering (SQL, DSA)</option>
            </select>
          </div>
        </div>

        <!-- 2. High-Priority Next Action Hero Card (5-Second Comprehension) -->
        ${renderNextActionHero(serverRecommendation, hasData, activeRole)}

        <!-- 3. Key Placement Metrics (4 Tiles) -->
        ${renderMetricsGrid(metrics)}

        <!-- 4. Skills Needing Attention (Horizontal Evidence-Weighted Competencies) -->
        ${renderSkillsSection(metrics)}

        <!-- 5. Structured Roadmap Timeline -->
        ${renderRoadmapSection(activeRole)}

        <!-- 6. Two-Column Split: Recent Activity & Mistakes Notebook Spotlight -->
        <div class="dash-two-column">
          <!-- Left: Recent Practice Sessions -->
          <div class="dash-section" style="margin-bottom: 0;">
            <div class="dash-section-header">
              <h2>Recent Practice Sessions</h2>
              <span class="dash-section-sub">${metrics.recentSessions.length} sessions logged</span>
            </div>
            ${renderRecentSessionsTable(metrics.recentSessions)}
          </div>

          <!-- Right: Mistakes Notebook Spotlight -->
          <div class="dash-section" style="margin-bottom: 0;">
            <div class="dash-section-header">
              <h2>Mistakes Notebook</h2>
              <span class="dash-section-sub">Deliberate Practice</span>
            </div>
            <div class="mistakes-spotlight-card">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-xs);">
                  <span class="badge ${mistakeStats.pendingCount > 0 ? 'badge-primary' : 'badge-easy'}">
                    ${mistakeStats.pendingCount > 0 ? `${mistakeStats.pendingCount} Pending Review` : 'All Mastered'}
                  </span>
                  <span style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                    ${mistakeStats.mastered} Mastered / ${mistakeStats.total} Total
                  </span>
                </div>
                <h3 style="font-size: var(--font-size-base); margin-bottom: var(--space-3xs); font-weight: var(--font-weight-bold);">
                  ${mistakeStats.pendingCount > 0 ? 'Retest Incorrect Concepts' : 'Error Notebook Clear'}
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); line-height: 1.5; margin: 0;">
                  ${mistakeStats.pendingCount > 0 
                    ? 'Every question missed during quiz rounds is automatically indexed here with detailed explanations. Retest missed items to eliminate recurring patterns.' 
                    : 'Great consistency! Whenever you miss a question during practice chambers or assessments, it appears here for deliberate retesting.'}
                </p>
              </div>

              <div style="border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-sm); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: var(--font-size-xs); color: var(--color-ink-faint);">Notebook v1.2</span>
                <a href="#/mistakes" class="btn btn-sm btn-primary">
                  <span>Open Notebook</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. Verified Milestone Achievements -->
        <div class="dash-section">
          <div class="dash-section-header">
            <h2>Milestone Achievements</h2>
            <span class="badge badge-accent">
              ${unlockedAchievements.size} of ${ACHIEVEMENT_DEFINITIONS.length} Badges Unlocked
            </span>
          </div>
          <div class="achievements-grid">
            ${ACHIEVEMENT_DEFINITIONS.map(ach => {
              const isUnlocked = unlockedAchievements.has(ach.id);
              return `
                <div class="achievement-card ${isUnlocked ? '' : 'locked'}">
                  <div class="achievement-icon-wrap" aria-hidden="true">
                    ${getAchievementSvg(ach.id)}
                  </div>
                  <div>
                    <h3 style="font-size: var(--font-size-sm); margin-bottom: 2px; font-weight: var(--font-weight-semibold);">
                      ${ach.title} ${isUnlocked ? '✓' : ''}
                    </h3>
                    <p style="font-size: var(--font-size-xs); margin: 0; color: var(--color-ink-muted); line-height: 1.4;">
                      ${ach.description}
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 8. Utility & Data Management Strip -->
        <div class="dash-utility-strip">
          <div>
            Data Storage: <strong>${currentUser ? 'Authenticated FastAPI Server + SQLite Sync' : 'Offline Local Storage'}</strong>
          </div>
          <div style="display: flex; gap: var(--space-xs);">
            ${hasData ? `
              <button type="button" id="export-data-btn" class="btn btn-sm btn-subtle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Export Progress (JSON)</span>
              </button>
              <button type="button" id="reset-progress-btn" class="btn btn-sm btn-subtle" style="color: var(--color-error);">
                <span>Reset Local Log</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderNextActionHero(rec, hasData, activeRole) {
    if (!hasData) {
      return `
        <div class="dash-next-action-hero">
          <div class="next-action-main">
            <div class="next-action-eyebrow">
              <span class="next-action-tag">RECOMMENDED NEXT ACTION</span>
              <span class="badge badge-easy">TIMED 3 MIN</span>
            </div>
            <h2 class="next-action-title">First Priority: Calibrate Placement Baseline</h2>
            <p class="next-action-reason">
              Take the rapid 3-minute diagnostic assessment to calibrate empirical baseline scores across Object-Oriented Design, SQL, Data Structures, Systems, and Aptitude.
            </p>
            <div class="next-action-meta">
              <span>Domain: Core CS Foundations</span>
              <span>•</span>
              <span>Est. Duration: ~3 minutes</span>
              <span>•</span>
              <span>Adapts your customized roadmap</span>
            </div>
          </div>
          <div class="next-action-cta-wrap">
            <a href="#/assessment" class="btn btn-primary btn-lg">
              <span>Start Diagnostic Test</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      `;
    }

    const title = rec?.game_title || 'SQL Fill in the Blanks';
    const difficulty = (rec?.recommended_difficulty || 'medium').toUpperCase();
    const reason = rec?.reason || 'Identified as having the highest impact for your selected career track.';
    const gameId = rec?.top_priority_game || 'sql';

    return `
      <div class="dash-next-action-hero">
        <div class="next-action-main">
          <div class="next-action-eyebrow">
            <span class="next-action-tag">PRIORITY NEXT STEP</span>
            <span class="badge ${difficulty === 'HARD' ? 'badge-hard' : difficulty === 'MEDIUM' ? 'badge-medium' : 'badge-easy'}">${difficulty}</span>
          </div>
          <h2 class="next-action-title">Continue: ${title}</h2>
          <p class="next-action-reason">${reason}</p>
          <div class="next-action-meta">
            <span>Target Track: ${activeRole.toUpperCase()}</span>
            <span>•</span>
            <span>Est. Duration: ~5 minutes</span>
            <span>•</span>
            <span>Awards verified XP & skill evidence</span>
          </div>
        </div>
        <div class="next-action-cta-wrap">
          <a href="#/game/${gameId}" class="btn btn-primary btn-lg">
            <span>Start Next Challenge</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      </div>
    `;
  }

  function renderMetricsGrid(metrics) {
    const formattedTime = formatDuration(metrics.totalTimeSeconds);

    // Calculate aggregate weighted mastery
    const skillScores = calculateDomainMastery(metrics);
    const avgMastery = Math.round(
      Object.values(skillScores).reduce((acc, s) => acc + s.mastery, 0) / 5
    );

    let confidenceTier = 'Baseline';
    if (avgMastery >= 75) confidenceTier = 'Placement Ready';
    else if (avgMastery >= 50) confidenceTier = 'Proficient';
    else if (avgMastery >= 25) confidenceTier = 'Developing';

    return `
      <div class="dash-metrics-grid">
        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-title">Track Mastery</span>
            <svg class="metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          </div>
          <div class="metric-value" style="color: var(--color-accent);">${avgMastery}%</div>
          <div class="metric-sub">${confidenceTier} • Evidence-Weighted</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-title">Practice Sessions</span>
            <svg class="metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="metric-value">${metrics.totalSessions}</div>
          <div class="metric-sub">${metrics.totalQuestionsAnswered} questions solved</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-title">Answer Accuracy</span>
            <svg class="metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="metric-value" style="color: var(--color-success);">${metrics.overallAccuracy}%</div>
          <div class="metric-sub">${metrics.totalCorrect} correct answers</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-title">Study Duration</span>
            <svg class="metric-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 10"></polyline></svg>
          </div>
          <div class="metric-value" style="font-size: 1.5rem;">${formattedTime}</div>
          <div class="metric-sub">Focused interactive preparation</div>
        </div>
      </div>
    `;
  }

  function renderSkillsSection(metrics) {
    const domainMastery = calculateDomainMastery(metrics);

    const domains = [
      { id: 'oop', name: 'Object-Oriented Design (OOP)', gameId: 'tictactoe' },
      { id: 'sql', name: 'Relational Databases & SQL', gameId: 'sql' },
      { id: 'dsa', name: 'Data Structures & Algorithms', gameId: 'dsa' },
      { id: 'systems', name: 'Systems & Memory Safety (C++)', gameId: 'debugger' },
      { id: 'aptitude', name: 'Quantitative Aptitude', gameId: 'aptitude' }
    ];

    return `
      <div class="dash-section">
        <div class="dash-section-header">
          <div>
            <h2>Skills Needing Attention</h2>
            <span class="dash-section-sub">Bayesian confidence calculation based on verified questions attempted</span>
          </div>
          <span style="font-size: var(--font-size-xs); color: var(--color-ink-faint); font-family: var(--font-mono);">
            Formula: min(100, Accuracy × min(1.0, Questions / 5))
          </span>
        </div>

        <div class="skills-list-card">
          ${domains.map(d => {
            const data = domainMastery[d.id] || { mastery: 0, questions: 0, label: 'Uncalibrated' };
            const m = data.mastery;

            let tierClass = 'skill-tier-need';
            let tierText = 'Needs Practice';
            let barColor = 'var(--color-error)';

            if (m >= 85) {
              tierClass = 'skill-tier-master';
              tierText = 'Mastered';
              barColor = 'var(--color-accent)';
            } else if (m >= 65) {
              tierClass = 'skill-tier-prof';
              tierText = 'Proficient';
              barColor = 'var(--color-success)';
            } else if (m >= 40) {
              tierClass = 'skill-tier-dev';
              tierText = 'Developing';
              barColor = 'var(--color-warning)';
            }

            return `
              <div class="skill-row">
                <div class="skill-name-wrap">
                  <span class="skill-name">${d.name}</span>
                  <span class="skill-evidence">${data.questions > 0 ? `${data.questions} verified questions attempted` : 'No verified attempts yet'}</span>
                </div>

                <div class="skill-bar-wrap skill-row-bar">
                  <div class="skill-bar-fill" style="width: ${m}%; background-color: ${barColor};"></div>
                </div>

                <div class="skill-tier-badge ${tierClass}">
                  ${m}% • ${tierText}
                </div>

                <div style="text-align: right;">
                  <a href="#/game/${d.gameId}" class="btn btn-sm btn-subtle" style="font-size: 0.725rem; padding: 2px 8px;">
                    Practice
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderRoadmapSection(activeRole) {
    const defaultSteps = {
      backend: [
        { step_number: 1, title: 'Tic Tac Toe + OOP Design Quiz', game_id: 'tictactoe', status: 'completed', reason: 'Encapsulation, inheritance, and dynamic dispatch verification' },
        { step_number: 2, title: 'SQL Fill in the Blanks', game_id: 'sql', status: 'in_progress', reason: 'Relational query formulation, aggregate filters, and multi-table joins' },
        { step_number: 3, title: 'DSA Match the Following', game_id: 'dsa', status: 'todo', reason: 'Algorithmic time and space Big-O complexity mapping' },
        { step_number: 4, title: 'C++ Systems Debugger', game_id: 'debugger', status: 'todo', reason: 'Dangling pointers, memory leaks, and RAII safety violations' },
        { step_number: 5, title: 'Placement Interview Simulator', game_id: 'interview', status: 'todo', reason: 'Capstone simulation with STAR behavioral rounds & rubric scoring' }
      ],
      systems: [
        { step_number: 1, title: 'Technical Memory Match', game_id: 'memory', status: 'completed', reason: 'Core architecture and operating systems definitions' },
        { step_number: 2, title: 'C++ Systems Debugger', game_id: 'debugger', status: 'in_progress', reason: 'Pointer safety, stack vs heap, buffer boundaries' },
        { step_number: 3, title: 'DSA Match the Following', game_id: 'dsa', status: 'todo', reason: 'Memory footprint of hash tables, trees, and graphs' },
        { step_number: 4, title: 'Visual Logic Riddles', game_id: 'riddles', status: 'todo', reason: 'Pattern recognition and topological sequence verification' },
        { step_number: 5, title: 'Placement Interview Simulator', game_id: 'interview', status: 'todo', reason: 'High-concurrency systems design scenarios' }
      ],
      fullstack: [
        { step_number: 1, title: 'Tic Tac Toe + OOP Quiz', game_id: 'tictactoe', status: 'completed', reason: 'Component architecture and state design' },
        { step_number: 2, title: 'SQL Fill in the Blanks', game_id: 'sql', status: 'in_progress', reason: 'Backend relational schema queries and indices' },
        { step_number: 3, title: 'Resume Keyword Matcher', game_id: 'resume', status: 'todo', reason: 'Audit stack terminology against job descriptions' },
        { step_number: 4, title: 'DSA Match the Following', game_id: 'dsa', status: 'todo', reason: 'Client-side and server-side complexity trade-offs' },
        { step_number: 5, title: 'Placement Interview Simulator', game_id: 'interview', status: 'todo', reason: 'End-to-end full stack architecture interview' }
      ],
      data: [
        { step_number: 1, title: 'SQL Fill in the Blanks', game_id: 'sql', status: 'in_progress', reason: 'Window functions, group aggregates, and data normalization' },
        { step_number: 2, title: 'Quantitative Aptitude', game_id: 'aptitude', status: 'todo', reason: 'Probability, statistics, and numerical interpretation' },
        { step_number: 3, title: 'DSA Match the Following', game_id: 'dsa', status: 'todo', reason: 'Big-O scaling of streaming and batch datasets' },
        { step_number: 4, title: 'Visual Logic Riddles', game_id: 'riddles', status: 'todo', reason: 'Matrix reasoning and sequence extrapolation' },
        { step_number: 5, title: 'Placement Interview Simulator', game_id: 'interview', status: 'todo', reason: 'Data pipeline and warehouse interview scenarios' }
      ]
    };

    const steps = serverLearningPath?.steps || defaultSteps[activeRole] || defaultSteps.backend;

    return `
      <div class="dash-section">
        <div class="dash-section-header">
          <div>
            <h2>Placement Preparation Roadmap</h2>
            <span class="dash-section-sub">Sequential milestone pathway tailored for your target track</span>
          </div>
          <span class="badge badge-accent">${activeRole.toUpperCase()} TRACK</span>
        </div>

        <div class="roadmap-timeline">
          ${steps.map(s => {
            const isCompleted = s.status === 'completed';
            const isInProgress = s.status === 'in_progress';

            return `
              <div class="timeline-step-card ${isInProgress ? 'active-step' : isCompleted ? 'completed-step' : ''}">
                <div class="timeline-step-left">
                  <div class="timeline-step-indicator ${isCompleted ? 'done' : isInProgress ? 'active' : 'planned'}">
                    ${isCompleted ? '✓' : s.step_number}
                  </div>
                  <div class="timeline-step-details">
                    <h3>${s.title}</h3>
                    <p>${s.reason}</p>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: var(--space-xs);">
                  <span class="badge ${isCompleted ? 'badge-easy' : isInProgress ? 'badge-accent' : 'badge-subtle'}">
                    ${isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Planned'}
                  </span>
                  <a href="#/game/${s.game_id || 'tictactoe'}" class="btn btn-sm ${isInProgress ? 'btn-primary' : 'btn-subtle'}">
                    ${isCompleted ? 'Replay' : isInProgress ? 'Resume' : 'Start'}
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderRecentSessionsTable(sessions) {
    if (!sessions || sessions.length === 0) {
      return `
        <div class="activity-table-wrap" style="padding: var(--space-xl); text-align: center;">
          <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted); margin-bottom: var(--space-sm);">No practice sessions recorded yet.</p>
          <a href="#/assessment" class="btn btn-sm btn-primary">Take Initial Calibration</a>
        </div>
      `;
    }

    return `
      <div class="activity-table-wrap">
        <table class="activity-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Chamber</th>
              <th>Difficulty</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.slice(0, 6).map(s => {
              const diff = (s.difficulty || 'medium').toLowerCase();
              const badgeClass = diff === 'hard' ? 'badge-hard' : diff === 'medium' ? 'badge-medium' : 'badge-easy';
              return `
                <tr>
                  <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-ink-faint);">
                    ${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td><strong>${s.gameTitle}</strong></td>
                  <td><span class="badge ${badgeClass}">${diff.toUpperCase()}</span></td>
                  <td><span class="badge badge-accent">${s.score} pts</span></td>
                  <td>${s.correctAnswers} / ${s.questionsAnswered}</td>
                  <td>${s.durationSeconds}s</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function calculateDomainMastery(metrics) {
    // If server provides breakdown, prioritize it
    if (serverLearningPath?.mastery_breakdown) {
      const result = {};
      serverLearningPath.mastery_breakdown.forEach(item => {
        result[item.skill_id] = {
          mastery: item.mastery_percent,
          questions: item.evidence_level.includes('attempts') ? parseInt(item.evidence_level) : 5,
          label: item.evidence_level
        };
      });
      return result;
    }

    // Otherwise calculate honestly from local gameStats
    const map = {
      oop: { questions: 0, correct: 0 },
      sql: { questions: 0, correct: 0 },
      dsa: { questions: 0, correct: 0 },
      systems: { questions: 0, correct: 0 },
      aptitude: { questions: 0, correct: 0 }
    };

    if (metrics.gameStats) {
      for (const [id, stats] of Object.entries(metrics.gameStats)) {
        if (id.includes('tictactoe') || id.includes('oop')) {
          map.oop.questions += stats.totalQuestions || 0;
          map.oop.correct += stats.totalCorrect || 0;
        } else if (id.includes('sql')) {
          map.sql.questions += stats.totalQuestions || 0;
          map.sql.correct += stats.totalCorrect || 0;
        } else if (id.includes('dsa')) {
          map.dsa.questions += stats.totalQuestions || 0;
          map.dsa.correct += stats.totalCorrect || 0;
        } else if (id.includes('debugger') || id.includes('memory')) {
          map.systems.questions += stats.totalQuestions || 0;
          map.systems.correct += stats.totalCorrect || 0;
        } else if (id.includes('aptitude') || id.includes('riddles')) {
          map.aptitude.questions += stats.totalQuestions || 0;
          map.aptitude.correct += stats.totalCorrect || 0;
        }
      }
    }

    const calculated = {};
    for (const [domain, st] of Object.entries(map)) {
      if (st.questions === 0) {
        calculated[domain] = { mastery: 0, questions: 0, label: 'Uncalibrated' };
      } else {
        const accuracy = (st.correct / st.questions) * 100;
        const evidenceFactor = Math.min(1.0, st.questions / 5.0);
        const weighted = Math.round(accuracy * evidenceFactor);
        calculated[domain] = {
          mastery: Math.min(100, Math.max(0, weighted)),
          questions: st.questions,
          label: `${st.questions} attempts`
        };
      }
    }
    return calculated;
  }

  function getAchievementSvg(achId) {
    switch (achId) {
      case 'first_coin':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-7 0c0 2 1.5 3 3.5 3s3.5 1 3.5 3a3.5 3.5 0 0 1-7 0"></path></svg>`;
      case 'dsa_tactician':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
      case 'sql_whiz':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
      case 'debugger_raii':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
      case 'perfect_round':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`;
    }
  }

  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (mins < 60) return `${mins}m ${remainingSecs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }

  function bindEvents() {
    const exportBtn = container.querySelector('#export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = storage.exportData();
        if (jsonStr) {
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `interview_arcade_progress_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          audio.correct();
        }
      });
    }

    const resetBtn = container.querySelector('#reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you certain you want to reset your local progress logs and milestone badges? This action cannot be undone.')) {
          progress.resetProgress();
          audio.move();
          render();
          bindEvents();
        }
      });
    }

    const trackSelect = container.querySelector('#track-select');
    if (trackSelect) {
      trackSelect.addEventListener('change', async (e) => {
        const newTrack = e.target.value;
        audio.click();
        localStorage.setItem('arcade_target_role', newTrack);
        if (api.token) {
          try {
            await api.updateTargetRole(newTrack);
            serverLearningPath = await api.getLearningPath().catch(() => null);
            serverRecommendation = await api.getRecommendation().catch(() => null);
          } catch (err) {
            console.warn('Track update failed on server:', err);
          }
        }
        render();
        bindEvents();
      });
    }
  }

  init();

  return {
    destroy: () => {}
  };
}
