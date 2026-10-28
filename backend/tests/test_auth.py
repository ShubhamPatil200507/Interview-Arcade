"""
Interview Arcade — Authentication & Authorization Tests
Tests user registration, bcrypt password hashing, and JWT token issuance.
"""

from fastapi.testclient import TestClient


def test_user_registration_success(client: TestClient):
    payload = {
        "username": "coder_pro",
        "email": "coder@example.com",
        "password": "StrongPassword99!",
        "target_role": "backend"
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "coder_pro"
    assert data["user"]["email"] == "coder@example.com"
    assert data["user"]["xp"] == 0
    assert data["user"]["level"] == 1


def test_user_registration_duplicate_email(client: TestClient):
    payload = {
        "username": "user_one",
        "email": "shared@example.com",
        "password": "Password123!",
        "target_role": "backend"
    }
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    # Attempt second registration with same email
    payload2 = {
        "username": "user_two",
        "email": "shared@example.com",
        "password": "Password456!",
        "target_role": "systems"
    }
    resp2 = client.post("/api/auth/register", json=payload2)
    assert resp2.status_code == 400
    assert "email address already exists" in resp2.json()["detail"]


def test_user_registration_invalid_inputs(client: TestClient):
    # Short password (< 6 chars)
    resp = client.post("/api/auth/register", json={
        "username": "valid_user",
        "email": "test@valid.com",
        "password": "123"
    })
    assert resp.status_code == 422

    # Malformed email
    resp_bad_email = client.post("/api/auth/register", json={
        "username": "valid_user",
        "email": "not-an-email",
        "password": "ValidPassword123!"
    })
    assert resp_bad_email.status_code == 422


def test_user_login_success_and_failure(client: TestClient):
    # Register account
    client.post("/api/auth/register", json={
        "username": "login_tester",
        "email": "login@tester.com",
        "password": "CorrectPassword123!"
    })

    # Valid Login
    login_resp = client.post("/api/auth/login", json={
        "email": "login@tester.com",
        "password": "CorrectPassword123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Invalid password
    bad_login_resp = client.post("/api/auth/login", json={
        "email": "login@tester.com",
        "password": "WrongPassword!"
    })
    assert bad_login_resp.status_code == 401
    assert "Incorrect email or password" in bad_login_resp.json()["detail"]


def test_authenticated_me_endpoint(client: TestClient, auth_user_a: dict):
    resp = client.get("/api/auth/me", headers=auth_user_a["headers"])
    assert resp.status_code == 200
    assert resp.json()["username"] == "usera_test"
    assert resp.json()["email"] == "usera@test.com"

    # Unauthenticated attempt (clear cookies from client first)
    client.cookies.clear()
    unauth_resp = client.get("/api/auth/me")
    assert unauth_resp.status_code == 401
