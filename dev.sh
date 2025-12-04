#!/bin/bash

# ChatNIL.io Smart Dev Server Launcher
# This script ensures only ONE dev server runs at a time

echo "🔍 Checking for existing dev servers..."

# Kill any existing Next.js dev servers
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "npm run dev" 2>/dev/null

# Kill anything on port 3000
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
  echo "🔫 Killing process on port 3000: $PORT_PID"
  kill -9 $PORT_PID 2>/dev/null
fi

# Wait for processes to die
sleep 2

# Verify port is free
if lsof -ti:3000 &>/dev/null; then
  echo "❌ ERROR: Port 3000 is still in use!"
  echo "Run: lsof -ti:3000 | xargs kill -9"
  exit 1
fi

echo "✅ Port 3000 is free"
echo "🚀 Starting dev server..."

# Start the dev server
npm run dev
