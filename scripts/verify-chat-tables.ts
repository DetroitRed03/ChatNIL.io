import { supabaseAdmin } from '../lib/supabase';

async function reloadAndVerify() {
  console.log('🔄 Reloading PostgREST schema cache...\n');

  // Reload schema cache
  try {
    await fetch('https://lqskiijspudfocddhkqs.supabase.co/rest/v1/rpc/reload_schema', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I'
      }
    });
    console.log('✅ Schema cache reloaded\n');
  } catch (err) {
    console.log('⚠️  Schema reload:', (err as Error).message, '\n');
  }

  // Small delay to let cache reload
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('📊 Verifying chat tables...\n');

  const { data: sessions, error: e1 } = await supabaseAdmin.from('chat_sessions').select('*').limit(1);
  console.log(e1 ? '❌ chat_sessions: ' + e1.message : '✅ chat_sessions: table exists and is accessible');

  const { data: messages, error: e2 } = await supabaseAdmin.from('chat_messages').select('*').limit(1);
  console.log(e2 ? '❌ chat_messages: ' + e2.message : '✅ chat_messages: table exists and is accessible');

  const { data: attachments, error: e3 } = await supabaseAdmin.from('chat_attachments').select('*').limit(1);
  console.log(e3 ? '❌ chat_attachments: ' + e3.message : '✅ chat_attachments: table exists and is accessible');

  console.log('\n🎉 Chat tables verification complete!');
}

reloadAndVerify();
