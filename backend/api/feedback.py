"""
Interview Arcade — User Feedback Endpoints
Enables users to submit usability reports and inspect previously submitted logs.
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_optional_user, get_current_user
from backend.models.user import User
from backend.models.feedback import Feedback
from backend.schemas.feedback import FeedbackCreateRequest, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/submit", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreateRequest,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Submits bug reports or feature suggestions with optional user attribution."""
    new_fb = Feedback(
        user_id=current_user.id if current_user else None,
        rating=payload.rating,
        category=payload.category,
        comments=payload.comments
    )
    db.add(new_fb)
    db.commit()
    db.refresh(new_fb)
    return FeedbackResponse.model_validate(new_fb)


@router.get("/my-feedback", response_model=List[FeedbackResponse])
def get_user_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all feedback entries submitted by the current authenticated user."""
    items = db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).order_by(Feedback.created_at.desc()).all()
    return [FeedbackResponse.model_validate(f) for f in items]
