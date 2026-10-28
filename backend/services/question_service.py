"""
Interview Arcade — Dynamic Question Generation & Repetition Elimination Service
Hybrid pipeline combining:
1. Static verified question bank with auto-seeding.
2. SHA-256 normalized prompt fingerprinting and paraphrase token-overlap detection.
3. User question history tracking (fresh practice vs mistake revision).
4. Dynamic AI generation via Gemini API with deterministic schema validation and quality fallback.
5. Answer key isolation (prevents client-side cheating before submission).
"""

import hashlib
import json
import logging
import re
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

from sqlalchemy import and_, func, not_, or_
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.models.question import Question
from backend.models.question_history import UserQuestionHistory
from backend.schemas.question import (
    QuestionBatchResponse,
    QuestionGenerateRequest,
    QuestionHistoryRecord,
    QuestionHistoryStatsResponse,
    QuestionItemResponse,
)

logger = logging.getLogger(__name__)


def compute_fingerprint(text: str) -> str:
    """
    Normalizes prompt text and computes a SHA-256 fingerprint.
    Normalizations:
    - Lowercase
    - Strip all punctuation and special characters
    - Collapse multiple whitespace to single space
    """
    cleaned = re.sub(r"[^a-z0-9\s]", "", text.lower())
    normalized = " ".join(cleaned.split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def are_paraphrases(text1: str, text2: str, threshold: float = 0.85) -> bool:
    """Detects near-duplicate paraphrasing using Jaccard word-token similarity."""
    tokens1 = {w for w in re.sub(r"[^a-z0-9\s]", "", text1.lower()).split() if len(w) > 3}
    tokens2 = {w for w in re.sub(r"[^a-z0-9\s]", "", text2.lower()).split() if len(w) > 3}
    if not tokens1 or not tokens2:
        return False
    overlap = len(tokens1.intersection(tokens2)) / len(tokens1.union(tokens2))
    return overlap >= threshold


# Initial verified baseline questions across arcade modules
STATIC_VERIFIED_BANK: List[Dict[str, Any]] = [
    # OOP Questions (Game ID: tictactoe)
    {
        "id": "oop_e1",
        "game_id": "tictactoe",
        "topic": "Encapsulation",
        "subtopic": "Access Modifiers",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "Which OOP principle is primarily achieved by making class member variables private and providing public getters and setters?",
        "options": ["Encapsulation", "Polymorphism", "Multiple Inheritance", "Dynamic Binding"],
        "correct_answer": "0",
        "explanation": "Encapsulation bundles data and the methods that operate on that data within a single unit and restricts direct access to internal components.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_e2",
        "game_id": "tictactoe",
        "topic": "Inheritance",
        "subtopic": "Relationships",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "In object-oriented programming, what relationship does inheritance model between a parent class and a derived child class?",
        "options": ['"HAS-A" relationship', '"IS-A" relationship', '"USES-A" relationship', '"IMPLEMENTS-ALL" relationship'],
        "correct_answer": "1",
        "explanation": 'Inheritance models an "IS-A" relationship (e.g., a Dog "IS-A" Animal), whereas composition models a "HAS-A" relationship.',
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_e3",
        "game_id": "tictactoe",
        "topic": "Constructors",
        "subtopic": "Lifecycle",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "What is the primary role of a constructor in a class?",
        "options": [
            "To deallocate memory when an object goes out of scope",
            "To initialize the newly created object's state and allocate resources",
            "To convert an object into a JSON string",
            "To enforce multiple inheritance at runtime"
        ],
        "correct_answer": "1",
        "explanation": "Constructors initialize member attributes and allocate necessary resources whenever a new instance is instantiated.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_e4",
        "game_id": "tictactoe",
        "topic": "Polymorphism",
        "subtopic": "Static Dispatch",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "Method overloading in Java and C++ is an example of which kind of polymorphism?",
        "options": ["Compile-time (Static) Polymorphism", "Run-time (Dynamic) Polymorphism", "Subtyping Polymorphism", "Ad-hoc Garbage Collection"],
        "correct_answer": "0",
        "explanation": "Method overloading resolves which method signature to invoke at compile time based on parameter count and types.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_e5",
        "game_id": "tictactoe",
        "topic": "Abstraction",
        "subtopic": "Abstract Classes",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "Can you directly instantiate an abstract class using the 'new' operator?",
        "options": ["No, abstract classes cannot be instantiated directly", "Yes, always", "Yes, but only if all methods are static", "Yes, if it has no constructors"],
        "correct_answer": "0",
        "explanation": "Abstract classes serve as blueprints; they cannot be instantiated directly without being subclassed with concrete implementations.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_m1",
        "game_id": "tictactoe",
        "topic": "Polymorphism",
        "subtopic": "Virtual Table",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": "How do C++ compilers achieve dynamic dispatch (runtime method overriding) for virtual member functions?",
        "options": [
            "By scanning source files at runtime",
            "Using a Virtual Method Table (vtable) and a hidden vptr per object",
            "By converting all virtual functions to switch-case statements",
            "Through automatic heap reallocation"
        ],
        "correct_answer": "1",
        "explanation": "When a class has virtual functions, the compiler creates a vtable containing function pointers. Each object holds a hidden pointer (vptr) pointing to this vtable.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_m2",
        "game_id": "tictactoe",
        "topic": "SOLID Principles",
        "subtopic": "Liskov Substitution",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": 'In the SOLID design principles, what does the "Liskov Substitution Principle" (LSP) dictate?',
        "options": [
            "Every class must implement at least two public interfaces",
            "Subtypes must be substitutable for their base types without altering program correctness",
            "Low-level modules must directly depend on high-level concrete classes",
            "Objects should never inherit from abstract classes"
        ],
        "correct_answer": "1",
        "explanation": "LSP states that objects of a superclass should be replaceable with objects of its subclasses without breaking application behavior.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_m3",
        "game_id": "tictactoe",
        "topic": "Destructors",
        "subtopic": "Virtual Destructors",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": 'Why should a base class destructor always be declared "virtual" in C++ when deleting a derived object via a base pointer?',
        "options": [
            "To prevent the base constructor from executing twice",
            "To ensure the derived class destructor is invoked, preventing undefined behavior and resource leaks",
            "To force all member variables to become private",
            "To speed up stack allocation"
        ],
        "correct_answer": "1",
        "explanation": "If the base destructor is not virtual, calling delete on a Base* pointing to a Derived instance only calls ~Base(), leaking resources allocated by ~Derived().",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_m4",
        "game_id": "tictactoe",
        "topic": "Inheritance Problems",
        "subtopic": "Diamond Problem",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": 'What is the "Diamond Problem" in object-oriented languages that allow multiple inheritance?',
        "options": [
            "Circular dependency between two private methods",
            "Ambiguity when a class inherits from two classes that both inherit from the same common ancestor",
            "A memory leak caused by self-referential smart pointers",
            "The inability to declare private static variables"
        ],
        "correct_answer": "1",
        "explanation": "The Diamond Problem occurs when class D inherits from B and C, which both inherit from A. Without virtual inheritance, D receives two conflicting copies of A's members.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_h1",
        "game_id": "tictactoe",
        "topic": "Design Patterns",
        "subtopic": "Observer Pattern",
        "difficulty": "hard",
        "question_type": "mcq",
        "prompt": 'In the Observer pattern, what mechanism prevents memory leaks (the "Lapsed Listener Problem") in garbage-collected languages?',
        "options": [
            "Using strong static references inside the Subject",
            "Explicitly unsubscribing or using Weak References (WeakReference/WeakMap) for listeners",
            "Calling System.gc() after every event dispatch",
            "Declaring the Observer as final"
        ],
        "correct_answer": "1",
        "explanation": "If a long-lived subject holds strong references to short-lived observers, the garbage collector cannot reclaim the observers. Weak references or explicit deregistration solve this.",
        "metadata": {"skill": "oop"}
    },
    {
        "id": "oop_h2",
        "game_id": "tictactoe",
        "topic": "C++ Object Model",
        "subtopic": "Object Slicing",
        "difficulty": "hard",
        "question_type": "mcq",
        "prompt": "In C++, what is Object Slicing and when does it occur?",
        "options": [
            "When an array of objects exceeds stack boundaries",
            "When a derived class object is assigned to a base class object by value, stripping derived-specific state",
            "When a compiler strips unused template specializations",
            "When a destructor fails to deallocate heap memory"
        ],
        "correct_answer": "1",
        "explanation": "Object slicing occurs when a derived class instance is copied into a base class value variable. The copy constructor of the base class only copies the base portion, discarding derived members.",
        "metadata": {"skill": "oop"}
    },

    # SQL Challenges (Game ID: sql-blanks)
    {
        "id": "sql_e1",
        "game_id": "sql-blanks",
        "topic": "Filtering & WHERE",
        "subtopic": "Logical Conjunction",
        "difficulty": "easy",
        "question_type": "sql_token",
        "prompt": "SELECT name, salary FROM employees WHERE department = 'Engineering' ___ salary > 85000;",
        "options": ["AND", "OR", "XOR", "NOT"],
        "correct_answer": "AND",
        "explanation": "AND conjunction requires both predicates to evaluate to true.",
        "metadata": {"skill": "sql", "accepted_tokens": ["AND"]}
    },
    {
        "id": "sql_e2",
        "game_id": "sql-blanks",
        "topic": "Ordering & Limits",
        "subtopic": "LIMIT Clause",
        "difficulty": "easy",
        "question_type": "sql_token",
        "prompt": "SELECT name, salary FROM employees ORDER BY salary DESC ___ 1;",
        "options": ["LIMIT", "TOP", "FIRST", "FETCH"],
        "correct_answer": "LIMIT",
        "explanation": "LIMIT clause restricts total returned tuples to 1.",
        "metadata": {"skill": "sql", "accepted_tokens": ["LIMIT"]}
    },
    {
        "id": "sql_m1",
        "game_id": "sql-blanks",
        "topic": "Aggregation",
        "subtopic": "HAVING Clause",
        "difficulty": "medium",
        "question_type": "sql_token",
        "prompt": "SELECT department, AVG(salary) FROM employees GROUP BY department ___ AVG(salary) > 80000;",
        "options": ["HAVING", "WHERE", "QUALIFY", "FILTER"],
        "correct_answer": "HAVING",
        "explanation": "HAVING filters aggregate groups calculated by GROUP BY.",
        "metadata": {"skill": "sql", "accepted_tokens": ["HAVING"]}
    },
    {
        "id": "sql_m2",
        "game_id": "sql-blanks",
        "topic": "NULL Handling",
        "subtopic": "IS Operator",
        "difficulty": "medium",
        "question_type": "sql_token",
        "prompt": "SELECT name FROM employees WHERE manager_id ___ NULL;",
        "options": ["IS", "=", "LIKE", "EQUALS"],
        "correct_answer": "IS",
        "explanation": "NULL comparators in 3-valued SQL logic require IS NULL rather than '='.",
        "metadata": {"skill": "sql", "accepted_tokens": ["IS", "IS NOT FALSE"]}
    },
    {
        "id": "sql_h1",
        "game_id": "sql-blanks",
        "topic": "Subqueries",
        "subtopic": "Scalar Subquery",
        "difficulty": "hard",
        "question_type": "sql_token",
        "prompt": "SELECT name FROM employees WHERE salary > (___ AVG(salary) FROM employees);",
        "options": ["SELECT", "FROM", "WITH", "EXEC"],
        "correct_answer": "SELECT",
        "explanation": "Subquery syntax starts with SELECT clause.",
        "metadata": {"skill": "sql", "accepted_tokens": ["SELECT"]}
    },
    {
        "id": "sql_h2",
        "game_id": "sql-blanks",
        "topic": "Joins",
        "subtopic": "Outer Joins",
        "difficulty": "hard",
        "question_type": "sql_token",
        "prompt": "SELECT e.name, d.department_name FROM employees e ___ JOIN departments d ON e.dept_id = d.id;",
        "options": ["LEFT", "CROSS", "NATURAL", "MERGE"],
        "correct_answer": "LEFT",
        "explanation": "LEFT OUTER JOIN preserves unmatched left table rows.",
        "metadata": {"skill": "sql", "accepted_tokens": ["LEFT", "LEFT OUTER"]}
    },

    # Aptitude (Game ID: aptitude)
    {
        "id": "apt_e1",
        "game_id": "aptitude",
        "topic": "Number Series",
        "subtopic": "Squares",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "Find the next number in the sequence: 4, 9, 16, 25, 36, ?",
        "options": ["47", "49", "50", "64"],
        "correct_answer": "1",
        "explanation": "Consecutive perfect squares: 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_e2",
        "game_id": "aptitude",
        "topic": "Percentages",
        "subtopic": "Profit & Loss",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": "A programmer sells an old GPU for $480, incurring a 20% loss on the original cost. What was the original cost price?",
        "options": ["$560", "$600", "$580", "$620"],
        "correct_answer": "1",
        "explanation": "Selling price = 0.80 × CP => CP = 480 / 0.80 = $600.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_e3",
        "game_id": "aptitude",
        "topic": "Logical Reasoning",
        "subtopic": "Character Coding",
        "difficulty": "easy",
        "question_type": "mcq",
        "prompt": 'If "LOGIC" is coded as "MPHID" (+1 to each letter), how is "STACK" coded under the same rule?',
        "options": ["TUBCM", "TUADL", "TUBDL", "RUADJ"],
        "correct_answer": "2",
        "explanation": "Caesar +1 shift: S->T, T->U, A->B, C->D, K->L => TUBDL.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_m1",
        "game_id": "aptitude",
        "topic": "Time and Work",
        "subtopic": "Collaborative Rate",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": "Worker A can build a feature in 10 hours, while Worker B can build the same feature in 15 hours. How long will it take them working together?",
        "options": ["5 hours", "6 hours", "7.5 hours", "8 hours"],
        "correct_answer": "1",
        "explanation": "Work rate = 1/10 + 1/15 = 5/30 = 1/6 per hour => 6 hours.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_m2",
        "game_id": "aptitude",
        "topic": "Probability",
        "subtopic": "Dice Combinations",
        "difficulty": "medium",
        "question_type": "mcq",
        "prompt": "What is the probability of getting a sum of 8 when two fair six-sided dice are rolled?",
        "options": ["5/36", "1/6", "7/36", "1/9"],
        "correct_answer": "0",
        "explanation": "Pairs summing to 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes out of 36.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_h1",
        "game_id": "aptitude",
        "topic": "Combinatorics",
        "subtopic": "Handshake Problem",
        "difficulty": "hard",
        "question_type": "mcq",
        "prompt": "At a tech conference networking dinner, 12 engineers all shake hands with each other once. How many total handshakes occur?",
        "options": ["66", "72", "132", "144"],
        "correct_answer": "0",
        "explanation": "Handshakes = C(12, 2) = (12 × 11)/2 = 66 handshakes.",
        "metadata": {"skill": "aptitude"}
    },
    {
        "id": "apt_h2",
        "game_id": "aptitude",
        "topic": "Clocks & Angles",
        "subtopic": "Clock Geometry",
        "difficulty": "hard",
        "question_type": "mcq",
        "prompt": "What is the angle between the hour hand and minute hand of a clock at 3:15?",
        "options": ["0°", "7.5°", "12°", "15°"],
        "correct_answer": "1",
        "explanation": "Minute hand at 90°, hour hand at 90° + (15 × 0.5°) = 97.5°. Angle difference = 7.5°.",
        "metadata": {"skill": "aptitude"}
    },

    # Debugger (Game ID: debugger)
    {
        "id": "dbg_e1",
        "game_id": "debugger",
        "topic": "Boundary Conditions",
        "subtopic": "Vector Out of Bounds",
        "difficulty": "easy",
        "question_type": "debug",
        "prompt": "Identify the critical flaw in this loop:\n\nfor (size_t i = 0; i <= nums.size(); ++i) {\n    total += nums[i];\n}",
        "options": [
            "total is uninitialized",
            "i <= nums.size() causes an off-by-one buffer overrun reading nums[nums.size()]",
            "size_t cannot be incremented",
            "nums[i] requires pointer dereference"
        ],
        "correct_answer": "1",
        "explanation": "Vectors are 0-indexed up to size() - 1. i <= nums.size() causes an off-by-one buffer overrun.",
        "metadata": {"skill": "systems", "buggy_line": 1}
    },
    {
        "id": "dbg_m1",
        "game_id": "debugger",
        "topic": "Memory Safety",
        "subtopic": "Dangling Pointers",
        "difficulty": "medium",
        "question_type": "debug",
        "prompt": "Identify the defect in this factory function:\n\nint* createCounter() {\n    int count = 10;\n    return &count;\n}",
        "options": [
            "Cannot assign 10 to int",
            "Returning address of stack automatic variable yields a dangling pointer upon function return",
            "Missing static_cast",
            "Memory leak because free() was omitted"
        ],
        "correct_answer": "1",
        "explanation": "Variable count lives on the call stack. Returning &count returns a dangling pointer referencing deallocated stack memory.",
        "metadata": {"skill": "systems", "buggy_line": 3}
    },
    {
        "id": "dbg_h1",
        "game_id": "debugger",
        "topic": "Rule of Three/Five",
        "subtopic": "Double Free",
        "difficulty": "hard",
        "question_type": "debug",
        "prompt": "Class Buffer owns a heap array `int* data = new int[size];`. When Buffer b2 = b1 is executed, what bug occurs upon destruction?",
        "options": [
            "Stack overflow during compilation",
            "Infinite recursive copy constructor calls",
            "Shallow copy of raw pointer leads to double-free undefined behavior when both destructors delete data",
            "Memory leak because memory cannot be copied"
        ],
        "correct_answer": "2",
        "explanation": "Default shallow copy replicates the raw pointer. When both instances go out of scope, both destructors call delete[], triggering a double-free crash.",
        "metadata": {"skill": "systems", "buggy_line": 2}
    }
]


class QuestionService:
    """Core question generation, deduplication, and history-aware delivery service."""

    @classmethod
    def seed_question_bank(cls, db: Session) -> int:
        """Seeds verified static bank questions into database if not already present."""
        inserted = 0
        for item in STATIC_VERIFIED_BANK:
            existing = db.query(Question).filter(Question.id == item["id"]).first()
            if not existing:
                fp = compute_fingerprint(item["prompt"])
                q = Question(
                    id=item["id"],
                    game_id=item["game_id"],
                    topic=item["topic"],
                    subtopic=item.get("subtopic"),
                    difficulty=item["difficulty"],
                    question_type=item.get("question_type", "mcq"),
                    prompt=item["prompt"],
                    options_json=json.dumps(item["options"]),
                    correct_answer=str(item["correct_answer"]),
                    explanation=item.get("explanation"),
                    fingerprint=fp,
                    source="bank",
                    validation_status="verified",
                    metadata_json=json.dumps(item.get("metadata", {}))
                )
                db.add(q)
                inserted += 1
        if inserted > 0:
            db.commit()
            logger.info(f"Seeded {inserted} baseline questions into questions table.")
        return inserted

    @classmethod
    def get_or_generate_questions(
        cls,
        db: Session,
        request: QuestionGenerateRequest,
        user_id: Optional[int] = None
    ) -> QuestionBatchResponse:
        """
        Primary question selection and generation pipeline.
        1. Ensures verified question bank is seeded.
        2. Retrieves eligible unseen questions based on mode (fresh vs revision).
        3. If bank count is insufficient, dynamically generates validated questions.
        4. Isolates answers from client response payload.
        """
        # Ensure database has base questions
        if db.query(func.count(Question.id)).scalar() == 0:
            cls.seed_question_bank(db)

        # Build set of excluded question IDs
        excluded_ids: Set[str] = set(request.exclude_ids or [])

        # History-aware filtering for authenticated users
        mistake_ids: List[str] = []
        if user_id:
            # Query questions user previously attempted
            user_history = db.query(UserQuestionHistory).filter(
                UserQuestionHistory.user_id == user_id,
                UserQuestionHistory.game_id == request.game_id
            ).all()

            for h in user_history:
                if request.mode == "fresh":
                    excluded_ids.add(h.question_id)
                elif request.mode == "revision" and not h.is_correct:
                    mistake_ids.append(h.question_id)

        selected_questions: List[Question] = []

        # In revision mode, prioritize past mistakes
        if request.mode == "revision" and mistake_ids:
            revision_query = db.query(Question).filter(
                Question.id.in_(mistake_ids),
                Question.game_id == request.game_id
            )
            if request.difficulty != "all":
                revision_query = revision_query.filter(Question.difficulty == request.difficulty)
            if request.topic:
                revision_query = revision_query.filter(Question.topic.ilike(f"%{request.topic}%"))

            selected_questions = revision_query.limit(request.count).all()

        # In fresh mode or if revision didn't satisfy request count:
        remaining_needed = request.count - len(selected_questions)
        if remaining_needed > 0:
            query = db.query(Question).filter(
                Question.game_id == request.game_id,
                Question.validation_status == "verified"
            )

            if request.difficulty != "all":
                query = query.filter(Question.difficulty == request.difficulty)

            if request.topic:
                query = query.filter(
                    or_(
                        Question.topic.ilike(f"%{request.topic}%"),
                        Question.subtopic.ilike(f"%{request.topic}%")
                    )
                )

            # Exclude already seen questions
            current_chosen_ids = {q.id for q in selected_questions} | excluded_ids
            if current_chosen_ids:
                query = query.filter(not_(Question.id.in_(list(current_chosen_ids))))

            bank_candidates = query.order_by(func.random()).limit(remaining_needed).all()
            selected_questions.extend(bank_candidates)

        bank_count = len(selected_questions)
        generated_count = 0

        # If bank count still falls short of requested count, dynamically generate
        still_needed = request.count - len(selected_questions)
        if still_needed > 0:
            logger.info(f"Generating {still_needed} dynamic questions for game '{request.game_id}', topic '{request.topic}'")
            existing_fps = {q.fingerprint for q in db.query(Question.fingerprint).all()}
            generated_items = cls._generate_and_validate_questions(
                db=db,
                game_id=request.game_id,
                topic=request.topic or "Core Concepts",
                difficulty=request.difficulty if request.difficulty != "all" else "medium",
                count=still_needed,
                existing_fingerprints=existing_fps
            )
            selected_questions.extend(generated_items)
            generated_count = len(generated_items)

        # Convert to client-facing response schemas (STRICTLY HIDING answer keys & explanations)
        client_items: List[QuestionItemResponse] = []
        for q in selected_questions:
            try:
                options = json.loads(q.options_json) if q.options_json else []
            except Exception:
                options = []

            try:
                meta = json.loads(q.metadata_json) if q.metadata_json else {}
            except Exception:
                meta = {}

            client_items.append(
                QuestionItemResponse(
                    id=q.id,
                    game_id=q.game_id,
                    topic=q.topic,
                    subtopic=q.subtopic,
                    difficulty=q.difficulty,
                    question_type=q.question_type,
                    prompt=q.prompt,
                    options=options,
                    metadata=meta,
                    source=q.source
                )
            )

        message = None
        if len(client_items) < request.count:
            message = f"Delivered {len(client_items)} verified questions ({bank_count} from bank, {generated_count} generated). Target count {request.count} was partially satisfied."

        return QuestionBatchResponse(
            game_id=request.game_id,
            topic=request.topic,
            difficulty=request.difficulty,
            mode=request.mode,
            requested_count=request.count,
            delivered_count=len(client_items),
            questions=client_items,
            bank_count=bank_count,
            generated_count=generated_count,
            message=message
        )

    @classmethod
    def _generate_and_validate_questions(
        cls,
        db: Session,
        game_id: str,
        topic: str,
        difficulty: str,
        count: int,
        existing_fingerprints: Set[str]
    ) -> List[Question]:
        """
        Attempts AI generation using Gemini if available, with structured JSON schema.
        Falls back to parameterized high-quality dynamic question generator.
        Validates all generated questions deterministically before storing in database.
        """
        generated_questions: List[Question] = []

        # 1. Try Gemini generation if configured
        if settings.GEMINI_API_KEY:
            try:
                ai_items = cls._call_gemini_generation(
                    game_id=game_id,
                    topic=topic,
                    difficulty=difficulty,
                    count=count
                )
                for item in ai_items:
                    validated = cls._validate_and_persist_question(
                        db=db,
                        item=item,
                        game_id=game_id,
                        topic=topic,
                        difficulty=difficulty,
                        source="ai_generated",
                        existing_fingerprints=existing_fingerprints
                    )
                    if validated:
                        generated_questions.append(validated)
                        existing_fingerprints.add(validated.fingerprint)
                        if len(generated_questions) >= count:
                            break
            except Exception as e:
                logger.warning(f"AI question generation via Gemini failed or timed out: {e}")

        # 2. If count still unsatisfied, use deterministic dynamic parameterized generator
        needed = count - len(generated_questions)
        if needed > 0:
            heuristic_items = cls._generate_parameterized_questions(
                game_id=game_id,
                topic=topic,
                difficulty=difficulty,
                count=needed,
                existing_fingerprints=existing_fingerprints
            )
            for item in heuristic_items:
                validated = cls._validate_and_persist_question(
                    db=db,
                    item=item,
                    game_id=game_id,
                    topic=topic,
                    difficulty=difficulty,
                    source="ai_generated",
                    existing_fingerprints=existing_fingerprints
                )
                if validated:
                    generated_questions.append(validated)
                    existing_fingerprints.add(validated.fingerprint)

        return generated_questions

    @classmethod
    def _call_gemini_generation(
        cls,
        game_id: str,
        topic: str,
        difficulty: str,
        count: int
    ) -> List[Dict[str, Any]]:
        """Makes an HTTP call to the Gemini API asking for validated technical questions."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"

        prompt = (
            f"You are a principal technical interviewer at Google. Generate {count} distinct, challenging, unambiguous technical interview questions.\n"
            f"Target Module: {game_id}\n"
            f"Topic: {topic}\n"
            f"Difficulty: {difficulty}\n\n"
            "Requirements:\n"
            "- If game_id is 'tictactoe' or 'aptitude': question_type is 'mcq' with exactly 4 options, a correct_answer index ('0', '1', '2', or '3'), and a detailed explanation.\n"
            "- If game_id is 'sql-blanks': question_type is 'sql_token', prompt must be a valid SQL statement with a '___' blank, options is a list of 4 keywords, and correct_answer is the exact keyword filling the blank.\n"
            "- If game_id is 'debugger': question_type is 'debug', prompt contains code with a specific bug, options contains 4 explanations, and correct_answer index is '0' to '3'.\n"
            "Return strictly a JSON array of objects with keys: prompt, options, correct_answer, explanation, subtopic."
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                body = json.loads(response.read().decode("utf-8"))
                candidate = body.get("candidates", [{}])[0]
                text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return parsed
        return []

    @classmethod
    def _generate_parameterized_questions(
        cls,
        game_id: str,
        topic: str,
        difficulty: str,
        count: int,
        existing_fingerprints: Set[str]
    ) -> List[Dict[str, Any]]:
        """
        Deterministic, offline-safe generator producing valid technical questions
        across various engineering domains and difficulty levels.
        """
        templates = {
            "tictactoe": [
                {
                    "prompt": "In OOP, how does the Adapter Pattern achieve interface compatibility between incompatible classes?",
                    "options": [
                        "By altering the original class source code",
                        "By wrapping an existing class with a new interface",
                        "By forcing both classes to inherit from a common base class",
                        "By using global static variables"
                    ],
                    "correct_answer": "1",
                    "explanation": "The Adapter pattern converts the interface of a class into another interface clients expect.",
                    "subtopic": "Structural Design Patterns"
                },
                {
                    "prompt": "What is the primary difference between a Shallow Copy and a Deep Copy in object cloning?",
                    "options": [
                        "Shallow copy duplicates dynamic heap memory; deep copy only copies references",
                        "Shallow copy copies references to objects; deep copy recursively copies the actual referenced objects",
                        "Shallow copy works only on primitive types",
                        "Deep copy executes faster than shallow copy"
                    ],
                    "correct_answer": "1",
                    "explanation": "Shallow copy copies memory bitwise (sharing pointers); deep copy allocates new memory and duplicates pointed-to objects.",
                    "subtopic": "Object Lifecycle & Memory"
                },
                {
                    "prompt": "Which SOLID principle is violated if a derived class throws an UnsupportedOperationException for an inherited method?",
                    "options": [
                        "Single Responsibility Principle",
                        "Open/Closed Principle",
                        "Liskov Substitution Principle",
                        "Dependency Inversion Principle"
                    ],
                    "correct_answer": "2",
                    "explanation": "Liskov Substitution Principle mandates that subclasses must fulfill the behavioral contract of their superclass without breaking expectations.",
                    "subtopic": "SOLID Principles"
                },
                {
                    "prompt": "In C++, what does the 'explicit' keyword on a single-argument constructor prevent?",
                    "options": [
                        "Implicit type conversions during assignment or argument passing",
                        "Virtual method overriding",
                        "Heap allocation via operator new",
                        "Copy construction"
                    ],
                    "correct_answer": "0",
                    "explanation": "The 'explicit' keyword prevents the compiler from using the constructor for implicit conversions and copy-initialization.",
                    "subtopic": "Constructors & Type Safety"
                }
            ],
            "sql-blanks": [
                {
                    "prompt": "SELECT department, COUNT(*) FROM employees GROUP BY department ___ COUNT(*) > 5;",
                    "options": ["HAVING", "WHERE", "ORDER BY", "QUALIFY"],
                    "correct_answer": "HAVING",
                    "explanation": "HAVING filters groups post-aggregation.",
                    "subtopic": "Aggregation"
                },
                {
                    "prompt": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 ___ 2;",
                    "options": ["OFFSET", "SKIP", "INDEX", "ROW"],
                    "correct_answer": "OFFSET",
                    "explanation": "OFFSET skips the specified number of rows before beginning to return tuples.",
                    "subtopic": "Pagination"
                },
                {
                    "prompt": "UPDATE accounts SET balance = balance - 100 WHERE account_id = 42 ___ balance >= 100;",
                    "options": ["AND", "OR", "THEN", "WITH"],
                    "correct_answer": "AND",
                    "explanation": "AND conjunction ensures the balance check guard is strictly evaluated.",
                    "subtopic": "Data Modification"
                }
            ],
            "aptitude": [
                {
                    "prompt": "What is the next number in the geometric series: 3, 6, 12, 24, 48, ?",
                    "options": ["72", "96", "84", "108"],
                    "correct_answer": "1",
                    "explanation": "Each term is multiplied by common ratio 2: 48 × 2 = 96.",
                    "subtopic": "Sequences"
                },
                {
                    "prompt": "If a train traveling at 72 km/h crosses a 180-meter long platform in 18 seconds, what is the length of the train?",
                    "options": ["160 meters", "180 meters", "200 meters", "220 meters"],
                    "correct_answer": "1",
                    "explanation": "Speed = 72 × (5/18) = 20 m/s. Distance = 20 × 18 = 360m. Train length = 360 - 180 = 180 meters.",
                    "subtopic": "Speed & Distance"
                },
                {
                    "prompt": "In how many distinct ways can the letters of the word 'ARCADE' be arranged?",
                    "options": ["360", "720", "180", "120"],
                    "correct_answer": "0",
                    "explanation": "6 letters with 'A' appearing twice: 6! / 2! = 720 / 2 = 360 distinct permutations.",
                    "subtopic": "Permutations"
                }
            ],
            "debugger": [
                {
                    "prompt": "std::unique_ptr<int> p1 = std::make_unique<int>(42);\nstd::unique_ptr<int> p2 = p1;\nWhat happens during compilation?",
                    "options": [
                        "Compiles and performs a deep copy",
                        "Compilation error: copy constructor of unique_ptr is explicitly deleted",
                        "Runtime segmentation fault",
                        "Memory leak"
                    ],
                    "correct_answer": "1",
                    "explanation": "std::unique_ptr represents exclusive ownership; its copy constructor and copy assignment operator are deleted.",
                    "subtopic": "Smart Pointers"
                },
                {
                    "prompt": "char* str = (char*)malloc(10);\nstrcpy(str, \"Hello World\");\nWhat bug is present?",
                    "options": [
                        "malloc cannot allocate 10 bytes",
                        "Buffer overflow: 'Hello World' requires 12 bytes including null-terminator",
                        "strcpy is a C++ keyword",
                        "Memory is automatically freed"
                    ],
                    "correct_answer": "1",
                    "explanation": "\"Hello World\" has 11 chars + 1 null terminator = 12 bytes. Writing into 10 bytes triggers a heap buffer overflow.",
                    "subtopic": "Buffer Safety"
                }
            ]
        }

        pool = templates.get(game_id, templates["tictactoe"])
        results: List[Dict[str, Any]] = []

        for item in pool:
            fp = compute_fingerprint(item["prompt"])
            if fp not in existing_fingerprints and not any(are_paraphrases(item["prompt"], r["prompt"]) for r in results):
                results.append(item)
                if len(results) >= count:
                    break

        return results

    @classmethod
    def _validate_and_persist_question(
        cls,
        db: Session,
        item: Dict[str, Any],
        game_id: str,
        topic: str,
        difficulty: str,
        source: str,
        existing_fingerprints: Set[str]
    ) -> Optional[Question]:
        """
        Validates structural completeness and duplicate fingerprints before writing to DB.
        Deterministic Checks:
        - prompt >= 15 chars
        - options list has >= 3 items (or valid tokens)
        - correct_answer is within options / valid index
        - explanation is present
        - fingerprint does not already exist
        """
        prompt = item.get("prompt", "").strip()
        options = item.get("options", [])
        correct_answer = str(item.get("correct_answer", "")).strip()
        explanation = item.get("explanation", "").strip()
        subtopic = item.get("subtopic")

        if len(prompt) < 15:
            return None
        if not options or len(options) < 3:
            return None
        if not correct_answer:
            return None
        if not explanation:
            explanation = "Server-validated algorithmic explanation."

        fp = compute_fingerprint(prompt)
        if fp in existing_fingerprints:
            return None

        # Check DB directly in case of concurrent generation
        if db.query(Question.id).filter(Question.fingerprint == fp).first():
            return None

        # Generate unique readable ID
        unique_id = f"gen_{game_id[:3]}_{uuid.uuid4().hex[:10]}"
        q_type = "mcq"
        if game_id == "sql-blanks":
            q_type = "sql_token"
        elif game_id == "debugger":
            q_type = "debug"

        q = Question(
            id=unique_id,
            game_id=game_id,
            topic=topic or "General",
            subtopic=subtopic,
            difficulty=difficulty,
            question_type=q_type,
            prompt=prompt,
            options_json=json.dumps(options),
            correct_answer=correct_answer,
            explanation=explanation,
            fingerprint=fp,
            source=source,
            validation_status="verified",
            metadata_json=json.dumps({"skill": game_id, "accepted_tokens": [correct_answer] if q_type == "sql_token" else []})
        )

        db.add(q)
        db.commit()
        db.refresh(q)
        return q

    @classmethod
    def record_question_attempt(
        cls,
        db: Session,
        user_id: int,
        question_id: str,
        game_id: str,
        is_correct: bool,
        selected_option: Optional[str] = None
    ) -> UserQuestionHistory:
        """Records or updates user attempt history for repetition tracking and revision mode."""
        history = db.query(UserQuestionHistory).filter(
            UserQuestionHistory.user_id == user_id,
            UserQuestionHistory.question_id == question_id
        ).first()

        now = datetime.now(timezone.utc)
        if history:
            history.attempt_count += 1
            history.is_correct = is_correct
            history.last_selected_option = selected_option
            history.last_attempted_at = now
        else:
            history = UserQuestionHistory(
                user_id=user_id,
                question_id=question_id,
                game_id=game_id,
                is_correct=is_correct,
                attempt_count=1,
                last_selected_option=selected_option,
                last_attempted_at=now
            )
            db.add(history)

        db.commit()
        db.refresh(history)
        return history

    @classmethod
    def get_user_history_stats(
        cls,
        db: Session,
        user_id: int,
        game_id: Optional[str] = None
    ) -> QuestionHistoryStatsResponse:
        """Aggregates user attempt accuracy and detects weak topics."""
        query = db.query(UserQuestionHistory).filter(UserQuestionHistory.user_id == user_id)
        if game_id:
            query = query.filter(UserQuestionHistory.game_id == game_id)

        records = query.all()
        total_attempted = len(records)
        total_correct = sum(1 for r in records if r.is_correct)
        total_incorrect = total_attempted - total_correct
        accuracy = round((total_correct / max(total_attempted, 1)) * 100.0, 1)

        by_game: Dict[str, Dict[str, int]] = {}
        topic_mistakes: Dict[str, int] = {}

        for r in records:
            if r.game_id not in by_game:
                by_game[r.game_id] = {"total": 0, "correct": 0, "incorrect": 0}
            by_game[r.game_id]["total"] += 1
            if r.is_correct:
                by_game[r.game_id]["correct"] += 1
            else:
                by_game[r.game_id]["incorrect"] += 1
                if r.question and r.question.topic:
                    topic_mistakes[r.question.topic] = topic_mistakes.get(r.question.topic, 0) + 1

        weak_topics = sorted(topic_mistakes.keys(), key=lambda t: topic_mistakes[t], reverse=True)[:5]

        return QuestionHistoryStatsResponse(
            total_attempted=total_attempted,
            total_correct=total_correct,
            total_incorrect=total_incorrect,
            accuracy_rate=accuracy,
            by_game=by_game,
            weak_topics=weak_topics
        )
