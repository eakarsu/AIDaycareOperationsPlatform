#!/bin/bash

# ============================================================
# AI Daycare Operations Platform - Start Script
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        AI Daycare Operations Platform                   ║"
echo "║        Starting Application...                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# Step 1: Clean up used ports (3000, 3001)
# ============================================================
echo -e "${YELLOW}[1/6] Cleaning up ports 3000 and 3001...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "  ${GREEN}Port $port is free${NC}"
    fi
}

cleanup_port 3000
cleanup_port 3001

# ============================================================
# Step 2: Load environment variables
# ============================================================
echo -e "${YELLOW}[2/6] Loading environment variables...${NC}"

if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs 2>/dev/null)
    echo -e "  ${GREEN}.env file loaded${NC}"
else
    echo -e "  ${RED}Warning: .env file not found. Using defaults.${NC}"
    export DB_USER=postgres
    export DB_HOST=localhost
    export DB_NAME=daycare_platform
    export DB_PASSWORD=postgres
    export DB_PORT=5432
fi

# ============================================================
# Step 3: Setup PostgreSQL Database
# ============================================================
echo -e "${YELLOW}[3/6] Setting up PostgreSQL database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -q 2>/dev/null; then
    echo -e "  ${RED}PostgreSQL is not running. Attempting to start...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -q 2>/dev/null; then
        echo -e "  ${RED}Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    fi
fi
echo -e "  ${GREEN}PostgreSQL is running${NC}"

# Create database if it doesn't exist
echo -e "  Creating database '${DB_NAME:-daycare_platform}'..."
createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} ${DB_NAME:-daycare_platform} 2>/dev/null || true

# Run seed script
echo -e "  Seeding database with sample data..."
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-daycare_platform} -f "$PROJECT_DIR/server/seed.sql" -q 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}Database seeded successfully (15 items per feature)${NC}"
else
    echo -e "  ${YELLOW}Database seed had warnings (tables may already exist)${NC}"
fi

# ============================================================
# Step 4: Install dependencies
# ============================================================
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"

# Server dependencies
echo -e "  Installing server dependencies..."
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    npm install --silent 2>/dev/null
fi
echo -e "  ${GREEN}Server dependencies ready${NC}"

# Client dependencies
echo -e "  Installing client dependencies..."
cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    npm install --silent 2>/dev/null
fi
echo -e "  ${GREEN}Client dependencies ready${NC}"

cd "$PROJECT_DIR"

# ============================================================
# Step 5: Start Backend Server (with hot reload via nodemon)
# ============================================================
echo -e "${YELLOW}[5/6] Starting backend server on port 3001...${NC}"

cd "$PROJECT_DIR/server"
npx nodemon index.js &
SERVER_PID=$!
cd "$PROJECT_DIR"

sleep 2

# Verify server is running
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}Backend server running on http://localhost:3001${NC}"
else
    echo -e "  ${YELLOW}Backend server starting... (may take a moment)${NC}"
fi

# ============================================================
# Step 6: Start Frontend (React with hot reload)
# ============================================================
echo -e "${YELLOW}[6/6] Starting frontend on port 3000...${NC}"

cd "$PROJECT_DIR/client"
BROWSER=none PORT=3000 npm start &
CLIENT_PID=$!
cd "$PROJECT_DIR"

# ============================================================
# Display startup info
# ============================================================
sleep 3

echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  AI Daycare Operations Platform is running!             ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                         ║"
echo "║  Frontend:  http://localhost:3000                        ║"
echo "║  Backend:   http://localhost:3001                        ║"
echo "║  API Health: http://localhost:3001/api/health            ║"
echo "║                                                         ║"
echo "║  Login Credentials:                                     ║"
echo "║    Email:    admin@daycare.com                           ║"
echo "║    Password: admin123                                    ║"
echo "║    (Click 'Demo Login' button to auto-fill)             ║"
echo "║                                                         ║"
echo "║  Hot reload is enabled - changes auto-refresh            ║"
echo "║  Press Ctrl+C to stop all services                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# Cleanup on exit
# ============================================================
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $CLIENT_PID 2>/dev/null || true
    cleanup_port 3000
    cleanup_port 3001
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
