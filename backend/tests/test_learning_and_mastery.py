"""
Interview Arcade — Learning Path & Mastery Tests
Verifies evidence-weighted skill mastery and target-role recommendations.
"""

from fastapi.testclient import TestClient


def test_evidence_weighted_mastery_calculation(client: TestClient, auth_user_a: dict):
    """
    Verifies that a student answering 1 question correctly does not receive 100% mastery
    until sufficient sample evidence (5+ challenges) is gathered.
    """
    # Submit 1 correct OOP question
    sub1 = {
        "game_id": "tictactoe",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "oop_e1", "selected_option_index": 0}
        ],
        "duration_seconds": 15,
        "idempotency_key": "mastery_evidence_001"
    }
    client.post("/api/games/submit", json=sub1, headers=auth_user_a["headers"])

    # Check learning path mastery
    path_resp = client.get("/api/learning/path", headers=auth_user_a["headers"])
    assert path_resp.status_code == 200
    oop_item = next(item for item in path_resp.json()["mastery_breakdown"] if item["skill_id"] == "oop")

    assert oop_item["questions_attempted"] == 1
    assert oop_item["questions_correct"] == 1
    # Evidence confidence factor for 1 question = 1/5 = 0.2 => 100% * 0.2 = 20%
    assert oop_item["mastery_percent"] == 20
    assert "Emerging" in oop_item["evidence_level"]


def test_target_role_update_and_recommendations(client: TestClient, auth_user_a: dict):
    """Verifies student can switch target role and receive custom game recommendations."""
    # User A starts with target_role='backend'
    rec_resp = client.get("/api/learning/recommendations", headers=auth_user_a["headers"])
    assert rec_resp.status_code == 200
    assert "weak_skills" in rec_resp.json()

    # Update role to 'systems' (embedded & C++)
    update_resp = client.put(
        "/api/learning/target-role",
        json={"target_role": "systems"},
        headers=auth_user_a["headers"]
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["target_role"] == "systems"

    # Learning path now features systems engineer steps
    path_resp = client.get("/api/learning/path", headers=auth_user_a["headers"])
    assert path_resp.status_code == 200
    assert path_resp.json()["target_role"] == "systems"
    assert "Systems & Embedded" in path_resp.json()["target_role_title"]
    # First step for systems is C++ debugging
    assert path_resp.json()["steps"][0]["game_id"] == "debugger"
