"""
Interview Arcade — Learning Paths & Mastery Pydantic Schemas
Defines evidence-based skill progression and role recommendations.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class TargetRoleUpdateRequest(BaseModel):
    target_role: str = Field(..., pattern="^(backend|fullstack|systems|data)$")

    model_config = ConfigDict(extra="forbid")


class SkillMasteryItem(BaseModel):
    skill_id: str
    skill_name: str
    questions_attempted: int
    questions_correct: int
    mastery_percent: int
    evidence_level: str  # "None", "Emerging (1-4 qns)", "Proficient (5+ qns, >70%)", "Mastered (10+ qns, >85%)"


class LearningPathStep(BaseModel):
    step_number: int
    game_id: str
    title: str
    target_skill: str
    recommended_difficulty: str
    reason: str
    status: str  # "todo", "in_progress", "completed"


class LearningPathResponse(BaseModel):
    target_role: str
    target_role_title: str
    steps: List[LearningPathStep]
    mastery_breakdown: List[SkillMasteryItem]


class RecommendationResponse(BaseModel):
    top_priority_game: str
    game_title: str
    reason: str
    recommended_difficulty: str
    weak_skills: List[str]
