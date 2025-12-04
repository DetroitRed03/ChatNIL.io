#!/bin/bash
#
# ChatNIL Migration Helper
#
# Usage: ./migrate.sh <migration-file>
# Example: ./migrate.sh migrations/031_add_username_to_users.sql
#

if [ -z "$1" ]; then
  echo "❌ Usage: ./migrate.sh <migration-file>"
  echo "   Example: ./migrate.sh migrations/031_add_username_to_users.sql"
  exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the migration
npx tsx scripts/run-migration.ts "$1"
