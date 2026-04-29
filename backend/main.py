from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# ============= DATA MODELS =============
class DecisionRequest(BaseModel):
    decision_question: str
    options: List[str]
    budget: float
    priorities: List[str]
    constraints: Optional[List[str]] = None

class PriorityScore(BaseModel):
    score: int
    note: str

class OptionResult(BaseModel):
    option: str
    overall_score: float
    priority_scores: Dict[str, int]
    priority_notes: Dict[str, str]
    reason: str

class DecisionResponse(BaseModel):
    rank_1: OptionResult
    rank_2: Optional[OptionResult] = None
    caution: Optional[OptionResult] = None
    processing_notes: str

# ============= HELPER FUNCTIONS =============
def assign_weights(priorities: List[str]) -> Dict[str, float]:
    """Assign weights to priorities (top = 0.50, then 0.30, 0.15, rest split)"""
    weights = {}
    if len(priorities) == 0:
        return weights
    
    weights[priorities[0]] = 0.50
    if len(priorities) > 1:
        weights[priorities[1]] = 0.30
    if len(priorities) > 2:
        weights[priorities[2]] = 0.15
    
    if len(priorities) > 3:
        remaining_weight = 0.05
        remaining_priorities = priorities[3:]
        per_priority = remaining_weight / len(remaining_priorities)
        for p in remaining_priorities:
            weights[p] = per_priority
    
    return weights

def call_gemini_for_scoring(decision_context: DecisionRequest, weights: Dict[str, float]) -> Dict:
    """Call Gemini API to score options against priorities"""
    
    priorities_str = ", ".join(decision_context.priorities)
    options_str = ", ".join(decision_context.options)
    constraints_str = ", ".join(decision_context.constraints) if decision_context.constraints else "None"
    
    prompt = f"""You are DecideAI, a neutral decision optimizer. Score each option fairly and transparently.

Decision: {decision_context.decision_question}
Budget: INR {decision_context.budget}
Options: {options_str}
Priorities (in order of importance): {priorities_str}
Hard Constraints: {constraints_str}

For EACH option, score it 0-100 on EACH priority. Consider how well it meets that specific priority.

Respond with ONLY valid JSON (no markdown, no preamble). Use this exact format:
{{
  "option_name_1": {{
    "priority_scores": {{"priority_1": 90, "priority_2": 75, "priority_3": 60}},
    "priority_notes": {{"priority_1": "explanation", "priority_2": "explanation", "priority_3": "explanation"}},
    "reason": "Summary of why this scores as it does"
  }},
  "option_name_2": {{...}}
}}

Ensure:
- All options are evaluated on ALL priorities
- Scores are 0-100 (integer)
- Notes are brief (1 sentence max)
- JSON is valid and parseable
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Parse JSON response
        gemini_scores = json.loads(response_text)
        return gemini_scores
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

def compute_composite_score(option: str, scores: Dict, weights: Dict[str, float], priorities: List[str]) -> float:
    """Compute weighted composite score for an option"""
    composite = 0.0
    
    if option not in scores:
        return 0.0
    
    priority_scores = scores[option].get("priority_scores", {})
    
    for priority in priorities:
        if priority in weights and priority in priority_scores:
            composite += priority_scores[priority] * weights[priority]
    
    return round(composite, 1)

def build_option_result(option: str, overall_score: float, scores: Dict, priorities: List[str]) -> OptionResult:
    """Build OptionResult object for an option"""
    option_data = scores.get(option, {})
    
    return OptionResult(
        option=option,
        overall_score=overall_score,
        priority_scores=option_data.get("priority_scores", {}),
        priority_notes=option_data.get("priority_notes", {}),
        reason=option_data.get("reason", "No explanation provided")
    )

# ============= MAIN ENDPOINT =============
@app.post("/decide", response_model=DecisionResponse)
async def decide(request: DecisionRequest):
    """
    Main decision optimization endpoint
    Input: options, budget, priorities
    Output: ranked recommendations with reasoning
    """
    
    # Validate input
    if not request.options or len(request.options) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 options")
    
    if not request.priorities or len(request.priorities) == 0:
        raise HTTPException(status_code=400, detail="Specify at least 1 priority")
    
    if request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be > 0")
    
    # Step 1: Assign weights to priorities
    weights = assign_weights(request.priorities)
    
    # Step 2: Call Gemini for scoring
    gemini_scores = call_gemini_for_scoring(request, weights)
    
    # Step 3: Compute composite scores
    results = []
    for option in request.options:
        composite = compute_composite_score(option, gemini_scores, weights, request.priorities)
        results.append({
            "option": option,
            "composite_score": composite,
            "gemini_data": gemini_scores.get(option, {})
        })
    
    # Step 4: Sort by composite score (descending)
    results.sort(key=lambda x: x["composite_score"], reverse=True)
    
    # Step 5: Build response tiers
    rank_1 = build_option_result(
        results[0]["option"],
        results[0]["composite_score"],
        gemini_scores,
        request.priorities
    )
    
    rank_2 = None
    if len(results) > 1:
        rank_2 = build_option_result(
            results[1]["option"],
            results[1]["composite_score"],
            gemini_scores,
            request.priorities
        )
    
    caution = None
    if len(results) > 1:
        caution = build_option_result(
            results[-1]["option"],
            results[-1]["composite_score"],
            gemini_scores,
            request.priorities
        )
    
    notes = f"Evaluated {len(request.options)} options on {len(request.priorities)} priorities. Weights: " + \
            ", ".join([f"{p}={weights[p]}" for p in request.priorities[:3]])
    
    return DecisionResponse(
        rank_1=rank_1,
        rank_2=rank_2,
        caution=caution,
        processing_notes=notes
    )

# ============= HEALTH CHECK =============
@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
