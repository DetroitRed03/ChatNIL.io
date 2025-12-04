#!/bin/bash

# Kill all Node processes
killall -9 node 2>/dev/null

# Wait for cleanup
sleep 3

# Remove all caches
rm -rf .next node_modules/.cache

# Load environment variables
export $(cat .env.local | grep -v "^#" | xargs)

# Start server on port 3000
PORT=3000 npm run dev
