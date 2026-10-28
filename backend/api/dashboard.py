"""
Interview Arcade — Dashboard Analytics Endpoints
Aggregates authentic student metrics and unlocked achievements using SQL aggregations.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.api.deps import get_db, get_current_user
from backend.models.user import User
from backend.models.session import GameSession
from backend.models.achievement import UserAchievement
from backend.schemas.game import DashboardMetricsResponse, GameSessionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardMetricsResponse)
def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes aggregate metrics for the authenticated student.
    Every metric derives strictly from real database records—zero fake numbers.
    """
    # 1. Aggregate totals
    totals = db.query(
        func.count(GameSession.id).label("total_sessions"),
        func.coalesce(func.sum(GameSession.questions_answered), 0).label("total_questions"),
        func.coalesce(func.sum(GameSession.correct_answers), 0).label("total_correct"),
        func.coalesce(func.sum(GameSession.duration_seconds), 0).label("total_duration")
    ).filter(GameSession.user_id == current_user.id).first()

    total_sessions = totals.total_sessions or 0
    total_questions = totals.total_questions or 0
    total_correct = totals.total_correct or 0
    total_duration = totals.total_duration or 0

    overall_accuracy = round((total_correct / max(1, total_questions)) * 100) if total_questions > 0 else 0

    # 2. Per-game breakdowns
    per_game_query = db.query(
        GameSession.game_id,
        func.count(GameSession.id).label("sessions_count"),
        func.max(GameSession.score).label("best_score"),
        func.sum(GameSession.questions_answered).label("game_questions"),
        func.sum(GameSession.correct_answers).label("game_correct"),
        func.max(GameSession.created_at).label("last_played")
    ).filter(GameSession.user_id == current_user.id).group_by(GameSession.game_id).all()

    per_game_stats: Dict[str, Any] = {}
    for row in per_game_query:
        g_acc = round((row.game_correct / max(1, row.game_questions)) * 100) if row.game_questions > 0 else 0
        per_game_stats[row.game_id] = {
            "sessions_count": row.sessions_count,
            "best_score": row.best_score,
            "accuracy": g_acc,
            "last_played": row.last_played.isoformat() if row.last_played else None
        }

    # 3. Recent 8 sessions
    recent_sessions_db = db.query(GameSession).filter(
        GameSession.user_id == current_user.id
    ).order_by(GameSession.created_at.desc()).limit(8).all()

    recent_sessions = [GameSessionResponse.model_validate(s) for s in recent_sessions_db]

    # 4. Unlocked achievements
    achievements_db = db.query(UserAchievement.achievement_id).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    unlocked_achievements = [a[0] for a in achievements_db]

    return DashboardMetricsResponse(
        total_sessions=total_sessions,
        total_questions_answered=total_questions,
        total_correct=total_correct,
        overall_accuracy=overall_accuracy,
        total_time_seconds=total_duration,
        current_xp=current_user.xp,
        current_level=current_user.level,
        target_role=current_user.target_role,
        per_game_stats=per_game_stats,
        recent_sessions=recent_sessions,
        unlocked_achievements=unlocked_achievements
    )
