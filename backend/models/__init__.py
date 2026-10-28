"""
Interview Arcade — Database Models Index
Exports all SQLAlchemy models for Base metadata registration.
"""

from backend.models.user import User
from backend.models.session import GameSession
from backend.models.mastery import SkillMastery
from backend.models.achievement import UserAchievement
from backend.models.feedback import Feedback
from backend.models.question import Question
from backend.models.question_history import UserQuestionHistory

__all__ = [
    "User",
    "GameSession",
    "SkillMastery",
    "UserAchievement",
    "Feedback",
    "Question",
    "UserQuestionHistory",
]
