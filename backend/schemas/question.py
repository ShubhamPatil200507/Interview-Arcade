"""
Interview Arcade — Question & History Pydantic Schemas
Defines request parameters for requirement-driven dynamic generation,
safe client question payloads (hiding answers before submission), and history tracking.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict


class QuestionGenerateRequest(BaseModel):
    """Parameters for requesting questions dynamically."""
    game_id: str = Field(..., min_length=2, max_length=50, description="Chamber or game identifier (e.g. tictactoe, sql-blanks)")
    topic: Optional[str] = Field(default=None, max_length=100, description="Filtered topic or subtopic")
    subtopic: Optional[str] = Field(default=None, max_length=100, description="Optional granular subtopic")
    difficulty: str = Field(default="all", pattern="^(all|easy|medium|hard|expert)$", description="Difficulty filter")
    count: int = Field(default=5, ge=1, le=20, description="Number of distinct questions requested")
    mode: str = Field(default="fresh", pattern="^(fresh|revision|all)$", description="Fresh practice, mistake revision, or all")
    target_role: Optional[str] = Field(default=None, max_length=50, description="Target career track")
    exclude_ids: List[str] = Field(default_factory=list, description="IDs to avoid (e.g., seen in current browser session)")

    model_config = ConfigDict(extra="forbid")


class QuestionItemResponse(BaseModel):
    """Client-facing question representation. Correct answers are strictly hidden before submission."""
    id: str
    game_id: str
    topic: str
    subtopic: Optional[str] = None
    difficulty: str
    question_type: str
    prompt: str
    options: Optional[Union[List[Any], Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    source: str = "bank"

    model_config = ConfigDict(from_attributes=True)


class QuestionBatchResponse(BaseModel):
    """Response payload containing a batch of verified, repetition-free questions."""
    game_id: str
    topic: Optional[str] = None
    difficulty: str
    mode: str
    requested_count: int
    delivered_count: int
    questions: List[QuestionItemResponse]
    bank_count: int
    generated_count: int
    message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class QuestionHistoryRecord(BaseModel):
    """Record of an individual question attempt."""
    id: int
    question_id: str
    game_id: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    is_correct: bool
    attempt_count: int
    last_selected_option: Optional[str] = None
    last_attempted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionHistoryStatsResponse(BaseModel):
    """Aggregated question attempt statistics and weak skills for targeted practice."""
    total_attempted: int
    total_correct: int
    total_incorrect: int
    accuracy_rate: float
    by_game: Dict[str, Dict[str, int]]
    weak_topics: List[str]

    model_config = ConfigDict(from_attributes=True)
