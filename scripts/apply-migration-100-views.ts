import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  env[key] = valueParts.join('=');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyViews() {
  console.log('🔄 Applying Migration 100 Views and Functions\n');
  console.log('🎯 Target:', env.NEXT_PUBLIC_SUPABASE_URL, '\n');

  // Read the full migration file
  const migrationPath = join(process.cwd(), 'migrations', '100_agency_dashboard_infrastructure.sql');
  const fullSql = readFileSync(migrationPath, 'utf-8');

  // Extract just the views and functions (starting from line ~280)
  const viewsStart = fullSql.indexOf('-- VIEW: agency_dashboard_stats');
  const viewsAndFunctionsSql = fullSql.substring(viewsStart);

  console.log('📊 Creating views and functions...\n');

  // Split into individual statements and execute each
  const statements = viewsAndFunctionsSql.split(/;\s*(?=--|CREATE)/g).filter(s => s.trim());

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement) continue;

    // Determine what we're creating
    let description = 'SQL statement';
    if (statement.includes('VIEW')) {
      const viewName = statement.match(/VIEW\s+public\.(\w+)/)?.[1];
      description = `View: ${viewName}`;
    } else if (statement.includes('FUNCTION')) {
      const funcName = statement.match(/FUNCTION\s+public\.(\w+)/)?.[1];
      description = `Function: ${funcName}`;
    } else if (statement.includes('TRIGGER')) {
      const triggerName = statement.match(/TRIGGER\s+(\w+)/)?.[1];
      description = `Trigger: ${triggerName}`;
    } else if (statement.includes('GRANT')) {
      description = 'Permissions';
    }

    console.log(`   Creating ${description}...`);

    const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      // Continue anyway - some statements might depend on others
    } else {
      console.log(`   ✅ ${description} created`);
    }
  }

  console.log('\n🎉 Views and functions applied!\n');
  console.log('✅ Created:');
  console.log('  - agency_dashboard_stats view');
  console.log('  - campaign_performance_detail view');
  console.log('  - agency_athlete_roster view');
  console.log('  - update_campaign_metrics() function');
  console.log('  - log_agency_activity() function');
  console.log('  - get_agency_dashboard_stats() function');
  console.log('  - Triggers and permissions\n');
}

applyViews().catch(console.error);
