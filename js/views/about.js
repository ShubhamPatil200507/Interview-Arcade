/**
 * Interview Arcade — About View
 * Technical design rationale, keyboard accessibility guide, and architecture overview.
 */

export function createAboutView(params, container) {
  function render() {
    container.innerHTML = `
      <div class="content-container">
        <div class="game-frame" style="max-width: var(--max-width-text);">
          <div class="game-header-bar">
            <h2>About Interview Arcade</h2>
            <span class="badge badge-accent">Platform Overview</span>
          </div>

          <div class="card" style="margin-top: var(--space-md); gap: var(--space-md);">
            <div>
              <h3>Why Interview Arcade?</h3>
              <p>
                Technical interview preparation is too frequently reduced to passive video watching or grinding hundreds of repetitive algorithmic questions with zero active recall. Interview Arcade was engineered as a tactile, gamified alternative that challenges computer science students across all interview evaluation vectors:
              </p>
              <ul style="margin-left: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-ink);">
                <li><strong>Core OOP Fundamentals:</strong> Encapsulation, inheritance trade-offs, virtual destructors, and dynamic dispatch.</li>
                <li><strong>Relational Database Logic:</strong> Aggregate grouping, NULL 3-valued logic, and query structure.</li>
                <li><strong>Memory Safety & Systems:</strong> Dangling pointers, buffer overflows, and C++ RAII resource leaks.</li>
                <li><strong>Big-O Algorithmic Complexities:</strong> Worst/average-case time and space complexities.</li>
                <li><strong>Quantitative Placement Aptitude:</strong> Number sequences, probability, and speed-distance arithmetic.</li>
              </ul>
            </div>

            <div>
              <h3>Design Principles: The Anti-AI Slop Mandate</h3>
              <p>
                Many web applications assemble generic purple-gradient SaaS templates with fabricated statistics, fake live player counts, and non-functional controls. Interview Arcade adheres to a strict set of human craftsmanship principles:
              </p>
              <ul style="margin-left: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-ink);">
                <li><strong>Warm Indie Arcade Visual Identity:</strong> High-contrast charcoal ink, warm off-white surfaces, and tactile button offsets inspired by classic mechanical instruments and physical card decks.</li>
                <li><strong>Zero Fake Metrics:</strong> If you haven't played, the dashboard displays 0 sessions. Every accuracy percentage is calculated from real user selections.</li>
                <li><strong>Complete Privacy:</strong> Zero telemetry, zero analytics tracking, and zero cloud uploads. Your resume text and session logs remain 100% in your local browser storage.</li>
                <li><strong>Pure Vanilla Architecture:</strong> Zero megabytes of heavy frontend framework bloat. Handcrafted semantic HTML5, CSS3 variables, and vanilla modern JavaScript modules.</li>
              </ul>
            </div>

            <div>
              <h3>Keyboard Navigation & Accessibility</h3>
              <ul style="margin-left: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-ink);">
                <li><strong>Tab / Shift+Tab:</strong> Navigate through interactive controls, cards, and input fields.</li>
                <li><strong>Enter / Space:</strong> Activate focused buttons, flip memory cards, or submit moves.</li>
                <li><strong>Skip Links:</strong> Screen-reader and keyboard users can bypass the top navigation header instantly.</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: var(--space-sm);">
              <a href="#/" class="btn btn-primary">Browse Practice Problems</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render();

  return {
    destroy: () => {}
  };
}
