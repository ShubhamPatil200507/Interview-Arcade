/**
 * Interview Arcade — Arcade Hub View
 * Handcrafted game library with category filters, tactile card states, and real player preview.
 */

import { progress } from '../services/progress.js';
import { audio } from '../services/audio.js';

export const ARCADE_GAMES = [
  {
    id: 'tictactoe',
    number: '01',
    title: 'Tic Tac Toe + OOP Quiz',
    category: 'Systems',
    description: 'Outsmart the Minimax AI while answering object-oriented design questions to earn bonus points.',
    difficulty: 'Easy / Med / Hard',
    tags: ['OOP', 'Minimax', 'Game Theory'],
    icon: '⚔️',
    href: '#/game/tictactoe'
  },
  {
    id: 'memory',
    number: '02',
    title: 'Technical Memory Match',
    category: 'Full Stack',
    description: 'Tactile card-flipping challenge matching technical terms to their exact definitions.',
    difficulty: '6 - 12 Pairs',
    tags: ['Definitions', 'Core CS'],
    icon: '🃏',
    href: '#/game/memory'
  },
  {
    id: 'aptitude',
    number: '03',
    title: 'Quantitative Aptitude',
    category: 'Aptitude',
    description: 'Placement assessment questions spanning number series, probability, time & work with hints.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Math', 'Reasoning', 'Placement'],
    icon: '📐',
    href: '#/game/aptitude'
  },
  {
    id: 'resume',
    number: '04',
    title: 'Resume Keyword Matcher',
    category: 'Career',
    description: 'Deterministic client-side parser comparing resume keywords against target job descriptions.',
    difficulty: 'Utility',
    tags: ['Resume', 'Keywords', 'Action Verbs'],
    icon: '📄',
    href: '#/resume'
  },
  {
    id: 'sql',
    number: '05',
    title: 'SQL Fill in the Blanks',
    category: 'Databases',
    description: 'Inspect relational database schemas and complete missing clauses in SQL queries.',
    difficulty: 'Easy / Med / Hard',
    tags: ['SQL', 'GROUP BY', 'JOINs'],
    icon: '🗄️',
    href: '#/game/sql'
  },
  {
    id: 'riddles',
    number: '06',
    title: 'Visual Logic Riddles',
    category: 'Aptitude',
    description: 'Original vector SVG pattern recognition, matrix reasoning, and topological sequence puzzles.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Visual', 'Matrix', 'Sequences'],
    icon: '🧩',
    href: '#/game/riddles'
  },
  {
    id: 'dsa',
    number: '07',
    title: 'DSA Match the Following',
    category: 'DSA',
    description: 'Two-column connector linking algorithms and data structures to exact Big-O complexities.',
    difficulty: 'Easy / Med / Hard',
    tags: ['Big-O', 'Algorithms', 'Complexities'],
    icon: '📊',
    href: '#/game/dsa'
  },
  {
    id: 'debugger',
    number: '08',
    title: 'Debug the Code (C++)',
    category: 'Systems',
    description: 'Inspect C++ snippets to identify out-of-bounds, dangling pointers, and shallow copy bugs.',
    difficulty: 'Easy / Med / Hard',
    tags: ['C++', 'RAII', 'Memory Bugs'],
    icon: '🐛',
    href: '#/game/debugger'
  },
  {
    id: 'interview',
    number: '09',
    title: 'Placement Interview Simulator',
    category: 'Career',
    description: 'High-stakes behavioral STAR methodology & technical system design scenarios with rubric scoring.',
    difficulty: 'Med / Hard',
    tags: ['STAR', 'Behavioral', 'System Design'],
    icon: '🎙️',
    href: '#/interview'
  },
  {
    id: 'assessment',
    number: '10',
    title: 'Diagnostic Skill Assessment',
    category: 'Career',
    description: 'Rapid 3-minute timed calibration test across 5 core competencies to match your target role.',
    difficulty: 'Timed 3m',
    tags: ['Calibration', 'Placement', 'Diagnostic'],
    icon: '📊',
    href: '#/assessment'
  },
  {
    id: 'mistakes',
    number: '11',
    title: 'Mistakes & Error Notebook',
    category: 'Utility',
    description: 'Deliberate practice notebook cataloging all missed questions with deep explanations and retesting.',
    difficulty: 'Review',
    tags: ['Corrections', 'Pedagogy', 'Mastery'],
    icon: '📖',
    href: '#/mistakes'
  },
  {
    id: 'feedback',
    number: '12',
    title: 'Feedback Chamber',
    category: 'Utility',
    description: 'Log your feedback, bug reports, and observations locally on your device with zero cloud tracking.',
    difficulty: 'Feedback',
    tags: ['Feedback', 'Usability', 'Local'],
    icon: '💬',
    href: '#/feedback'
  },
  {
    id: 'dashboard',
    number: '13',
    title: 'Progress Log & Analytics',
    category: 'Utility',
    description: 'Inspect real session counts, accuracy %, personal bests, and genuine unlocked achievement badges.',
    difficulty: 'Dashboard',
    tags: ['Analytics', 'Achievements', 'History'],
    icon: '📈',
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
    case 'resume':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
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
    const categories = ['All', 'DSA', 'Systems', 'Databases', 'Aptitude', 'Career', 'Utility'];

    const filteredGames = selectedCategory === 'All' 
      ? ARCADE_GAMES 
      : ARCADE_GAMES.filter(g => g.category === selectedCategory);

    container.innerHTML = `
      <div class="content-container">
        <!-- Arcade Hero Panel -->
        <section class="hero-arcade-panel" aria-labelledby="hero-title">
          <div class="hero-copy">
            <span class="badge badge-accent" style="margin-bottom: var(--space-xs);">Unified Placement Preparation Cabinet</span>
            <h1 id="hero-title">Technical Interview Practice Without the Slop.</h1>
            <p>
              Twelve interactive practice chambers connecting initial diagnostic calibration, targeted role tracks, algorithmic mastery, SQL challenges, C++ debugging, behavioral STAR simulations, and deliberate error review.
            </p>
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <a href="#/assessment" class="btn btn-primary btn-lg">Calibrate Skills (3 min) ➔</a>
              <a href="#/interview" class="btn btn-subtle btn-lg">Interview Simulator</a>
              <a href="#/dashboard" class="btn btn-subtle btn-lg">View Roadmap</a>
            </div>
          </div>

          <!-- Handcrafted SVG Arcade Machine -->
          <div class="hero-cabinet-graphic">
            <svg viewBox="0 0 160 180" width="140" height="155" xmlns="http://www.w3.org/2000/svg">
              <!-- Cabinet Body -->
              <rect x="25" y="10" width="110" height="160" rx="8" fill="#1C1917"/>
              <rect x="32" y="18" width="96" height="30" rx="4" fill="#E05626"/>
              <text x="80" y="38" font-family="monospace" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ARCADE</text>
              
              <!-- CRT Screen -->
              <rect x="35" y="55" width="90" height="65" rx="6" fill="#1A1A1E" stroke="#57534E" stroke-width="2"/>
              <circle cx="80" cy="85" r="14" fill="#15803D" opacity="0.8"/>
              <line x1="50" y1="85" x2="110" y2="85" stroke="#FBF9F5" stroke-width="2"/>
              <line x1="80" y1="65" x2="80" y2="105" stroke="#FBF9F5" stroke-width="2"/>
              
              <!-- Control Deck -->
              <rect x="30" y="125" width="100" height="35" rx="4" fill="#292524"/>
              <!-- Joystick -->
              <line x1="55" y1="145" x2="55" y2="135" stroke="#78716C" stroke-width="4"/>
              <circle cx="55" cy="133" r="6" fill="#E05626"/>
              <!-- Action Buttons -->
              <circle cx="85" cy="142" r="4" fill="#E05626"/>
              <circle cx="98" cy="138" r="4" fill="#2563EB"/>
              <circle cx="111" cy="142" r="4" fill="#15803D"/>
            </svg>
            <div style="font-family: var(--font-mono); font-size: var(--font-size-xs); color: var(--color-ink-muted); margin-top: 4px;">
              Cabinet v2.0 • 12 Chambers
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
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">Welcome Back! Active Sessions in Progress</strong>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink-muted);">
                  ${metrics.totalSessions} sessions logged • ${metrics.overallAccuracy}% verified accuracy • ${metrics.totalCorrect} questions solved
                </div>
              </div>
            </div>
            <a href="#/dashboard" class="btn btn-sm btn-primary">
              <span>Open Roadmap</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        ` : ''}

        <!-- Filter Bar -->
        <div class="filter-bar" role="toolbar" aria-label="Game Category Filters">
          <span style="font-size: var(--font-size-xs); font-weight: bold; margin-right: var(--space-2xs); color: var(--color-ink-muted);">
            TOPICS:
          </span>
          ${categories.map(cat => `
            <button type="button" class="filter-chip ${selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- 10 Game Mini-Modules Grid -->
        <div class="grid-cards" role="region" aria-label="Interactive Game Chambers">
          ${filteredGames.map(game => `
            <div class="card card-interactive" onclick="window.location.hash='${game.href.replace('#', '')}'" tabindex="0" role="link" aria-label="${game.title}">
              <div class="game-card-hub">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
                    <span class="badge badge-accent">No. ${game.number}</span>
                    <div class="game-card-icon" aria-hidden="true">${getChamberSvg(game.id)}</div>
                  </div>
                  <h3>${game.title}</h3>
                  <p>${game.description}</p>
                </div>

                <div style="margin-top: var(--space-md); border-top: var(--border-width-sm) solid var(--color-border-subtle); padding-top: var(--space-xs); display: flex; justify-content: space-between; align-items: center;">
                  <span class="badge badge-subtle">${game.difficulty}</span>
                  <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-accent); display: flex; align-items: center; gap: 4px;">
                    Enter
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
