'use client';

import { OnboardingStepProps } from '@/lib/onboarding-types';

export function WelcomeBackStep({ data, onNext, isLoading }: OnboardingStepProps) {
  const firstName = data.first_name || data.firstName || 'Athlete';
  const sport = data.primary_sport || data.primarySport || 'your sport';
  const schoolName = data.school_name || data.schoolName || 'school';
  const graduationYear = data.graduation_year || data.graduationYear;

  const handleContinue = () => {
    console.log('🚀 WelcomeBackStep: Continuing with prefilled data');
    console.log('📋 Data available:', data);

    // Pass all the prefilled data forward to the next step
    onNext({
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      email: data.email,
      primarySport: data.primarySport || data.primary_sport,
      graduationYear: data.graduationYear || data.graduation_year,
      schoolName: data.schoolName || data.school_name,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-lg text-gray-600">
            You created your account at {schoolName}. Now let's complete your full profile
            to unlock NIL opportunities!
          </p>
        </div>

        {/* Already Have Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            What we already have:
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Your name: <strong>{data.first_name} {data.last_name}</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Your sport: <strong>{sport}</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Your school: <strong>{schoolName}</strong></span>
            </li>
            {graduationYear && (
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Graduation year: <strong>{graduationYear}</strong></span>
              </li>
            )}
          </ul>
        </div>

        {/* What We'll Ask For Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4 text-blue-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What we'll ask for:
          </h3>
          <ul className="grid gap-3 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Personal email & phone number</strong> (for account security)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Parent/guardian contact</strong> (if you're under 18)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Your position and achievements</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Hobbies & interests</strong> for brand matching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Social media accounts</strong> (optional but recommended)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">→</span>
              <span><strong>Profile photo & content samples</strong> (optional)</span>
            </li>
          </ul>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50 py-3 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Takes about 5-7 minutes</span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          ) : (
            "Let's Complete My Profile →"
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
          🔒 Your privacy is important to us. We only share data you explicitly approve.
          You can skip optional questions.
        </p>
      </div>
    </div>
  );
}

export default WelcomeBackStep;
