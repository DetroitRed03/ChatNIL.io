'use client';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onAssign: () => void;
  onExport: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onAssign,
  onExport,
  onClearSelection,
  isProcessing = false
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      data-testid="bulk-action-bar"
    >
      <div className="flex items-center gap-3 px-6 py-3 bg-gray-900 rounded-xl shadow-2xl">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
          <span className="flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full text-white text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-white text-sm">
            {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-green-700 rounded text-xs">A</kbd>
          </button>

          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-red-700 rounded text-xs">R</kbd>
          </button>

          <button
            onClick={onAssign}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assign
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-gray-600 rounded text-xs">S</kbd>
          </button>

          <button
            onClick={onExport}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="ml-2 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Clear selection (Esc)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="ml-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
