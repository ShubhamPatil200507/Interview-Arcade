"""
Interview Arcade — Pytest Configuration & Test Fixtures
Sets up isolated in-memory SQLite database and test API clients.
"""

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from backend.core.database import Base
from backend.api.deps import get_db
from backend.main import app

# In-memory SQLite engine for test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create tables once for test engine
Base.metadata.create_all(bind=test_engine)


@pytest.fixture(scope="function", autouse=True)
def clean_database():
    """Wipes all rows between test runs while keeping schema intact."""
    yield
    with test_engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys = OFF;"))
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.execute(text("PRAGMA foreign_keys = ON;"))
        conn.commit()


@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    """TestClient fixture overriding get_db with isolated in-memory sessions."""
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        test_client.cookies.clear()
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_user_a(client: TestClient) -> dict:
    """Registers and authenticates User A, returning user data and auth headers."""
    reg_data = {
        "username": "usera_test",
        "email": "usera@test.com",
        "password": "Password123!",
        "target_role": "backend"
    }
    resp = client.post("/api/auth/register", json=reg_data)
    assert resp.status_code == 201, f"User A registration failed: {resp.text}"
    token = resp.json()["access_token"]
    return {
        "user": resp.json()["user"],
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }


@pytest.fixture
def auth_user_b(client: TestClient) -> dict:
    """Registers and authenticates User B for cross-user isolation testing."""
    reg_data = {
        "username": "userb_test",
        "email": "userb@test.com",
        "password": "Password456!",
        "target_role": "systems"
    }
    resp = client.post("/api/auth/register", json=reg_data)
    assert resp.status_code == 201, f"User B registration failed: {resp.text}"
    token = resp.json()["access_token"]
    return {
        "user": resp.json()["user"],
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }
