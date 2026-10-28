"""
Interview Arcade — Skill Mastery Database Model
Tracks cumulative skill mastery with evidence-based progression.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship

from backend.core.database import Base


class SkillMastery(Base):
    __tablename__ = "skill_mastery"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(50), nullable=False, index=True)  # e.g., "oop", "dsa", "sql", "systems", "aptitude"
    questions_attempted = Column(Integer, default=0, nullable=False)
    questions_correct = Column(Integer, default=0, nullable=False)
    mastery_percent = Column(Integer, default=0, nullable=False)
    last_practiced = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="mastery_records")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
        Index("idx_user_skill", "user_id", "skill_id"),
    )
