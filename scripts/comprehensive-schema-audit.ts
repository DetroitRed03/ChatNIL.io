/**
 * Comprehensive Schema Audit
 *
 * This script will:
 * 1. Document all tables and their columns in the current database
 * 2. Identify any missing columns that the application expects
 * 3. Generate migration SQL to add missing columns
 * 4. Provide a complete schema reference
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TableColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

async function auditSchema() {
  console.log('🔍 COMPREHENSIVE DATABASE SCHEMA AUDIT\n');
  console.log('=' .repeat(80));

  const report: string[] = [];
  const migrations: string[] = [];

  // Define expected schema based on application code
  const expectedSchema = {
    users: [
      'id', 'email', 'role', 'first_name', 'last_name', 'username',
      'phone', 'date_of_birth', 'parent_email', 'profile_photo',
      'onboarding_completed', 'created_at', 'updated_at',
      'school_id', 'school_name', 'company_name', 'industry'
    ],
    athlete_profiles: [
      'id', 'user_id', 'bio', 'major', 'gpa', 'primary_sport', 'position',
      'secondary_sports', 'achievements', 'coach_name', 'coach_email',
      'height_inches', 'weight_lbs', 'jersey_number', 'sport', 'school', 'year',
      'estimated_fmv', 'social_media_stats', 'content_creation_interests',
      'brand_affinity', 'causes_care_about', 'lifestyle_interests', 'hobbies',
      'nil_preferences', 'created_at', 'updated_at'
    ],
    social_media_stats: [
      'id', 'user_id', 'platform', 'handle', 'followers', 'engagement_rate',
      'instagram_followers', 'instagram_engagement', 'tiktok_followers',
      'tiktok_engagement', 'twitter_followers', 'twitter_engagement',
      'youtube_subscribers', 'created_at', 'updated_at'
    ],
    chat_sessions: [
      'id', 'user_id', 'title', 'created_at', 'updated_at', 'last_message_at'
    ],
    chat_messages: [
      'id', 'session_id', 'role', 'content', 'created_at'
    ],
    agency_athlete_lists: [
      'id', 'agency_user_id', 'list_name', 'description', 'created_at', 'updated_at'
    ],
    agency_athlete_list_items: [
      'id', 'list_id', 'athlete_profile_id', 'tags', 'notes', 'created_at'
    ],
    agency_athlete_messages: [
      'id', 'agency_user_id', 'athlete_user_id', 'thread_id', 'sender_id',
      'message_text', 'attachments', 'is_read', 'read_at', 'created_at'
    ],
    athlete_public_profiles: [
      'id', 'user_id', 'username', 'sport', 'position', 'school', 'state',
      'school_level', 'content_categories', 'total_followers', 'avg_engagement_rate',
      'estimated_fmv_min', 'estimated_fmv_max', 'is_available_for_partnerships',
      'created_at', 'updated_at'
    ]
  };

  // Get all tables
  const tables = Object.keys(expectedSchema);

  for (const tableName of tables) {
    console.log(`\n📋 Checking table: ${tableName}`);
    report.push(`\n## Table: ${tableName}\n`);

    // Try to select from the table to see if it exists and what columns it has
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ❌ Table not found or inaccessible: ${error.message}`);
      report.push(`❌ **TABLE MISSING OR INACCESSIBLE**\n`);
      report.push(`Error: ${error.message}\n`);

      // Add to migrations
      migrations.push(`-- TODO: Create table ${tableName}`);
      migrations.push(`-- Expected columns: ${expectedSchema[tableName as keyof typeof expectedSchema].join(', ')}\n`);
      continue;
    }

    const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : [];
    const expectedColumns = expectedSchema[tableName as keyof typeof expectedSchema];

    console.log(`   ✅ Table exists`);
    console.log(`   📊 Columns found: ${actualColumns.length}`);
    report.push(`✅ Table exists with ${actualColumns.length} columns\n\n`);

    // Compare expected vs actual columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
      report.push(`### ⚠️ Missing Columns:\n`);
      missingColumns.forEach(col => {
        report.push(`- \`${col}\`\n`);
        migrations.push(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col} TEXT; -- TODO: Set proper data type`);
      });
      report.push('\n');
    }

    if (extraColumns.length > 0) {
      console.log(`   ℹ️  Extra columns (not expected): ${extraColumns.join(', ')}`);
      report.push(`### ℹ️ Extra Columns (in DB but not expected by app):\n`);
      extraColumns.forEach(col => {
        report.push(`- \`${col}\`\n`);
      });
      report.push('\n');
    }

    if (missingColumns.length === 0 && extraColumns.length === 0) {
      console.log(`   ✅ All expected columns present`);
      report.push(`✅ All expected columns present\n`);
    }

    // List all actual columns
    report.push(`### Actual Columns:\n`);
    report.push('```\n');
    report.push(actualColumns.join(', '));
    report.push('\n```\n');
  }

  // Write report
  console.log('\n' + '='.repeat(80));
  console.log('📝 Writing audit report...');

  const reportContent = `# Database Schema Audit Report
Generated: ${new Date().toISOString()}

${report.join('')}

---

## Summary

This audit compared the application's expected database schema against the actual Supabase database.

### Action Items:
1. Review missing columns and determine if they need to be added
2. Review extra columns and determine if application code needs to use them
3. Run migrations to add any required missing columns
4. Update application code to match actual schema

`;

  fs.writeFileSync('DATABASE_SCHEMA_AUDIT.md', reportContent);
  console.log('✅ Report written to DATABASE_SCHEMA_AUDIT.md');

  // Write migrations
  if (migrations.length > 0) {
    const migrationContent = `-- Database Schema Migrations
-- Generated: ${new Date().toISOString()}
-- Run these migrations to add missing columns

${migrations.join('\n')}
`;

    fs.writeFileSync('migrations/999_schema_fixes.sql', migrationContent);
    console.log('✅ Migration SQL written to migrations/999_schema_fixes.sql');
  }

  console.log('\n✅ Schema audit complete!');
  console.log('📖 Review DATABASE_SCHEMA_AUDIT.md for details');
}

auditSchema().catch(console.error);
