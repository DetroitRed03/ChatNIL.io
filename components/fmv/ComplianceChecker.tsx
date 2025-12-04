'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ComplianceResult {
  compliant: boolean;
  state: string;
  state_code: string;
  athlete_level: string;
  violations: string[];
  warnings: string[];
  requirements: string[];
  summary: string;
}

export function ComplianceChecker() {
  const [dealCategory, setDealCategory] = useState('');
  const [hasSchoolApproval, setHasSchoolApproval] = useState(false);
  const [hasAgentRegistration, setHasAgentRegistration] = useState(false);
  const [hasDisclosure, setHasDisclosure] = useState(false);
  const [hasFinancialLiteracy, setHasFinancialLiteracy] = useState(false);

  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setChecking(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/compliance/check-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_category: dealCategory || undefined,
          has_school_approval: hasSchoolApproval,
          has_agent_registration: hasAgentRegistration,
          has_disclosure: hasDisclosure,
          has_financial_literacy: hasFinancialLiteracy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check compliance');
      }

      setResult(data.compliance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check compliance');
    } finally {
      setChecking(false);
    }
  };

  const handleReset = () => {
    setDealCategory('');
    setHasSchoolApproval(false);
    setHasAgentRegistration(false);
    setHasDisclosure(false);
    setHasFinancialLiteracy(false);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">NIL Compliance Checker</h3>
          <p className="text-sm text-gray-600">Verify your deal complies with state regulations</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCheck} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Deal Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deal Category (Optional)
          </label>
          <select
            value={dealCategory}
            onChange={(e) => setDealCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select category...</option>
            <option value="sports_apparel">Sports Apparel</option>
            <option value="sports_equipment">Sports Equipment</option>
            <option value="food_beverage">Food & Beverage</option>
            <option value="technology">Technology</option>
            <option value="automotive">Automotive</option>
            <option value="financial_services">Financial Services</option>
            <option value="health_wellness">Health & Wellness</option>
            <option value="alcohol">Alcohol (Prohibited in many states)</option>
            <option value="gambling">Gambling (Prohibited in many states)</option>
            <option value="cannabis">Cannabis (Prohibited in many states)</option>
            <option value="tobacco">Tobacco (Prohibited in many states)</option>
            <option value="adult_entertainment">Adult Entertainment (Prohibited in most states)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select a category to check if it's prohibited in your state
          </p>
        </div>

        {/* Compliance Checkboxes */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Compliance Requirements</p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSchoolApproval}
              onChange={(e) => setHasSchoolApproval(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">School Approval Obtained</div>
              <div className="text-xs text-gray-500">I have received approval from my school's compliance office</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgentRegistration}
              onChange={(e) => setHasAgentRegistration(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Agent/Agency Registered</div>
              <div className="text-xs text-gray-500">My agent or agency is registered with the state (if applicable)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDisclosure}
              onChange={(e) => setHasDisclosure(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Deal Disclosed to School</div>
              <div className="text-xs text-gray-500">I have disclosed or will disclose this deal to my athletic department</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasFinancialLiteracy}
              onChange={(e) => setHasFinancialLiteracy(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Financial Literacy Completed</div>
              <div className="text-xs text-gray-500">I have completed required financial literacy education (if applicable)</div>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={checking}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking Compliance...' : 'Check Compliance'}
          </button>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-900 mb-1">Error</div>
            <div className="text-sm text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Compliance Status */}
          <div className={`border-2 rounded-lg p-6 ${
            result.compliant
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4">
              {result.compliant ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={`text-xl font-bold mb-2 ${
                  result.compliant ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.compliant ? 'Deal Appears Compliant ✓' : 'Compliance Violations Found ✗'}
                </h4>
                <p className={`text-sm ${
                  result.compliant ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.state} ({result.state_code}) • {result.athlete_level === 'high_school' ? 'High School' : 'College'} Athlete
                </p>
              </div>
            </div>
          </div>

          {/* Violations */}
          {result.violations.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h5 className="font-semibold text-red-900">Violations</h5>
              </div>
              <ul className="space-y-2">
                {result.violations.map((violation, index) => (
                  <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1">•</span>
                    <span>{violation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h5 className="font-semibold text-yellow-900">Warnings</h5>
              </div>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {result.requirements.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h5 className="font-semibold text-blue-900">Requirements</h5>
              </div>
              <ul className="space-y-2">
                {result.requirements.map((requirement, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1">•</span>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">💡 Recommendations</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              {result.compliant ? (
                <>
                  <li>• This deal appears to be compliant with state NIL rules</li>
                  <li>• Always consult with your school's compliance office before finalizing any NIL deal</li>
                  <li>• Keep detailed records of all NIL activities for reporting purposes</li>
                </>
              ) : (
                <>
                  <li>• Do not proceed with this deal until all violations are addressed</li>
                  <li>• Contact your school's compliance office for guidance</li>
                  <li>• Review your state's NIL regulations before signing any agreement</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
