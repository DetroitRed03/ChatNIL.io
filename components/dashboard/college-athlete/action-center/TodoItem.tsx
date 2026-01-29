'use client';

import { DateCountdown } from '../shared/DateCountdown';

interface TodoItemProps {
  todo: {
    id: string;
    priority: 'urgent' | 'soon' | 'later';
    type: 'deal' | 'tax' | 'submission' | 'document';
    title: string;
    description?: string;
    dueDate?: string;
    action: {
      label: string;
      type: string;
      url?: string;
      dealId?: string;
    };
  };
  onAction: (todoId: string, action: any) => void;
  onDismiss: (todoId: string) => void;
  className?: string;
}

export function TodoItem({
  todo,
  onAction,
  onDismiss,
  className = ''
}: TodoItemProps) {
  const typeConfig = {
    deal: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-500'
    },
    tax: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-emerald-500'
    },
    submission: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      color: 'text-orange-500'
    },
    document: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-purple-500'
    }
  };

  const priorityConfig = {
    urgent: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      badgeLabel: 'Urgent'
    },
    soon: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      badgeLabel: 'Soon'
    },
    later: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-600',
      badgeLabel: 'Later'
    }
  };

  const type = typeConfig[todo.type];
  const priority = priorityConfig[todo.priority];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${priority.bg} ${priority.border} ${className}`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center ${type.color}`}>
        {type.icon}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 text-sm">{todo.title}</h4>
              {todo.priority === 'urgent' && (
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${priority.badge}`}>
                  {priority.badgeLabel}
                </span>
              )}
            </div>
            {todo.description && (
              <p className="text-sm text-gray-600 mt-0.5">{todo.description}</p>
            )}
            {todo.dueDate && (
              <div className="mt-1">
                <DateCountdown date={todo.dueDate} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onAction(todo.id, todo.action)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                todo.priority === 'urgent'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : todo.priority === 'soon'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {todo.action.label}
            </button>
            <button
              onClick={() => onDismiss(todo.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-white"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
