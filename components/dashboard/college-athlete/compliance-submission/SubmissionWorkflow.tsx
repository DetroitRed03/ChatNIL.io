'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SubmissionDeadlineCountdown } from './SubmissionDeadlineCountdown';
import { SubmissionStatusBadge, SubmissionStatus } from './SubmissionStatusBadge';
import { SubmissionConfirmModal } from './SubmissionConfirmModal';
import { MoneyDisplay } from '../shared/MoneyDisplay';

interface Deal {
  id: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  dealType: string;
  overallScore: number;
  submissionStatus: SubmissionStatus;
  submissionDeadline?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  athleteNotes?: string;
  supersededByDealId?: string | null;
}

interface SubmissionWorkflowProps {
  deals: Deal[];
  school: {
    name: string;
    state: string;
    complianceEmail?: string;
  };
  onSubmitDeal: (dealId: string) => Promise<void>;
  className?: string;
}

export function SubmissionWorkflow({
  deals,
  school,
  onSubmitDeal,
  className = ''
}: SubmissionWorkflowProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Group deals by status
  const pendingDeals = deals.filter(d => d.submissionStatus === 'not_submitted');
  const submittedDeals = deals.filter(d => d.submissionStatus === 'pending_review' || d.submissionStatus === 'response_submitted' || d.submissionStatus === 'conditions_completed');
  const needsRevisionDeals = deals.filter(d => d.submissionStatus === 'needs_revision');
  const approvedDeals = deals.filter(d => d.submissionStatus === 'approved');
  const rejectedDeals = deals.filter(d => d.submissionStatus === 'rejected');

  const handleSubmitClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedDeal) return;
    await onSubmitDeal(selectedDeal.id);
    setShowModal(false);
    setSelectedDeal(null);
  };

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">School Reporting</h2>
            <p className="text-sm text-gray-500">
              Keep {school.name} in the loop
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{pendingDeals.length}</p>
          <p className="text-xs text-orange-700">Need to Report</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{submittedDeals.length}</p>
          <p className="text-xs text-blue-700">Under Review</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{needsRevisionDeals.length}</p>
          <p className="text-xs text-amber-700">Need Updates</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{rejectedDeals.length}</p>
          <p className="text-xs text-red-700">Rejected</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{approvedDeals.length}</p>
          <p className="text-xs text-emerald-700">Approved</p>
        </div>
      </div>

      {/* Pending Deals - Most Important */}
      {pendingDeals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Needs to Be Reported
          </h3>
          <div className="space-y-3">
            {pendingDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-xl border-2 border-orange-200 p-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {deal.brandLogo ? (
                        <img src={deal.brandLogo} alt={deal.brandName} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
                          {deal.brandName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{deal.brandName}</h4>
                      <p className="text-xs text-gray-500">{deal.dealType}</p>
                    </div>
                  </div>
                  <MoneyDisplay amount={deal.value} size="md" />
                </div>

                {deal.submissionDeadline && (
                  <SubmissionDeadlineCountdown
                    dueDate={deal.submissionDeadline}
                    state={school.state}
                    className="mb-3"
                  />
                )}

                <button
                  onClick={() => handleSubmitClick(deal)}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Report to School Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Needs Revision */}
      {needsRevisionDeals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            School Needs More Info
          </h3>
          <div className="space-y-3">
            {needsRevisionDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-amber-50 rounded-xl border border-amber-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      {deal.brandLogo ? (
                        <img src={deal.brandLogo} alt={deal.brandName} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
                          {deal.brandName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{deal.brandName}</h4>
                      <SubmissionStatusBadge status={deal.submissionStatus} size="sm" />
                    </div>
                  </div>
                  <MoneyDisplay amount={deal.value} size="md" />
                </div>
                {deal.reviewNotes && (
                  <div className="bg-white rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Compliance notes:</p>
                    <p className="text-sm text-gray-700">{deal.reviewNotes}</p>
                  </div>
                )}
                <Link href={`/deals/${deal.id}`} className="block w-full mt-3 py-2 border border-amber-400 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors text-center">
                  Update & Resubmit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedDeals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Rejected by School
          </h3>
          <div className="space-y-3">
            {rejectedDeals.map(deal => {
              const wasResubmitted = !!deal.supersededByDealId;
              return (
                <div
                  key={deal.id}
                  className="bg-red-50 rounded-xl border border-red-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        {deal.brandLogo ? (
                          <img src={deal.brandLogo} alt={deal.brandName} className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">
                            {deal.brandName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{deal.brandName}</h4>
                          {wasResubmitted && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              Resubmitted
                            </span>
                          )}
                        </div>
                        <SubmissionStatusBadge status={deal.submissionStatus} size="sm" />
                      </div>
                    </div>
                    <MoneyDisplay amount={deal.value} size="md" />
                  </div>
                  {deal.athleteNotes && (
                    <div className="bg-white rounded-lg p-3 mt-2">
                      <p className="text-xs text-gray-500 mb-1">Reason for rejection:</p>
                      <p className="text-sm text-gray-700">{deal.athleteNotes}</p>
                    </div>
                  )}
                  {deal.reviewedAt && (
                    <p className="text-xs text-red-600 mt-2">
                      Rejected on {new Date(deal.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="flex-1 py-2 text-center border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    {wasResubmitted ? (
                      <Link
                        href={`/deals/${deal.supersededByDealId}`}
                        className="flex-1 py-2 text-center bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                      >
                        View Resubmission &rarr;
                      </Link>
                    ) : (
                      <Link
                        href={`/deals/validate?resubmit=${deal.id}`}
                        className="flex-1 py-2 text-center bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        Modify & Resubmit
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted - Under Review */}
      {submittedDeals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Under Review
          </h3>
          <div className="space-y-2">
            {submittedDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-blue-50 rounded-lg border border-blue-200 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-500">
                      {deal.brandName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{deal.brandName}</h4>
                    <p className="text-xs text-blue-600">
                      Submitted {deal.submittedAt ? new Date(deal.submittedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                </div>
                <MoneyDisplay amount={deal.value} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      {approvedDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Approved by School
          </h3>
          <div className="space-y-2">
            {approvedDeals.slice(0, 3).map(deal => (
              <div
                key={deal.id}
                className="bg-emerald-50 rounded-lg border border-emerald-200 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{deal.brandName}</h4>
                    <p className="text-xs text-emerald-600">Approved</p>
                  </div>
                </div>
                <MoneyDisplay amount={deal.value} size="sm" />
              </div>
            ))}
            {approvedDeals.length > 3 && (
              <button className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2">
                View all {approvedDeals.length} approved deals
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {deals.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No Deals Yet</h3>
          <p className="text-sm text-gray-500">
            When you get NIL deals, they'll appear here for reporting to your school.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedDeal && (
        <SubmissionConfirmModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedDeal(null);
          }}
          onConfirm={handleConfirmSubmit}
          deal={selectedDeal}
          school={school}
        />
      )}
    </section>
  );
}
