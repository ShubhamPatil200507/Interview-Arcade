"""
Interview Arcade — AI Evaluation Engine Pytest Suite
Verifies candidate answer evaluation, rubric scoring variance across strong/weak inputs,
omission and strength extraction, and mentor exemplar retrieval.
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.ai_service import ai_service
from backend.schemas.ai import AiEvaluationRequest


@pytest.fixture
def client():
    return TestClient(app)


def test_ai_evaluation_strong_star_response(client):
    """A comprehensive STAR response with concrete metrics should score highly with verified strengths."""
    payload = {
        "scenario_id": "beh_1",
        "scenario_title": "Architectural Disagreement with Senior Colleague",
        "scenario_type": "behavioral",
        "prompt": "Tell me about a time you disagreed with a colleague on an architectural decision.",
        "user_response": (
            "Situation: During our billing service migration, a senior architect favored synchronous gRPC "
            "while I believed event streams would prevent cascading failures under peak traffic.\n"
            "Task: My responsibility was to resolve the design deadlock objectively without friction.\n"
            "Action: I developed a prototype using k6 to benchmark both architectures under 45k RPS. "
            "I authored a detailed Architecture Decision Record (ADR) analyzing tail latency, consumer backpressure, "
            "and failure blast radius. The empirical data showed synchronous gRPC timed out when upstream banks stalled.\n"
            "Result: The team unanimously approved the event-driven design, and we deployed with 40% lower P99 latency "
            "and zero Sev-1 incidents during peak sales."
        )
    }

    response = client.post("/api/ai/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_id"] == "beh_1"
    assert data["overall_score"] >= 70
    assert data["evaluation_mode"] in ["semantic_heuristic_engine", "gemini_llm"]
    assert len(data["strengths"]) >= 2
    assert "Situation" in data["rubric_scores"] or "Action" in data["rubric_scores"]
    assert "Debug the Code" in data["recommended_next_action"]
    assert len(data["exemplar_answer"]) > 100


def test_ai_evaluation_weak_response_detects_omissions(client):
    """A vague or superficial response should receive a lower score and identify missing trade-offs and metrics."""
    payload = {
        "scenario_id": "beh_1",
        "scenario_title": "Architectural Disagreement with Senior Colleague",
        "scenario_type": "behavioral",
        "prompt": "Tell me about a time you disagreed with a colleague on an architectural decision.",
        "user_response": "We argued about the database. I told them my way was faster and we just went with my idea."
    }

    response = client.post("/api/ai/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["overall_score"] < 65
    assert len(data["omissions_and_gaps"]) >= 1
    # Check that omission highlights lack of metrics or evidence
    omission_text = " ".join(data["omissions_and_gaps"]).lower()
    assert any(w in omission_text for w in ["metric", "quant", "bench", "adr", "trade-off", "outcome"])


def test_ai_evaluation_trivial_empty_input(client):
    """Empty or one-word input is safely shielded with a minimal score and constructive guidance."""
    payload = {
        "scenario_id": "beh_2",
        "scenario_title": "Production Outage Resolution (SEV-1)",
        "scenario_type": "behavioral",
        "prompt": "Describe a major production outage you resolved.",
        "user_response": "i fixed it"
    }

    response = client.post("/api/ai/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["overall_score"] <= 20
    assert len(data["omissions_and_gaps"]) >= 1
    assert "brief" in data["improvement_advice"].lower() or "re-attempt" in data["recommended_next_action"].lower()


def test_ai_evaluation_system_design(client):
    """System design evaluations should score architectural trade-offs, scalability, and resilience."""
    payload = {
        "scenario_id": "beh_5",
        "scenario_title": "Distributed Rate Limiter Design",
        "scenario_type": "system_design",
        "prompt": "Design a distributed rate limiter that handles 60,000 requests per second.",
        "user_response": (
            "We deploy an in-memory Redis cluster running an atomic Lua script to implement a sliding window counter. "
            "The Lua script guarantees atomicity against race conditions across distributed microservice worker pods. "
            "To handle network partitions, we configure a circuit breaker that fails-open with local in-memory token buckets "
            "if Redis latency exceeds 15ms, maintaining 99.99% availability."
        )
    }

    response = client.post("/api/ai/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["overall_score"] >= 70
    assert "System Architecture" in data["rubric_scores"] or "Trade-off Analysis" in data["rubric_scores"]
    assert len(data["strengths"]) >= 1


def test_ai_exemplar_endpoint(client):
    """Exemplar endpoint should return benchmark mentor answer and key trade-offs."""
    response = client.get("/api/ai/exemplar/beh_1")
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_id"] == "beh_1"
    assert "Situation:" in data["exemplar_text"]
    assert len(data["key_tradeoffs"]) >= 2
