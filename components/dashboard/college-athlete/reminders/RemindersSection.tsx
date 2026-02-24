'use client';

import { ReminderItem } from './ReminderItem';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  reminderType: string;
  relatedDealId?: string;
}

interface RemindersSectionProps {
  reminders: Reminder[];
  onComplete: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
  onSetReminder: () => void;
  className?: string;
}

function groupReminders(reminders: Reminder[]) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const overdue: Reminder[] = [];
  const today: Reminder[] = [];
  const upcoming: Reminder[] = [];

  for (const r of reminders) {
    const date = new Date(r.reminderDate);
    if (date < now && date < todayEnd) {
      // Check if it's today but past time, or truly overdue
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (date < todayStart) {
        overdue.push(r);
      } else {
        today.push(r);
      }
    } else if (date >= now && date < todayEnd) {
      today.push(r);
    } else {
      upcoming.push(r);
    }
  }

  return { overdue, today, upcoming };
}

export function RemindersSection({
  reminders,
  onComplete,
  onDismiss,
  onSetReminder,
  className = '',
}: RemindersSectionProps) {
  const { overdue, today, upcoming } = groupReminders(reminders);

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Reminders</h2>
            <p className="text-sm text-gray-500">
              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''}
              {overdue.length > 0 && (
                <span className="text-red-600 font-medium"> ({overdue.length} overdue)</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onSetReminder}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          + Add
        </button>
      </div>

      {/* Empty State */}
      {reminders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No Reminders Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Set reminders for tax payments, deal deadlines, and more.
          </p>
          <button
            onClick={onSetReminder}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Set Your First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                Overdue
              </p>
              <div className="space-y-2">
                {overdue.map(r => (
                  <ReminderItem key={r.id} reminder={r} onComplete={onComplete} onDismiss={onDismiss} />
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          {today.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                Today
              </p>
              <div className="space-y-2">
                {today.map(r => (
                  <ReminderItem key={r.id} reminder={r} onComplete={onComplete} onDismiss={onDismiss} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Upcoming
              </p>
              <div className="space-y-2">
                {upcoming.map(r => (
                  <ReminderItem key={r.id} reminder={r} onComplete={onComplete} onDismiss={onDismiss} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
