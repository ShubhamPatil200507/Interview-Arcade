"""
Interview Arcade — AI Evaluation Service
Evaluates candidate-authored interview responses with structured rubric scoring,
strengths identification, critical omission detection, improvement advice, and exemplars.
Supports live Gemini/OpenAI API calls when configured, with a robust deterministic
semantic heuristic evaluator as a 100% reliable offline/fallback engine.
"""

import json
import re
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

from backend.core.config import settings
from backend.schemas.ai import AiEvaluationRequest, AiEvaluationResponse, AiExemplarResponse

# Domain rubric standards and benchmark exemplars
SCENARIO_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "beh_1": {
        "title": "Architectural Disagreement with Senior Colleague",
        "type": "behavioral",
        "competency": "Technical Leadership & Conflict Resolution (STAR)",
        "priority_concepts": ["benchmark", "adr", "trade-off", "data", "metric", "consensus", "latency", "prototype", "customer"],
        "critical_omissions": [
            "Lack of quantitative benchmarking data or proof-of-concept",
            "Failure to document trade-offs in an Architecture Decision Record (ADR)",
            "Absence of team consensus building or blameless retrospection",
            "No measurable business or performance outcome cited"
        ],
        "exemplar": (
            "Situation: During our distributed billing service redesign, a senior engineer proposed synchronous gRPC while I advocated for event-driven Kafka messaging.\n"
            "Task: I needed to align the team on the optimal pattern without causing political friction or delaying our Q3 launch.\n"
            "Action: Rather than debating theoretically, I authored a concise 2-page ADR comparing throughput, tail latency, and failure modes. I built a quick load-test harness using k6 simulating peak 45k RPS. The benchmark revealed that synchronous gRPC suffered cascading timeouts when downstream banks stalled, whereas Kafka absorbed spikes seamlessly. I presented the empirical data in an open technical review.\n"
            "Result: The senior engineer accepted the Kafka design, the ADR was approved unanimously, and the migration shipped 2 weeks early with zero Sev-1 incidents during Black Friday."
        ),
        "next_action": "Practice 'Debug the Code (C++)' to build deeper intuition on low-level latency and resource contention."
    },
    "beh_2": {
        "title": "Production Outage Resolution (SEV-1)",
        "type": "behavioral",
        "competency": "Production Incident Management & Systems Reliability",
        "priority_concepts": ["rollback", "telemetry", "metrics", "blast radius", "post-mortem", "customer", "triage", "canary", "revert"],
        "critical_omissions": [
            "No immediate containment or blast-radius mitigation (e.g., traffic divert, rollback)",
            "Absence of blameless post-mortem with actionable preventive measures",
            "Lack of stakeholder or customer communication protocol",
            "Modifying production code directly without canary validation or version control"
        ],
        "exemplar": (
            "Situation: At 2:00 PM on Cyber Monday, our payment checkout service error rate spiked to 18% following a database schema migration.\n"
            "Task: As primary incident commander, I had to stop financial loss, protect customer orders, and restore sub-200ms latency.\n"
            "Action: I immediately declared a SEV-1 incident and halted deployment pipelines. Guided by Datadog APM traces pointing to table lock contention on the orders table, I initiated an immediate zero-downtime rollback to the previous container revision and enabled circuit breakers to queue incoming payment intents rather than dropping them. I communicated bi-hourly status updates to executive leadership.\n"
            "Result: Full service availability was restored in 11 minutes. Zero customer transactions were lost, and I subsequently led a blameless post-mortem introducing mandatory shadow-write load testing for all future schema alterations."
        ),
        "next_action": "Explore 'SQL Fill in the Blanks' to master index locking, transaction isolation levels, and query optimization."
    },
    "beh_5": {
        "title": "Distributed Rate Limiter Design",
        "type": "system_design",
        "competency": "Distributed Systems & High-Throughput Architecture",
        "priority_concepts": ["token bucket", "leaky bucket", "redis", "lua", "sliding window", "race condition", "latency", "cluster", "fail-open"],
        "critical_omissions": [
            "Unaddressed concurrency race conditions between distributed workers (e.g., need atomic Lua script or Redis counter)",
            "Undefined fail-safe behavior when the rate limiter cluster itself crashes (fail-open vs fail-closed policy)",
            "Memory complexity estimation per active user/IP",
            "Lack of multi-region replication or distributed clock drift synchronization"
        ],
        "exemplar": (
            "Architecture: I would implement a Distributed Sliding Window Counter using an in-memory Redis cluster deployed alongside our API gateway.\n"
            "Algorithm & Concurrency: To prevent race conditions across distributed microservice pods, we execute an atomic Redis Lua script that checks the current window key, increments the counter with a 60-second TTL, and evaluates whether the threshold is exceeded in a single network round-trip.\n"
            "Reliability & Fallback: If Redis latency exceeds 15ms or the cluster encounters a network partition, the limiter gracefully fails-open with local in-memory token buckets per pod, logging an alert to prevent impacting legitimate customer checkout flows.\n"
            "Scalability: Keys are partitioned by `hash(user_id) % redis_nodes`, handling 60,000 RPS with sub-2ms P99 latency."
        ),
        "next_action": "Practice 'DSA Match the Following' to solidify Big-O complexity bounds on hashing and queue operations."
    },
    "beh_6": {
        "title": "Global Unique ID Generator (Snowflake)",
        "type": "system_design",
        "competency": "Distributed ID Generation & High Availability",
        "priority_concepts": ["snowflake", "timestamp", "worker id", "sequence", "64-bit", "monotonically increasing", "clock drift", "ntp"],
        "critical_omissions": [
            "Lack of bit-level allocation breakdown (epoch timestamp, worker/datacenter ID, sequence number)",
            "Neglecting NTP clock backwards drift handling",
            "Assuming centralized database auto-increment can scale to multi-datacenter 100k RPS",
            "Omitting 64-bit integer index friendliness in B-tree database storage"
        ],
        "exemplar": (
            "Design: A 64-bit monotonically increasing ID generator modeled after Twitter Snowflake.\n"
            "Bit Allocation: 1 sign bit (unused), 41 bits for millisecond timestamp (~69 years lifespan from custom epoch), 10 bits for worker/machine ID (allowing 1,024 unique instances across datacenters), and 12 bits for sequence number (4,096 IDs per millisecond per worker).\n"
            "Clock Synchronization: If NTP clock drift moves backwards, the generator waits for the clock to catch up or shifts to a backup sequence buffer to eliminate collision risk.\n"
            "Performance: Generates up to 4.09 million unique IDs per node per second with zero coordination between nodes and native B-Tree index alignment."
        ),
        "next_action": "Practice 'Quantitative Aptitude' to master binary arithmetic, combinatorics, and clock calculations."
    }
}


class AiService:
    """Core AI evaluation engine supporting external LLMs and deterministic semantic evaluation."""

    @classmethod
    def evaluate_response(cls, request: AiEvaluationRequest) -> AiEvaluationResponse:
        """Evaluates student's open-ended answer with structured output and failure shielding."""
        cleaned_text = request.user_response.strip()

        # If user submitted empty or trivial text
        if len(cleaned_text) < 15:
            return cls._build_trivial_response(request, cleaned_text)

        # Attempt Live Gemini API if key is present
        if settings.GEMINI_API_KEY:
            try:
                llm_eval = cls._evaluate_with_gemini(request, cleaned_text)
                if llm_eval:
                    return llm_eval
            except Exception as e:
                # Fall back safely without crashing
                pass

        # Deterministic Semantic Heuristic Engine (100% reliable fallback)
        return cls._evaluate_heuristically(request, cleaned_text)

    @classmethod
    def get_exemplar(cls, scenario_id: str) -> AiExemplarResponse:
        """Retrieves high-scoring mentor exemplar for a scenario."""
        benchmark = SCENARIO_BENCHMARKS.get(scenario_id)
        if not benchmark:
            return AiExemplarResponse(
                scenario_id=scenario_id,
                scenario_title="Engineering Interview Scenario",
                exemplar_text="A structured STAR answer provides clear Context, specific individual Actions, and measurable Results with data.",
                rubric_breakdown={
                    "Situation": "Context, constraints, and business stakes.",
                    "Task": "Specific engineering ownership.",
                    "Action": "Technical decisions, trade-offs, and implementation.",
                    "Result": "Quantifiable outcomes, metrics, and reflections."
                },
                key_tradeoffs=["Latency vs Throughput", "Consistency vs Availability"]
            )

        return AiExemplarResponse(
            scenario_id=scenario_id,
            scenario_title=benchmark["title"],
            exemplar_text=benchmark["exemplar"],
            rubric_breakdown={
                "Competency": benchmark["competency"],
                "Priority Concepts": ", ".join(benchmark["priority_concepts"][:5])
            },
            key_tradeoffs=[
                "Empirical proof vs theoretical debate",
                "Immediate containment vs permanent fix",
                "Fail-open availability vs strict quota enforcement"
            ]
        )

    @classmethod
    def _evaluate_heuristically(cls, request: AiEvaluationRequest, text: str) -> AiEvaluationResponse:
        """
        Deep semantic analysis measuring:
        1. Length & conceptual density
        2. STAR pillar markers or System Architecture criteria
        3. Priority concept match
        4. Omission and gap identification
        """
        scenario = SCENARIO_BENCHMARKS.get(request.scenario_id, {
            "title": request.scenario_title,
            "type": request.scenario_type,
            "competency": "Technical Communication & Problem Solving",
            "priority_concepts": ["metrics", "trade-off", "scalability", "testing", "monitoring", "design"],
            "critical_omissions": ["Lack of quantifiable outcomes", "Omission of architectural trade-offs"],
            "exemplar": "A structured response clearly defines the problem, explores trade-offs, and validates outcomes with data.",
            "next_action": "Review the relevant module in Interview Arcade."
        })

        lower_text = text.lower()
        word_count = len(text.split())

        # 1. Concept Density Analysis
        matched_concepts = [c for c in scenario["priority_concepts"] if c in lower_text]
        concept_ratio = len(matched_concepts) / max(len(scenario["priority_concepts"]), 1)

        # 2. Structural Pillar Analysis
        is_star = request.scenario_type == "behavioral"
        rubric_scores: Dict[str, int] = {}
        strengths: List[str] = []
        gaps: List[str] = []

        if is_star:
            has_situation = any(w in lower_text for w in ["situation", "when", "project", "during", "faced", "context", "background"])
            has_task = any(w in lower_text for w in ["task", "needed", "responsible", "goal", "objective", "role", "had to"])
            has_action = any(w in lower_text for w in ["action", "implemented", "built", "designed", "created", "analyzed", "benchmarked", "led", "investigated"])
            has_result = any(w in lower_text for w in ["result", "reduced", "improved", "saved", "latency", "shipped", "prevented", "outcome", "percent", "%", "ms"])

            # Numerical metrics check
            has_metrics = bool(re.search(r'\d+(\.\d+)?%|\d+\s*(ms|rps|kb|mb|gb|sec|min|hours|dollars|k)', lower_text))

            rubric_scores["Situation"] = 85 if has_situation else 45
            rubric_scores["Task"] = 85 if has_task else 50
            rubric_scores["Action"] = 90 if has_action else 40
            rubric_scores["Result & Metrics"] = 90 if (has_result and has_metrics) else (65 if has_result else 35)

            if has_situation and has_task:
                strengths.append("Clearly framed the situational context, stakeholder constraints, and engineering objective.")
            if has_action:
                strengths.append("Articulated proactive individual actions rather than passive bystander involvement.")
            if has_metrics:
                strengths.append(f"Strengthened credibility with concrete quantitative metrics (found data markers in your response).")
            if matched_concepts:
                strengths.append(f"Demonstrated domain mastery by citing key technical concepts: {', '.join(matched_concepts[:3])}.")

            # Check omissions
            if not has_metrics:
                gaps.append("Omitted quantified business or technical impact (e.g. latency reduced by X%, zero data loss, SLA restored in Y minutes).")
            if not has_action or len(text.split()) < 40:
                gaps.append("The action section lacks technical granularity—specify the exact tools, architectures, or protocols applied.")
            for omission in scenario["critical_omissions"]:
                # Check if omission is present
                omission_keywords = [w.lower() for w in omission.split() if len(w) > 4]
                if not any(k in lower_text for k in omission_keywords):
                    if omission not in gaps and len(gaps) < 3:
                        gaps.append(omission)

        else: # System Design / Technical
            has_arch = any(w in lower_text for w in ["architecture", "component", "gateway", "cluster", "cache", "service", "storage", "database", "redis"])
            has_tradeoff = any(w in lower_text for w in ["trade-off", "tradeoff", "versus", "vs", "bottleneck", "failure", "fail-open", "partition", "latency"])
            has_scalability = any(w in lower_text for w in ["throughput", "scale", "rps", "concurrency", "distributed", "horizontal", "partition", "load"])
            has_reliability = any(w in lower_text for w in ["fallback", "circuit breaker", "retry", "replication", "availability", "consistency", "health"])

            rubric_scores["System Architecture"] = 85 if has_arch else 50
            rubric_scores["Trade-off Analysis"] = 90 if has_tradeoff else 45
            rubric_scores["Scalability & Throughput"] = 85 if has_scalability else 40
            rubric_scores["Reliability & Failure Modes"] = 85 if has_reliability else 45

            if has_arch:
                strengths.append("Proposed concrete component boundaries and suitable data store choices.")
            if has_tradeoff:
                strengths.append("Identified engineering trade-offs rather than assuming a single flawless architecture.")
            if matched_concepts:
                strengths.append(f"Directly addressed foundational design primitives: {', '.join(matched_concepts[:3])}.")

            if not has_tradeoff:
                gaps.append("Did not thoroughly discuss failure modes, bottlenecks, or trade-offs (e.g. latency vs consistency).")
            if not has_reliability:
                gaps.append("Did not specify system resilience strategies when upstream or downstream components fail.")
            for omission in scenario["critical_omissions"]:
                if omission not in gaps and len(gaps) < 3:
                    gaps.append(omission)

        # 3. Compute Composite Scores
        avg_rubric = sum(rubric_scores.values()) // max(len(rubric_scores), 1)
        tech_acc = min(100, int(40 + (concept_ratio * 40) + (15 if word_count >= 50 else 0)))
        comm_clarity = min(100, int(avg_rubric * 0.7 + (25 if word_count >= 60 else 10)))

        overall_score = int((tech_acc * 0.55) + (comm_clarity * 0.45))
        overall_score = max(25, min(98, overall_score))

        # 4. Actionable Improvement Coaching
        if overall_score >= 85:
            advice = (
                "Excellent, placement-ready answer. You balanced technical depth with clear narrative structure. "
                "In a live technical round, continue to proactively address edge cases and system monitoring."
            )
        elif overall_score >= 65:
            advice = (
                f"Solid foundation, but elevated answers require sharper precision. Focus on addressing: {gaps[0] if gaps else 'quantifiable outcomes'}. "
                "Review the benchmark exemplar below to see how top candidates structure their explanation."
            )
        else:
            advice = (
                "Your response is too brief or lacks key technical specifics. Top tier interviewers look for concrete engineering actions, "
                "justified architectural choices, and measurable results. Use the STAR methodology and study the mentor exemplar."
            )

        if not strengths:
            strengths.append("Addressed the general interview topic and demonstrated basic awareness.")

        return AiEvaluationResponse(
            scenario_id=request.scenario_id,
            scenario_title=request.scenario_title,
            overall_score=overall_score,
            evaluation_mode="semantic_heuristic_engine",
            technical_accuracy=tech_acc,
            communication_clarity=comm_clarity,
            rubric_scores=rubric_scores,
            strengths=strengths,
            omissions_and_gaps=gaps,
            improvement_advice=advice,
            exemplar_answer=scenario["exemplar"],
            target_competency=scenario["competency"],
            recommended_next_action=scenario["next_action"]
        )

    @classmethod
    def _evaluate_with_gemini(cls, request: AiEvaluationRequest, text: str) -> Optional[AiEvaluationResponse]:
        """Calls Gemini API with structured JSON output schema and strict timeout."""
        api_key = settings.GEMINI_API_KEY
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"

        system_instruction = (
            "You are an expert technical hiring manager evaluating software engineering candidates. "
            "Evaluate the student's open-ended response against the prompt, scenario, and technical rubric. "
            "Return strictly valid JSON conforming to the requested schema. Do not include markdown code block backticks."
        )

        prompt_payload = {
            "contents": [{
                "parts": [{
                    "text": (
                        f"{system_instruction}\n\n"
                        f"Question Title: {request.scenario_title}\n"
                        f"Question Type: {request.scenario_type}\n"
                        f"Prompt: {request.prompt}\n"
                        f"Candidate Response: {text}\n\n"
                        "Provide evaluation strictly formatted as JSON with keys:\n"
                        "- overall_score (integer 0-100)\n"
                        "- technical_accuracy (integer 0-100)\n"
                        "- communication_clarity (integer 0-100)\n"
                        "- rubric_scores (object mapping criteria string to integer 0-100)\n"
                        "- strengths (array of strings)\n"
                        "- omissions_and_gaps (array of strings)\n"
                        "- improvement_advice (string)\n"
                        "- exemplar_answer (string)\n"
                        "- target_competency (string)\n"
                        "- recommended_next_action (string)\n"
                    )
                }]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
                "responseMimeType": "application/json"
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(prompt_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                body = json.loads(response.read().decode("utf-8"))
                candidate = body.get("candidates", [{}])[0]
                text_content = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(text_content)

                return AiEvaluationResponse(
                    scenario_id=request.scenario_id,
                    scenario_title=request.scenario_title,
                    overall_score=int(parsed.get("overall_score", 70)),
                    evaluation_mode="gemini_llm",
                    technical_accuracy=int(parsed.get("technical_accuracy", 70)),
                    communication_clarity=int(parsed.get("communication_clarity", 70)),
                    rubric_scores=parsed.get("rubric_scores", {}),
                    strengths=parsed.get("strengths", ["Addressed the core interview question."]),
                    omissions_and_gaps=parsed.get("omissions_and_gaps", ["Could provide more technical depth."]),
                    improvement_advice=parsed.get("improvement_advice", "Continue practicing structured responses."),
                    exemplar_answer=parsed.get("exemplar_answer", SCENARIO_BENCHMARKS.get(request.scenario_id, {}).get("exemplar", "")),
                    target_competency=parsed.get("target_competency", "Technical Interview Readiness"),
                    recommended_next_action=parsed.get("recommended_next_action", "Practice recommended challenges on Interview Arcade.")
                )
        return None

    @classmethod
    def _build_trivial_response(cls, request: AiEvaluationRequest, text: str) -> AiEvaluationResponse:
        """Handles empty or trivial input with honest zero-reward feedback."""
        benchmark = SCENARIO_BENCHMARKS.get(request.scenario_id, {})
        return AiEvaluationResponse(
            scenario_id=request.scenario_id,
            scenario_title=request.scenario_title,
            overall_score=10,
            evaluation_mode="semantic_heuristic_engine",
            technical_accuracy=10,
            communication_clarity=10,
            rubric_scores={"Completeness": 10, "Depth": 10},
            strengths=["Attempted submission."],
            omissions_and_gaps=[
                "Response was empty or too brief to evaluate meaningful technical competency.",
                "Lacks problem framing, engineering actions, or concrete outcomes."
            ],
            improvement_advice="Please provide a substantive answer with your engineering thought process, tools used, and measurable outcomes.",
            exemplar_answer=benchmark.get("exemplar", "A complete answer clearly walks through Situation, Task, Action, and measurable Results."),
            target_competency=benchmark.get("competency", "Foundational Communication"),
            recommended_next_action="Re-attempt this interview question with at least 3-4 sentences following the STAR framework."
        )


ai_service = AiService()
