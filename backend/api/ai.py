"""
Interview Arcade — AI Evaluation API Router
Provides endpoints for candidate answer evaluation, rubric feedback, and mentor exemplars.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.ai import AiEvaluationRequest, AiEvaluationResponse, AiExemplarResponse
from backend.services.ai_service import ai_service
from backend.api.deps import get_optional_user
from backend.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Evaluation"])


@router.post("/evaluate", response_model=AiEvaluationResponse)
def evaluate_candidate_response(
    request: AiEvaluationRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates an open-ended candidate answer (STAR behavioral or system design).
    Returns real strengths, omissions, rubric score breakdowns, and next recommended action.
    Works authenticated or unauthenticated for smooth demo/assessment flow.
    """
    try:
        evaluation = ai_service.evaluate_response(request)
        return evaluation
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate response. Please verify input and retry."
        )


@router.get("/exemplar/{scenario_id}", response_model=AiExemplarResponse)
def get_scenario_exemplar(
    scenario_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves mentor-grade benchmark answer for a given scenario.
    """
    return ai_service.get_exemplar(scenario_id)
