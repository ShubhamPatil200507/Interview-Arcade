"""
Interview Arcade — Security & Data Isolation Tests
Verifies cross-user privacy, score tampering prevention, and duplicate reward rejection.
"""

from fastapi.testclient import TestClient


def test_cross_user_session_isolation(client: TestClient, auth_user_a: dict, auth_user_b: dict):
    """Verifies User A cannot read or modify User B's game sessions."""
    # User A submits a challenge
    submission_a = {
        "game_id": "tictactoe",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "oop_e1", "selected_option_index": 0}
        ],
        "duration_seconds": 30,
        "idempotency_key": "idemp_user_a_session_001"
    }
    resp_a = client.post("/api/games/submit", json=submission_a, headers=auth_user_a["headers"])
    assert resp_a.status_code == 200

    # User A sees 1 session
    sessions_a = client.get("/api/games/sessions", headers=auth_user_a["headers"]).json()
    assert len(sessions_a) == 1
    assert sessions_a[0]["game_id"] == "tictactoe"

    # User B queries their own sessions -> MUST BE 0 (isolated)
    sessions_b = client.get("/api/games/sessions", headers=auth_user_b["headers"]).json()
    assert len(sessions_b) == 0, "User B should not see User A's game sessions"


def test_unauthorized_access_protection(client: TestClient):
    """Verifies unauthenticated requests cannot access protected private resources."""
    endpoints = [
        ("GET", "/api/auth/me"),
        ("GET", "/api/games/sessions"),
        ("POST", "/api/games/submit"),
        ("GET", "/api/dashboard/stats"),
        ("GET", "/api/learning/path"),
        ("GET", "/api/learning/recommendations"),
    ]

    for method, path in endpoints:
        if method == "GET":
            resp = client.get(path)
        else:
            resp = client.post(path, json={})
        assert resp.status_code == 401, f"Unauthenticated request to {path} should return 401"


def test_server_side_scoring_tamper_prevention(client: TestClient, auth_user_a: dict):
    """
    Verifies the server verifies actual answers against master keys and rejects
    client-side tampering or fabricated score claims.
    """
    # Student submits wrong answer (Option 2 instead of Option 0 for oop_e1)
    submission = {
        "game_id": "tictactoe",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "oop_e1", "selected_option_index": 2}  # WRONG
        ],
        "duration_seconds": 25,
        "idempotency_key": "idemp_tamper_test_001"
    }
    resp = client.post("/api/games/submit", json=submission, headers=auth_user_a["headers"])
    assert resp.status_code == 200
    data = resp.json()

    # The server must evaluate the answer as FALSE, score = 0, XP = 0
    assert data["correct_count"] == 0
    assert data["score"] == 0
    assert data["xp_awarded"] == 0
    assert data["results"][0]["is_correct"] is False


def test_duplicate_reward_idempotency_guard(client: TestClient, auth_user_a: dict):
    """Verifies duplicate submission requests with same idempotency key are rejected."""
    submission = {
        "game_id": "tictactoe",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "oop_e1", "selected_option_index": 0}  # CORRECT
        ],
        "duration_seconds": 20,
        "idempotency_key": "duplicate_guard_key_xyz_999"
    }

    # First attempt: succeeds and awards XP
    resp1 = client.post("/api/games/submit", json=submission, headers=auth_user_a["headers"])
    assert resp1.status_code == 200
    assert resp1.json()["xp_awarded"] == 20

    # Second attempt with same idempotency key: rejected with 409 Conflict
    resp2 = client.post("/api/games/submit", json=submission, headers=auth_user_a["headers"])
    assert resp2.status_code == 409
    assert "already submitted and verified" in resp2.json()["detail"]
