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
        background: `linear-gradient(to bottom, ${schoolData.primary_color}15, white)`
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* School Branding Header */}
        <div className="text-center mb-8">
          {schoolData.logo_url ? (
            <img
              src={schoolData.logo_url}
              alt={`${schoolData.school_name} logo`}
              className="h-20 w-auto mx-auto mb-4"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: schoolData.primary_color || '#3B82F6' }}
            >
              <School className="h-10 w-10 text-white" />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {schoolData.school_name}
          </h1>

          <p className="text-lg text-gray-600 mb-1">
            Student Athlete Registration
          </p>

          {schoolData.school_district && (
            <p className="text-sm text-gray-500">
              {schoolData.school_district}
            </p>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* FERPA Compliance Notice */}
          <div
            className="px-6 py-4 border-b border-gray-200"
            style={{ backgroundColor: `${schoolData.primary_color}10` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: schoolData.primary_color || '#3B82F6' }}
              >
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  FERPA-Compliant Registration
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This registration collects only the minimum information required for your school account.
                  You'll be able to complete your full profile at home with additional details about your
                  NIL interests, social media, and opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
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
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  What happens after registration?
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold mt-0.5">1.</span>
                    <span>You'll receive temporary login credentials (save these!)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold mt-0.5">2.</span>
                    <span>Complete your full profile at home to unlock NIL opportunities</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold mt-0.5">3.</span>
                    <span>Connect with brands, agencies, and start building your NIL brand</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-6">
            <SchoolSignupForm
              school={schoolData}
              primaryColor={schoolData.primary_color || '#3B82F6'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Questions? Contact{' '}
            {schoolData.contact_email ? (
              <a
                href={`mailto:${schoolData.contact_email}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {schoolData.contact_name || schoolData.contact_email}
              </a>
            ) : (
              <a
                href="mailto:support@chatnil.io"
                className="text-blue-600 hover:text-blue-700 font-medium"
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
