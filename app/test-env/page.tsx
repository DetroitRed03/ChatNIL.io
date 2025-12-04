'use client';

export default function TestEnvPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>

      <div style={{ marginTop: '20px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_URL:</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {url || 'NOT SET'}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {key ? `${key.substring(0, 50)}...` : 'NOT SET'}
        </pre>

        {key && (
          <div style={{ marginTop: '10px' }}>
            <p>✅ Key is {key.length} characters long</p>
            <p>✅ Key starts with: {key.substring(0, 20)}...</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd' }}>
        <p><strong>Note:</strong> If these show "NOT SET", the dev server needs to be restarted.</p>
        <p>Environment variables are baked in at build time for client components.</p>
      </div>
    </div>
  );
}
