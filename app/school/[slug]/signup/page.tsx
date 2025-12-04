import { createClient } from '@supabase/supabase-js';
import { SchoolSignupForm } from '@/components/school/SchoolSignupForm';
import { notFound } from 'next/navigation';
import { School } from 'lucide-react';
import type { School as SchoolType } from '@/types';

interface SchoolSignupPageProps {
  params: {
    slug: string;
  };
}

// Create a public client for reading school data (no auth required)
const getPublicClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export default async function SchoolSignupPage({ params }: SchoolSignupPageProps) {
  const supabase = getPublicClient();

  // Fetch school data by slug
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('custom_slug', params.slug)
    .eq('active', true)
    .single();

  // Handle not found or inactive schools
  if (error || !school) {
    return notFound();
  }

  const schoolData = school as SchoolType;

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(to bottom, #FAF6F1, #FFF5E6)`
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* School Branding Header */}
        <div className="text-center mb-8">
          {schoolData.logo_url ? (
            <div className="mb-6">
              <img
                src={schoolData.logo_url}
                alt={`${schoolData.school_name} logo`}
                className="h-24 w-auto mx-auto drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <School className="h-12 w-12 text-white" />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            {schoolData.school_name}
          </h1>

          <p className="text-xl text-gray-600 mb-2 font-medium">
            Student Athlete Registration
          </p>

          {schoolData.school_district && (
            <p className="text-base text-gray-500">
              {schoolData.school_district}
            </p>
          )}
        </div>

        {/* Main Content Card - Updated to white with shadow */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
          {/* FERPA Compliance Notice - Updated to orange */}
          <div className="px-6 py-5 border-b-2 border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  FERPA-Compliant Registration
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This registration collects only the minimum information required for your school account.
                  You'll be able to complete your full profile at home with additional details about your
                  NIL interests, social media, and opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Information Notice - Updated to orange */}
          <div className="px-6 py-5 bg-orange-50 border-b-2 border-orange-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900 mb-2">
                  What happens after registration?
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold text-base flex-shrink-0">1.</span>
                    <span className="leading-relaxed">You'll receive temporary login credentials (save these!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold text-base flex-shrink-0">2.</span>
                    <span className="leading-relaxed">Complete your full profile at home to unlock NIL opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold text-base flex-shrink-0">3.</span>
                    <span className="leading-relaxed">Connect with brands, agencies, and start building your NIL brand</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-8">
            <SchoolSignupForm
              school={schoolData}
              primaryColor="#f97316"
            />
          </div>
        </div>

        {/* Footer - Updated to orange */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Questions? Contact{' '}
            {schoolData.contact_email ? (
              <a
                href={`mailto:${schoolData.contact_email}`}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                {schoolData.contact_name || schoolData.contact_email}
              </a>
            ) : (
              <a
                href="mailto:support@chatnil.io"
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                ChatNIL Support
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
