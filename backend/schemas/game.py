"""
Interview Arcade — Game & Challenge Pydantic Schemas
Defines tamper-proof challenge submission, server verification, and dashboard aggregates.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class SingleAnswerSubmission(BaseModel):
    challenge_id: str
    selected_option_index: Optional[int] = None
    text_answer: Optional[str] = None
    pair_matches: Optional[Dict[str, str]] = None  # for DSA matching: { leftId: rightId }

    model_config = ConfigDict(extra="forbid")


class ChallengeSubmitRequest(BaseModel):
    game_id: str = Field(..., min_length=2, max_length=50)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard|expert)$")
    answers: List[SingleAnswerSubmission] = Field(..., min_length=1)
    duration_seconds: int = Field(default=10, ge=1, le=7200)
    idempotency_key: str = Field(..., min_length=10, max_length=128)

    model_config = ConfigDict(extra="forbid")


class VerifiedAnswerResult(BaseModel):
    challenge_id: str
    is_correct: bool
    explanation: str
    correct_answer_preview: Optional[str] = None


class ChallengeResultResponse(BaseModel):
    session_id: int
    game_id: str
    difficulty: str
    score: int
    max_score: int
    correct_count: int
    total_count: int
    xp_awarded: int
    new_total_xp: int
    new_level: int
    newly_unlocked_achievements: List[str]
    results: List[VerifiedAnswerResult]


class GameSessionResponse(BaseModel):
    id: int
    game_id: str
    difficulty: str
    score: int
    max_score: int
    questions_answered: int
    correct_answers: int
    xp_earned: int
    duration_seconds: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardMetricsResponse(BaseModel):
    total_sessions: int
    total_questions_answered: int
    total_correct: int
    overall_accuracy: int
    total_time_seconds: int
    current_xp: int
    current_level: int
    target_role: str
    per_game_stats: Dict[str, Any]
    recent_sessions: List[GameSessionResponse]
    unlocked_achievements: List[str]
