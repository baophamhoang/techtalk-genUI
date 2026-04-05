#!/bin/bash

# GenUI Techtalk - Stop All Demos
# Run with: ./stop-demos.sh

echo "🛑 Stopping GenUI Techtalk Demos..."
echo "========================================"

# Stop processes by PID files
if [ -d "logs" ]; then
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping process $pid..."
                kill "$pid" 2>/dev/null
                sleep 1
            fi
            rm "$pidfile"
        fi
    done
fi

# Kill any remaining next/vite processes
echo "Cleaning up any remaining processes..."
pkill -f "next\|vite" 2>/dev/null || true
sleep 2

echo "✅ All demos stopped!"
echo ""
echo "Logs are available in ./logs directory"
echo "To restart: ./start-demos.sh"