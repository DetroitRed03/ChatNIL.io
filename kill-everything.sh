#!/bin/bash

echo "🔫 NUCLEAR CLEANUP - KILLING EVERYTHING"
echo "========================================"

# Kill by process name
pkill -9 -f "next dev"
pkill -9 -f "npm run dev"
pkill -9 -f "dev.sh"
pkill -9 node
pkill -9 npm

# Kill by port
PORT_PIDS=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_PIDS" ]; then
  echo "Killing processes on port 3000: $PORT_PIDS"
  echo $PORT_PIDS | xargs kill -9 2>/dev/null
fi

# Nuclear option - kill ALL node processes
killall -9 node 2>/dev/null
killall -9 npm 2>/dev/null

# Wait for everything to die
sleep 3

# Verify nothing is running
echo ""
echo "Checking for survivors..."
SURVIVORS=$(ps aux | grep -E "next dev|npm run dev" | grep -v grep)
if [ -z "$SURVIVORS" ]; then
  echo "✅ All processes killed successfully"
else
  echo "⚠️  Warning: Some processes still running:"
  echo "$SURVIVORS"
fi

# Check port status
if lsof -ti:3000 &>/dev/null; then
  echo "❌ ERROR: Port 3000 still in use!"
  lsof -ti:3000
else
  echo "✅ Port 3000 is free"
fi

echo ""
echo "========================================"
echo "Cleanup complete. You can now run: npm run dev"
