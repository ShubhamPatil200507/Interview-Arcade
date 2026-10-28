"""
Interview Arcade — User Feedback Pydantic Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class FeedbackCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    category: str = Field(..., min_length=2, max_length=50)
    comments: Optional[str] = Field(default="", max_length=1000)

    model_config = ConfigDict(extra="forbid")


class FeedbackResponse(BaseModel):
    id: int
    rating: int
    category: str
    comments: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
