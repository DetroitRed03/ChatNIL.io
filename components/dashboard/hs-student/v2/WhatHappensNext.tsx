'use client';

interface WhatHappensNextProps {
  hasInvite: boolean;
}

export default function WhatHappensNext({ hasInvite }: WhatHappensNextProps) {
  const steps = hasInvite
    ? [
        {
          number: 1,
          title: 'Email Sent',
          description: 'Your parent received an approval request',
          status: 'completed',
        },
        {
          number: 2,
          title: 'Parent Reviews',
          description: 'They\'ll see what ChatNIL offers and how it helps you',
          status: 'current',
        },
        {
          number: 3,
          title: 'Approval Granted',
          description: 'One click and you\'re in!',
          status: 'pending',
        },
        {
          number: 4,
          title: 'Start Your Journey',
          description: 'Full access to your NIL education dashboard',
          status: 'pending',
        },
      ]
    : [
        {
          number: 1,
          title: 'Enter Parent Details',
          description: 'Tell us who to send the approval request to',
          status: 'current',
        },
        {
          number: 2,
          title: 'Email Sent',
          description: 'We\'ll send a friendly email explaining ChatNIL',
          status: 'pending',
        },
        {
          number: 3,
          title: 'Parent Approves',
          description: 'One-click approval - no account needed',
          status: 'pending',
        },
        {
          number: 4,
          title: 'Start Learning',
          description: 'Full access unlocked instantly',
          status: 'pending',
        },
      ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">What Happens Next</h3>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-4">
            {/* Step Number/Check */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : step.status === 'current'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.status === 'completed' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <h4
                className={`font-medium ${
                  step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                }`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm ${
                  step.status === 'pending' ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.description}
              </p>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 mt-2 w-0.5 h-8 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ marginLeft: '15px' }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement Message */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          <span className="font-medium">Pro tip:</span>{' '}
          {hasInvite
            ? 'Text your parent to check their email - most approve within minutes!'
            : 'Have your parent\'s email ready? This only takes 30 seconds.'}
        </p>
      </div>
    </div>
  );
}
