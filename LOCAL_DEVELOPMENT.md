# 🚀 OptiChoice Local Development Guide

## Quick Start

Your OptiChoice project is ready to run locally! Here's how to get it up and running.

### Option 1: Automated Startup (Recommended)

Run the startup script from the project root:

```bash
chmod +x start.sh
./start.sh
```

This will automatically start both servers and open the ports.

---

### Option 2: Manual Startup (Separate Terminals)

#### Terminal 1: Start Backend Server
```bash
cd backend
pip install -r requirements.txt  # (only needed first time)
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

#### Terminal 2: Start Frontend Server
```bash
cd frontend
npm install  # (only needed first time)
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Access Your Project

Once both servers are running, you can access:

### Frontend (User Interface)
- **URL:** [http://localhost:5173](http://localhost:5173)
- **What it is:** React Vite application with Tailwind CSS styling
- **Features:** 
  - Decision form interface
  - Product recommendation results
  - FAQ and How-It-Works sections

### Backend API
- **Base URL:** [http://localhost:8000](http://localhost:8000)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)

---

## API Endpoints Available

### `/analyze` (POST) - Product Analysis
Intelligent product recommendation with weight inference.

**Example Request:**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_needs": "College student needing battery and portability",
    "budget": 70000,
    "factors": {
      "battery": 0.8,
      "portability": 0.7,
      "cpu_score": 0.5
    },
    "products": [
      {
        "id": 1,
        "name": "Laptop A",
        "price": 72000,
        "battery": 8.4,
        "portability": 8.0,
        "cpu_score": 7.2
      }
    ]
  }'
```

### `/decide` (POST) - General Decision Making
Conversational decision-making with priorities.

### `/health` (GET) - Health Check
```bash
curl http://localhost:8000/health
```

---

## Project Structure

```
OptiChoice/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API client
│   │   └── styles/          # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # FastAPI + Python
│   ├── main.py             # API server
│   ├── requirements.txt     # Python dependencies
│   ├── examples.py          # Example usage
│   └── .env                 # Environment variables
│
└── start.sh                  # Startup script
```

---

## Configuration

### Backend Environment Variables
Create or edit `/backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### Frontend Environment Variables
Create or edit `/frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

---

## Dependencies

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Google Generative AI** - Gemini API integration

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** (implied) - HTTP client

---

## Common Issues & Fixes

### Port Already in Use
If you get "Address already in use", the port is occupied:

```bash
# Kill process on port 8000 (backend)
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Module Not Found (Backend)
```bash
cd backend
pip install -r requirements.txt
```

### Module Not Found (Frontend)
```bash
cd frontend
npm install
```

### Gemini API Errors
- Verify `GEMINI_API_KEY` is set in `/backend/.env`
- Check API quota and rate limits
- Ensure internet connection

---

## Development Features

### Hot Reload
- **Frontend**: Changes to React code auto-refresh
- **Backend**: Uses FastAPI's auto-reload feature

### API Documentation
Visit [http://localhost:8000/docs](http://localhost:8000/docs) to:
- View all available endpoints
- Test API calls interactively
- See request/response schemas

### Browser DevTools
- Frontend runs with sourcemaps for easy debugging
- Use Chrome DevTools (F12) for debugging

---

## Next Steps

1. ✅ Start both servers
2. 📝 Open the frontend at [http://localhost:5173](http://localhost:5173)
3. 🧪 Try the analysis feature with sample products
4. 📚 Check the API docs at [http://localhost:8000/docs](http://localhost:8000/docs)
5. 💻 Explore the codebase and customize as needed

---

## Helpful Commands

```bash
# Start everything at once
./start.sh

# Check if backend is running
curl http://localhost:8000/health

# View backend logs with timestamps
python backend/main.py

# Reinstall dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Run examples (requires backend running)
python backend/examples.py
```

---

## Need Help?

- **Backend Docs**: See [backend/README.md](backend/README.md)
- **API Guide**: See [ANALYSIS_API_GUIDE.md](ANALYSIS_API_GUIDE.md)
- **API Examples**: Run `python backend/examples.py`

---

Enjoy developing with OptiChoice! 🎯
