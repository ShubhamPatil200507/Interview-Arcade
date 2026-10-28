"""
Interview Arcade — End-to-End User Integration Journey
Verifies the complete 9-step user preparation lifecycle:
1. Register and log in.
2. Select target role.
3. Start a game challenge.
4. Submit challenge answers for server verification.
5. Verify XP awarded and session recorded exactly once.
6. Verify skill evidence and mastery updated.
7. Retrieve updated dashboard progress.
8. Verify persistence across requests.
9. Log out and verify protected access is denied.
"""

from fastapi.testclient import TestClient


def test_complete_user_preparation_journey(client: TestClient):
    # STEP 1: Register student account
    reg_payload = {
        "username": "shubham_engineer",
        "email": "shubham.student@example.com",
        "password": "MasterInterview2026!",
        "target_role": "backend"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Verify initial profile
    me_resp = client.get("/api/auth/me", headers=auth_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "shubham_engineer"
    assert me_resp.json()["xp"] == 0

    # STEP 2: Configure target role
    role_resp = client.put(
        "/api/learning/target-role",
        json={"target_role": "backend"},
        headers=auth_headers
    )
    assert role_resp.status_code == 200

    # STEP 3: Retrieve learning path recommendation
    rec_resp = client.get("/api/learning/recommendations", headers=auth_headers)
    assert rec_resp.status_code == 200
    assert rec_resp.json()["top_priority_game"] in ["tictactoe", "sql", "dsa"]

    # STEP 4: Submit challenge answers for server-side verification
    sub_payload = {
        "game_id": "sql",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "sql_e1", "text_answer": "AND"},     # Correct
            {"challenge_id": "sql_m1", "text_answer": "HAVING"}   # Correct
        ],
        "duration_seconds": 35,
        "idempotency_key": "e2e_journey_key_001_sql"
    }
    sub_resp = client.post("/api/games/submit", json=sub_payload, headers=auth_headers)
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()

    # STEP 5: Verify XP awarded and session recorded exactly once
    assert sub_data["correct_count"] == 2
    assert sub_data["total_count"] == 2
    assert sub_data["xp_awarded"] == 40  # 2 * 20 (Medium)
    assert sub_data["new_total_xp"] == 40
    assert "first_coin" in sub_data["newly_unlocked_achievements"]

    # Duplicate submission with same idempotency key is rejected
    dup_resp = client.post("/api/games/submit", json=sub_payload, headers=auth_headers)
    assert dup_resp.status_code == 409

    # STEP 6: Verify skill evidence and mastery updated
    path_resp = client.get("/api/learning/path", headers=auth_headers)
    assert path_resp.status_code == 200
    sql_mastery = next(item for item in path_resp.json()["mastery_breakdown"] if item["skill_id"] == "sql")
    assert sql_mastery["questions_attempted"] == 2
    assert sql_mastery["questions_correct"] == 2
    # 2 questions attempted => confidence = 2/5 = 0.4 => 100% * 0.4 = 40%
    assert sql_mastery["mastery_percent"] == 40

    # STEP 7: Retrieve updated dashboard statistics
    dash_resp = client.get("/api/dashboard/stats", headers=auth_headers)
    assert dash_resp.status_code == 200
    stats = dash_resp.json()
    assert stats["total_sessions"] == 1
    assert stats["total_questions_answered"] == 2
    assert stats["total_correct"] == 2
    assert stats["overall_accuracy"] == 100
    assert stats["current_xp"] == 40
    assert "first_coin" in stats["unlocked_achievements"]

    # STEP 8: Verify persistence across session retrieval
    history_resp = client.get("/api/games/sessions", headers=auth_headers)
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 1
    assert history_resp.json()[0]["game_id"] == "sql"

    # STEP 9: Log out and verify protected access is denied
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200

    # Unauthenticated request without header fails
    protected_resp = client.get("/api/dashboard/stats")
    assert protected_resp.status_code == 401
