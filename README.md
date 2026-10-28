# Interview Arcade 🕹️

> **A handcrafted, client-side technical interview preparation platform featuring 10 interactive mini-games, authentic difficulty scaling, and honest browser persistence.**

[![Tests](https://img.shields.io/badge/tests-203%20passed%20%2F%200%20failed-15803D?style=flat-square)](tests/)
[![Architecture](https://img.shields.io/badge/architecture-Vanilla%20ES%20Modules-E05626?style=flat-square)](#architecture--engineering-standards)
[![Persistence](https://img.shields.io/badge/persistence-Client--Side%20localStorage-3730A3?style=flat-square)](#honest-progress--persistence-engine)
[![License](https://img.shields.io/badge/license-MIT-57534E?style=flat-square)](#license)

---

## 1. Product Overview

Technical interview preparation is too frequently reduced to passive video watching or grinding hundreds of repetitive algorithmic questions with zero active recall.

**Interview Arcade** was engineered as an engaging, tactile preparation cabinet designed for computer science and engineering students. It covers core CS topics through 10 distinct, fully interactive mini-game chambers:

1. **Tic Tac Toe + OOP Quiz:** Human vs. Minimax AI board game with integrated OOP trivia on strategic placements.
2. **Technical Memory Match:** Tactile 3D card-flipping challenge matching terms to definitions (6 to 12 pairs).
3. **Quantitative Aptitude Quiz:** Placement assessment covering number series, probability, and work/time.
4. **Resume Keyword Matcher:** Transparent, deterministic client-side resume vs. job description parser.
5. **SQL Fill in the Blanks:** Relational schema table inspector and query-clause completion.
6. **Visual Logic Riddles:** Original vector SVG pattern recognition, matrix reasoning, and sequence puzzles.
7. **DSA Match the Following:** Accessible two-column connector linking algorithms to exact Big-O complexities.
8. **Debug the Code (C++):** Line-by-line defect localization for boundary overruns, dangling pointers, and double-frees.
9. **Feedback Chamber:** Device-local feedback logging with privacy transparency and deletion controls.
10. **Progress & Analytics Dashboard:** Real-time metrics, per-game personal bests, and authentic achievements.

---

## 2. Distinctive Visual Identity & Human-Crafted Design

Interview Arcade rejects the ubiquitous "AI-generated SaaS aesthetic" (monotonous purple gradients, glowing decorative blobs, repeated 3-column card grids, and fake player counters).

Instead, it implements a **Warm Indie Arcade** aesthetic:
- **Paper & Ink Surface Palette:** Warm off-white background (`#FBF9F5`), muted stone containers (`#F3EFE6`), crisp surface cards (`#FFFFFF`), and deep near-black charcoal ink (`#1C1917`).
- **Tactile Physical Elevation:** Solid 2px-3px ink borders with offset box-shadows (`3px 3px 0px #1C1917`), giving buttons and cards a physical, mechanical response on press (`transform: translate(2px, 2px)`).
- **Restrained Arcade Accent:** Warm Vermilion / Arcade Amber (`#E05626`) reserved strictly for primary actions, badges, and score accents.
- **Monospace Precision:** Code snippets, difficulty badges, and metric counters use `'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas`.
- **Zero External Runtime Bloat:** Audio synthesized in real time via the Web Audio API without downloading external audio files; vector diagrams rendered directly via inline SVG.

---

## 3. Real Difficulty Progression System

Every challenge incorporates genuine difficulty tiers that alter problem complexity rather than simply shortening arbitrary timers:

| Game | Easy | Medium | Hard |
|---|---|---|---|
| **Tic Tac Toe + OOP** | Random AI moves + Basic Class/Encapsulation trivia | Heuristic AI (blocks wins) + Virtual destructors & LSP | Optimal Minimax AI + Object Slicing & Observer patterns |
| **Technical Memory** | 6 Pairs (12 Cards, 4x3 Grid) | 8 Pairs (16 Cards, 4x4 Grid) | 12 Pairs (24 Cards, 6x4 Grid) |
| **Quantitative Aptitude**| Arithmetic series & 1-step percentages | 2-stage Time & Work, Speed-Distance, Dice probability | Combinatorics handshakes & clock angles |
| **SQL Challenges** | Simple `AND` / `LIMIT 1` filtering | `GROUP BY ... HAVING`, `IS NULL` 3-valued logic | Correlated subqueries & `LEFT OUTER JOIN` |
| **Visual Riddles** | 90° Clockwise pointer rotations | Symmetry bitwise NOT quadrant inversions | Topological vertex & concentric dot progression |
| **DSA Matching** | O(1) Arrays, O(log n) Binary Search | O(n log n) Merge Sort, BFS graph traversals | Dijkstra Min-Heap, Tarjan SCC, Trie space |
| **C++ Debugging** | Vector off-by-one boundary overrun | Stack-allocated pointer returned from function | Double-free from shallow copy (Rule of Three) |

---

## 4. Architecture & Engineering Standards

```
interview-arcade/
├── index.html                   # Semantic HTML5 app shell (landmarks, skip link, live region)
├── IMPLEMENTATION_ROADMAP.md    # Honest project task tracker & completion record
├── README.md                    # Engineering documentation & interview defense guide
├── css/
│   ├── tokens.css               # Design tokens (colors, ink, shadows, spacing, radii)
│   ├── base.css                 # Reset, typography scale, focus rings, accessibility
│   ├── layout.css               # App shell, navigation header, responsive container
│   ├── components.css           # Tactile buttons, cards, badges, modal, toast
│   ├── games/                   # Game-specific stylesheets
│   └── views/                   # Dashboard, home, and feedback stylesheets
├── js/
│   ├── app.js                   # Application bootstrap & router initialization
│   ├── router.js                # Hash-based SPA router with view lifecycle cleanup
│   ├── services/
│   │   ├── storage.js           # Versioned localStorage with in-memory fallback
│   │   ├── audio.js             # Web Audio API retro sound synthesizer
│   │   └── progress.js          # Session deduplication, accuracy math, achievements
│   ├── data/                    # Verified question banks & dictionaries
│   ├── games/                   # 8 Interactive mini-game modules
│   └── views/                   # Home, Dashboard, Feedback, and About views
└── tests/
    ├── run-all.js               # CLI test runner (Node.js)
    ├── runner.html              # In-browser test runner
    ├── services.test.js         # Storage & Progress unit tests
    ├── content.test.js          # Data integrity assertions
    └── games.test.js            # Algorithmic logic & tokenizer tests
```

---

## 5. Honest Progress & Persistence Engine

- **Client-Side Privacy:** All activity is persisted solely in the browser's `localStorage` under `interview_arcade_v1_`. No cookies, tracking scripts, or remote endpoints are invoked.
- **Session Deduplication:** Guards against duplicate session logging caused by UI rerenders, multiple clicks, or page refreshes.
- **Genuine Mathematical Accuracy:** Overall accuracy is calculated as:
  $$\text{Accuracy} = \operatorname{round}\left(\frac{\sum \text{Correct Answers}}{\sum \text{Questions Answered}} \times 100\right)$$
  If no questions have been answered, the dashboard displays `0%` and a welcoming empty state rather than inventing numbers.
- **Verifiable Achievements:**
  - `first_coin` — Completed 1st mini-game session.
  - `streak_5` — Completed 5 sessions across the platform.
  - `perfect_run` — Scored 100% in any quiz challenge.
  - `dsa_tactician` — Scored $\ge 80\%$ in DSA Match the Following.
  - `sql_master` — Successfully validated the SQL challenge.
  - `bug_hunter` — Eliminated all defects in C++ Debugging.
  - `all_rounder` — Practiced in at least 5 distinct game modules.

---

## 6. Running Locally

Because Interview Arcade uses modern ES modules and vanilla web standards, it requires no build step.

### Quick Start with Node.js:
```bash
# Clone the repository
git clone https://github.com/shubham/interview-arcade.git
cd interview-arcade

# Run local static server (any of the following):
npx serve .
# or
python -m http.server 8000
```
Open `http://localhost:3000` or `http://localhost:8000` in any modern web browser.

---

## 7. Automated Test Suite

Interview Arcade includes an automated test harness executable both from the terminal (via Node.js) and directly in the browser:

### Run via Command Line:
```bash
node tests/run-all.js
```

### Verification Output:
```
=== INTERVIEW ARCADE AUTOMATED TEST SUITE ===
▶ Suite: StorageService (4 passed)
▶ Suite: ProgressService (9 passed)
▶ Suite: OOP Questions Integrity (79 passed)
▶ Suite: Memory Terms Integrity (37 passed)
▶ Suite: Aptitude Bank Integrity (45 passed)
▶ Suite: SQL Challenges Integrity (13 passed)
▶ Suite: DSA Matching Sets Integrity (13 passed)
▶ Suite: C++ Debugging Snippets Integrity (10 passed)
▶ Suite: TicTacToe Win Detection Logic (5 passed)
▶ Suite: Resume Matcher Keyword Tokenizer (5 passed)

Total Assertions: 203
Passed: 203
ALL TESTS PASSED SUCCESSFULLY! (100% Green)
```

---

## 8. Defending This Project in Technical Interviews

When explaining this project to interviewers, highlight these engineering decisions:

1. **Why Vanilla JavaScript over React/Vue?**
   - Eliminates megabytes of node_modules, bundle compile steps, and hydration overhead.
   - Demonstrates deep native understanding of the DOM API, custom hash routing, event delegation, and Web Audio synthesis.
2. **How does Minimax in Tic Tac Toe work?**
   - Evaluates terminal board states (+10 for AI win, -10 for Human win, 0 for draw) discounted by depth to prioritize faster wins and delayed losses.
3. **How is state corruption prevented in LocalStorage?**
   - The `StorageService` wraps all JSON operations in `try/catch`, uses versioned prefixes (`interview_arcade_v1_`), and provides transparent fallback to an in-memory `Map` if storage quota is exceeded or browser private mode restricts access.
4. **How are symbol-based keywords parsed in the Resume Matcher?**
   - Standard word-boundary regex (`\b`) breaks on languages like `C++` or `C#` because symbols are treated as non-word characters. We implemented a boundary matcher that handles leading and trailing non-alphanumeric punctuation.

---

## 9. Deployment to GitHub Pages

Interview Arcade is 100% static and deployment-ready:
1. Push repository to GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Branch**, select `main` / `root` and click **Save**.
4. Your site will be live at `https://<username>.github.io/<repo>/` with fully working hash navigation (`#/game/tictactoe`).

---

## 10. License

Released under the [MIT License](LICENSE). Handcrafted with pride for computer engineering students.
