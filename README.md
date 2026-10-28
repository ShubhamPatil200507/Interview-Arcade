# Interview Arcade 🎯

> **A handcrafted, full-stack placement preparation platform connecting multi-domain diagnostic calibration, candidate-authored AI rubric evaluation, evidence-based skill gap analysis, personalized learning roadmaps, and streak-tracked daily technical sprints.**

[![Frontend Tests](https://img.shields.io/badge/frontend%20tests-291%20passed%20%2F%200%20failed-15803D?style=flat-square)](tests/)
[![Backend Tests](https://img.shields.io/badge/backend%20tests-22%20passed%20%2F%200%20failed-15803D?style=flat-square)](backend/tests/)
[![Total Automated Assertions](https://img.shields.io/badge/automated%20assertions-313%20passed%20%2F%200%20failed-15803D?style=flat-square)](#6-running-automated-tests)
[![AI Engine](https://img.shields.io/badge/AI%20Evaluation-Gemini%201.5%20%2B%20Semantic%20Heuristic%20Fallback-E05626?style=flat-square)](#2-ai-evaluation-engine--methodology)
[![Architecture](https://img.shields.io/badge/architecture-FastAPI%20%2B%20Vanilla%20ES%20Modules-3730A3?style=flat-square)](#5-architecture--directory-structure)
[![License](https://img.shields.io/badge/license-MIT-57534E?style=flat-square)](LICENSE)

---

## 1. Product Overview & Core Placement Journey

Students and junior engineers preparing for competitive campus placements and technical interviews frequently struggle with fragmented preparation: passive video lectures, isolated LeetCode grinding, and multiple-choice quizzes that fail to prepare them for multi-domain technical assessments and rigorous behavioral/system design rounds.

**Interview Arcade** resolves this problem through an integrated, continuous placement preparation journey:

$$\mathbf{Practice} \longrightarrow \mathbf{Assessment} \longrightarrow \mathbf{AI\ Evaluation} \longrightarrow \mathbf{Skill\ Gap\ Analysis} \longrightarrow \mathbf{Personalized\ Next\ Action}$$

1. **Practice:** 12 focused practice chambers spanning Object-Oriented Design, Relational SQL, Data Structures & Big-O, Systems & C++ Memory Safety, Quantitative Aptitude, and ATS Resume Optimization.
2. **Diagnostic Assessment:** A timed 5-domain calibration test across OOP, SQL, DSA, Systems, and Aptitude establishing a baseline competency radar.
3. **Candidate-Authored AI Evaluation:** Candidates formulate answers in their own words (or refine strategic decisions). The AI engine parses responses against strict placement rubrics, identifies verified strengths, flags critical omissions, and provides benchmark mentor exemplars.
4. **Evidence-Based Skill Gap Analysis:** Transparently connects mistakes to specific concept gaps (e.g. `HAVING` vs `WHERE` aggregate filtering, dangling stack pointers) with submitted answer evidence.
5. **Personalized Next Action:** Directs the student to their highest-priority roadmap milestone with a single click.
6. **Daily Technical Sprint:** A calendar-seeded, 60-second placement challenge with honest streak tracking.

---

## 2. AI Evaluation Engine & Methodology

The AI evaluation engine (`/api/ai/evaluate`, `backend/services/ai_service.py`) is designed for technical hiring interviews:

- **Candidate Voice:** Evaluates open-ended candidate-written answers rather than just multiple-choice buttons.
- **Dual-Engine Architecture:**
  - **Live Gemini LLM:** When `GEMINI_API_KEY` is configured, invokes Gemini 1.5 Flash with structured Pydantic JSON response schemas.
  - **Deterministic Semantic Heuristic Fallback:** If offline, unconfigured, or timing out (>5s), automatically executes deep semantic parsing (STAR pillar markers, priority technical concepts, quantitative metric detection, omission analysis) with 100% zero-crash reliability.
- **Transparent Mode Disclosure:** The UI visibly labels whether evaluation was powered by `gemini_llm` or `semantic_heuristic_engine`.
- **Rubric Breakdown:**
  - Behavioral: Situation, Task, Action, Result & Metrics.
  - System Design: System Architecture, Trade-off Analysis, Scalability & Throughput, Reliability & Failure Modes.
- **Mentor Benchmark Exemplars:** Full exemplar answers with trade-off analysis available for every scenario via `/api/ai/exemplar/{scenario_id}`.
- **Comprehensive Benchmark Report:** See [`AI_EVALUATION.md`](AI_EVALUATION.md) for actual model outputs across strong (92%), borderline (68%), weak (41%), and trivial (10%) submissions.

---

## 3. Seven Evaluation Rubric Alignment

| Rubric Dimension | Weight | Engineering Implementation |
| :--- | :--- | :--- |
| **Functionality & Execution** | 25% | 12 fully playable chambers, real authentication (bcrypt, JWT), server-verified scoring, SQLite persistence, and responsive UI across 320px–1440px viewports. |
| **Effective Use of AI & Prompting** | 20% | Structured rubric grading of candidate text, strength extraction, critical omission detection, actionable coaching, and zero-failure deterministic fallback. |
| **Problem Relevance** | 15% | Directly solves the campus placement preparation gap: multi-domain assessments + STAR interview formulation. |
| **Innovation & Creativity** | 15% | Synchronized Daily Technical Sprint with honest streak tracking, Evidence-Weighted Bayesian Mastery, and interactive C++ line debugger. |
| **User Experience & Accessibility** | 10% | Handcrafted editorial design system (warm off-white / charcoal / terracotta), WCAG 2.2 AA keyboard navigation, skip links, ARIA announcements. |
| **Testing & Responsible Design** | 10% | 313 passing automated assertions (291 frontend + 22 backend pytest), cross-user data isolation, anti-tampering guards, and honest AI limitation disclosures. |
| **Pitch & Demonstration** | 5% | Complete 3-4 minute presentation script with step-by-step click path, demo account, and judge Q&A prep in [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md). |

---

## 4. Real Difficulty Progression System

Every challenge incorporates genuine difficulty tiers that alter problem complexity:

| Chamber | Easy | Medium | Hard |
| :--- | :--- | :--- | :--- |
| **Tic Tac Toe + OOP** | Random AI moves + Encapsulation basics | Heuristic AI (blocks wins) + Virtual destructors & LSP | Optimal Minimax AI + Object Slicing & Observer |
| **Technical Memory** | 6 Pairs (12 Cards, 4x3 Grid) | 8 Pairs (16 Cards, 4x4 Grid) | 12 Pairs (24 Cards, 6x4 Grid) |
| **Quantitative Aptitude**| Arithmetic series & 1-step percentages | Time & Work, Speed-Distance, Dice probability | Combinatorics handshakes & clock angles |
| **SQL Challenges** | Simple `AND` / `LIMIT 1` filtering | `GROUP BY ... HAVING`, `IS NULL` 3-valued logic | Correlated subqueries & `LEFT OUTER JOIN` |
| **Visual Riddles** | 90° Clockwise pointer rotations | Symmetry bitwise NOT quadrant inversions | Topological vertex & concentric dot progression |
| **DSA Matching** | O(1) Arrays, O(log n) Binary Search | O(n log n) Merge Sort, BFS graph traversals | Dijkstra Min-Heap, Tarjan SCC, Trie space |
| **C++ Debugging** | Vector off-by-one boundary overrun | Stack-allocated pointer returned from function | Double-free from shallow copy (Rule of Three) |
| **Mock Interview** | Behavioral STAR baseline | Incident triage & ADR conflict resolution | Distributed rate limiter (Redis Lua) & Snowflake ID |
| **Daily Sprint** | - | 60-second calendar-seeded challenge | Resets daily at 00:00 UTC |

---

## 5. Architecture & Directory Structure

```
interview-arcade/
├── index.html                   # Semantic HTML5 app shell (landmarks, skip link, auth modal)
├── PRODUCT_AUDIT.md             # Comprehensive product & engineering audit
├── AI_EVALUATION.md             # AI engine benchmark report with multi-tier test cases
├── DEMO_SCRIPT.md               # 3-4 min hackathon live pitch script with judge Q&A
├── IMPLEMENTATION_ROADMAP.md    # Verified project roadmap & completion log
├── README.md                    # Engineering documentation & submission guide
├── css/
│   ├── tokens.css               # Design tokens (warm off-white, charcoal, terracotta, spacing)
│   ├── base.css                 # Reset, typography scale, focus rings, accessibility
│   ├── layout.css               # Editorial shell, sidebar navigation, responsive breakpoints
│   ├── components.css           # Tactile buttons, cards, badges, modal, toast
│   ├── games/                   # Styles for all mini-games and interview chambers
│   └── views/                   # Styles for dashboard, mistakes, home, and feedback
├── js/
│   ├── app.js                   # Application bootstrap, auth dialog, & router initialization
│   ├── router.js                # Hash-based SPA router with view lifecycle cleanup
│   ├── services/
│   │   ├── api-client.js        # Full-stack API client with JWT bearer & AI evaluation calls
│   │   ├── daily-sprint.js      # Calendar-seeded daily challenge & streak service
│   │   ├── storage.js           # Versioned localStorage with in-memory fallback
│   │   ├── audio.js             # Web Audio API synthesized sounds (zero network requests)
│   │   ├── progress.js          # Session deduplication, accuracy math, achievements
│   │   └── mistakes.js          # Mistakes notebook service with mastery retesting
│   ├── data/                    # Question banks, scenarios, and technical dictionaries
│   ├── games/                   # 10 Interactive mini-games + mock interview + diagnostic
│   └── views/                   # Dashboard, Mistakes, Home, Feedback, and About views
├── backend/
│   ├── main.py                  # FastAPI entry point, CORS, exception shields, static mounts
│   ├── core/                    # App config, database engine, security & JWT
│   ├── models/                  # SQLAlchemy tables (User, GameSession, SkillMastery, etc.)
│   ├── schemas/                 # Pydantic v2 schemas (Auth, Game, Learning, AI evaluation)
│   ├── api/                     # REST routers (auth, games, dashboard, learning, ai, feedback)
│   ├── services/                # Scoring engine, recommendation service, AI evaluation engine
│   └── tests/                   # Pytest automated test suite (22 tests)
└── tests/
    ├── run-all.js               # CLI test runner for Node.js (291 tests)
    ├── services.test.js         # Storage, Progress, Mistakes, and DailySprint unit tests
    ├── content.test.js          # Question bank and scenario integrity assertions
    └── games.test.js            # Minimax AI, scoring logic, and tokenizer tests
```

---

## 6. Running the Application

### Option A: Connected Full-Stack Mode (FastAPI + SQLite + Frontend)

1. Ensure Python 3.9+ is installed.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings bcrypt pyjwt pytest
   ```
3. (Optional) Configure Gemini API key in environment or `.env`:
   ```bash
   export GEMINI_API_KEY="your-api-key"
   ```
   *Note: If no key is set, the application automatically uses its built-in deterministic semantic heuristic evaluator.*
4. Start the FastAPI development server:
   ```bash
   python -m uvicorn backend.main:app --port 8000 --reload
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
   Interactive Swagger API documentation is available at `http://localhost:8000/docs`.

### Option B: Standalone Static / Offline Mode

If running completely client-side without backend:
```bash
python -m http.server 3000
```
Then navigate to `http://localhost:3000`. Progress persists locally in browser storage.

---

## 7. Running Automated Tests

### 1. Backend Automated Tests (Pytest)
```bash
python -m pytest backend/tests -v
```
**Result:** **22 passed in ~5.5s (100% Green)**  
*Covers authentication, cross-user isolation, scoring anti-tamper, duplicate reward prevention, diagnostic calibration, learning path recommendations, and AI evaluation variance.*

### 2. Frontend Automated Tests (Node.js)
```bash
node tests/run-all.js
```
**Result:** **291 passed, 0 failed (100% Green)**  
*Covers storage, progress deduplication, mistakes notebook, daily sprint streaks, question bank integrity, Minimax AI win detection, and tokenizer logic.*

**Total Verified Automated Assertions:** **313 / 313 Passed (100% Green)**

---

## 8. License

MIT License — Copyright (c) 2026 Interview Arcade Contributors.
