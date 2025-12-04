#!/bin/bash
# Simple wrapper to load env and run verification

# Load environment variables
set -a
source .env.local
set +a

# Run the verification script
npx tsx scripts/verify-seeded-data.ts
