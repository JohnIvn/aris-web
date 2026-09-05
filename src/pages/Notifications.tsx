import React, { useMemo } from 'react';
import { Bell, CheckCheck, CircleDot, Search, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import { useUIStore } from '../lib/stores/ui.store';

interface NotificationsPageProps {
  role?: 'professor' | 'staff';
}

const professorNotifications = [
  { id: 'prof-001', title: 'AR submission reminder', message: 'Submit your accomplishment report before the end of the month. The last 7 days are the final review period.', category: 'AR', createdAt: 'Today, 8:15 AM', read: false },
  { id: 'prof-002', title: 'Payroll cycle notice', message: 'Approved reports are included in the next payroll calculation. Review your pay summary before release.', category: 'Payroll', createdAt: 'Today, 6:40 AM', read: false },
  { id: 'prof-003', title: 'Meeting attendance recorded', message: 'Your attendance session has been successfully captured for review.', category: 'Attendance', createdAt: 'Yesterday, 4:25 PM', read: true },
];

const staffNotifications = [
  { id: 'staff-001', title: 'Awaiting approval', message: 'Prof. Amelia Torres submitted an AR and is now waiting for your review before it moves to the next approval stage.', category: 'AR', createdAt: 'Today, 9:10 AM', read: false },
  { id: 'staff-002', title: 'Secretary action required', message: 'The checker has approved the submission. Please review and approve or return it to the professor if revisions are needed.', category: 'Approval', createdAt: 'Today, 7:45 AM', read: false },
  { id: 'staff-003', title: 'Payroll review queue', message: 'Three approved reports are ready for payroll calculation this cycle.', category: 'Payroll', createdAt: 'Yesterday, 5:35 PM', read: true },
];

const NotificationsPage: React.FC<NotificationsPageProps> = ({ role = 'professor' }) => {
  const notifications = useUIStore((state) => state.notifications);
  const markNotificationAsRead = useUIStore((state) => state.markNotificationAsRead);
  const unreadCount = useUIStore((state) => state.unreadCount);
  const markAllNotificationsAsRead = useUIStore((state) => state.markAllNotificationsAsRead);

  const roleNotifications = useMemo(
    () => (role === 'staff' ? [...notifications.filter((item) => !item.title.includes('ARIS') || item.category !== 'System'), ...staffNotifications] : [...notifications.filter((item) => item.category !== 'System'), ...professorNotifications]),
    [notifications, role],
  );

  const sortedNotifications = useMemo(
    () => [...roleNotifications].sort((a, b) => Number(a.read ?? false) - Number(b.read ?? false)),
    [roleNotifications],
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Bell size={18} />
            </div>
            <span>
              {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All notifications viewed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Search size={14} />
              Search
            </button>
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>
        </div>

        <Card title="Inbox" accentColor="#047857">
          <div className="space-y-3">
            {sortedNotifications.map((notification) => {
              const isUnread = !notification.read;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                    isUnread
                      ? 'border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                      isUnread
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isUnread ? <CircleDot size={18} className="fill-current" /> : <Bell size={18} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                        {isUnread && <Sparkles size={14} className="text-emerald-500" />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{notification.createdAt}</span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{notification.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {notification.category}
                      </span>
                      {!notification.read && <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">New</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default NotificationsPage;
