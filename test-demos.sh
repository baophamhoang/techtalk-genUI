#!/bin/bash

# Quick test of all demos
echo "🚀 Testing GenUI Demos..."
echo "========================================"

# Test Demo 1
echo "📦 Testing Demo 1 (JSON Render)..."
cd apps/json-render-demo
if npm run dev > /tmp/demo1.log 2>&1 &
then
    DEMO1_PID=$!
    echo "   Started on PID $DEMO1_PID"
    sleep 5
    if curl -s http://localhost:3101 > /dev/null 2>&1; then
        echo "   ✅ Demo 1 running at http://localhost:3101"
    else
        echo "   ❌ Demo 1 failed to start"
        cat /tmp/demo1.log | tail -20
    fi
    kill $DEMO1_PID 2>/dev/null
else
    echo "   ❌ Demo 1 failed to start"
fi
cd ..

# Test Demo 2
echo ""
echo "📦 Testing Demo 2 (Vercel AI)..."
cd apps/vercel-ai-demo
if npm run dev > /tmp/demo2.log 2>&1 &
then
    DEMO2_PID=$!
    echo "   Started on PID $DEMO2_PID"
    sleep 5
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "   ✅ Demo 2 running at http://localhost:3000"
    else
        echo "   ❌ Demo 2 failed to start"
        cat /tmp/demo2.log | tail -20
    fi
    kill $DEMO2_PID 2>/dev/null
else
    echo "   ❌ Demo 2 failed to start"
fi
cd ..

# Test Demo 3
echo ""
echo "📦 Testing Demo 3 (Multi-Model)..."
cd apps/multi-model-demo
if npm run dev > /tmp/demo3.log 2>&1 &
then
    DEMO3_PID=$!
    echo "   Started on PID $DEMO3_PID"
    sleep 5
    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        echo "   ✅ Demo 3 running at http://localhost:3002"
    else
        echo "   ❌ Demo 3 failed to start"
        cat /tmp/demo3.log | tail -20
    fi
    kill $DEMO3_PID 2>/dev/null
else
    echo "   ❌ Demo 3 failed to start"
fi
cd ..

echo ""
echo "========================================"
echo "🎉 Test complete!"
echo "Cleanup..."
pkill -f "node\|next\|vite" 2>/dev/null
sleep 2