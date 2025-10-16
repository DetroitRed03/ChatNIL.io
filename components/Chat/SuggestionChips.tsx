'use client';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  show: boolean;
}

export default function SuggestionChips({ onSuggestionClick, show }: SuggestionChipsProps) {
  const nilSuggestions = [
    'NIL rules overview',
    'High school NIL eligibility',
    'NIL and eligibility',
    'NIL compliance issues',
    'NIL contract negotiation',
    'NIL tax guidance'
  ];

  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="p-2">
        <p className="text-xs text-gray-500 px-3 py-2 font-medium">NIL suggestions:</p>
        <div className="space-y-1">
          {nilSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}