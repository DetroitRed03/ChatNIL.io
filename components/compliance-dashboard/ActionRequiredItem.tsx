'use client';

interface ActionItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealId: string;
  severity: 'critical' | 'warning';
  issue: string;
  amount: number;
  action: string;
  dueDate?: string;
}

interface ActionRequiredItemProps {
  item: ActionItem;
  onClick: () => void;
}

export function ActionRequiredItem({ item, onClick }: ActionRequiredItemProps) {
  const isCritical = item.severity === 'critical';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <button
      data-testid={`action-item-${item.id}`}
      onClick={onClick}
      className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group ${
        isCritical ? 'bg-red-50/50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex-shrink-0">
          {isCritical ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {item.athleteName}
          </p>
          <p className={`text-sm truncate ${
            isCritical ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {item.issue}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Amount */}
        <span className="text-sm font-medium text-gray-700">
          {formatCurrency(item.amount)}
        </span>

        {/* Action */}
        <span className={`text-sm font-semibold whitespace-nowrap ${
          isCritical
            ? 'text-red-600'
            : 'text-yellow-600'
        }`}>
          {item.action}
        </span>

        {/* Review Button */}
        <span className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg group-hover:bg-orange-600 transition-colors">
          Review
        </span>
      </div>
    </button>
  );
}
