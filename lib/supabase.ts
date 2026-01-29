import { createClient } from '@supabase/supabase-js';

const devMode = process.env.NEXT_PUBLIC_DEV_MODE;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// In-memory storage for mock development
const mockDatabase: { [table: string]: any[] } = {
  users: []
};

// Create mock client for development
const mockSupabaseClient = {
  auth: {
    getSession: async () => ({
      data: { session: null },
      error: null
    }),

    onAuthStateChange: (callback: Function) => ({
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }),

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔄 Mock login for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: {
            id: 'mock-user-' + Date.now(),
            email,
            created_at: new Date().toISOString()
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            user: {
              id: 'mock-user-' + Date.now(),
              email
            }
          }
        },
        error: null
      };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('🚀 Mock signup started for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userId = 'mock-user-' + Date.now();
      const userData = {
        id: userId,
        email,
        created_at: new Date().toISOString()
      };

      console.log('✅ Mock signup completed, user created:', userData);

      return {
        data: {
          user: userData,
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            user: userData
          }
        },
        error: null
      };
    },

    signOut: async () => ({
      error: null
    })
  },

  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          console.log(`🔍 Mock query: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`);

          if (!mockDatabase[table]) {
            mockDatabase[table] = [];
          }

          const record = mockDatabase[table].find(item => item[column] === value);

          if (record) {
            console.log('✅ Mock profile found:', record);
            return {
              data: record,
              error: null
            };
          } else {
            console.log('❌ Mock profile not found in database:', mockDatabase[table]);
            return {
              data: null,
              error: { message: `Mock: No records found in ${table} where ${column} = ${value}` }
            };
          }
        }
      })
    }),

    insert: async (data: any[]) => {
      console.log('🔄 Mock insert to', table, ':', data);

      if (!mockDatabase[table]) {
        mockDatabase[table] = [];
      }

      // Add each record to the mock database
      data.forEach(record => {
        mockDatabase[table].push(record);
        console.log('💾 Stored in mock database:', record);
      });

      console.log('🗄️ Complete mock database state:', mockDatabase);

      return {
        error: null,
        data
      };
    },

    update: (data: any) => ({
      eq: (column: string, value: any) => async () => {
        console.log('🔄 Mock update to', table, ':', data, 'where', column, '=', value);

        if (!mockDatabase[table]) {
          mockDatabase[table] = [];
        }

        // Find and update the record
        const index = mockDatabase[table].findIndex(item => item[column] === value);
        if (index !== -1) {
          mockDatabase[table][index] = { ...mockDatabase[table][index], ...data };
          console.log('✅ Updated record:', mockDatabase[table][index]);
          return {
            error: null,
            data: mockDatabase[table][index]
          };
        } else {
          console.log('❌ Record not found for update');
          return {
            error: { message: `Mock: No records found in ${table} where ${column} = ${value}` },
            data: null
          };
        }
      }
    })
  })
};

// Determine which client to use
let supabaseClient: any;

if (devMode === 'mock' || !supabaseUrl || !supabaseAnonKey) {
  if (devMode === 'mock') {
    console.log('🛠️ MOCK MODE: Using fake in-memory database for testing');
    console.log('📝 Data will not persist between sessions');
    console.log('🔄 To switch to real database, change NEXT_PUBLIC_DEV_MODE=real in .env.local');
  } else {
    console.log('⚠️ Missing Supabase credentials - falling back to mock mode');
    console.log('📋 Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  supabaseClient = mockSupabaseClient;
} else {
  console.log('🚀 PRODUCTION MODE: Using real Supabase database');
  console.log('📊 Supabase URL:', supabaseUrl);
  console.log('🔑 API Key configured:', supabaseAnonKey ? 'Yes' : 'No');
  console.log('💾 Data will persist between sessions');

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'chatnil-app'
      }
    }
  });
}

export const supabase = supabaseClient;

/**
 * Reset Supabase auth session for fresh signup with configurable aggressiveness
 */
export async function resetSupabaseSession(options: {
  aggressive?: boolean;
  skipIfNoSession?: boolean;
  debug?: boolean;
} = {}) {
  const { aggressive = false, skipIfNoSession = true, debug = false } = options;

  if (debug) {
    console.log('🔄 === SUPABASE SESSION RESET START ===');
    console.log('⚙️ Options:', options);
  }

  try {
    // Check if there's an existing session first
    if (skipIfNoSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (debug) console.log('ℹ️ No existing session found, skipping reset');
        return true;
      }
      if (debug) console.log('🔍 Found existing session, proceeding with reset');
    }

    // Sign out any existing session
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('⚠️ Warning during session reset:', error.message);
      // Don't fail completely on signOut errors - they're often non-critical
    } else {
      if (debug) console.log('✅ Successfully signed out existing session');
    }

    // Clear cached auth state (only if aggressive mode or debug mode)
    if ((aggressive || debug) && typeof window !== 'undefined') {
      try {
        const localStorage = window.localStorage;
        const sessionStorage = window.sessionStorage;

        // Find and remove Supabase auth keys
        const keysToRemove: string[] = [];

        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            keysToRemove.push(`localStorage:${key}`);
            localStorage.removeItem(key);
          }
        });

        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            keysToRemove.push(`sessionStorage:${key}`);
            sessionStorage.removeItem(key);
          }
        });

        if (debug && keysToRemove.length > 0) {
          console.log('🗑️ Cleared Supabase storage keys:', keysToRemove);
        }
      } catch (storageError) {
        console.warn('⚠️ Error clearing Supabase storage (non-fatal):', storageError);
      }
    }

    if (debug) console.log('✅ Supabase session reset complete');
    return true;
  } catch (error) {
    console.error('❌ Error resetting Supabase session:', error);
    console.log('🛡️ Continuing despite session reset error...');
    return false;
  }
}

// Service role client for admin operations (bypasses RLS)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceRoleKey && supabaseUrl ?
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'chatnil-admin'
      }
    }
  }) : null;

console.log('🔑 Service role client:', supabaseAdmin ? 'Available' : 'Not configured');