import { supabaseAdmin } from '../lib/supabase';

async function applyMigrations() {
  console.log('🔧 Creating Chat Tables...\n');

  // Step 1: Create helper function
  console.log('📝 Creating update_updated_at_column function...');
  try {
    const { error: funcError } = await supabaseAdmin.rpc('query', {
      query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (funcError && funcError.code !== 'PGRST202') {
      console.log('⚠️  Helper function:', funcError.message);
    } else {
      console.log('✅ Helper function ready\n');
    }
  } catch (err: any) {
    console.log('⚠️  Helper function:', err.message, '\n');
  }

  // Step 2: Create chat_sessions table
  console.log('📝 Creating chat_sessions table...');
  try {
    // Use raw SQL via admin client
    await supabaseAdmin.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title text NOT NULL DEFAULT 'New Chat',
          role_context text DEFAULT 'athlete',
          is_pinned boolean DEFAULT false,
          is_archived boolean DEFAULT false,
          draft text DEFAULT '',
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );
      `
    });

    // Enable RLS
    await supabaseAdmin.rpc('query', {
      query: 'ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;'
    });

    // Create policies
    const policies = [
      `DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;`,
      `CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;`,
      `CREATE POLICY "Users can create own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;`,
      `CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;`,
      `CREATE POLICY "Users can delete own chat sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Service role can manage all chat sessions" ON chat_sessions;`,
      `CREATE POLICY "Service role can manage all chat sessions" ON chat_sessions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`
    ];

    for (const policy of policies) {
      await supabaseAdmin.rpc('query', { query: policy });
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);'
    ];

    for (const index of indexes) {
      await supabaseAdmin.rpc('query', { query: index });
    }

    // Create trigger
    await supabaseAdmin.rpc('query', {
      query: `
        DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
        CREATE TRIGGER update_chat_sessions_updated_at
          BEFORE UPDATE ON chat_sessions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    console.log('✅ chat_sessions table created\n');
  } catch (err: any) {
    console.log('❌ chat_sessions error:', err.message, '\n');
  }

  // Step 3: Create chat_messages table
  console.log('📝 Creating chat_messages table...');
  try {
    await supabaseAdmin.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content text NOT NULL,
          metadata jsonb DEFAULT '{}',
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });

    await supabaseAdmin.rpc('query', {
      query: 'ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;'
    });

    const msgPolicies = [
      `DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;`,
      `CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Users can create own messages" ON chat_messages;`,
      `CREATE POLICY "Users can create own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `DROP POLICY IF EXISTS "Service role can manage all messages" ON chat_messages;`,
      `CREATE POLICY "Service role can manage all messages" ON chat_messages FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`
    ];

    for (const policy of msgPolicies) {
      await supabaseAdmin.rpc('query', { query: policy });
    }

    await supabaseAdmin.rpc('query', {
      query: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);'
    });
    await supabaseAdmin.rpc('query', {
      query: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);'
    });

    console.log('✅ chat_messages table created\n');
  } catch (err: any) {
    console.log('❌ chat_messages error:', err.message, '\n');
  }

  // Step 4: Create chat_attachments table
  console.log('📝 Creating chat_attachments table...');
  try {
    await supabaseAdmin.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS chat_attachments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
          file_name text NOT NULL,
          file_type text NOT NULL,
          file_size integer NOT NULL,
          storage_path text NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    });

    await supabaseAdmin.rpc('query', {
      query: 'ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;'
    });

    await supabaseAdmin.rpc('query', {
      query: `
        DROP POLICY IF EXISTS "Users can view attachments for their messages" ON chat_attachments;
        CREATE POLICY "Users can view attachments for their messages" ON chat_attachments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM chat_messages
              WHERE chat_messages.id = chat_attachments.message_id
              AND chat_messages.user_id = auth.uid()
            )
          );
      `
    });

    await supabaseAdmin.rpc('query', {
      query: 'CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(message_id);'
    });

    console.log('✅ chat_attachments table created\n');
  } catch (err: any) {
    console.log('❌ chat_attachments error:', err.message, '\n');
  }

  // Step 5: Verify tables
  console.log('📊 Verifying tables...\n');

  const { data: sessions, error: e1 } = await supabaseAdmin.from('chat_sessions').select('*').limit(1);
  console.log(e1 ? '❌ chat_sessions: ' + e1.message : '✅ chat_sessions: table exists');

  const { data: messages, error: e2 } = await supabaseAdmin.from('chat_messages').select('*').limit(1);
  console.log(e2 ? '❌ chat_messages: ' + e2.message : '✅ chat_messages: table exists');

  const { data: attachments, error: e3 } = await supabaseAdmin.from('chat_attachments').select('*').limit(1);
  console.log(e3 ? '❌ chat_attachments: ' + e3.message : '✅ chat_attachments: table exists');

  console.log('\n🎉 Chat tables migration complete!');
  console.log('\nℹ️  Note: You may need to reload the PostgREST schema cache for changes to take effect.');
}

applyMigrations().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
