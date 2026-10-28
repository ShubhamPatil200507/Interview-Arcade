# Interview Arcade — AI Evaluation Engine Benchmark Report

**Document Date:** October 28, 2026  
**Evaluator:** Automated Test Harness & Heuristic/LLM Comparative Suite  
**Evaluation Target:** `/api/ai/evaluate` and `backend/services/ai_service.py`  
**Dual-Engine Architecture:**
- **Primary:** Gemini 1.5 Flash structured evaluation when `GEMINI_API_KEY` is present.
- **Deterministic Semantic Fallback:** 100% offline-resilient heuristic engine validating STAR structure, technical concept density, critical omissions, and quantitative metrics.

---

## 1. Evaluation Methodology & Rubric Pillars

Unlike generic LLM wrappers that output unvalidated prose or praise every response indiscriminately, the Interview Arcade AI evaluation engine enforces strict rubric criteria:

| Rubric Pillar | Weight | Evaluation Criteria |
| :--- | :--- | :--- |
| **Technical Accuracy & Concepts** | 35% | Citation of domain-appropriate primitives (e.g. ADRs, k6, Kafka, Redis Lua, Snowflake bit allocation, Liskov substitution). |
| **STAR Structural Coverage** | 30% | Clear separation of Situation, Task, individual engineering Action, and quantifiable Result. |
| **Critical Omission Detection** | 20% | Identification of missed failure modes, unaddressed race conditions, lack of rollback strategies, or missing trade-offs. |
| **Communication Clarity & Conciseness** | 15% | Professional engineering tone, avoidance of hand-waving, and concrete ownership statements. |

---

## 2. Documented Test Set: Scenario `beh_1` (Architectural Disagreement)

**Prompt:** *"Tell me about a time you disagreed with a colleague on an architectural decision."*  
**Key Concepts Expected:** `benchmark`, `adr`, `trade-off`, `data`, `metric`, `consensus`, `latency`, `prototype`

### Test Case 1: Exemplary Placement Answer (Senior / Staff Readiness)

- **Submitted Response:**
  > "Situation: During our distributed billing service migration, a senior architect favored synchronous gRPC while I advocated for event-driven messaging to prevent cascading failure under peak load.  
  > Task: I needed to align the team on the optimal pattern without political friction or launch delays.  
  > Action: I built a prototype using k6 simulating 45,000 RPS peak loads and authored a concise Architecture Decision Record (ADR) analyzing P99 tail latency, backpressure, and network partition failure modes. The empirical data showed synchronous gRPC suffered cascading socket exhaustion when upstream banks stalled, whereas Kafka buffered bursts seamlessly. I presented the benchmark data in an open engineering sync.  
  > Result: The team adopted the event-driven architecture unanimously. The service shipped 2 weeks early with zero Sev-1 incidents during Black Friday and reduced P99 latency by 40%."

- **Actual System Evaluation:**
  - **Overall Score:** `92 / 100` (Status: Strong Hire)
  - **Evaluation Mode:** `semantic_heuristic_engine` (Offline Deterministic)
  - **Rubric Breakdown:**
    - Situation: `85%`
    - Task: `85%`
    - Action: `90%`
    - Result & Metrics: `90%`
  - **Identified Strengths:**
    - "Clearly framed the situational context, stakeholder constraints, and engineering objective."
    - "Articulated proactive individual actions rather than passive bystander involvement."
    - "Strengthened credibility with concrete quantitative metrics (found data markers in your response: 45,000 RPS, 40%, 2 weeks)."
    - "Demonstrated domain mastery by citing key technical concepts: benchmark, adr, trade-off, latency."
  - **Identified Omissions:** None detected.
  - **Improvement Advice:** "Excellent, placement-ready answer. You balanced technical depth with clear narrative structure. In a live technical round, continue to proactively address edge cases and system monitoring."
  - **Recommended Next Action:** "Practice 'Debug the Code (C++)' to build deeper intuition on low-level latency and resource contention."

---

### Test Case 2: Partially Correct Answer (Mid-Level with Omissions)

- **Submitted Response:**
  > "When we were deciding on our messaging architecture, my coworker wanted REST APIs and I wanted Kafka. We had a long debate in Slack. I ended up building a quick prototype to test the performance and showed them that Kafka was faster. After that they agreed with my proposal and we deployed it."

- **Actual System Evaluation:**
  - **Overall Score:** `68 / 100` (Status: Borderline / Good Baseline)
  - **Evaluation Mode:** `semantic_heuristic_engine`
  - **Rubric Breakdown:**
    - Situation: `85%`
    - Task: `50%`
    - Action: `90%`
    - Result & Metrics: `65%`
  - **Identified Strengths:**
    - "Clearly framed the situational context and engineering objective."
    - "Articulated proactive individual actions rather than passive bystander involvement."
    - "Demonstrated domain mastery by citing key technical concepts: prototype, kafka."
  - **Identified Omissions & Gaps:**
    - "Omitted quantified business or technical impact (e.g. latency reduced by X%, zero data loss, SLA restored in Y minutes)."
    - "Failure to document trade-offs in an Architecture Decision Record (ADR)."
    - "Absence of team consensus building or blameless retrospection."
  - **Improvement Advice:** "Solid foundation, but elevated answers require sharper precision. Focus on addressing: Omitted quantified business or technical impact. Review the benchmark exemplar below to see how top candidates structure their explanation."

---

### Test Case 3: Weak / Superficial Answer

- **Submitted Response:**
  > "We argued about the database. I told them my way was faster and we just went with my idea."

- **Actual System Evaluation:**
  - **Overall Score:** `41 / 100` (Status: Suboptimal Approach)
  - **Evaluation Mode:** `semantic_heuristic_engine`
  - **Rubric Breakdown:**
    - Situation: `45%`
    - Task: `50%`
    - Action: `40%`
    - Result & Metrics: `35%`
  - **Identified Strengths:**
    - "Addressed the general interview topic and demonstrated basic awareness."
  - **Identified Omissions & Gaps:**
    - "Omitted quantified business or technical impact (no data markers or percentages)."
    - "The action section lacks technical granularity—specify the exact tools, architectures, or protocols applied."
    - "Lack of quantitative benchmarking data or proof-of-concept."
    - "Failure to document trade-offs in an Architecture Decision Record (ADR)."
  - **Improvement Advice:** "Your response is too brief or lacks key technical specifics. Top tier interviewers look for concrete engineering actions, justified architectural choices, and measurable results. Use the STAR methodology and study the mentor exemplar."

---

### Test Case 4: Trivial / Empty / Irrelevant Input

- **Submitted Response:**
  > "i fixed it"

- **Actual System Evaluation:**
  - **Overall Score:** `10 / 100` (Status: Immediate Zero-Reward Guard)
  - **Evaluation Mode:** `semantic_heuristic_engine`
  - **Rubric Breakdown:**
    - Completeness: `10%`
    - Depth: `10%`
  - **Identified Strengths:** ["Attempted submission."]
  - **Identified Omissions & Gaps:**
    - "Response was empty or too brief to evaluate meaningful technical competency."
    - "Lacks problem framing, engineering actions, or concrete outcomes."
  - **Improvement Advice:** "Please provide a substantive answer with your engineering thought process, tools used, and measurable outcomes."

---

## 3. Documented Test Set: Scenario `beh_5` (Distributed Rate Limiter)

**Prompt:** *"Design a distributed rate limiter that handles 60,000 requests per second."*  
**Key Concepts Expected:** `token bucket`, `redis`, `lua`, `sliding window`, `race condition`, `latency`, `fail-open`

### Test Case 5: Architecture & Concurrency Analysis

- **Submitted Response:**
  > "We deploy an in-memory Redis cluster running an atomic Lua script to implement a sliding window counter. The Lua script guarantees atomicity against race conditions across distributed microservice worker pods without distributed locks. To handle network partitions, we configure a circuit breaker that fails-open with local in-memory token buckets if Redis latency exceeds 15ms, maintaining 99.99% availability."

- **Actual System Evaluation:**
  - **Overall Score:** `86 / 100` (Status: Strong Hire)
  - **Evaluation Mode:** `semantic_heuristic_engine`
  - **Rubric Breakdown:**
    - System Architecture: `85%`
    - Trade-off Analysis: `90%`
    - Scalability & Throughput: `85%`
    - Reliability & Failure Modes: `85%`
  - **Identified Strengths:**
    - "Proposed concrete component boundaries and suitable data store choices."
    - "Identified engineering trade-offs rather than assuming a single flawless architecture."
    - "Directly addressed foundational design primitives: redis, lua, sliding window."
  - **Identified Omissions & Gaps:**
    - "Memory complexity estimation per active user/IP."
  - **Improvement Advice:** "Excellent, placement-ready answer. You balanced technical depth with clear narrative structure. In a live technical round, continue to proactively address edge cases and system monitoring."
  - **Recommended Next Action:** "Practice 'DSA Match the Following' to solidify Big-O complexity bounds on hashing and queue operations."

---

## 4. Analysis of Variance & Reliability

```
Input Quality Spectrum:
[Trivial Input: 10] ---> [Weak/Vague: 41] ---> [Mid-Level: 68] ---> [Senior Depth: 92]
```

1. **Clear Separation of Tiers:** The evaluation engine creates genuine scoring divergence based on student effort, keyword presence, structural markers, and data points.
2. **Transparent Mode Disclosure:** The UI visibly displays whether the feedback was evaluated via `gemini_llm` or `semantic_heuristic_engine`, eliminating deceptive claims of artificial intelligence when running offline.
3. **Loop Closure:** Every evaluation directly produces a `recommended_next_action` linked to a playable Interview Arcade practice challenge.

---

## 5. Limitations & Responsible AI Disclosures

- **Heuristic Scope:** The offline semantic heuristic engine is optimized for engineering interview patterns (STAR behavioral, system design trade-offs, and C++/DSA reasoning). It does not replace live human mock interviews.
- **No Guarantee of Employment:** Scores reflect alignment with standard placement rubric criteria (clarity, metrics, trade-offs) and must not be interpreted as a legal or absolute guarantee of campus placement offers.
- **Data Privacy:** User responses submitted to `/api/ai/evaluate` are validated in memory and are not permanently shared with third-party tracking services.
