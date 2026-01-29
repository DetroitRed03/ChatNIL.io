'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DealValidationWizard } from '@/components/deal-validation';

interface UserProfile {
  id: string;
  state: string;
  role: string;
}

interface OriginalDeal {
  third_party_name: string;
  deal_type: string;
  compensation_amount: number;
  description?: string;
  deliverables?: string;
  start_date?: string;
  end_date?: string;
  athlete_notes?: string;
  compliance_decision_at?: string;
}

export default function ValidateDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitDealId = searchParams.get('resubmit') || searchParams.get('modify');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalDeal, setOriginalDeal] = useState<OriginalDeal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/');
          return;
        }

        const accessToken = session.access_token;

        const response = await fetch('/api/dashboard/college-athlete', {
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError('This page is only available for college athletes.');
            return;
          }
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setProfile({
          id: data.user.id,
          state: data.user.state || 'CA',
          role: 'college_athlete',
        });

        // If resubmitting, fetch original deal details
        if (resubmitDealId) {
          try {
            const dealRes = await fetch(`/api/deals/${resubmitDealId}`, {
              headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
              credentials: 'include',
            });
            if (dealRes.ok) {
              const dealData = await dealRes.json();
              if (dealData.superseded_by_deal_id) {
                setError('This deal has already been resubmitted.');
                setLoading(false);
                return;
              }
              setOriginalDeal(dealData);
            }
          } catch (err) {
            console.error('Failed to fetch original deal:', err);
            // Non-blocking — proceed with empty form
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, resubmitDealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Build resubmission context and pre-populate form if resubmitting
  const resubmission = resubmitDealId && originalDeal ? {
    originalDealId: resubmitDealId,
    originalDealName: originalDeal.third_party_name || 'Unknown Deal',
    rejectionReason: originalDeal.athlete_notes,
    rejectedAt: originalDeal.compliance_decision_at,
  } : undefined;

  const initialData = originalDeal ? {
    thirdPartyName: originalDeal.third_party_name || '',
    dealType: originalDeal.deal_type || 'social_post',
    compensation: originalDeal.compensation_amount || '',
    deliverables: originalDeal.description || originalDeal.deliverables || '',
    startDate: originalDeal.start_date || '',
    endDate: originalDeal.end_date || '',
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <DealValidationWizard
        athleteId={profile.id}
        athleteState={profile.state}
        onComplete={() => router.push('/deals')}
        initialData={initialData}
        resubmission={resubmission}
      />
    </div>
  );
}
