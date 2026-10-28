"""
Interview Arcade — Scoring & Difficulty Rules Tests
Verifies server-side answer keys, difficulty XP scaling, and milestone triggers.
"""

from fastapi.testclient import TestClient


def test_oop_quiz_verification(client: TestClient, auth_user_a: dict):
    """Tests multiple-choice evaluation of OOP principles."""
    submission = {
        "game_id": "tictactoe",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "oop_e1", "selected_option_index": 0},  # Correct (Encapsulation)
            {"challenge_id": "oop_e2", "selected_option_index": 1},  # Correct (IS-A)
            {"challenge_id": "oop_e3", "selected_option_index": 0}   # Incorrect
        ],
        "duration_seconds": 45,
        "idempotency_key": "oop_test_sub_101"
    }
    resp = client.post("/api/games/submit", json=submission, headers=auth_user_a["headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_count"] == 3
    assert data["correct_count"] == 2
    # Medium rate = 20 XP per correct => 2 * 20 = 40 XP
    assert data["xp_awarded"] == 40
    assert data["results"][0]["is_correct"] is True
    assert data["results"][1]["is_correct"] is True
    assert data["results"][2]["is_correct"] is False


def test_sql_token_verification(client: TestClient, auth_user_a: dict):
    """Tests SQL query fill-in-the-blank keyword validation."""
    submission = {
        "game_id": "sql",
        "difficulty": "hard",
        "answers": [
            {"challenge_id": "sql_e1", "text_answer": "and"},      # Case-insensitive "AND" -> Correct
            {"challenge_id": "sql_m1", "text_answer": "HAVING"},   # Correct
            {"challenge_id": "sql_h1", "text_answer": "SELECT"}    # Correct
        ],
        "duration_seconds": 60,
        "idempotency_key": "sql_test_sub_202"
    }
    resp = client.post("/api/games/submit", json=submission, headers=auth_user_a["headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["correct_count"] == 3
    assert data["total_count"] == 3
    # Hard rate = 35 XP * 3 = 105 XP + 25 perfect run bonus = 130 XP
    assert data["xp_awarded"] == 130
    assert "sql_master" in data["newly_unlocked_achievements"] or "perfect_run" in data["newly_unlocked_achievements"]


def test_difficulty_xp_scaling(client: TestClient, auth_user_a: dict):
    """Verifies that harder difficulty levels award proportionally greater XP."""
    diff_rates = [
        ("easy", 10),
        ("medium", 20),
        ("hard", 35)
    ]

    for idx, (diff, expected_rate) in enumerate(diff_rates):
        sub = {
            "game_id": "aptitude",
            "difficulty": diff,
            "answers": [
                {"challenge_id": "apt_e1", "selected_option_index": 1}  # 1 correct
            ],
            "duration_seconds": 15,
            "idempotency_key": f"diff_test_rate_{idx}_{diff}"
        }
        resp = client.post("/api/games/submit", json=sub, headers=auth_user_a["headers"])
        assert resp.status_code == 200
        assert resp.json()["xp_awarded"] == expected_rate
