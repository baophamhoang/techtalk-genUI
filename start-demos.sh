#!/bin/bash

# GenUI Techtalk - Start All Demos
# Run with: ./start-demos.sh

set -e  # Exit on error

echo "🚀 Starting GenUI Techtalk Demos..."
echo "========================================"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js $NODE_VERSION detected. Node.js 18+ recommended."
fi

# Create logs directory
mkdir -p logs

# Function to start a demo
start_demo() {
    local demo_name=$1
    local demo_dir=$2
    local port=$3
    
    echo "📦 Starting $demo_name..."
    
    cd "$demo_dir" || exit 1
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "   Installing dependencies..."
        npm install --silent > "../../logs/${demo_name}-install.log" 2>&1
    fi
    
    # Start the demo in background
    npm run dev > "../../logs/${demo_name}.log" 2>&1 &
    DEMO_PID=$!
    echo $DEMO_PID > "../../logs/${demo_name}.pid"
    
    # Wait for server to start
    echo "   Waiting for server on port $port..."
    sleep 5
    
    # Check if server is running
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "   ✅ $demo_name running at http://localhost:$port"
    else
        echo "   ⚠️  $demo_name may not be ready yet. Check logs/${demo_name}.log"
    fi
    
    cd ../..
}

# Clean up previous runs
echo "🧹 Cleaning up previous sessions..."
pkill -f "next\|vite" 2>/dev/null || true
rm -f logs/*.pid

# Start demos
echo ""
start_demo "JSON-Render-Demo" "apps/json-render-demo" "3101"
echo ""
start_demo "Vercel-AI-Demo" "apps/vercel-ai-demo" "3000"
echo ""
start_demo "Multi-Model-Demo" "apps/multi-model-demo" "3003"

echo ""
echo "========================================"
echo "🎉 All demos started!"
echo ""
echo "📊 Demo URLs:"
echo "   Demo 1 (Basic):     http://localhost:3101"
echo "   Demo 2 (Medium):    http://localhost:3000"
echo "   Demo 3 (Advanced):  http://localhost:3003"
echo ""
echo "📁 Logs directory: ./logs"
echo ""
echo "🛑 To stop all demos:"
echo "   ./stop-demos.sh"
echo "   or press Ctrl+C and run: pkill -f \"next\|vite\""
echo ""
echo "🔧 API Key Notes:"
echo "   - Demo 2 needs OpenAI API key in apps/vercel-ai-demo/.env.local"
echo "   - Demos 1 & 3 work without API keys"
echo "========================================"

# Keep script running
echo ""
echo "Press Ctrl+C to stop all demos..."
wait