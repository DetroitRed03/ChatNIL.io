import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://enbuwffusjhpcyoveewb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function reloadSchema() {
  console.log('🔄 Reloading Supabase PostgREST Schema Cache');
  console.log('============================================\n');

  try {
    // Notify PostgREST to reload its schema cache
    const { error } = await supabase.rpc('exec_sql', { 
      query: `NOTIFY pgrst, 'reload schema';` 
    });

    if (error) {
      console.error('❌ Failed to reload schema:', error.message);
      console.log('\n⚠️  Alternative: The schema cache will auto-reload within a few minutes.');
      console.log('   Or you can restart the Supabase project in the dashboard.\n');
    } else {
      console.log('✅ Schema cache reload signal sent successfully!\n');
      console.log('⏳ PostgREST should recognize the new views within a few seconds.');
      console.log('🔄 Try refreshing your dashboard now.\n');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 The materialized views exist, but PostgREST needs to discover them.');
    console.log('   This usually happens automatically within 1-2 minutes.\n');
  }
}

reloadSchema();
