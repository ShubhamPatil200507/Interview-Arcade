"""
Interview Arcade — Learning Path & Recommendation Service
Generates targeted learning pathways based on target-role standards and student mastery.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.models.mastery import SkillMastery
from backend.schemas.learning import LearningPathStep, SkillMasteryItem, LearningPathResponse, RecommendationResponse

ROLE_ROADMAPS: Dict[str, Dict[str, Any]] = {
    "backend": {
        "title": "Core Backend & Distributed Systems",
        "priority_skills": ["oop", "sql", "dsa", "systems", "aptitude"],
        "steps": [
            {"step_number": 1, "game_id": "tictactoe", "title": "Tic Tac Toe + OOP Quiz", "target_skill": "oop", "reason": "Master dynamic dispatch, encapsulation, and class relationships"},
            {"step_number": 2, "game_id": "sql", "title": "SQL Fill in the Blanks", "target_skill": "sql", "reason": "Practice aggregation, grouping, HAVING, and 3-valued NULL logic"},
            {"step_number": 3, "game_id": "dsa", "title": "DSA Match the Following", "target_skill": "dsa", "reason": "Solidify Big-O time and space complexity intuition"},
            {"step_number": 4, "game_id": "debugger", "title": "Debug the Code (C++)", "target_skill": "systems", "reason": "Identify memory leaks, dangling pointers, and boundary hazards"},
            {"step_number": 5, "game_id": "aptitude", "title": "Quantitative Aptitude", "target_skill": "aptitude", "reason": "Sharpen placement rounds arithmetic and probability"}
        ]
    },
    "systems": {
        "title": "Systems & Embedded Software Engineer",
        "priority_skills": ["systems", "oop", "dsa", "aptitude"],
        "steps": [
            {"step_number": 1, "game_id": "debugger", "title": "Debug the Code (C++)", "target_skill": "systems", "reason": "Essential for C++ memory safety, pointer mechanics, and RAII"},
            {"step_number": 2, "game_id": "tictactoe", "title": "Tic Tac Toe + OOP Quiz", "target_skill": "oop", "reason": "Virtual destructors, object slicing, and polymorphic dispatch"},
            {"step_number": 3, "game_id": "dsa", "title": "DSA Match the Following", "target_skill": "dsa", "reason": "Analyze stack limits, graph traversals, and heap complexities"},
            {"step_number": 4, "game_id": "riddles", "title": "Visual Logic Riddles", "target_skill": "aptitude", "reason": "Train topological sequence and bitwise pattern deduction"}
        ]
    },
    "fullstack": {
        "title": "Full Stack Application Engineer",
        "priority_skills": ["oop", "sql", "dsa", "aptitude"],
        "steps": [
            {"step_number": 1, "game_id": "tictactoe", "title": "Tic Tac Toe + OOP Quiz", "target_skill": "oop", "reason": "Build component models and clean architectural decoupling"},
            {"step_number": 2, "game_id": "sql", "title": "SQL Fill in the Blanks", "target_skill": "sql", "reason": "Query database tables efficiently and avoid N+1 query traps"},
            {"step_number": 3, "game_id": "memory", "title": "Technical Memory Match", "target_skill": "systems", "reason": "Recall networking, HTTP, DNS, and operating system terminology"},
            {"step_number": 4, "game_id": "debugger", "title": "C++ Systems Debugger", "target_skill": "systems", "reason": "Identify memory leaks, pointer defects, and runtime crashes"}
        ]
    },
    "data": {
        "title": "Data Engineering & Analytics",
        "priority_skills": ["sql", "dsa", "aptitude", "systems"],
        "steps": [
            {"step_number": 1, "game_id": "sql", "title": "SQL Fill in the Blanks", "target_skill": "sql", "reason": "Query analysis, subqueries, group filtering, and join mechanics"},
            {"step_number": 2, "game_id": "dsa", "title": "DSA Match the Following", "target_skill": "dsa", "reason": "Hash maps, tries, and algorithmic complexity bottlenecks"},
            {"step_number": 3, "game_id": "aptitude", "title": "Quantitative Aptitude", "target_skill": "aptitude", "reason": "Combinatorics, probability, and numerical series reasoning"}
        ]
    }
}

SKILL_DISPLAY_NAMES = {
    "oop": "Object-Oriented Programming",
    "sql": "Relational Databases & SQL",
    "dsa": "Data Structures & Big-O",
    "systems": "Systems & Memory Safety",
    "aptitude": "Quantitative Aptitude"
}


class RecommendationService:
    @staticmethod
    def get_learning_path(db: Session, user: User) -> LearningPathResponse:
        role_key = user.target_role.lower() if user.target_role else "backend"
        role_info = ROLE_ROADMAPS.get(role_key, ROLE_ROADMAPS["backend"])

        # Fetch student mastery records
        mastery_map: Dict[str, SkillMastery] = {
            m.skill_id: m for m in db.query(SkillMastery).filter(SkillMastery.user_id == user.id).all()
        }

        # Build mastery breakdown items
        breakdown: List[SkillMasteryItem] = []
        for s_id in ["oop", "sql", "dsa", "systems", "aptitude"]:
            m = mastery_map.get(s_id)
            attempted = m.questions_attempted if m else 0
            correct = m.questions_correct if m else 0
            percent = m.mastery_percent if m else 0

            # Determine evidence confidence tier
            if attempted == 0:
                evidence = "None"
            elif attempted < 5:
                evidence = f"Emerging ({attempted} challenges)"
            elif percent >= 80:
                evidence = f"Mastered ({attempted} challenges, {percent}%)"
            else:
                evidence = f"Proficient ({attempted} challenges, {percent}%)"

            breakdown.append(SkillMasteryItem(
                skill_id=s_id,
                skill_name=SKILL_DISPLAY_NAMES.get(s_id, s_id.upper()),
                questions_attempted=attempted,
                questions_correct=correct,
                mastery_percent=percent,
                evidence_level=evidence
            ))

        # Build steps with completion statuses
        steps: List[LearningPathStep] = []
        for s in role_info["steps"]:
            m = mastery_map.get(s["target_skill"])
            status = "todo"
            recommended_diff = "easy"
            if m:
                if m.mastery_percent >= 75:
                    status = "completed"
                    recommended_diff = "hard"
                elif m.questions_attempted > 0:
                    status = "in_progress"
                    recommended_diff = "medium"

            steps.append(LearningPathStep(
                step_number=s["step_number"],
                game_id=s["game_id"],
                title=s["title"],
                target_skill=s["target_skill"],
                recommended_difficulty=recommended_diff,
                reason=s["reason"],
                status=status
            ))

        return LearningPathResponse(
            target_role=role_key,
            target_role_title=role_info["title"],
            steps=steps,
            mastery_breakdown=breakdown
        )

    @staticmethod
    def get_recommendation(db: Session, user: User) -> RecommendationResponse:
        path = RecommendationService.get_learning_path(db, user)

        # Identify lowest mastery skill required by this role
        lowest_skill = "oop"
        lowest_score = 999
        weak_skills = []

        for item in path.mastery_breakdown:
            if item.mastery_percent < 70:
                weak_skills.append(item.skill_name)
            if item.mastery_percent < lowest_score:
                lowest_score = item.mastery_percent
                lowest_skill = item.skill_id

        # Match to appropriate game
        skill_game_map = {
            "oop": ("tictactoe", "Tic Tac Toe + OOP Quiz"),
            "sql": ("sql", "SQL Fill in the Blanks"),
            "dsa": ("dsa", "DSA Match the Following"),
            "systems": ("debugger", "Debug the Code (C++)"),
            "aptitude": ("aptitude", "Quantitative Aptitude")
        }

        rec_game, rec_title = skill_game_map.get(lowest_skill, ("tictactoe", "Tic Tac Toe + OOP Quiz"))
        rec_diff = "easy" if lowest_score < 40 else "medium" if lowest_score < 75 else "hard"

        return RecommendationResponse(
            top_priority_game=rec_game,
            game_title=rec_title,
            reason=f"Your current {SKILL_DISPLAY_NAMES.get(lowest_skill, lowest_skill)} proficiency is at {lowest_score}%. Practice this challenge to strengthen your {path.target_role_title} readiness.",
            recommended_difficulty=rec_diff,
            weak_skills=weak_skills
        )


recommendation_service = RecommendationService()
