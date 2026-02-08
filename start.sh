#!/bin/bash

# ============================================================
# EcoDrone Hello World - Quick Start Script
# ============================================================
# Sprint 0: Inception & Foundation
# Course: ICS 532 - Agile Software Engineering Methods
# University: Ashesi University
# ============================================================

echo "============================================================"
echo "  EcoDrone Hello World - Quick Start"
echo "  Parrot ANAFI Ai Control System"
echo "============================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo -e "${RED}Error: Python not found!${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Python found: $($PYTHON --version)${NC}"

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "\n${YELLOW}Creating virtual environment...${NC}"
    $PYTHON -m venv venv
fi

# Activate virtual environment
echo -e "\n${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pip install -q flask flask-cors python-dotenv

# Check for Olympe
echo -e "\n${YELLOW}Checking for Parrot Olympe SDK...${NC}"
if $PYTHON -c "import olympe" 2>/dev/null; then
    echo -e "${GREEN}✓ Olympe SDK is available${NC}"
    MODE="wifi"
else
    echo -e "${YELLOW}! Olympe SDK not found - using simulation mode${NC}"
    MODE="simulation"
fi

# Set connection mode
export DRONE_CONNECTION_MODE=$MODE

echo ""
echo "============================================================"
echo "  Starting EcoDrone API Server"
echo "  Mode: $MODE"
echo "============================================================"
echo ""
echo "  Backend API: http://localhost:5000"
echo "  Frontend:    Open frontend/index.html in your browser"
echo ""
echo "  Press Ctrl+C to stop"
echo ""
echo "============================================================"

# Start the backend
cd backend
$PYTHON app.py
