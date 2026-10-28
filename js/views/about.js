/**
 * Interview Arcade — Platform Rationale, Architecture & System Overview
 * Explains dynamic question generation, server-verified scoring, and accessible design principles.
 */

import { api } from '../services/api-client.js';

export function createAboutView(params, container) {
  let activeTab = 'architecture';
  let pingLatency = null;
  let isApiOnline = false;

  async function checkSystemHealth() {
    const start = performance.now();
    try {
      isApiOnline = await api.checkHealth();
      pingLatency = Math.round(performance.now() - start);
    } catch (e) {
      isApiOnline = false;
      pingLatency = null;
    }
    updateHealthUI();
  }

  function updateHealthUI() {
    const pill = container.querySelector('#system-health-pill');
    if (!pill) return;
    if (isApiOnline) {
      pill.innerHTML = `
        <span class="badge badge-success" style="font-family: var(--font-mono); font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">
          ● API ONLINE • ${pingLatency}ms
        </span>
      `;
    } else {
      pill.innerHTML = `
        <span class="badge badge-subtle" style="font-family: var(--font-mono); font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">
          ○ LOCAL STORAGE MODE
        </span>
      `;
    }
  }

  // SHA-256 in browser using Web Crypto API
  async function computeSha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function render() {
    container.innerHTML = `
      <div class="content-container about-container">
        <!-- Hero Header Card -->
        <div class="about-hero">
          <div class="about-hero-top">
            <div>
              <span class="badge badge-accent">Platform Architecture & Pedagogy</span>
              <h2 class="about-hero-title">About Interview Arcade</h2>
              <p class="about-hero-subtitle">
                High-velocity, gamified technical placement platform engineered around active recall, spatial reasoning, and server-verified mastery.
              </p>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-xs);">
              <div id="system-health-pill">
                <span class="badge badge-subtle" style="font-family: var(--font-mono); font-size: 0.75rem;">Checking Engine...</span>
              </div>
              <button type="button" id="ping-engine-btn" class="btn btn-sm btn-subtle" style="font-size: 0.7rem; padding: 2px 8px;">
                ⚡ Ping Server
              </button>
            </div>
          </div>

          <!-- Micro-Metrics Ribbon -->
          <div class="about-metrics-bar">
            <div class="about-metric-pill">
              <span class="about-metric-val">100% Active</span>
              <span class="about-metric-lbl">Recall-Gated Challenges</span>
            </div>
            <div class="about-metric-pill">
              <span class="about-metric-val">SHA-256</span>
              <span class="about-metric-lbl">Cryptographic Deduplication</span>
            </div>
            <div class="about-metric-pill">
              <span class="about-metric-val">Authoritative</span>
              <span class="about-metric-lbl">Server-Verified Scoring</span>
            </div>
            <div class="about-metric-pill">
              <span class="about-metric-val">WCAG 2.2 AA</span>
              <span class="about-metric-lbl">Full Keyboard & Screen Reader</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="about-nav-tabs" aria-label="About Sections">
          <button type="button" class="about-tab-btn ${activeTab === 'architecture' ? 'active' : ''}" data-tab="architecture">
            🏛️ Architecture & Pillars
          </button>
          <button type="button" class="about-tab-btn ${activeTab === 'engine' ? 'active' : ''}" data-tab="engine">
            ⚡ Dynamic Question Engine
          </button>
          <button type="button" class="about-tab-btn ${activeTab === 'manifesto' ? 'active' : ''}" data-tab="manifesto">
            🛡️ Anti-AI Slop Mandate
          </button>
          <button type="button" class="about-tab-btn ${activeTab === 'compare' ? 'active' : ''}" data-tab="compare">
            📊 Arcade vs. LeetCode
          </button>
          <button type="button" class="about-tab-btn ${activeTab === 'accessibility' ? 'active' : ''}" data-tab="accessibility">
            ⌨️ WCAG & Shortcuts
          </button>
        </nav>

        <!-- PANEL 1: ARCHITECTURE & PILLARS -->
        <section id="panel-architecture" class="about-panel ${activeTab === 'architecture' ? 'active' : ''}">
          <div class="card" style="border-left: 4px solid var(--color-accent);">
            <h3 style="margin-top: 0;">Rethinking Technical Placement Preparation</h3>
            <p style="font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-ink); margin-bottom: var(--space-md);">
              Technical interview preparation is too frequently reduced to passive video watching or grinding memorized code snippets without context. <strong>Interview Arcade</strong> bridges conceptual depth with game mechanics to trigger higher cognitive engagement.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-sm);">
              <div class="card" style="margin: 0; background: var(--color-bg-subtle);">
                <strong style="color: var(--color-accent); font-size: var(--font-size-sm); display: block; margin-bottom: 4px;">
                  ⚡ Active Retrieval Gating
                </strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0; line-height: 1.5;">
                  Moves in Tic-Tac-Toe, memory card pairs in OS Architecture, and SQL token builders require real-time conceptual answers before board execution.
                </p>
              </div>
              <div class="card" style="margin: 0; background: var(--color-bg-subtle);">
                <strong style="color: var(--color-success); font-size: var(--font-size-sm); display: block; margin-bottom: 4px;">
                  🛡️ Authoritative Verification
                </strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0; line-height: 1.5;">
                  Client scoring is strictly untrusted. Answer keys, tokens, and XP bonuses are authoritatively verified server-side with idempotency guards.
                </p>
              </div>
              <div class="card" style="margin: 0; background: var(--color-bg-subtle);">
                <strong style="color: var(--color-ink); font-size: var(--font-size-sm); display: block; margin-bottom: 4px;">
                  🎯 Evidence-Weighted Tracks
                </strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0; line-height: 1.5;">
                  Bayesian evidence calculations calibrate candidates into Core Backend, Systems & Embedded, and Data Engineering career paths.
                </p>
              </div>
            </div>
          </div>

          <!-- Active Game Chambers Overview -->
          <div class="card">
            <h3 style="margin-top: 0;">Tactile Arcade Chambers</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-xs);">
              <div style="padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <strong>Tic-Tac-Toe + OOP Quiz:</strong> Turn-based strategy gated by inheritance, polymorphism, and encapsulation challenges.
              </div>
              <div style="padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <strong>Memory Matrix:</strong> Tactile spatial memory pairing core OS primitives, mutexes, and networking protocols.
              </div>
              <div style="padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <strong>SQL Syntax Sprint:</strong> Token-filling database query reconstruction testing aggregations, joins, and indexing.
              </div>
              <div style="padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <strong>DSA Matcher & Debugger:</strong> Algorithmic complexity pairing and real-world memory leak diagnostics.
              </div>
            </div>
          </div>
        </section>

        <!-- PANEL 2: DYNAMIC QUESTION ENGINE -->
        <section id="panel-engine" class="about-panel ${activeTab === 'engine' ? 'active' : ''}">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
              <h3 style="margin: 0;">Dynamic Question Engine & Repetition Elimination</h3>
              <span class="badge badge-accent">Hybrid Pipeline</span>
            </div>
            <p style="font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-ink); margin-bottom: var(--space-md);">
              To solve the fatigue of repeated questions, Interview Arcade links a curated baseline question bank with an AI generator and cryptographic deduplication:
            </p>

            <div class="about-flow-pipeline">
              <div class="about-flow-step">
                <span class="about-step-num">STEP 1</span>
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">Candidate Seen Filter</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
                  Queries candidate attempt history in <code style="font-family: var(--font-mono);">user_question_history</code>. Questions previously answered are excluded from fresh practice.
                </p>
              </div>

              <div class="about-flow-step">
                <span class="about-step-num">STEP 2</span>
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">SHA-256 Fingerprinting</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
                  Prompts are stripped of punctuation, lowercased, and hashed into unique fingerprints to reject semantically identical questions.
                </p>
              </div>

              <div class="about-flow-step">
                <span class="about-step-num">STEP 3</span>
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">On-Demand Generation</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
                  When unseen questions run low, the server invokes Google Gemini or deterministic procedural generators to craft fresh challenges.
                </p>
              </div>

              <div class="about-flow-step">
                <span class="about-step-num">STEP 4</span>
                <strong style="font-size: var(--font-size-sm); color: var(--color-ink);">Pydantic Validation</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); margin: 0;">
                  Every generated item undergoes strict boundary validation: minimum 3 distinct options, verified correct index, and rich explanation.
                </p>
              </div>
            </div>
          </div>

          <!-- Interactive Fingerprint Demo -->
          <div class="about-demo-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: #F59E0B; font-weight: bold;">LIVE DEMO: Cryptographic Question Normalizer & Fingerprinter</span>
              <span style="color: #888;">Client WebCrypto Engine</span>
            </div>
            <p style="margin: 0 0 6px; font-size: 0.75rem; color: #AAA;">
              Type any question prompt below to see how Interview Arcade normalizes whitespace and calculates its SHA-256 fingerprint:
            </p>
            <input type="text" id="demo-prompt-input" class="about-demo-input" value="Explain why multiple inheritance can cause the diamond problem in C++" aria-label="Sample Question Prompt">
            <div style="margin-top: 8px; font-size: 0.75rem; color: #888;">
              Normalized String: <span id="demo-normalized-str" style="color: #60A5FA;"></span>
            </div>
            <div class="about-demo-output">
              SHA-256: <span id="demo-hash-output">calculating...</span>
            </div>
          </div>
        </section>

        <!-- PANEL 3: ANTI-AI SLOP MANIFESTO -->
        <section id="panel-manifesto" class="about-panel ${activeTab === 'manifesto' ? 'active' : ''}">
          <div class="card">
            <h3 style="margin-top: 0;">Craftsmanship Principles: The Anti-AI Slop Mandate</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-ink); line-height: 1.6;">
              Many contemporary coding web apps assemble generic purple-gradient SaaS templates with fabricated live player counters, non-functional mock buttons, and superficial wrapper fluff. Interview Arcade follows four human craftsmanship rules:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-sm); margin-top: var(--space-md);">
              <div class="card" style="margin: 0; border-top: 3px solid var(--color-ink);">
                <strong style="color: var(--color-ink); display: block; margin-bottom: 4px;">1. Tactile Physical Design</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); line-height: 1.5; margin: 0;">
                  High-contrast charcoal ink (<code style="font-family: var(--font-mono);">#1c1917</code>), warm cardstock canvas (<code style="font-family: var(--font-mono);">#faf8f5</code>), and tactile button offsets inspired by mechanical computers.
                </p>
              </div>
              <div class="card" style="margin: 0; border-top: 3px solid var(--color-accent);">
                <strong style="color: var(--color-accent); display: block; margin-bottom: 4px;">2. Zero Fabricated Metrics</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); line-height: 1.5; margin: 0;">
                  No fake "4,500 students online" counters or artificial global rankings. Every percentage and XP point is genuinely earned and computed.
                </p>
              </div>
              <div class="card" style="margin: 0; border-top: 3px solid var(--color-success);">
                <strong style="color: var(--color-success); display: block; margin-bottom: 4px;">3. Absolute Student Privacy</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); line-height: 1.5; margin: 0;">
                  Zero advertising scripts, zero third-party telemetry trackers. Passwords use salted bcrypt hashes with isolated user database records.
                </p>
              </div>
              <div class="card" style="margin: 0; border-top: 3px solid #3730A3;">
                <strong style="color: #3730A3; display: block; margin-bottom: 4px;">4. Pure Vanilla Architecture</strong>
                <p style="font-size: var(--font-size-xs); color: var(--color-ink-muted); line-height: 1.5; margin: 0;">
                  Zero megabytes of heavy frontend bundle bloat. Pure semantic HTML5, CSS design tokens, and modular vanilla ES modules that load in under 120ms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- PANEL 4: COMPARISON MATRIX -->
        <section id="panel-compare" class="about-panel ${activeTab === 'compare' ? 'active' : ''}">
          <div class="card">
            <h3 style="margin-top: 0;">How Interview Arcade Compares</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-ink-muted); margin-bottom: var(--space-md);">
              A side-by-side assessment of Interview Arcade against traditional interview grinding platforms:
            </p>
            <div style="overflow-x: auto;">
              <table class="about-compare-table">
                <thead>
                  <tr>
                    <th>Capability / Feature</th>
                    <th style="width: 40%;">Traditional Grinding Sites</th>
                    <th style="width: 40%; color: var(--color-accent);">Interview Arcade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Learning Mechanics</strong></td>
                    <td>Passive reading & copy-pasting solutions</td>
                    <td class="col-ia">Active recall-gated arcade games</td>
                  </tr>
                  <tr>
                    <td><strong>Question Repetition</strong></td>
                    <td>Repeats identical questions in static sets</td>
                    <td class="col-ia">SHA-256 deduplicated dynamic generator</td>
                  </tr>
                  <tr>
                    <td><strong>Scoring Integrity</strong></td>
                    <td>Client-calculated or mock scoreboards</td>
                    <td class="col-ia">Server-verified scoring with idempotency keys</td>
                  </tr>
                  <tr>
                    <td><strong>Mistake Handling</strong></td>
                    <td>Hidden behind paid premium subscriptions</td>
                    <td class="col-ia">Free built-in Mistake Notebook with export</td>
                  </tr>
                  <tr>
                    <td><strong>Privacy & Overhead</strong></td>
                    <td>Heavy tracking cookies & bloated bundles</td>
                    <td class="col-ia">0 trackers, pure vanilla ES modules (< 120ms load)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- PANEL 5: ACCESSIBILITY & HOTKEYS -->
        <section id="panel-accessibility" class="about-panel ${activeTab === 'accessibility' ? 'active' : ''}">
          <div class="card">
            <h3 style="margin-top: 0;">Keyboard Accessibility & WCAG 2.2 AA Compliance</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-ink); line-height: 1.6; margin-bottom: var(--space-md);">
              All interactive chambers, modal dialogs, and quiz cards are fully navigable via standard assistive devices and keyboard shortcuts:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-sm);">
              <div style="background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <kbd style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 2px 6px; border-radius: var(--radius-xs); font-family: var(--font-mono); font-weight: bold; box-shadow: 0 1px 0 rgba(0,0,0,0.2);">Tab</kbd>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink); margin-top: 4px;">
                  Cycles through interactive buttons, cells, and navigation links in logical DOM order.
                </div>
              </div>

              <div style="background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <kbd style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 2px 6px; border-radius: var(--radius-xs); font-family: var(--font-mono); font-weight: bold; box-shadow: 0 1px 0 rgba(0,0,0,0.2);">Enter / Space</kbd>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink); margin-top: 4px;">
                  Selects active options, flips memory cards, or executes Tic-Tac-Toe placement.
                </div>
              </div>

              <div style="background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <kbd style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 2px 6px; border-radius: var(--radius-xs); font-family: var(--font-mono); font-weight: bold; box-shadow: 0 1px 0 rgba(0,0,0,0.2);">Escape</kbd>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink); margin-top: 4px;">
                  Instantly dismisses modal dialogs or closes mobile navigation drawers.
                </div>
              </div>

              <div style="background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <kbd style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 2px 6px; border-radius: var(--radius-xs); font-family: var(--font-mono); font-weight: bold; box-shadow: 0 1px 0 rgba(0,0,0,0.2);">Alt + S</kbd>
                <div style="font-size: var(--font-size-xs); color: var(--color-ink); margin-top: 4px;">
                  Skips directly to the primary arcade viewport via accessible skip links.
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom Action CTA Buttons -->
        <div style="text-align: center; margin-top: var(--space-md); display: flex; justify-content: center; gap: var(--space-sm); flex-wrap: wrap;">
          <a href="#/" class="btn btn-primary">Start Practicing Problems</a>
          <a href="#/game/tictactoe" class="btn btn-subtle">Play Tic-Tac-Toe + OOP</a>
          <a href="#/assessment" class="btn btn-subtle">Take Diagnostic Assessment</a>
        </div>
      </div>
    `;

    bindEvents();
    checkSystemHealth();
    initDemoFingerprinter();
  }

  function bindEvents() {
    container.querySelectorAll('.about-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        activeTab = tab;

        container.querySelectorAll('.about-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        container.querySelectorAll('.about-panel').forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === `panel-${tab}`) {
            panel.classList.add('active');
          }
        });
      });
    });

    const pingBtn = container.querySelector('#ping-engine-btn');
    if (pingBtn) {
      pingBtn.addEventListener('click', async () => {
        pingBtn.textContent = 'Pinging...';
        await checkSystemHealth();
        pingBtn.textContent = '⚡ Ping Server';
      });
    }
  }

  function initDemoFingerprinter() {
    const input = container.querySelector('#demo-prompt-input');
    const normEl = container.querySelector('#demo-normalized-str');
    const hashEl = container.querySelector('#demo-hash-output');

    async function updateDemo() {
      if (!input || !normEl || !hashEl) return;
      const raw = input.value || '';
      // Normalization: lowercase, remove punctuation, collapse whitespace
      const normalized = raw.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      normEl.textContent = `"${normalized}"`;
      try {
        const hash = await computeSha256(normalized);
        hashEl.textContent = hash;
      } catch (e) {
        hashEl.textContent = 'WebCrypto unavailable';
      }
    }

    if (input) {
      input.addEventListener('input', updateDemo);
      updateDemo();
    }
  }

  render();

  return {
    destroy: () => {}
  };
}
