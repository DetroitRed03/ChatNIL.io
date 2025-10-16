// Mock Supabase client for development when real Supabase is unavailable
// This allows you to test the onboarding flow without a real database connection

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful signup
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

    signOut: async () => ({
      error: null
    })
  },

  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: null,
          error: { message: 'Mock: User profile not found' }
        })
      })
    }),

    insert: async (data: any[]) => ({
      error: null,
      data
    }),

    update: async (data: any) => ({
      eq: () => ({
        error: null,
        data
      })
    })
  })
};

export { mockSupabaseClient as supabase };