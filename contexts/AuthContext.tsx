'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { User, UserRole, AthleteProfile, ParentProfile, CoachProfile } from '@/types';
import { supabase, resetSupabaseSession } from '@/lib/supabase';
import { prepareForSignup, setSignupSession, clearRedirectStorage, isFreshSession, setDebugMode, clearAllAuthStorage } from '@/lib/auth-storage';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import type { Session, AuthError } from '@supabase/supabase-js';
import { trackEvent, calculateSessionDuration } from '@/lib/analytics';

// Keep existing interface for backward compatibility, but extend it
interface ExtendedUser extends User {
  profile?: AthleteProfile | ParentProfile | CoachProfile;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileData: Partial<AthleteProfile | ParentProfile | CoachProfile>;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  isReady: boolean; // Indicates auth initialization is complete
  login: (email: string, password: string) => Promise<{ error?: string; user?: ExtendedUser }>;
  signup: (data: SignupData) => Promise<{ error?: string }>;
  // Legacy signup for backward compatibility
  signupLegacy: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add state to track profile loading and prevent race conditions
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const profileLoadingRef = useRef<string | null>(null); // Track current loading user ID

  // Track login time for session duration calculation
  const loginTimeRef = useRef<Date | null>(null);

  // Debug mode configuration
  useEffect(() => {
    // Enable debug mode based on URL parameter or environment
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const debugParam = urlParams?.get('debug_auth');
    const debugEnv = process.env.NODE_ENV === 'development';

    if (debugParam === 'true' || debugEnv) {
      setDebugMode(true);
    }
  }, []);

  // Add effect to log user state changes
  useEffect(() => {
    console.log('🔔 User state changed:', user ? `${user.name} (${user.email})` : 'null');
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserProfile(session.user.id);
      }

      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes with debouncing to prevent race conditions
    let authChangeTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔔 Auth state change detected:', event, session?.user?.id || 'no-user');

        // Clear any pending auth state changes to debounce rapid changes
        if (authChangeTimeout) {
          clearTimeout(authChangeTimeout);
        }

        authChangeTimeout = setTimeout(async () => {
          if (session?.user) {
            console.log('🔄 Auth state change: loading profile for user:', session.user.id);
            await loadUserProfile(session.user.id);
          } else {
            console.log('🔄 Auth state change: clearing user (no session)');
            // Clear profile loading state when signing out
            profileLoadingRef.current = null;
            setIsLoadingProfile(false);
            setUser(null);
          }
        }, 100); // 100ms debounce
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, force: boolean = false): Promise<ExtendedUser | null> => {
    // Prevent race conditions by checking if we're already loading this user
    if (!force && profileLoadingRef.current === userId) {
      console.log('🔄 Profile already loading for userId:', userId, '- skipping duplicate request');
      return null;
    }

    // Check if we're currently loading a different user and this isn't forced
    if (!force && profileLoadingRef.current && profileLoadingRef.current !== userId) {
      console.log('⏳ Currently loading different user profile, waiting...');
      // Wait a moment for the current load to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      // Check again if we still need to load
      if (profileLoadingRef.current) {
        console.log('🔄 Still loading, proceeding with new request for:', userId);
      }
    }

    try {
      console.log('🔄 loadUserProfile called for userId:', userId);
      profileLoadingRef.current = userId;
      setIsLoadingProfile(true);

      console.log('📤 Fetching profile via secure API to avoid RLS issues...');

      // Use API route instead of direct Supabase call to avoid RLS authentication issues
      const response = await fetch('/api/auth/get-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      console.log('📊 Profile API response:', { status: response.status, success: result.success });

      // Check if this request is still relevant (user might have changed during loading)
      if (profileLoadingRef.current !== userId) {
        console.log('🚫 Profile load result obsolete for userId:', userId, '- current loading:', profileLoadingRef.current);
        return null;
      }

      if (!response.ok || !result.success) {
        console.error('❌ Profile loading error from API:', result.error);
        // Clear loading state but don't throw - let the app handle gracefully
        profileLoadingRef.current = null;
        setIsLoadingProfile(false);
        return null;
      }

      const profile = result.profile;
      if (profile) {
        console.log('📋 Raw profile data from API:', profile);

        // Spread all profile fields into userData for direct access
        const userData: ExtendedUser = {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || 'User',
          email: profile.email,
          role: profile.role,
          profile: profile,
          // Phase 6B: Include school fields for direct access
          school_created: profile.school_created,
          profile_completion_tier: profile.profile_completion_tier,
          home_completion_required: profile.home_completion_required,
          school_id: profile.school_id,
          school_name: profile.school_name,
          home_completed_at: profile.home_completed_at,
          // Include other commonly accessed fields
          first_name: profile.first_name,
          last_name: profile.last_name,
          onboarding_completed: profile.onboarding_completed,
          graduation_year: profile.graduation_year,
          primary_sport: profile.primary_sport,
        };

        console.log('👤 Setting user state with:', userData);
        console.log('🎯 Onboarding status:', profile.onboarding_completed);
        console.log('🏫 Phase 6B fields included:', {
          school_created: userData.school_created,
          profile_completion_tier: userData.profile_completion_tier,
          home_completion_required: userData.home_completion_required,
        });

        // Only set user if this is still the current request
        if (profileLoadingRef.current === userId) {
          setUser(userData);
          console.log('✅ User state has been set successfully via API');
          return userData;
        } else {
          console.log('🚫 Skipping user state update - request obsolete');
          return null;
        }
      } else {
        console.log('⚠️ No profile data found in API response');
        if (profileLoadingRef.current === userId) {
          setUser(null);
        }
        return null;
      }
    } catch (error) {
      console.error('💥 Error in loadUserProfile via API:', error);
      // Don't set user to null on error - maintain current state
      return null;
    } finally {
      // Only clear loading state if this was the current request
      if (profileLoadingRef.current === userId) {
        profileLoadingRef.current = null;
        setIsLoadingProfile(false);
      }
      console.log('🔚 === LOADUSERPROFILE FUNCTION ENDING ===');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        console.error('Supabase auth error:', error);

        // Provide user-friendly error messages
        if (error.message.includes('fetch')) {
          return { error: 'Unable to connect to authentication service. Please check your internet connection and try again.' };
        }

        return { error: error.message };
      }

      if (data.user) {
        const userData = await loadUserProfile(data.user.id);

        // Track login event
        loginTimeRef.current = new Date();
        if (userData?.role) {
          trackEvent('user_login', {
            user_id: data.user.id,
            role: userData.role,
            login_method: 'email',
          });
        }

        setIsLoading(false);
        return { user: userData || undefined };
      }

      setIsLoading(false);
      return {};
    } catch (error) {
      setIsLoading(false);
      return { error: 'An unexpected error occurred' };
    }
  };

  // Cleanup function for failed authentication attempts
  const cleanupFailedAuth = (reason: string) => {
    console.log(`🧹 === CLEANUP FAILED AUTH: ${reason} ===`);

    try {
      // Clear loading state
      setIsLoading(false);

      // Clear any partial authentication state
      clearAllAuthStorage({
        clearSupabaseAuth: true,
        clearAppState: true,
        clearOnboarding: false, // Keep onboarding data if it exists
        clearRedirectFlags: true,
        preserveCurrentSession: false,
        debug: true
      });

      // Reset Supabase session aggressively to prevent conflicts
      resetSupabaseSession({
        aggressive: true,
        skipIfNoSession: false,
        debug: true
      }).catch(error => {
        console.warn('⚠️ Session reset warning during cleanup:', error);
      });

      console.log('✅ Cleanup completed - ready for fresh signup attempt');
    } catch (error) {
      console.error('❌ Error during auth cleanup:', error);
    }
  };

  const signup = async (data: SignupData) => {
    console.log('🚀 === SIGNUP PROCESS START ===');
    console.log('📝 Signup data:', { name: data.name, email: data.email, role: data.role });

    // Check for fallback mode (simplified signup without advanced features)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const fallbackMode = urlParams?.get('fallback_signup') === 'true';

    let signupSessionId = 'fallback_mode';

    if (!fallbackMode) {
      try {
        // 🧹 COMPREHENSIVE STORAGE CLEANUP - Fix conflicts from previous attempts
        console.log('🧹 === CLEANING STORAGE FOR FRESH SIGNUP ===');
        signupSessionId = prepareForSignup({ debug: true });
        console.log('📦 Generated signup session ID:', signupSessionId);

        // 🔄 RESET SUPABASE SESSION - Ensure clean auth state (less aggressive)
        console.log('🔄 === RESETTING SUPABASE SESSION ===');
        const sessionResetSuccess = await resetSupabaseSession({
          aggressive: false,
          skipIfNoSession: true,
          debug: true
        });
        if (!sessionResetSuccess) {
          console.warn('⚠️ Session reset had issues, but continuing with signup...');
        }

        // Store this signup attempt data for tracking
        setSignupSession(signupSessionId, {
          email: data.email,
          role: data.role,
          startTime: Date.now()
        });
      } catch (storageError) {
        console.error('❌ Error in advanced signup preparation:', storageError);
        console.log('🛡️ Falling back to simple signup mode...');
        signupSessionId = 'simple_fallback_' + Date.now();
      }
    } else {
      console.log('🛡️ Using fallback signup mode (bypassing advanced features)');
      signupSessionId = 'fallback_' + Date.now();
    }

    setIsLoading(true);

    try {
      console.log('🔐 Step 1: Creating auth user in Supabase...');

      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('📊 Auth signup response details:');
      console.log('  - User created:', !!authData?.user);
      console.log('  - User ID:', authData?.user?.id);
      console.log('  - Session exists:', !!authData?.session);
      console.log('  - Email confirmed:', authData?.user?.email_confirmed_at);
      console.log('  - Auth error:', authError?.message);
      console.log('🔍 Raw authData:', authData);
      console.log('🔍 Raw authError:', authError);

      if (authData?.session) {
        console.log('✅ Session details:', {
          access_token: authData.session.access_token ? 'Present' : 'Missing',
          refresh_token: authData.session.refresh_token ? 'Present' : 'Missing',
          expires_at: authData.session.expires_at
        });
      }

      if (authError) {
        console.log('❌ === AUTH ERROR DETECTED ===');
        console.log('🚫 Error message:', authError.message);
        console.log('🚫 Error details:', authError);

        // Comprehensive cleanup on signup failure
        cleanupFailedAuth('Supabase signup error');

        console.error('Supabase signup error:', authError);

        // Provide user-friendly error messages
        if (authError.message.includes('fetch')) {
          return { error: 'Unable to connect to authentication service. Please check your internet connection and try again.' };
        }

        return { error: authError.message };
      }

      console.log('✅ === NO AUTH ERROR - PROCEEDING ===');

      if (authData.user) {
        console.log('👤 Step 2: User created successfully');
        console.log('🔍 Analyzing session and confirmation status...');

        // If email confirmation is required and user is not confirmed,
        // we can't create profile yet due to RLS policy
        if (!authData.session) {
          console.log('❌ === SIGNUP BLOCKED ===');
          console.log('🚫 No session created - this indicates email confirmation is ENABLED');
          console.log('📧 User created but must confirm email before getting session');
          console.log('⚙️  SOLUTION: Disable email confirmation in Supabase:');
          console.log('   1. Go to https://app.supabase.com/project/[your-project]');
          console.log('   2. Navigate to Authentication → Settings');
          console.log('   3. Find "Email Auth" section');
          console.log('   4. Set "Confirm email" to OFF');
          console.log('   5. Save settings and try signup again');

          // Cleanup on email confirmation requirement
          cleanupFailedAuth('Email confirmation required');

          return {
            error: 'Account created! Please check your email to confirm your account before signing in.'
          };
        }

        console.log('✅ Session exists! Proceeding with profile creation...');
        console.log('💾 Step 3: Creating user profile in database...');

        // Small delay to ensure auth session is fully established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create the user profile (only if we have a session)
        const profileData = {
          id: authData.user.id,
          email: data.email,
          first_name: data.name.split(' ')[0] || '',
          last_name: data.name.split(' ').slice(1).join(' ') || '',
          role: data.role,
          ...data.profileData
        };

        console.log('📋 Profile data to insert:', profileData);

        // Use secure API route to create profile (bypasses client-side RLS issues)
        console.log('🔄 Creating profile via secure API route...');

        try {
          const response = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: authData.user.id,
              profileData
            })
          });

          const result = await response.json();

          if (!response.ok) {
            console.error('💥 === API PROFILE CREATION FAILED ===');
            console.error('❌ Status:', response.status);
            console.error('❌ Error:', result.error);
            console.error('📝 Data that failed:', profileData);
            setIsLoading(false);
            return { error: `Failed to create user profile: ${result.error}` };
          }

          console.log('✅ Profile created successfully via API:', result.profile?.id);
        } catch (fetchError: any) {
          console.error('💥 === FETCH ERROR ===');
          console.error('❌ Error:', fetchError.message);
          setIsLoading(false);
          return { error: `Failed to create user profile: Network error` };
        }

        console.log('✅ Step 4: Profile created successfully!');

        // Load user profile first, then let useOnboardingGate handle redirect
        console.log('🔄 Step 5: Loading complete user profile...');

        // Load the complete profile
        console.log('📞 About to call loadUserProfile...');
        const loadedUser = await loadUserProfile(authData.user.id);
        console.log('✅ loadUserProfile completed successfully');

        // Track signup event
        loginTimeRef.current = new Date();
        trackEvent('user_signup', {
          user_id: authData.user.id,
          role: data.role,
          signup_method: 'email',
          timestamp: new Date().toISOString(),
        });

        console.log('🎉 === SIGNUP PROCESS COMPLETE ===');
        console.log('✅ User authenticated and profile created');
        console.log('📊 Final user state after signup:', loadedUser);

        // CRITICAL FIX: Explicit redirect for athletes to onboarding
        // This prevents the race condition where signup() returns before useOnboardingGate mounts
        if (data.role === 'athlete' && typeof window !== 'undefined') {
          console.log('🎯 Redirecting new athlete to onboarding...');
          setIsLoading(false);
          window.location.href = '/onboarding';
          return {};
        }

        // For agency users, redirect to agency dashboard
        if (data.role === 'agency' && typeof window !== 'undefined') {
          console.log('🎯 Redirecting new agency to agency dashboard...');
          setIsLoading(false);
          window.location.href = '/agencies/dashboard';
          return {};
        }
      }

      setIsLoading(false);
      console.log('✅ Signup function returning success (no errors)');
      return {};
    } catch (error) {
      console.error('💥 === UNEXPECTED SIGNUP ERROR ===');
      console.error('🚨 Error details:', error);

      // Comprehensive cleanup on unexpected error
      cleanupFailedAuth('Unexpected signup error');

      return { error: 'An unexpected error occurred during signup' };
    }
  };

  // Legacy signup function for backward compatibility
  const signupLegacy = async (name: string, email: string, password: string) => {
    return await signup({
      name,
      email,
      password,
      role: 'athlete',
      profileData: { first_name: name.split(' ')[0], last_name: name.split(' ')[1] || '' }
    });
  };

  const logout = async () => {
    console.log('🚪 === COMPREHENSIVE LOGOUT START ===');

    try {
      // Track logout event BEFORE clearing user data
      if (user && loginTimeRef.current) {
        const sessionDuration = calculateSessionDuration(loginTimeRef.current);
        trackEvent('user_logout', {
          user_id: user.id,
          role: user.role,
          session_duration_minutes: sessionDuration,
        });
      }

      // Step 1: Clear chat data FIRST (before clearing user state)
      console.log('💬 Step 1: Clearing chat history and data...');
      try {
        // Get chat store actions
        const { clearAllChats, clearUserStorage } = useChatHistoryStore.getState();

        // Clear all chat data for current user
        if (user?.id) {
          clearUserStorage(user.id);
        }

        // Clear in-memory chat state
        clearAllChats();

        console.log('✅ Chat data cleared successfully');
      } catch (chatError) {
        console.warn('⚠️ Error clearing chat data:', chatError);
      }

      // Step 2: Clear Supabase auth session
      console.log('🔐 Step 2: Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('⚠️ Supabase signOut warning:', error.message);
      } else {
        console.log('✅ Supabase signOut successful');
      }

      // Step 3: Clear React state
      console.log('🔄 Step 3: Clearing React user state...');
      setUser(null);
      setIsLoading(false);
      loginTimeRef.current = null; // Clear login time

      // Clear profile loading state
      profileLoadingRef.current = null;
      setIsLoadingProfile(false);

      // Step 4: Comprehensive storage cleanup
      console.log('🧹 Step 4: Comprehensive storage cleanup...');
      const clearedCount = clearAllAuthStorage({
        clearSupabaseAuth: true,
        clearAppState: true,
        clearOnboarding: true,
        clearRedirectFlags: true,
        preserveCurrentSession: false,
        debug: true
      });

      console.log(`✅ Cleared ${clearedCount} storage items during logout`);
      console.log('🚪 === LOGOUT COMPLETE ===');

    } catch (error) {
      console.error('❌ Error during logout:', error);

      // Even if logout fails, clear local state to prevent UI issues
      setUser(null);
      setIsLoading(false);

      // Clear profile loading state
      profileLoadingRef.current = null;
      setIsLoadingProfile(false);

      // Attempt emergency cleanup including chat data
      try {
        // Emergency chat cleanup
        const { clearAllChats, clearUserStorage } = useChatHistoryStore.getState();
        clearAllChats();
        clearUserStorage(); // Clear all users

        // Emergency auth cleanup
        clearAllAuthStorage({
          clearSupabaseAuth: true,
          clearAppState: true,
          clearOnboarding: true,
          clearRedirectFlags: true,
          preserveCurrentSession: false
        });
        console.log('🛡️ Emergency cleanup completed');
      } catch (cleanupError) {
        console.error('💥 Emergency cleanup failed:', cleanupError);
      }
    }
  };

  // Refresh user profile function for external use (e.g., after onboarding completion)
  const refreshUserProfile = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing user profile for user:', user.id);
      await loadUserProfile(user.id, true); // Force refresh
    } else {
      console.log('⚠️ Cannot refresh profile - no user logged in');
    }
  };

  const value = {
    user,
    isLoading,
    isLoadingProfile,
    isReady: !isLoading, // Auth is ready when initial loading is complete
    login,
    signup,
    signupLegacy,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}