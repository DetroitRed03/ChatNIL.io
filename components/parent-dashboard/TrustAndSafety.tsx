'use client';

interface TrustAndSafetyProps {
  onPrivacySettings: () => void;
  onViewAsChild: () => void;
  onRevokeAccess: () => void;
}

export function TrustAndSafety({ onPrivacySettings, onViewAsChild, onRevokeAccess }: TrustAndSafetyProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        🔒 Trust & Safety
      </h3>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-500">✓</span>
          <span>COPPA Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-500">✓</span>
          <span>No Deals for Minors</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-500">✓</span>
          <span>You Control Access</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-green-500">✓</span>
          <span>Data Encrypted</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onPrivacySettings}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Privacy Settings
        </button>
        <button
          onClick={onViewAsChild}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View What My Child Sees
        </button>
        <button
          onClick={onRevokeAccess}
          className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Revoke Access
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        ChatNIL is purely educational. We do not facilitate deals, connect students with brands,
        or share personal information with third parties.
      </p>
    </div>
  );
}

export default TrustAndSafety;
