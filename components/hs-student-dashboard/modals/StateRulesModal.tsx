'use client';

interface StateRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: string;
  stateName: string;
  hsNilAllowed: boolean;
  canDo: string[];
  watchOut: string[];
  prohibited: string[];
}

export function StateRulesModal({
  isOpen,
  onClose,
  stateName,
  hsNilAllowed,
  canDo,
  watchOut,
  prohibited
}: StateRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏈</span>
              <div>
                <h2 className="text-xl font-bold">{stateName} NIL Rules</h2>
                <p className="text-white/80 text-sm">For High School Athletes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Main Status */}
          <div className={`p-4 rounded-xl mb-5 ${
            hsNilAllowed
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{hsNilAllowed ? '✅' : '⚠️'}</span>
              <div>
                <h3 className={`font-bold ${hsNilAllowed ? 'text-green-800' : 'text-red-800'}`}>
                  {hsNilAllowed
                    ? 'High School NIL is ALLOWED'
                    : 'High School NIL is LIMITED'}
                </h3>
                <p className={`text-sm ${hsNilAllowed ? 'text-green-700' : 'text-red-700'}`}>
                  {hsNilAllowed
                    ? 'You can earn from your name, image, and likeness!'
                    : 'Check specific restrictions below'}
                </p>
              </div>
            </div>
          </div>

          {/* What You CAN Do */}
          <div className="mb-5">
            <h3 className="font-bold text-green-700 flex items-center gap-2 mb-3">
              ✅ What You CAN Do
            </h3>
            <ul className="space-y-2">
              {canDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Watch Out */}
          <div className="mb-5">
            <h3 className="font-bold text-yellow-700 flex items-center gap-2 mb-3">
              ⚠️ Watch Out For
            </h3>
            <ul className="space-y-2">
              {watchOut.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Prohibited */}
          <div className="mb-5">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
              🚫 Off-Limits Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {prohibited.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              These categories are prohibited for high school athlete sponsorships.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <strong>Note:</strong> NIL rules can change. Always check with your school&apos;s
            athletic department before signing any deal. ChatNIL helps you understand the
            rules but isn&apos;t legal advice.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
          >
            Got It! 👍
          </button>
        </div>
      </div>
    </div>
  );
}

export default StateRulesModal;
