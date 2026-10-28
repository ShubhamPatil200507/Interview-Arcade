"""
Interview Arcade — Learning Paths & Role Mastery Endpoints
Aligns practice chambers with target internship/placement roles and diagnostic evidence.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user
from backend.models.user import User
from backend.schemas.learning import (
    TargetRoleUpdateRequest,
    LearningPathResponse,
    RecommendationResponse
)
from backend.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/learning", tags=["Learning & Mastery"])


@router.get("/path", response_model=LearningPathResponse)
def get_user_learning_path(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves the structured learning path and mastery breakdown for the user's target role."""
    return recommendation_service.get_learning_path(db, current_user)


@router.put("/target-role")
def update_target_role(
    payload: TargetRoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the student's target preparation track (backend, systems, fullstack, data)."""
    current_user.target_role = payload.target_role
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Target role updated successfully.",
        "target_role": current_user.target_role
    }


@router.get("/recommendations", response_model=RecommendationResponse)
def get_personalized_recommendation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the top recommended practice chamber based on the student's lowest mastery areas."""
    return recommendation_service.get_recommendation(db, current_user)
