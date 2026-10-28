"""
Interview Arcade — Dynamic Questions API Router
Provides requirement-driven question generation, repetition-free batch selection,
and candidate question attempt history endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user, get_optional_user
from backend.models.user import User
from backend.schemas.game import SingleAnswerSubmission
from backend.schemas.question import (
    QuestionGenerateRequest,
    QuestionBatchResponse,
    QuestionHistoryStatsResponse,
    SingleAnswerCheckRequest,
    SingleAnswerCheckResponse
)
from backend.services.question_service import QuestionService
from backend.services.scoring_engine import scoring_engine

router = APIRouter(prefix="/questions", tags=["Dynamic Questions & Adaptive Practice"])


@router.post("/generate", response_model=QuestionBatchResponse, status_code=status.HTTP_200_OK)
def generate_questions(
    payload: QuestionGenerateRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Delivers a varied, high-quality batch of questions tailored to user requirements.
    - Repetition Elimination: filters out questions previously seen by the candidate or in active session.
    - Revision Mode: prioritizes questions previously answered incorrectly for targeted deliberate practice.
    - Dynamic Generation: calls AI / deterministic algorithmic generators when bank questions are exhausted.
    - Security: answer keys and full explanations are withheld prior to submission.
    """
    user_id = current_user.id if current_user else None
    return QuestionService.get_or_generate_questions(
        db=db,
        request=payload,
        user_id=user_id
    )


@router.get("/history", response_model=QuestionHistoryStatsResponse)
def get_user_question_history(
    game_id: Optional[str] = Query(None, description="Optional game identifier filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns authenticated user's question attempt history, per-game accuracy,
    and weak topics for targeted revision.
    """
    return QuestionService.get_user_history_stats(
        db=db,
        user_id=current_user.id,
        game_id=game_id
    )


@router.post("/verify-single", response_model=SingleAnswerCheckResponse)
def verify_single_question(
    payload: SingleAnswerCheckRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Verifies an individual challenge answer server-side,
    enforcing server integrity and logging attempt history.
    """
    user_id = current_user.id if current_user else None
    submission = SingleAnswerSubmission(
        challenge_id=payload.challenge_id,
        selected_option_index=payload.selected_option_index,
        text_answer=payload.text_answer
    )
    results, _, _, _, _ = scoring_engine.verify_answers(
        payload.game_id,
        [submission],
        db=db,
        user_id=user_id
    )
    r = results[0]
    return SingleAnswerCheckResponse(
        challenge_id=r.challenge_id,
        is_correct=r.is_correct,
        explanation=r.explanation,
        correct_answer_preview=r.correct_answer_preview
    )
