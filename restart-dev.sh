#!/bin/bash

# Kill all Next.js dev servers
pkill -9 -f "next dev"
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Clean cache
rm -rf .next

# Wait for port to be free
sleep 3

# Start dev server
PORT=3000 npm run dev
