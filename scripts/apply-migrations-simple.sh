#!/bin/bash

# Simple script to apply migrations using psql directly
# This bypasses PostgREST schema cache issues

echo "🔧 APPLYING MISSING MIGRATIONS"
echo "============================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v "^#" | xargs)

# Extract connection details from SUPABASE_URL
# Format: https://PROJECT_REF.supabase.co
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📋 Project: $PROJECT_REF"
echo ""

# PostgreSQL connection string
# Supabase format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
PGPASSWORD="your-db-password-here"
PGHOST="db.${PROJECT_REF}.supabase.co"
PGPORT="5432"
PGDATABASE="postgres"
PGUSER="postgres"

echo "⚠️  NOTE: This script requires direct PostgreSQL access"
echo "   You'll need to get your database password from Supabase dashboard"
echo "   Settings > Database > Connection string"
echo ""
echo "Alternatively, we can use the Supabase SQL Editor in the dashboard"
echo ""

# For now, just output the SQL files that need to be run
echo "📄 MIGRATIONS TO APPLY:"
echo ""
echo "1. NIL Deals Table:"
echo "   File: migrations/018_nil_deals.sql"
echo "   Action: Copy/paste into Supabase SQL Editor"
echo ""
echo "2. State NIL Rules:"
echo "   File: migrations/phase-5-fmv-system/023_state_nil_rules.sql"
echo "   Action: Copy/paste into Supabase SQL Editor"
echo ""
echo "🌐 Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo ""
