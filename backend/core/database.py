"""
Interview Arcade — Database Connection & Session Management
SQLAlchemy 2.0 configuration with SQLite foreign key enforcement.
"""

from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from backend.core.config import settings

# SQLite connection args for multithreaded web server
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

# Enable foreign keys for SQLite
if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it upon exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
