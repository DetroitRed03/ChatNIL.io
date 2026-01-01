#!/usr/bin/env npx tsx
/**
 * Apply Migration 020: Campaign Slugs
 *
 * Adds slug column to agency_campaigns for URL-friendly campaign URLs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('Applying Migration 020: Campaign Slugs');
  console.log('='.repeat(60));

  try {
    // Step 1: Check if slug column exists by querying
    console.log('\nStep 1: Checking campaigns...');

    let { data: campaigns, error: fetchError } = await supabase
      .from('agency_campaigns')
      .select('id, name, slug');

    if (fetchError) {
      // If slug column doesn't exist, the error will say so
      if (fetchError.message.includes('slug')) {
        console.log('Slug column does not exist yet. Adding it...');
        
        // Try to add via RPC
        const { error: alterError } = await supabase.rpc('exec_sql', {
          query: `ALTER TABLE agency_campaigns ADD COLUMN IF NOT EXISTS slug TEXT;`
        });
        
        if (alterError) {
          console.log('⚠️ Cannot add column via RPC. Please run this SQL in Supabase Dashboard:');
          console.log('\n  ALTER TABLE agency_campaigns ADD COLUMN IF NOT EXISTS slug TEXT;\n');
          return;
        }
        
        // Retry fetch
        const { data: retryData, error: retryError } = await supabase
          .from('agency_campaigns')
          .select('id, name, slug');
        campaigns = retryData;
          
        if (retryError) {
          throw retryError;
        }
      } else {
        throw fetchError;
      }
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns found');
      return;
    }

    console.log(`Found ${campaigns.length} campaigns\n`);

    // Track existing slugs
    const existingSlugs = new Set<string>();

    // First pass: collect existing slugs
    for (const campaign of campaigns) {
      if (campaign.slug) {
        existingSlugs.add(campaign.slug);
      }
    }

    // Second pass: generate missing slugs
    for (const campaign of campaigns) {
      if (campaign.slug) {
        console.log(`  ✓ "${campaign.name}" → ${campaign.slug}`);
        continue;
      }

      // Generate slug from name
      let baseSlug = (campaign.name || 'campaign')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      if (!baseSlug) {
        baseSlug = 'campaign';
      }

      let slug = baseSlug;
      let counter = 0;

      // Ensure uniqueness
      while (existingSlugs.has(slug)) {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }

      existingSlugs.add(slug);

      // Update campaign with slug
      const { error: updateError } = await supabase
        .from('agency_campaigns')
        .update({ slug })
        .eq('id', campaign.id);

      if (updateError) {
        console.log(`  ❌ "${campaign.name}": ${updateError.message}`);
      } else {
        console.log(`  ✅ "${campaign.name}" → ${slug}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration 020 completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
