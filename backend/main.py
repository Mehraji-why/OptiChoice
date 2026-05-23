from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from google import genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

class DecisionRequest(BaseModel):
    decision_question: str
    options: List[str]
    budget: float
    priorities: List[str]
    constraints: Optional[List[str]] = None

class AnalysisRequest(BaseModel):
    user_needs: str
    budget: float
    factors: Dict[str, float]
    products: List[Dict[str, Any]]
    constraints: Optional[List[str]] = None

class AnalysisResult(BaseModel):
    budget: float
    inferred_weights: Dict[str, float]
    explanation: str
    ranked_products: List[Dict[str, Any]]

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

def infer_weights_from_needs(user_needs: str, available_factors: List[str]) -> Dict[str, float]:
    factors_str = ", ".join(available_factors)
    prompt = f"""You are an intelligent decision optimizer. Analyze the user's needs and infer the relative importance (weights) of different factors.

User Needs: {user_needs}

Available factors: {factors_str}

Assign weights from 0.0 to 1.0. Do not make all weights equal.

Respond with ONLY valid JSON (no markdown, no preamble):
{{
  "factor_name_1": 0.9,
  "factor_name_2": 0.7
}}
"""
    try:
        response = client.models.generate_content(model="gemini-3.0-flash", contents=prompt)
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        weights = json.loads(response_text)
        return {k: float(v) for k, v in weights.items()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to infer weights: {str(e)}")

def generate_explanation(user_needs: str, inferred_weights: Dict[str, float], top_product: Dict[str, Any]) -> str:
    weights_str = ", ".join([f"{k}: {v:.1f}" for k, v in sorted(inferred_weights.items(), key=lambda x: x[1], reverse=True)])
    top_product_name = top_product.get("name", "Top Option")
    prompt = f"""Provide a brief 1-2 sentence explanation of why these weights were inferred.

User Needs: {user_needs}
Inferred Weights: {weights_str}
Top Recommendation: {top_product_name}"""
    try:
        response = client.models.generate_content(model="gemini-3
        .0-flash", contents=prompt)
        return response.text.strip()
    except Exception as e:
        return f"User appears to prioritize: {', '.join(list(inferred_weights.keys())[:3])}"

def score_products(products, weights, budget, constraints=None):
    scored_products = []
    for product in products:
        product["within_budget"] = product.get("price", float('inf')) <= budget
        composite_score = 0.0
        factor_scores = {}
        for factor, weight in weights.items():
            if factor in product:
                score = float(product[factor])
                composite_score += score * weight
                factor_scores[factor] = score
        product["composite_score"] = round(composite_score, 2)
        product["factor_scores"] = factor_scores
        product["weighted_contribution"] = {
            factor: round(factor_scores.get(factor, 0) * weight, 2)
            for factor, weight in weights.items()
        }
        scored_products.append(product)
    scored_products.sort(key=lambda x: (x["composite_score"], -x.get("price", 0)), reverse=True)
    return scored_products

def assign_weights(priorities):
    weights = {}
    if not priorities:
        return weights
    weights[priorities[0]] = 0.50
    if len(priorities) > 1:
        weights[priorities[1]] = 0.30
    if len(priorities) > 2:
        weights[priorities[2]] = 0.15
    if len(priorities) > 3:
        per = 0.05 / len(priorities[3:])
        for p in priorities[3:]:
            weights[p] = per
    return weights

def call_gemini_for_scoring(decision_context, weights):
    prompt = f"""You are DecideAI, a neutral decision optimizer.

Decision: {decision_context.decision_question}
Budget: INR {decision_context.budget}
Options: {", ".join(decision_context.options)}
Priorities: {", ".join(decision_context.priorities)}
Constraints: {", ".join(decision_context.constraints) if decision_context.constraints else "None"}

Score each option 0-100 on each priority.

Respond with ONLY valid JSON (no markdown):
{{
  "option_name": {{
    "priority_scores": {{"priority": 90}},
    "priority_notes": {{"priority": "explanation"}},
    "reason": "summary"
  }}
}}
"""
    try:
        response = client.models.generate_content(model="gemini-3.0-flash", contents=prompt)
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

def compute_composite_score(option, scores, weights, priorities):
    if option not in scores:
        return 0.0
    priority_scores = scores[option].get("priority_scores", {})
    return round(sum(priority_scores.get(p, 0) * weights.get(p, 0) for p in priorities), 1)

def build_option_result(option, overall_score, scores):
    data = scores.get(option, {})
    return OptionResult(
        option=option,
        overall_score=overall_score,
        priority_scores=data.get("priority_scores", {}),
        priority_notes=data.get("priority_notes", {}),
        reason=data.get("reason", "No explanation provided")
    )

@app.post("/decide", response_model=DecisionResponse)
async def decide(request: DecisionRequest):
    if not request.options or len(request.options) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 options")
    if not request.priorities:
        raise HTTPException(status_code=400, detail="Specify at least 1 priority")
    if request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be > 0")

    weights = assign_weights(request.priorities)
    gemini_scores = call_gemini_for_scoring(request, weights)

    results = sorted([
        {"option": o, "composite_score": compute_composite_score(o, gemini_scores, weights, request.priorities)}
        for o in request.options
    ], key=lambda x: x["composite_score"], reverse=True)

    return DecisionResponse(
        rank_1=build_option_result(results[0]["option"], results[0]["composite_score"], gemini_scores),
        rank_2=build_option_result(results[1]["option"], results[1]["composite_score"], gemini_scores) if len(results) > 1 else None,
        caution=build_option_result(results[-1]["option"], results[-1]["composite_score"], gemini_scores) if len(results) > 1 else None,
        processing_notes=f"Evaluated {len(request.options)} options on {len(request.priorities)} priorities."
    )

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_products(request: AnalysisRequest):
    if not request.user_needs or not request.user_needs.strip():
        raise HTTPException(status_code=400, detail="Provide user needs description")
    if not request.products:
        raise HTTPException(status_code=400, detail="Provide at least 1 product")
    if request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be > 0")

    available_factors = list(request.factors.keys()) if request.factors else [
        "cpu_score", "gpu_score", "battery", "portability", "display",
        "thermals", "build_quality", "gaming_score", "creator_score", "student_score"
    ]

    inferred_weights = infer_weights_from_needs(request.user_needs, available_factors)
    ranked_products = score_products(request.products, inferred_weights, request.budget, request.constraints)
    explanation = generate_explanation(request.user_needs, inferred_weights, ranked_products[0] if ranked_products else {})

    return AnalysisResult(
        budget=request.budget,
        inferred_weights=inferred_weights,
        explanation=explanation,
        ranked_products=ranked_products
    )

@app.get("/")
def root():
    return {
        "name": "OptiChoice API",
        "version": "1.0",
        "description": "AI-powered decision optimization API",
        "endpoints": {
            "POST /decide": "General decision making",
            "POST /analyze": "Structured product analysis",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
