"""
Interview Arcade — User Feedback Database Model
Stores user bug reports, usability suggestions, and experience ratings.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from backend.core.database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User", back_populates="feedback_entries")
