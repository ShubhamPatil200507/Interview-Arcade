"""
Interview Arcade — User Achievement Database Model
Records server-verified milestone achievement unlocks.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship

from backend.core.database import Base


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(String(50), nullable=False, index=True)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="achievements")

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
        Index("idx_user_achievement", "user_id", "achievement_id"),
    )
