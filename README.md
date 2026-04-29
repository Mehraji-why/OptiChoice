# OptiChoice

**AI-powered decision optimizer for students and young professionals.**

Tell OptiChoice your options, budget, and priorities—it will rank your choices with transparent, explainable reasoning.

## Features

- 🎯 **Neutral AI Rankings** – Zero merchant bias, based entirely on your priorities
- 💰 **Budget-Conscious** – Free forever
- 📊 **Explainable Trade-offs** – See exactly why each option was ranked
- 🔄 **Works for Anything** – Laptops, courses, job offers, apartments, frameworks
- ⚡ **Instant Results** – Get recommendations in seconds
- 🎓 **Built for Students** – Simple, no fluff, no sign-up required

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Google Gemini API
- **Deployment**: Vercel (frontend), Render/AWS (backend)

## Project Structure

```
OptiChoice/
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Home, DecisionForm, Results
│   │   ├── components/     # Reusable UI components
│   │   ├── api/            # API client
│   │   ├── styles/         # Tailwind + globals
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── .env                # API keys (git-ignored)
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Valid Google Gemini API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Run dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Test the App

1. Open http://localhost:5173
2. Click "Try It Free"
3. Example decision:
   - **Decision**: "Which laptop should I buy?"
   - **Options**: Dell XPS 13, MacBook Air M3, Lenovo ThinkPad X1
   - **Budget**: 100000
   - **Priorities**: Price, Performance, Battery Life
4. Click "Get My Recommendation"
5. View ranked results with trade-off analysis

## API Reference

### POST `/decide`

Score and rank decision options based on user priorities.

**Request:**
```json
{
  "decision_question": "Which laptop should I buy?",
  "options": ["Dell XPS 13", "MacBook Air M3", "Lenovo ThinkPad X1"],
  "budget": 100000,
  "priorities": ["Price", "Performance", "Battery Life"],
  "constraints": [] (optional)
}
```

**Response:**
```json
{
  "rank_1": {
    "option": "Dell XPS 13",
    "overall_score": 0.85,
    "priority_scores": {"Price": 8, "Performance": 9, "Battery Life": 7},
    "priority_notes": {...},
    "reason": "Best balance of price and performance..."
  },
  "rank_2": {...},
  "caution": {...},
  "processing_notes": "Analysis completed in 2.3 seconds"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{"status": "ok"}
```

## Deployment

### Frontend (Vercel)

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Connect repo to Vercel at https://vercel.com/new
# Vercel auto-detects Vite setup
# Set env var: VITE_API_BASE_URL=https://your-api-url.com
```

### Backend (Render)

1. Create `requirements.txt`:
   ```
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   pydantic==2.5.0
   python-dotenv==1.0.0
   google-generativeai==0.3.0
   python-multipart==0.0.6
   ```

2. Create `render.yaml`:
   ```yaml
   services:
     - type: web
       name: optichoice-backend
       runtime: python-3.11
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
       envVars:
         - key: GEMINI_API_KEY
           sync: false
   ```

3. Push to GitHub and connect to Render at https://render.com

4. Add CORS in backend for production domain

## Environment Variables

### Backend (`.env`)
```
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8000  # Dev
VITE_API_BASE_URL=https://your-api-url.com  # Prod
```

## Self-Review Checklist

- [x] Form validation works (no empty submissions)
- [x] Loading states show during API calls
- [x] Results display all three tiers (rank_1, rank_2, caution)
- [x] Mobile responsive (tested @375px, 768px, 1440px)
- [x] No hardcoded URLs (uses .env)
- [x] Error messages display on API failures
- [x] Tailwind CSS properly configured with custom colors
- [x] Components are reusable and well-named
- [x] Footer and FAQ sections included
- [x] WCAG accessibility basics (labels, semantic HTML, contrast)
- [x] No console errors
- [x] Brand colors (#2c5aa0) consistent throughout

## Common Issues

**Q: Getting 502 error on frontend?**
A: Backend server not running. Run `uvicorn main:app --reload` on port 8000.

**Q: API calls failing with CORS error?**
A: Backend CORS is configured for "*". Check that API_BASE_URL in frontend .env matches running backend.

**Q: Gemini API returning errors?**
A: Check API key in `.env` is valid. Visit https://aistudio.google.com/app/apikey to get/refresh key.

**Q: Recommendations seem wrong?**
A: OptiChoice shows trade-off analysis, not perfect predictions. Review priority weights and adjust as needed.

## Contributing

Feedback and PRs welcome! Email: feedback@optichoice.dev

## License

MIT License. See LICENSE file for details.

---

**Built with ❤️ for students making budget-conscious decisions.**

Deployed: [OptiChoice Live](https://optichoice.dev) | GitHub: [Mehraji-why/OptiChoice](https://github.com/Mehraji-why/OptiChoice)
