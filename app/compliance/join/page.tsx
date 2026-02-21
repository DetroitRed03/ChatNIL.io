'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Users,
  AlertCircle,
  LogIn,
} from 'lucide-react';

type InviteStatus = 'loading' | 'valid' | 'accepting' | 'accepted' | 'declined' | 'error' | 'expired' | 'auth_required';

interface InviteInfo {
  invitee_email: string;
  invitee_name?: string;
  role: string;
  institution_name?: string;
  invited_by_name?: string;
}

export default function JoinTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<InviteStatus>('loading');
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // Validate the invite token on load
  const validateToken = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No invite token provided. Please check the link you received.');
      return;
    }

    try {
      // We'll try to accept with a 'validate' action first to check the token
      // Since the PUT endpoint handles token validation, we can peek at it
      const accessToken = user ? await getAccessToken() : null;
      const res = await fetch('/api/compliance/team/invite', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ token, action: 'validate' }),
      });

      const data = await res.json();

      if (res.status === 401 && data.requiresAuth) {
        // Token is valid but user needs to log in
        setInviteInfo({ invitee_email: data.inviteEmail, role: '' });
        setStatus('auth_required');
        return;
      }

      if (!res.ok) {
        if (data.error?.includes('expired')) {
          setStatus('expired');
        } else if (data.error?.includes('already processed')) {
          setStatus('error');
          setErrorMsg('This invite has already been used.');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Invalid invite link');
        }
        return;
      }

      // If validate returned ok, the token is valid
      // For now, the PUT handler only handles accept/decline, not validate
      // So we'll treat the response based on what we get back
      setStatus('valid');
    } catch (err) {
      // The validate action doesn't exist yet, so we do a simpler check
      // Just show the accept/decline UI and let the actual action handle errors
      if (user) {
        setStatus('valid');
      } else {
        setStatus('auth_required');
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        setStatus('error');
        setErrorMsg('No invite token provided. Please check the link you received.');
      } else if (!user) {
        setStatus('auth_required');
      } else {
        setStatus('valid');
      }
    }
  }, [authLoading, token, user]);

  const handleAccept = async () => {
    if (!token) return;

    setStatus('accepting');
    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/compliance/team/invite', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ token, action: 'accept' }),
      });

      const data = await res.json();

      if (res.status === 401 && data.requiresAuth) {
        setInviteInfo({ invitee_email: data.inviteEmail, role: '' });
        setStatus('auth_required');
        return;
      }

      if (!res.ok) {
        if (data.error?.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Failed to accept invite');
        }
        return;
      }

      setStatus('accepted');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    if (!confirm('Are you sure you want to decline this invite?')) return;

    try {
      const res = await fetch('/api/compliance/team/invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'decline' }),
      });

      if (res.ok) {
        setStatus('declined');
      } else {
        const data = await res.json();
        setStatus('error');
        setErrorMsg(data.error || 'Failed to decline invite');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  const redirectToLogin = () => {
    // Redirect to login with a return URL
    const returnUrl = `/compliance/join?token=${token}`;
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ChatNIL Compliance</h1>
          <p className="text-gray-500 mt-1">Team Invitation</p>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Validating your invite...</p>
          </div>
        )}

        {/* Auth Required */}
        {status === 'auth_required' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-1">
              You&apos;ve been invited to join a compliance team.
            </p>
            {inviteInfo?.invitee_email && (
              <p className="text-sm text-gray-500 mb-6">
                Please sign in with <strong>{inviteInfo.invitee_email}</strong>
              </p>
            )}
            {!inviteInfo?.invitee_email && (
              <p className="text-sm text-gray-500 mb-6">
                Please sign in to accept this invitation.
              </p>
            )}
            <button
              onClick={redirectToLogin}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Continue
            </button>
            <button
              onClick={handleDecline}
              className="w-full mt-3 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Decline Invite
            </button>
          </div>
        )}

        {/* Valid - Show Accept/Decline */}
        {status === 'valid' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Team Invitation</h2>
            <p className="text-gray-600 mb-6">
              You&apos;ve been invited to join a compliance team on ChatNIL.
              Accept to start collaborating with your team.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Accept Invitation
              </button>
              <button
                onClick={handleDecline}
                className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Accepting */}
        {status === 'accepting' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Joining the team...</p>
          </div>
        )}

        {/* Accepted */}
        {status === 'accepted' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome to the Team!</h2>
            <p className="text-gray-600 mb-6">
              You&apos;ve successfully joined the compliance team.
              You can now access the compliance dashboard.
            </p>
            <button
              onClick={() => router.push('/compliance')}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Declined */}
        {status === 'declined' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-gray-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Invite Declined</h2>
            <p className="text-gray-600 mb-6">
              You&apos;ve declined this team invitation. If you change your mind,
              ask the team admin to send a new invite.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Return Home
            </button>
          </div>
        )}

        {/* Expired */}
        {status === 'expired' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Invite Expired</h2>
            <p className="text-gray-600 mb-6">
              This invitation has expired. Please ask the team admin to send a new one.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Return Home
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
