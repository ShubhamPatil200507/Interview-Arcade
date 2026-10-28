"""
Interview Arcade — Game Session Database Model
Tracks server-verified challenge outcomes, durations, scores, and awarded XP.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from backend.core.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    game_id = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(20), default="medium", nullable=False)
    score = Column(Integer, nullable=False)
    max_score = Column(Integer, nullable=False)
    questions_answered = Column(Integer, default=0, nullable=False)
    correct_answers = Column(Integer, default=0, nullable=False)
    xp_earned = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Integer, default=0, nullable=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="sessions")

    # Composite index for efficient querying by user & game
    __table_args__ = (
        Index("idx_user_game_created", "user_id", "game_id", "created_at"),
    )
