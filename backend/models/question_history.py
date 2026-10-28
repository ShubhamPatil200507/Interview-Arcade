"""
Interview Arcade — User Question History Model
Persists per-user question attempt outcomes, mistake tracking, and frequency
to prevent repetition and support deliberate revision mode.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship

from backend.core.database import Base


class UserQuestionHistory(Base):
    __tablename__ = "user_question_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(64), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    game_id = Column(String(50), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    attempt_count = Column(Integer, default=1, nullable=False)
    last_selected_option = Column(Text, nullable=True)
    last_attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="question_histories")
    question = relationship("Question", back_populates="history_entries")

    __table_args__ = (
        Index("idx_user_question_unique", "user_id", "question_id"),
        Index("idx_user_game_correct", "user_id", "game_id", "is_correct"),
    )
