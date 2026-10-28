/**
 * Interview Arcade — Practice Problems Hub View
 * Professional Technical Interview Preparation Platform
 */

import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export const ARCADE_GAMES = [
  {
    id: 'tictactoe',
    title: 'Object-Oriented Design & Minimax',
    category: 'Systems & OOP',
    description: 'Solve object-oriented design and design pattern challenges while competing against a Minimax decision tree.',
    difficulty: 'Easy / Med / Hard',
    tags: ['OOP', 'Design Patterns', 'Polymorphism'],
    href: '#/game/tictactoe'
  },
  {
    id: 'memory',
    title: 'Computer Science Terminology',
    category: 'Computer Science',
    description: 'Interactive recall exercise matching core systems, operating systems, and networking terms to definitions.',
    difficulty: '6 - 12 Pairs',
    tags: ['OS Concepts', 'Memory Models', 'Networks'],
    href: '#/game/memory'
  },
  {
    id: 'aptitude',
    title: 'Quantitative Reasoning & Aptitude',
    category: 'Aptitude',
    description: 'Technical placement aptitude problems spanning number sequences, probability, and speed-work problems.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Probability', 'Combinatorics', 'Logic'],
    href: '#/game/aptitude'
  },
  {
    id: 'sql',
    title: 'SQL Query Formulation',
    category: 'Databases',
    description: 'Inspect relational schemas and complete missing clauses, aggregate filters, and multi-table joins.',
    difficulty: 'Easy / Med / Hard',
    tags: ['SQL', 'GROUP BY', 'JOINs', 'HAVING'],
    href: '#/game/sql'
  },
  {
    id: 'riddles',
    title: 'Visual Pattern Recognition & Logic',
    category: 'Aptitude',
    description: 'Original vector SVG pattern recognition, matrix reasoning, and topological sequence puzzles.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Matrix Reasoning', 'Sequences', 'Visual'],
    href: '#/game/riddles'
  },
  {
    id: 'dsa',
    title: 'Data Structures & Big-O Complexities',
    category: 'Algorithms',
    description: 'Two-column connector linking algorithms and data structures to exact worst-case and average-case bounds.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Big-O', 'Algorithms', 'Trees', 'Graphs'],
    href: '#/game/dsa'
  },
  {
    id: 'debugger',
    title: 'C++ Systems & Memory Debugger',
    category: 'Systems & OOP',
    description: 'Inspect real C++ snippets to identify dangling pointers, buffer overflows, and RAII safety violations.',
    difficulty: 'Easy / Med / Hard',
    tags: ['C++', 'RAII', 'Memory Leaks', 'Pointers'],
    href: '#/game/debugger'
  },
  {
    id: 'interview',
    title: 'Behavioral (STAR) & System Design Mocks',
    category: 'Mock Interviews',
    description: 'Realistic behavioral interview scenarios evaluated on STAR rubrics plus high-concurrency systems design.',
    difficulty: 'Med / Hard',
    tags: ['STAR Method', 'System Design', 'Behavioral'],
    href: '#/interview'
  },
  {
    id: 'assessment',
    title: 'Diagnostic Skill Assessment',
    category: 'Evaluation',
    description: 'Rapid 3-minute timed evaluation across 5 core competencies to identify your strengths and gaps.',
    difficulty: 'Timed 3m',
    tags: ['Calibration', 'Skill Evaluation', 'Placement'],
    href: '#/assessment'
  },
  {
    id: 'mistakes',
    title: 'Mistake & Revision Notebook',
    category: 'Revision',
    description: 'Active revision notebook cataloging every missed question with deep explanations and retesting.',
    difficulty: 'Revision',
    tags: ['Spaced Repetition', 'Error Analysis', 'Mastery'],
    href: '#/mistakes'
  },
  {
    id: 'feedback',
    title: 'Platform Feedback & Support',
    category: 'Support',
    description: 'Share feedback, bug reports, and suggestions directly to help improve the platform experience.',
    difficulty: 'Support',
    tags: ['Feedback', 'Community', 'Support'],
    href: '#/feedback'
  },
  {
    id: 'dashboard',
    title: 'Learning Dashboard & Roadmap',
    category: 'Analytics',
    description: 'Inspect verified session history, accuracy percentages, personal bests, and milestone badges.',
    difficulty: 'Dashboard',
    tags: ['Analytics', 'Roadmap', 'Skill Mastery'],
    href: '#/dashboard'
  }
];

function getChamberSvg(id) {
  switch (id) {
    case 'tictactoe':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="9" y1="4" x2="9" y2="20"></line><line x1="15" y1="4" x2="15" y2="20"></line></svg>`;
    case 'memory':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path></svg>`;
    case 'aptitude':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    case 'sql':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
    case 'riddles':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
    case 'dsa':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
    case 'debugger':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
    case 'interview':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
    case 'assessment':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    case 'mistakes':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
    case 'feedback':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
  }
}

export function createHomeView(params, container) {
  let selectedCategory = 'All';

  function init() {
    render();
    bindEvents();
  }

  function render() {
    const metrics = progress.getMetrics();
    const categories = ['All', 'Algorithms', 'Systems & OOP', 'Databases', 'Aptitude', 'Mock Interviews', 'Career Tools'];

    const filteredGames = selectedCategory === 'All' 
      ? ARCADE_GAMES 
      : ARCADE_GAMES.filter(g => g.category === selectedCategory);

    container.innerHTML = `
      <div class="content-container">
        <!-- Modern Product Hero Panel -->
        <section class="hero-arcade-panel" aria-labelledby="hero-title">
          <div class="hero-copy">
            <span class="badge badge-accent" style="margin-bottom: var(--space-xs);">Interactive Interview Preparation</span>
            <h1 id="hero-title">Master Technical Interviews with Interactive Practice</h1>
            <p>
              Practice Data Structures, Algorithms, SQL, Systems Programming, and Behavioral interviews with hands-on exercises, instant feedback, and role-targeted roadmaps.
            </p>
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <a href="#/assessment" class="btn btn-primary btn-lg">Start Diagnostic Test (3 min) ➔</a>
              <a href="#/interview" class="btn btn-subtle btn-lg">Mock Interviews</a>
              <a href="#/dashboard" class="btn btn-subtle btn-lg">View Roadmap</a>
            </div>
          </div>

          <!-- Modern IDE Workstation Card Preview -->
          <div class="hero-ide-preview" aria-hidden="true">
            <div class="ide-titlebar">
              <div class="ide-dots">
                <span class="ide-dot red"></span>
                <span class="ide-dot yellow"></span>
                <span class="ide-dot green"></span>
              </div>
              <div class="ide-tab">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>two_sum.py</span>
              </div>
              <span class="ide-lang">Python 3.11</span>
            </div>
            <div class="ide-code-body">
              <div class="code-line"><span class="token-keyword">def</span> <span class="token-fn">two_sum</span>(nums: List[int], target: int):</div>
              <div class="code-line indent"><span class="token-var">seen</span> = {}</div>
              <div class="code-line indent"><span class="token-keyword">for</span> i, val <span class="token-keyword">in</span> enumerate(nums):</div>
              <div class="code-line indent-2"><span class="token-var">diff</span> = target - val</div>
              <div class="code-line indent-2"><span class="token-keyword">if</span> diff <span class="token-keyword">in</span> seen:</div>
              <div class="code-line indent-3"><span class="token-keyword">return</span> [seen[diff], i]</div>
              <div class="code-line indent-2">seen[val] = i</div>
            </div>
            <div class="ide-output-strip">
              <span class="ide-status-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                All Tests Passed (15/15)
              </span>
              <span class="ide-metric">0.8 ms • O(N) Time</span>
            </div>
          </div>
        </section>

        <!-- Quick Status Preview if user has played -->
        ${metrics.totalSessions > 0 ? `
          <div class="dash-next-action-hero" style="padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg);">
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div class="game-card-icon" style="background: var(--color-ink); color: #fff;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">Welcome Back! Pick up where you left off</strong>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                  ${metrics.totalSessions} sessions logged • ${metrics.overallAccuracy}% verified accuracy • ${metrics.totalCorrect} questions solved
                </div>
              </div>
            </div>
            <a href="#/dashboard" class="btn btn-sm btn-primary">
              <span>View Learning Roadmap</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        ` : ''}

        <!-- Category Filter Bar -->
        <div class="filter-bar" role="toolbar" aria-label="Topic Filters">
          ${categories.map(cat => `
            <button type="button" class="filter-chip ${selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Problems & Challenges Grid -->
        <div class="grid-cards" role="region" aria-label="Interactive Challenges">
          ${filteredGames.map(game => `
            <div class="card card-interactive" onclick="window.location.hash='${game.href.replace('#', '')}'" tabindex="0" role="link" aria-label="${game.title}">
              <div class="game-card-hub">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                    <span class="badge badge-accent">${game.category}</span>
                    <div class="game-card-icon" aria-hidden="true">${getChamberSvg(game.id)}</div>
                  </div>
                  <h3>${game.title}</h3>
                  <p>${game.description}</p>
                </div>

                <div style="margin-top: var(--space-md); border-top: var(--border-width-sm) solid var(--color-border-subtle); padding-top: var(--space-xs); display: flex; justify-content: space-between; align-items: center;">
                  <span class="badge badge-subtle">${game.difficulty}</span>
                  <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-accent); display: flex; align-items: center; gap: 4px;">
                    Solve Challenge
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        selectedCategory = e.currentTarget.getAttribute('data-cat');
        audio.click();
        render();
        bindEvents();
      });
    });

    container.querySelectorAll('.card-interactive').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  init();

  return {
    destroy: () => {}
  };
}
