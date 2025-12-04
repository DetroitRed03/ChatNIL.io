import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function testClients() {
  console.log('=== Testing Direct Client (@supabase/supabase-js) ===\n');

  const directClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: directData, error: directError } = await directClient
    .from('agency_athlete_lists')
    .select('*')
    .limit(2);

  if (directError) {
    console.error('❌ Direct Client Error:', directError);
  } else {
    console.log('✅ Direct Client Success:', directData?.length, 'records');
    console.log(JSON.stringify(directData, null, 2));
  }

  console.log('\n=== Testing Server Client (@supabase/ssr) ===\n');

  const serverClient = createServerClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: serverData, error: serverError } = await serverClient
    .from('agency_athlete_lists')
    .select('*')
    .limit(2);

  if (serverError) {
    console.error('❌ Server Client Error:', serverError);
  } else {
    console.log('✅ Server Client Success:', serverData?.length, 'records');
    console.log(JSON.stringify(serverData, null, 2));
  }
}

testClients();
