'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
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

interface ResubmittedDealInfo {
  id: string;
  third_party_name: string;
  status: string;
  compliance_decision: string | null;
}

export default function ValidateDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitDealId = searchParams.get('resubmit') || searchParams.get('modify');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalDeal, setOriginalDeal] = useState<OriginalDeal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyResubmitted, setAlreadyResubmitted] = useState<{ originalName: string; newDeal: ResubmittedDealInfo | null } | null>(null);

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
                // Fetch the new deal's info to show helpful context
                let newDealInfo: ResubmittedDealInfo | null = null;
                try {
                  const newDealRes = await fetch(`/api/deals/${dealData.superseded_by_deal_id}`, {
                    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
                    credentials: 'include',
                  });
                  if (newDealRes.ok) {
                    const nd = await newDealRes.json();
                    newDealInfo = {
                      id: nd.id,
                      third_party_name: nd.third_party_name,
                      status: nd.status,
                      compliance_decision: nd.compliance_decision,
                    };
                  }
                } catch {
                  // Non-blocking
                }
                setAlreadyResubmitted({
                  originalName: dealData.third_party_name || 'this deal',
                  newDeal: newDealInfo,
                });
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

  // Deal was already resubmitted — show helpful info page
  if (alreadyResubmitted) {
    const { originalName, newDeal } = alreadyResubmitted;
    const statusLabel = newDeal?.compliance_decision === 'approved' ? 'Approved'
      : newDeal?.compliance_decision === 'rejected' ? 'Rejected'
      : newDeal?.compliance_decision === 'info_requested' ? 'Info Requested'
      : newDeal?.compliance_decision === 'approved_with_conditions' ? 'Approved with Conditions'
      : 'Under Review';
    const statusColor = newDeal?.compliance_decision === 'approved' ? 'text-green-700 bg-green-100'
      : newDeal?.compliance_decision === 'rejected' ? 'text-red-700 bg-red-100'
      : 'text-blue-700 bg-blue-100';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-lg text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal Already Resubmitted</h2>
          <p className="text-gray-600 mb-6">
            You&apos;ve already resubmitted &ldquo;{originalName}&rdquo; as a new deal.
          </p>

          {newDeal && (
            <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Resubmitted as:</p>
              <p className="font-medium text-gray-900">{newDeal.third_party_name}</p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {newDeal && (
              <Link
                href={`/deals/${newDeal.id}`}
                className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                View Resubmitted Deal
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/dashboard"
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
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
    dealType: (originalDeal.deal_type || 'social_post') as 'social_post' | 'appearance' | 'endorsement' | 'brand_ambassador' | 'merchandise' | 'other',
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
