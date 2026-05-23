#!/bin/bash

# OptiChoice Local Development Startup Script

echo "🚀 Starting OptiChoice Project..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "${YELLOW}⚠️  Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "${YELLOW}⚠️  Python 3 is not installed${NC}"
    echo "Please install Python 3 from https://www.python.org/"
    exit 1
fi

echo "${BLUE}✓ Node.js and Python are installed${NC}"
echo ""

# Start Backend
echo "${BLUE}Starting Backend Server...${NC}"
cd backend
python3 main.py &
BACKEND_PID=$!
echo "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  API available at: http://localhost:8000"
echo "  API Docs at: http://localhost:8000/docs"
echo ""

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo "${BLUE}Starting Frontend Development Server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "  Frontend available at: http://localhost:5173"
echo ""

echo "${GREEN}========================================${NC}"
echo "${GREEN}OptiChoice is running!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
