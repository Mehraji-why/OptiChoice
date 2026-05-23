# OptiChoice Backend Implementation Guide

## Overview

OptiChoice is an intelligent decision optimization system that helps users make informed choices by analyzing their needs, inferring priorities, and ranking options based on weighted factors.

## System Architecture

### Two Decision-Making Modes

1. **General Decision Mode (`/decide`)** - Conversational decision-making
   - Input: Question, options, priorities, budget, constraints
   - Uses Gemini API for intelligent scoring
   - Best for: General decisions, trade-off analysis

2. **Structured Analysis Mode (`/analyze`)** - Product/option analysis with predefined factors
   - Input: User needs description, product data with factor scores
   - Infers importance weights from user description
   - Best for: Product recommendations, comparative analysis

## Key Features

### Intelligent Weight Inference
- **Natural Language Processing**: Analyzes user needs in plain English
- **Context-Aware Prioritization**: Automatically infers which factors matter most
- **Flexible Weighting**: Weights range from 0.0 (irrelevant) to 1.0 (critical)
- **Differentiated Importance**: Ensures weights reflect actual priorities (not all equal)

### Composite Scoring Algorithm
```
For each product:
  composite_score = Σ(factor_score × inferred_weight)
```
- Transparent calculation
- Factor-by-factor breakdown in response
- Budget filtering automatic
- Ranking by score (highest first)

### Explanation Generation
- Human-readable summary of weight inference
- Context for top recommendation
- Explains why factors were prioritized

## Backend Stack

- **Framework**: FastAPI (async, high-performance)
- **AI/ML**: Google Gemini API (for natural language understanding)
- **Validation**: Pydantic (type safety, request validation)
- **CORS**: Enabled for frontend integration

## Installation & Setup

### Prerequisites
- Python 3.8+
- Environment variable: `GEMINI_API_KEY`

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Running the Backend
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation
Once running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

## API Endpoints

### 1. `/decide` (POST)
General decision-making endpoint.

**Request:**
```json
{
    "decision_question": "Which laptop should I buy?",
    "options": ["Option A", "Option B", "Option C"],
    "budget": 70000,
    "priorities": ["Battery", "Performance", "Portability"],
    "constraints": ["Max weight 2.5kg"]
}
```

**Response:**
```json
{
    "rank_1": {
        "option": "Option A",
        "overall_score": 85.5,
        "priority_scores": {"Battery": 90, "Performance": 75, "Portability": 80},
        "priority_notes": {"Battery": "Excellent 12-hour battery", ...},
        "reason": "Best overall value for your priorities"
    },
    "rank_2": {...},
    "caution": {...},
    "processing_notes": "..."
}
```

### 2. `/analyze` (POST)
Structured product analysis with intelligent weight inference.

**Request:**
```json
{
    "user_needs": "College student, need battery life and portability, some gaming",
    "budget": 70000,
    "factors": {
        "cpu_score": 0.25,
        "gpu_score": 0.15,
        "battery": 0.20,
        "portability": 0.15,
        "display": 0.10,
        "thermals": 0.10,
        "build_quality": 0.05
    },
    "products": [
        {
            "id": 1,
            "name": "Laptop A",
            "price": 72000,
            "cpu_score": 8.8,
            "gpu_score": 8.5,
            "battery": 5.5,
            ...
        }
    ]
}
```

**Response:**
```json
{
    "budget": 70000,
    "inferred_weights": {
        "battery": 0.9,
        "cpu_score": 0.8,
        "portability": 0.7,
        "gpu_score": 0.5,
        ...
    },
    "explanation": "User prioritizes portability and battery for college...",
    "ranked_products": [
        {
            "id": 1,
            "name": "Laptop A",
            "price": 72000,
            "composite_score": 8.23,
            "within_budget": true,
            "factor_scores": {...},
            "weighted_contribution": {...}
        }
    ]
}
```

### 3. `/health` (GET)
Health check endpoint.

**Response:**
```json
{
    "status": "ok",
    "version": "1.0"
}
```

## Available Factors

The system supports these predefined factors (more can be added):

- `cpu_score` - CPU performance (0-10)
- `gpu_score` - GPU performance (0-10)
- `battery` - Battery life (0-10)
- `portability` - Portability/weight (0-10)
- `display` - Display quality (0-10)
- `thermals` - Thermal management (0-10)
- `build_quality` - Build durability (0-10)
- `gaming_score` - Gaming performance (0-10)
- `creator_score` - Content creation capability (0-10)
- `student_score` - Value for students (0-10)

Additional factors can be easily added without code changes.

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful analysis
- `400 Bad Request` - Invalid input (missing fields, invalid values)
- `500 Internal Server Error` - API call failures

### Common Validation Errors

**Missing user_needs:**
```
"detail": "Provide user needs description"
```

**Invalid budget:**
```
"detail": "Budget must be > 0"
```

**No products:**
```
"detail": "Provide at least 1 product"
```

## Example Usage

### Running Examples
```bash
cd backend
python examples.py
```

This runs 3 example scenarios:
1. College student looking for a laptop
2. Content creator with professional needs
3. Budget-conscious user

### Using with cURL
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_needs": "Student needing good battery and portability",
    "budget": 70000,
    "factors": {
        "battery": 0.8,
        "portability": 0.7,
        "cpu_score": 0.5
    },
    "products": [...]
  }'
```

### Using with Python
```python
import requests

response = requests.post(
    "http://localhost:8000/analyze",
    json={
        "user_needs": "...",
        "budget": 70000,
        "factors": {...},
        "products": [...]
    }
)

result = response.json()
print(result["inferred_weights"])
print(result["ranked_products"][0]["name"])
```

## Algorithm Details

### Weight Inference Process
1. **User Input Analysis**: Gemini API receives user needs description
2. **Context Understanding**: AI analyzes key phrases, priorities, use cases
3. **Factor Mapping**: Maps user needs to relevant factors
4. **Weight Calculation**: Assigns intelligently differentiated weights
5. **Validation**: Ensures weights are 0.0-1.0 and non-uniform

### Scoring Process
1. **Budget Filtering**: Marks products within/outside budget
2. **Factor-wise Scoring**: Multiplies each factor score by its weight
3. **Composite Calculation**: Sums weighted factor scores
4. **Ranking**: Sorts by composite score (highest first)
5. **Breakdown**: Includes per-factor contribution analysis

### Explanation Generation
1. **Pattern Recognition**: Identifies key priorities from weights
2. **Context Matching**: Relates weights to original user needs
3. **Summary Generation**: Gemini creates human-readable explanation
4. **Top Product Analysis**: Explains why top product ranks first

## Performance Characteristics

- **Response Time**: 2-5 seconds (includes Gemini API calls)
- **Scalability**: Suitable for real-time recommendations
- **Concurrency**: Built on async FastAPI for handling multiple requests
- **Memory Usage**: Minimal (no persistent state)
- **API Cost**: Based on Gemini API usage (token-based pricing)

## Future Enhancements

Potential improvements:
- Caching of weight inferences for similar needs
- Custom factor definitions per domain
- Multi-criteria decision analysis (MCDA) integration
- Historical comparison and trending
- User feedback loop for weight refinement
- Batch analysis API for comparing multiple need scenarios

## Troubleshooting

### API Won't Start
- Verify Python version (3.8+)
- Check all dependencies: `pip install -r requirements.txt`
- Ensure `GEMINI_API_KEY` is set: `echo $GEMINI_API_KEY`

### Gemini API Errors
- Verify API key is valid
- Check API quota and rate limits
- Ensure internet connection

### Port Already in Use
```bash
# Change port in main.py or use:
python main.py --port 8001
```

### Invalid JSON Responses
- Verify product data format
- Ensure all required fields present
- Check for special characters in user_needs

## Code Structure

```
backend/
├── main.py           # FastAPI app, endpoints, helper functions
├── requirements.txt  # Python dependencies
├── examples.py       # Example usage scenarios
└── .env             # Environment variables (GEMINI_API_KEY)
```

### Main Components in main.py
- **Data Models**: Pydantic classes for request/response validation
- **Helper Functions**: Weight inference, scoring, explanation generation
- **Endpoints**: `/decide`, `/analyze`, `/health`
- **Error Handling**: Custom validation and error messages
