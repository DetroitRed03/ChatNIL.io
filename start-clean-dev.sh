#!/bin/bash

# Unset ALL Supabase environment variables
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
unset SUPABASE_URL
unset SUPABASE_SERVICE_ROLE_KEY

echo "🧹 Cleared system Supabase environment variables"
echo "📁 Will read from .env.local instead"
echo ""

# Start dev server - it will read from .env.local
npm run dev
