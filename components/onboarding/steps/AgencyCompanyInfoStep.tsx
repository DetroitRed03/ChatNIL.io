'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Globe, Users, Briefcase } from 'lucide-react';
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/agency-data';

const schema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  company_size: z.string().min(1, 'Please select company size'),
  website_url: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

export type AgencyCompanyInfoData = z.infer<typeof schema>;

interface AgencyCompanyInfoStepProps {
  onNext: (data: AgencyCompanyInfoData) => void;
  onBack?: () => void;
  initialData?: Partial<AgencyCompanyInfoData>;
}

export default function AgencyCompanyInfoStep({
  onNext,
  onBack,
  initialData,
}: AgencyCompanyInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<AgencyCompanyInfoData>({
    resolver: zodResolver(schema) as any,
    mode: 'onChange',
    defaultValues: initialData || {
      company_name: '',
      industry: '',
      company_size: '',
      website_url: '',
    },
  });

  const companyName = watch('company_name');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
        <p className="text-gray-600">Tell us about your brand or agency</p>
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
          Company/Brand Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="company_name"
            {...register('company_name')}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.company_name ? 'border-red-300' : 'border-gray-300'
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Nike, Gatorade, Local Sports Shop..."
          />
        </div>
        {errors.company_name && (
          <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
        )}
        {companyName && !errors.company_name && (
          <p className="mt-1 text-sm text-green-600">✓ Looking good!</p>
        )}
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
          Industry <span className="text-red-500">*</span>
        </label>
        <select
          id="industry"
          {...register('industry')}
          className={`block w-full px-3 py-3 border ${
            errors.industry ? 'border-red-300' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white`}
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map((industry) => (
            <option key={industry.value} value={industry.value}>
              {industry.label}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
        )}
      </div>

      {/* Company Size */}
      <div>
        <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-2">
          Company Size <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="company_size"
            {...register('company_size')}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.company_size ? 'border-red-300' : 'border-gray-300'
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white`}
          >
            <option value="">Select company size...</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label} ({size.employees})
              </option>
            ))}
          </select>
        </div>
        {errors.company_size && (
          <p className="mt-1 text-sm text-red-600">{errors.company_size.message}</p>
        )}
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
          Website URL <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="website_url"
            {...register('website_url')}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.website_url ? 'border-red-300' : 'border-gray-300'
            } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="https://www.yourcompany.com"
          />
        </div>
        {errors.website_url && (
          <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Your company website helps athletes learn more about your brand
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all ${
            isValid
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Step 1 of 4 • Company Information
      </p>
    </form>
  );
}
