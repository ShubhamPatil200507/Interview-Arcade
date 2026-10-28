"""
Interview Arcade — Challenge Submission & Game Session Endpoints
Validates user answers server-side, guards against tampering, and enforces user isolation.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user
from backend.models.user import User
from backend.models.session import GameSession
from backend.schemas.game import (
    ChallengeSubmitRequest,
    ChallengeResultResponse,
    GameSessionResponse
)
from backend.services.scoring_engine import scoring_engine

router = APIRouter(prefix="/games", tags=["Games & Submissions"])


@router.post("/submit", response_model=ChallengeResultResponse)
def submit_challenge_answers(
    payload: ChallengeSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits student answers for server-side evaluation.
    Server verifies correctness, computes XP, updates skill mastery, and unlocks achievements.
    Guarded with an idempotency key to prevent duplicate rewards.
    """
    # 1. Idempotency Check: prevent duplicate reward claims
    existing_session = db.query(GameSession).filter(
        GameSession.idempotency_key == payload.idempotency_key
    ).first()

    if existing_session:
        # If this exact challenge was already evaluated, reject duplicate reward issuance
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This challenge session was already submitted and verified. Duplicate rewards are prohibited."
        )

    # 2. Server-Side Answer Verification (Never trust client scores)
    verified_results, correct_count, total_count, primary_skill, skill_breakdown = scoring_engine.verify_answers(
        payload.game_id,
        payload.answers
    )

    # 3. Calculate true score & XP
    pts_per_correct = 25
    calculated_score = correct_count * pts_per_correct
    max_possible_score = total_count * pts_per_correct

    xp_awarded = scoring_engine.calculate_xp(
        payload.difficulty,
        correct_count,
        total_count
    )

    # 4. Record GameSession
    new_session = GameSession(
        user_id=current_user.id,
        game_id=payload.game_id,
        difficulty=payload.difficulty,
        score=calculated_score,
        max_score=max_possible_score,
        questions_answered=total_count,
        correct_answers=correct_count,
        xp_earned=xp_awarded,
        duration_seconds=payload.duration_seconds,
        idempotency_key=payload.idempotency_key
    )
    db.add(new_session)

    # 5. Update user mastery, XP, and award achievements
    newly_unlocked = scoring_engine.update_user_mastery_and_xp(
        db,
        current_user,
        primary_skill,
        correct_count,
        total_count,
        xp_awarded,
        skill_breakdown
    )

    db.commit()
    db.refresh(new_session)
    db.refresh(current_user)

    return ChallengeResultResponse(
        session_id=new_session.id,
        game_id=payload.game_id,
        difficulty=payload.difficulty,
        score=calculated_score,
        max_score=max_possible_score,
        correct_count=correct_count,
        total_count=total_count,
        xp_awarded=xp_awarded,
        new_total_xp=current_user.xp,
        new_level=current_user.level,
        newly_unlocked_achievements=newly_unlocked,
        results=verified_results
    )


@router.get("/sessions", response_model=List[GameSessionResponse])
def get_user_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    game_id: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves paginated game session history for the authenticated user.
    Enforces strict user ownership: User A CANNOT see User B's sessions.
    """
    query = db.query(GameSession).filter(GameSession.user_id == current_user.id)
    if game_id:
        query = query.filter(GameSession.game_id == game_id)

    sessions = query.order_by(GameSession.created_at.desc()).offset(skip).limit(limit).all()
    return [GameSessionResponse.model_validate(s) for s in sessions]
