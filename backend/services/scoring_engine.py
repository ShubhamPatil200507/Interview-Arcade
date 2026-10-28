"""
Interview Arcade — Centralized Server-Side Scoring & Mastery Engine
Validates all answers, enforces difficulty scaling, and computes genuine evidence-based XP.
Never trusts client-submitted scores or claims.
"""

from datetime import datetime, timezone
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.models.session import GameSession
from backend.models.mastery import SkillMastery
from backend.models.achievement import UserAchievement
from backend.models.question import Question
from backend.schemas.game import SingleAnswerSubmission, VerifiedAnswerResult

logger = logging.getLogger(__name__)

# Server-Side Master Answer Banks
SERVER_QUESTION_BANK: Dict[str, Dict[str, Any]] = {
    # OOP Questions
    "oop_e1": {"correct_index": 0, "explanation": "Encapsulation bundles state with methods and restricts direct attribute access.", "skill": "oop"},
    "oop_e2": {"correct_index": 1, "explanation": "Inheritance models an IS-A relationship; composition models HAS-A.", "skill": "oop"},
    "oop_e3": {"correct_index": 1, "explanation": "Constructors initialize state and allocate resources upon instantiation.", "skill": "oop"},
    "oop_m1": {"correct_index": 1, "explanation": "Dynamic dispatch in C++ uses a vtable and vptr per instance.", "skill": "oop"},
    "oop_m2": {"correct_index": 1, "explanation": "Liskov Substitution Principle mandates subtypes must be substitutable for base types without breaking behavior.", "skill": "oop"},
    "oop_m3": {"correct_index": 1, "explanation": "A virtual destructor ensures derived object destructors are invoked upon deletion via base pointer.", "skill": "oop"},
    "oop_h1": {"correct_index": 1, "explanation": "Weak references or explicit deregistration prevent Lapsed Listener memory leaks.", "skill": "oop"},
    "oop_h2": {"correct_index": 1, "explanation": "Object slicing strips derived member state when assigned to a base class variable by value.", "skill": "oop"},

    # Aptitude Questions
    "apt_e1": {"correct_index": 1, "explanation": "Consecutive perfect squares: 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.", "skill": "aptitude"},
    "apt_e2": {"correct_index": 1, "explanation": "Selling price = 0.80 × CP => CP = 480 / 0.80 = $600.", "skill": "aptitude"},
    "apt_e3": {"correct_index": 2, "explanation": "Caesar +1 shift: S->T, T->U, A->B, C->D, K->L => TUBDL.", "skill": "aptitude"},
    "apt_m1": {"correct_index": 1, "explanation": "Work rate = 1/10 + 1/15 = 5/30 = 1/6 per hour => 6 hours.", "skill": "aptitude"},
    "apt_m2": {"correct_index": 0, "explanation": "Pairs summing to 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5/36.", "skill": "aptitude"},
    "apt_h1": {"correct_index": 0, "explanation": "Handshakes = C(12, 2) = (12 × 11)/2 = 66 handshakes.", "skill": "aptitude"},
    "apt_h2": {"correct_index": 1, "explanation": "Minute hand at 90°, hour hand at 97.5°. Angle difference = 7.5°.", "skill": "aptitude"},

    # SQL Challenges (text tokens)
    "sql_e1": {"accepted_tokens": ["AND"], "explanation": "AND conjunction requires both predicates to evaluate to true.", "skill": "sql"},
    "sql_e2": {"accepted_tokens": ["LIMIT"], "explanation": "LIMIT clause restricts total returned tuples to 1.", "skill": "sql"},
    "sql_m1": {"accepted_tokens": ["HAVING"], "explanation": "HAVING filters aggregate groups calculated by GROUP BY.", "skill": "sql"},
    "sql_m2": {"accepted_tokens": ["IS", "IS NOT FALSE"], "explanation": "NULL comparators in 3-valued logic require IS NULL.", "skill": "sql"},
    "sql_h1": {"accepted_tokens": ["SELECT"], "explanation": "Subquery syntax starts with SELECT clause.", "skill": "sql"},
    "sql_h2": {"accepted_tokens": ["LEFT", "LEFT OUTER"], "explanation": "LEFT OUTER JOIN preserves unmatched left table rows.", "skill": "sql"},

    # Visual Riddles
    "vis_e1": {"correct_index": 0, "explanation": "Sequence increments 90° clockwise: 0° -> 90° -> 180° -> 270° (Pointing West).", "skill": "aptitude"},
    "vis_m1": {"correct_index": 0, "explanation": "Bitwise NOT inversion: shaded quadrant empties, remaining 3 fill.", "skill": "aptitude"},
    "vis_h1": {"correct_index": 0, "explanation": "Vertices N=3,4,5,6 (Hexagon); dots D=1,2,3,4.", "skill": "aptitude"},

    # DSA Match pairs
    "dsa_e1": {"match": "O(1) Constant Time", "explanation": "Array pointer index arithmetic takes O(1).", "skill": "dsa"},
    "dsa_e2": {"match": "O(log n) Logarithmic Time", "explanation": "Binary search repeatedly halves interval.", "skill": "dsa"},
    "dsa_e3": {"match": "O(n) Linear Time", "explanation": "Linear scan inspects each element once.", "skill": "dsa"},
    "dsa_e4": {"match": "O(n²) Quadratic Time", "explanation": "Nested loops for comparison.", "skill": "dsa"},
    "dsa_m1": {"match": "O(n log n) Guaranteed", "explanation": "Merge sort divides log n levels with n work each.", "skill": "dsa"},
    "dsa_m2": {"match": "Average O(1), Worst O(n)", "explanation": "Hash map averages O(1); degrades with collision.", "skill": "dsa"},
    "dsa_m3": {"match": "O(V + E) Time, O(V) Space", "explanation": "BFS traverses vertices and edges with queue.", "skill": "dsa"},
    "dsa_m4": {"match": "O(log n) Average Stack Space", "explanation": "Quick sort call stack on balanced pivots.", "skill": "dsa"},
    "dsa_h1": {"match": "O((V + E) log V)", "explanation": "Dijkstra with priority queue.", "skill": "dsa"},
    "dsa_h2": {"match": "O(V + E) Single DFS Pass", "explanation": "Tarjan low-link values in single pass.", "skill": "dsa"},

    # Debugging
    "dbg_e1": {"correct_index": 1, "explanation": "i <= nums.size() causes an off-by-one buffer overrun.", "skill": "systems"},
    "dbg_m1": {"correct_index": 1, "explanation": "Returning address of stack automatic variable yields a dangling pointer.", "skill": "systems"},
    "dbg_h1": {"correct_index": 2, "explanation": "Shallow copy passes pointer without deep copy, leading to double-free.", "skill": "systems"},

    # Interview Scenarios (Behavioral STAR & System Design)
    "beh_1": {"correct_index": 1, "explanation": "Senior engineers use benchmarks and written ADRs to resolve architectural disputes objectively.", "skill": "systems"},
    "beh_2": {"correct_index": 1, "explanation": "SEV-1 incident triage prioritizes containing blast radius and telemetry over cowboy SSH actions.", "skill": "systems"},
    "beh_3": {"correct_index": 1, "explanation": "Bad news does not age well; proactive scope communication with trade-offs builds leadership trust.", "skill": "general"},
    "beh_4": {"correct_index": 2, "explanation": "Technical debt must be quantified in financial cost, customer impact, and delivery velocity drag.", "skill": "general"},
    "beh_5": {"correct_index": 1, "explanation": "Distributed rate limiting at 60k RPS requires Redis in-memory storage with atomic Lua scripts.", "skill": "systems"},
    "beh_6": {"correct_index": 2, "explanation": "Twitter Snowflake generates 64-bit monotonically increasing unique IDs without inter-node consensus.", "skill": "systems"},

    # Diagnostic Skill Assessment
    "diag_1": {"correct_index": 1, "explanation": "Dynamic dispatch (late binding) relies on a virtual method table (vtable).", "skill": "oop"},
    "diag_2": {"correct_index": 1, "explanation": "HAVING filters groups post-aggregation; WHERE filters rows pre-aggregation.", "skill": "sql"},
    "diag_3": {"correct_index": 0, "explanation": "Two-heap design yields O(1) median lookup and O(log n) insertions.", "skill": "dsa"},
    "diag_4": {"correct_index": 2, "explanation": "Net rate = 1/6 + 1/12 - 1/24 = 5/24 reservoir per hour => 4.8 hours.", "skill": "aptitude"},
    "diag_5": {"correct_index": 1, "explanation": "Returning address of stack automatic array leaves a dangling pointer.", "skill": "systems"}
}

# XP Table per difficulty tier
XP_PER_CORRECT_ANSWER = {
    "easy": 10,
    "medium": 20,
    "hard": 35,
    "expert": 50
}


class ScoringEngine:
    @staticmethod
    def verify_answers(
        game_id: str,
        answers: List[SingleAnswerSubmission],
        db: Optional[Session] = None,
        user_id: Optional[int] = None
    ) -> Tuple[List[VerifiedAnswerResult], int, int, str, Dict[str, Dict[str, int]]]:
        """
        Verifies student submissions against server answer keys and database questions.
        Records attempts for authenticated users to power repetition elimination.
        Returns: (results_list, correct_count, total_count, primary_skill, skill_breakdown)
        """
        from backend.services.question_service import QuestionService

        results: List[VerifiedAnswerResult] = []
        correct_count = 0
        total_count = len(answers)
        primary_skill = "general"
        skill_breakdown: Dict[str, Dict[str, int]] = {}

        for ans in answers:
            q_id = ans.challenge_id
            is_correct = False
            preview = None
            explanation = ""
            s_name = "general"

            if q_id in SERVER_QUESTION_BANK:
                entry = SERVER_QUESTION_BANK[q_id]
                s_name = entry.get("skill", "general")
                primary_skill = s_name
                if s_name not in skill_breakdown:
                    skill_breakdown[s_name] = {"attempted": 0, "correct": 0}
                skill_breakdown[s_name]["attempted"] += 1

                # 1. Multiple-choice check
                if "correct_index" in entry:
                    expected_idx = entry["correct_index"]
                    is_correct = (ans.selected_option_index == expected_idx)
                    preview = f"Option {chr(65 + expected_idx)}"

                # 2. SQL / Text token check
                elif "accepted_tokens" in entry:
                    user_token = (ans.text_answer or "").strip().upper()
                    accepted = [t.upper() for t in entry["accepted_tokens"]]
                    is_correct = (user_token in accepted)
                    preview = accepted[0]

                # 3. Match item check
                elif "match" in entry:
                    expected_match = entry["match"].lower()
                    user_match = (ans.text_answer or "").strip().lower()
                    is_correct = (user_match == expected_match)
                    preview = entry["match"]

                explanation = entry.get("explanation", "")

            elif db is not None:
                # Dynamic question database verification
                db_q = db.query(Question).filter(Question.id == q_id).first()
                if db_q:
                    meta = {}
                    try:
                        meta = json.loads(db_q.metadata_json) if db_q.metadata_json else {}
                    except Exception:
                        pass
                    s_name = meta.get("skill", db_q.topic or "general")
                    primary_skill = s_name
                    if s_name not in skill_breakdown:
                        skill_breakdown[s_name] = {"attempted": 0, "correct": 0}
                    skill_breakdown[s_name]["attempted"] += 1

                    if db_q.question_type in ("mcq", "debug", "scenario"):
                        try:
                            expected_idx = int(db_q.correct_answer)
                            is_correct = (ans.selected_option_index == expected_idx)
                            preview = f"Option {chr(65 + expected_idx)}" if 0 <= expected_idx < 26 else str(expected_idx)
                        except (ValueError, TypeError):
                            is_correct = (str(ans.selected_option_index) == db_q.correct_answer)
                            preview = db_q.correct_answer

                    elif db_q.question_type == "sql_token":
                        user_token = (ans.text_answer or "").strip().upper()
                        accepted = [db_q.correct_answer.strip().upper()]
                        if "accepted_tokens" in meta and isinstance(meta["accepted_tokens"], list):
                            accepted.extend([t.strip().upper() for t in meta["accepted_tokens"]])
                        is_correct = (user_token in accepted)
                        preview = db_q.correct_answer

                    explanation = db_q.explanation or "Server-validated algorithmic explanation."
                else:
                    results.append(VerifiedAnswerResult(
                        challenge_id=q_id,
                        is_correct=False,
                        explanation="Unrecognized server challenge identifier."
                    ))
                    continue
            else:
                results.append(VerifiedAnswerResult(
                    challenge_id=q_id,
                    is_correct=False,
                    explanation="Unrecognized server challenge identifier."
                ))
                continue

            if is_correct:
                correct_count += 1
                skill_breakdown[s_name]["correct"] += 1

            results.append(VerifiedAnswerResult(
                challenge_id=q_id,
                is_correct=is_correct,
                explanation=explanation,
                correct_answer_preview=preview
            ))

            # Record attempt for authenticated candidate history
            if db is not None and user_id is not None:
                selected_val = str(ans.selected_option_index) if ans.selected_option_index is not None else ans.text_answer
                try:
                    QuestionService.record_question_attempt(
                        db=db,
                        user_id=user_id,
                        question_id=q_id,
                        game_id=game_id,
                        is_correct=is_correct,
                        selected_option=selected_val
                    )
                except Exception as ex:
                    logger.warning(f"Failed to record question attempt history for user {user_id}: {ex}")

        return results, correct_count, total_count, primary_skill, skill_breakdown

    @staticmethod
    def calculate_xp(difficulty: str, correct_count: int, total_count: int) -> int:
        """Calculates earned XP based on verified difficulty and accuracy."""
        rate = XP_PER_CORRECT_ANSWER.get(difficulty.lower(), 15)
        xp = correct_count * rate
        # Bonus for perfect run
        if total_count >= 3 and correct_count == total_count:
            xp += 25
        return xp

    @staticmethod
    def update_user_mastery_and_xp(
        db: Session,
        user: User,
        skill_id: str,
        correct_count: int,
        total_count: int,
        xp_earned: int,
        skill_breakdown: Optional[Dict[str, Dict[str, int]]] = None
    ) -> List[str]:
        """
        Updates user XP, computes new level, updates evidence-weighted skill mastery,
        and unlocks server-side verified milestone achievements.
        """
        # 1. Update user XP and level
        user.xp += xp_earned
        user.level = 1 + (user.xp // 150)

        # 2. Update Skill Mastery with evidence weighting
        skills_map = skill_breakdown if skill_breakdown else (
            {skill_id: {"attempted": total_count, "correct": correct_count}}
            if skill_id and skill_id != "general" else {}
        )

        for s_id, counts in skills_map.items():
            if not s_id or s_id == "general":
                continue

            mastery = db.query(SkillMastery).filter(
                SkillMastery.user_id == user.id,
                SkillMastery.skill_id == s_id
            ).first()

            if not mastery:
                mastery = SkillMastery(
                    user_id=user.id,
                    skill_id=s_id,
                    questions_attempted=0,
                    questions_correct=0,
                    mastery_percent=0,
                    last_practiced=datetime.now(timezone.utc)
                )
                db.add(mastery)

            mastery.questions_attempted += counts["attempted"]
            mastery.questions_correct += counts["correct"]
            mastery.last_practiced = datetime.now(timezone.utc)

            # Evidence calculation: scales up confidence as sample size reaches 5+ questions
            confidence_factor = min(1.0, mastery.questions_attempted / 5.0)
            raw_accuracy = (mastery.questions_correct / max(1, mastery.questions_attempted)) * 100
            mastery.mastery_percent = min(100, round(raw_accuracy * confidence_factor))

        # 3. Check for newly unlocked achievements
        existing_achievements = {
            a.achievement_id for a in db.query(UserAchievement).filter(
                UserAchievement.user_id == user.id
            ).all()
        }
        total_sessions_count = db.query(GameSession).filter(GameSession.user_id == user.id).count() + 1
        newly_unlocked: List[str] = []

        def grant(ach_id: str):
            if ach_id not in existing_achievements:
                ach = UserAchievement(
                    user_id=user.id,
                    achievement_id=ach_id,
                    unlocked_at=datetime.now(timezone.utc)
                )
                db.add(ach)
                existing_achievements.add(ach_id)
                newly_unlocked.append(ach_id)

        # First coin
        if total_sessions_count >= 1:
            grant("first_coin")

        # Streak 5
        if total_sessions_count >= 5:
            grant("streak_5")

        # Perfect run
        if total_count >= 3 and correct_count == total_count:
            grant("perfect_run")

        # Specific skills
        if skill_id == "dsa" and correct_count >= 3:
            grant("dsa_tactician")
        if skill_id == "sql" and correct_count >= 2:
            grant("sql_master")
        if skill_id == "systems" and correct_count >= 2:
            grant("bug_hunter")

        return newly_unlocked


scoring_engine = ScoringEngine()
