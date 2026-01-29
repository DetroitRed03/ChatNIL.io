'use client';

import { useMemo } from 'react';
import { TodoItem } from './TodoItem';

interface Todo {
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
}

interface ActionCenterSectionProps {
  todos: Todo[];
  onAction: (todoId: string, action: any) => void;
  onDismiss: (todoId: string) => void;
  className?: string;
}

export function ActionCenterSection({
  todos,
  onAction,
  onDismiss,
  className = ''
}: ActionCenterSectionProps) {
  // Group todos by priority
  const groupedTodos = useMemo(() => {
    const groups = {
      urgent: todos.filter(t => t.priority === 'urgent'),
      soon: todos.filter(t => t.priority === 'soon'),
      later: todos.filter(t => t.priority === 'later')
    };
    return groups;
  }, [todos]);

  const urgentCount = groupedTodos.urgent.length;
  const soonCount = groupedTodos.soon.length;

  if (todos.length === 0) {
    return (
      <section className={className}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Clear!</h2>
            <p className="text-sm text-gray-500">You've got nothing on your to-do list</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your To-Do List</h2>
            <p className="text-sm text-gray-500">
              {todos.length} item{todos.length !== 1 ? 's' : ''} to complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {urgentCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              {urgentCount} Urgent
            </span>
          )}
          {soonCount > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              {soonCount} Soon
            </span>
          )}
        </div>
      </div>

      {/* Urgent Section */}
      {groupedTodos.urgent.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Do Today
          </h3>
          <div className="space-y-2">
            {groupedTodos.urgent.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onAction={onAction}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      )}

      {/* Soon Section */}
      {groupedTodos.soon.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-amber-600 mb-2">This Week</h3>
          <div className="space-y-2">
            {groupedTodos.soon.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onAction={onAction}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      )}

      {/* Later Section */}
      {groupedTodos.later.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Coming Up</h3>
          <div className="space-y-2">
            {groupedTodos.later.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onAction={onAction}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
