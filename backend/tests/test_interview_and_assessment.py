"""
Interview Arcade — Behavioral Interview & Diagnostic Assessment Test Suite
Verifies server-side evaluation of STAR behavioral scenarios, system design rounds,
and multi-domain diagnostic calibration with Bayesian evidence weighting.
"""

from fastapi.testclient import TestClient


def test_behavioral_and_system_design_server_verification(client: TestClient):
    # Register candidate
    reg_resp = client.post("/api/auth/register", json={
        "username": "candidate_alex",
        "email": "alex.interview@example.com",
        "password": "Password123!",
        "target_role": "backend"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit behavioral & system design challenge
    # beh_1 correct_index is 1, beh_2 correct_index is 1, beh_5 correct_index is 1, beh_6 correct_index is 2
    sub_payload = {
        "game_id": "interview",
        "difficulty": "hard",
        "answers": [
            {"challenge_id": "beh_1", "selected_option_index": 1},  # Correct (ADR + benchmark)
            {"challenge_id": "beh_2", "selected_option_index": 1},  # Correct (triage protocol)
            {"challenge_id": "beh_3", "selected_option_index": 0},  # Incorrect (hero crunch)
            {"challenge_id": "beh_5", "selected_option_index": 1},  # Correct (Redis Lua script)
            {"challenge_id": "beh_6", "selected_option_index": 2}   # Correct (Snowflake 64-bit)
        ],
        "duration_seconds": 95,
        "idempotency_key": "interview_alex_session_001"
    }

    sub_resp = client.post("/api/games/submit", json=sub_payload, headers=headers)
    assert sub_resp.status_code == 200, f"Submission failed: {sub_resp.text}"
    data = sub_resp.json()

    assert data["total_count"] == 5
    assert data["correct_count"] == 4
    # Hard tier: 35 XP per correct answer = 4 * 35 = 140 XP
    assert data["xp_awarded"] == 140
    assert data["new_total_xp"] == 140

    # Verify duplicate idempotency rejection
    dup_resp = client.post("/api/games/submit", json=sub_payload, headers=headers)
    assert dup_resp.status_code == 409


def test_diagnostic_assessment_multi_domain_calibration(client: TestClient):
    # Register new student
    reg_resp = client.post("/api/auth/register", json={
        "username": "candidate_sam",
        "email": "sam.diagnostic@example.com",
        "password": "Password123!",
        "target_role": "systems"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit diagnostic test:
    # diag_1: oop (correct is 1)
    # diag_2: sql (correct is 1)
    # diag_3: dsa (correct is 0)
    # diag_4: aptitude (correct is 2)
    # diag_5: systems (correct is 1)
    sub_payload = {
        "game_id": "assessment",
        "difficulty": "medium",
        "answers": [
            {"challenge_id": "diag_1", "selected_option_index": 1},  # Correct (vtable)
            {"challenge_id": "diag_2", "selected_option_index": 1},  # Correct (HAVING)
            {"challenge_id": "diag_3", "selected_option_index": 0},  # Correct (Two-Heap)
            {"challenge_id": "diag_4", "selected_option_index": 2},  # Correct (4.8h)
            {"challenge_id": "diag_5", "selected_option_index": 1}   # Correct (Dangling pointer)
        ],
        "duration_seconds": 110,
        "idempotency_key": "diag_sam_assessment_001"
    }

    sub_resp = client.post("/api/games/submit", json=sub_payload, headers=headers)
    assert sub_resp.status_code == 200, f"Diagnostic submission failed: {sub_resp.text}"
    data = sub_resp.json()

    # Flawless 5/5 run
    assert data["total_count"] == 5
    assert data["correct_count"] == 5
    # Medium tier: 20 XP * 5 = 100 XP + 25 perfect run bonus = 125 XP
    assert data["xp_awarded"] == 125
    assert "perfect_run" in data["newly_unlocked_achievements"]

    # Verify Bayesian mastery updated across all 5 domains
    path_resp = client.get("/api/learning/path", headers=headers)
    assert path_resp.status_code == 200
    mastery_list = path_resp.json()["mastery_breakdown"]

    # 1 question attempted per domain: confidence damping factor is 1/5 = 0.2
    # Accuracy = 100% => mastery_percent = round(100 * 0.2) = 20%
    for item in mastery_list:
        assert item["questions_attempted"] == 1
        assert item["questions_correct"] == 1
        assert item["mastery_percent"] == 20
        assert "Emerging" in item["evidence_level"]
