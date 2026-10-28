"""
Interview Arcade — User Database Model
Represents registered students with target role, XP, and learning progress.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from backend.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    target_role = Column(String(50), default="backend", nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    mastery_records = relationship("SkillMastery", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    feedback_entries = relationship("Feedback", back_populates="user")
    question_histories = relationship("UserQuestionHistory", back_populates="user", cascade="all, delete-orphan")
