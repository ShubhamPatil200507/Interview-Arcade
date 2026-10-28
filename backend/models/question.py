"""
Interview Arcade — Question Database Model
Stores verified bank questions and dynamically generated validated questions
with fingerprint hashing for strict repetition elimination.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Index
from sqlalchemy.orm import relationship

from backend.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(64), primary_key=True, index=True)
    game_id = Column(String(50), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    subtopic = Column(String(100), nullable=True)
    difficulty = Column(String(20), default="medium", nullable=False, index=True)
    question_type = Column(String(30), default="mcq", nullable=False)  # mcq, sql_token, match, debug, code, scenario
    prompt = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True)  # JSON-encoded array or dictionary of options
    correct_answer = Column(Text, nullable=False)  # Option index ("0"), value ("SELECT"), or key string
    explanation = Column(Text, nullable=True)
    fingerprint = Column(String(64), unique=True, index=True, nullable=False)  # SHA-256 of normalized prompt
    source = Column(String(30), default="bank", nullable=False)  # 'bank', 'ai_generated', 'manual'
    validation_status = Column(String(30), default="verified", nullable=False)  # 'verified', 'pending', 'rejected'
    metadata_json = Column(Text, nullable=True)  # JSON-encoded snippets, starter code, test cases, tags
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    history_entries = relationship("UserQuestionHistory", back_populates="question", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_question_game_topic_diff", "game_id", "topic", "difficulty"),
        Index("idx_question_game_diff", "game_id", "difficulty"),
    )
