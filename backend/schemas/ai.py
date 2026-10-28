"""
Interview Arcade — AI Evaluation Schemas
Pydantic v2 data models for candidate response evaluation, rubric scoring, and exemplar analysis.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AiEvaluationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario_id: str = Field(..., min_length=1, max_length=100, description="Unique scenario identifier")
    scenario_title: str = Field(..., min_length=1, max_length=200, description="Title of the interview question or challenge")
    scenario_type: str = Field(default="behavioral", description="Scenario type: behavioral, system_design, or technical")
    prompt: str = Field(..., min_length=5, max_length=2000, description="The interview question or situation prompt")
    user_response: str = Field(..., min_length=1, max_length=8000, description="Candidate-authored open text response")
    target_rubric: Optional[Dict[str, str]] = Field(default=None, description="Optional rubric pillars (e.g. STAR or architecture criteria)")


class AiEvaluationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario_id: str
    scenario_title: str
    overall_score: int = Field(..., ge=0, le=100, description="Composite score between 0 and 100")
    evaluation_mode: str = Field(..., description="gemini_llm or semantic_heuristic_engine")
    technical_accuracy: int = Field(..., ge=0, le=100)
    communication_clarity: int = Field(..., ge=0, le=100)
    rubric_scores: Dict[str, int] = Field(default_factory=dict, description="Component rubric ratings (0-100)")
    strengths: List[str] = Field(default_factory=list, description="Specific strengths identified in student's answer")
    omissions_and_gaps: List[str] = Field(default_factory=list, description="Critical trade-offs, metrics, or points omitted")
    improvement_advice: str = Field(..., description="Actionable coaching on how to elevate the response")
    exemplar_answer: str = Field(..., description="Benchmark high-scoring mentor response demonstrating best practices")
    target_competency: str = Field(..., description="Primary skill evaluated (e.g., 'Behavioral Leadership (STAR)', 'Distributed Architecture')")
    recommended_next_action: str = Field(..., description="Suggested next practice challenge in Interview Arcade")


class AiExemplarResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    scenario_id: str
    scenario_title: str
    exemplar_text: str
    rubric_breakdown: Dict[str, str]
    key_tradeoffs: List[str]
