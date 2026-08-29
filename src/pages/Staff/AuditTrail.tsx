import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

import Card from '../../components/ui/Card';
import Topbar from '../../components/Topbar';

const auditEntries = [
  {
    id: 'AUD-3301',
    user: 'Ms. Karen Reyes',
    action: 'Checker approved AR-0826-01 and forwarded it to Secretary',
    timestamp: 'May 28, 2026 • 8:12 AM',
    status: 'Approved',
    reportId: 'AR-0826-01',
    approvalRoute: 'Checker → Secretary → HR → Accounting',
  },
  {
    id: 'AUD-3300',
    user: 'Ms. Grace Navarro',
    action: 'Secretary returned AR-0716-05 for missing endorsement documents',
    timestamp: 'May 28, 2026 • 7:58 AM',
    status: 'Rejected',
    reportId: 'AR-0716-05',
    approvalRoute: 'Checker → Secretary → HR → Accounting',
  },
  {
    id: 'AUD-3299',
    user: 'Mr. Daniel Cruz',
    action: 'Accounting requested additional cost evidence before final approval',
    timestamp: 'May 27, 2026 • 5:02 PM',
    status: 'Pending',
    reportId: 'AR-0818-07',
    approvalRoute: 'Checker → Secretary → HR → Accounting',
  },
];

const AuditTrail: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 p-6 md:p-8">
      <main className="mx-auto max-w-5xl">
        <Topbar
          title="Audit Trail"
          subtitle={<p className="text-sm text-slate-600 dark:text-slate-300">System changes and approval actions</p>}
          dateLabel="May 28, 2026"
          dayTimeLabel="Thursday, 8:30 AM"
          unreadCount={2}
          accentColor="#34d399"
          textColor="#0f172a"
        />

        <Card title="Recent audit log" accentColor="#047857">
          <div className="space-y-4">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className={`mt-0.5 rounded-full p-2 ${entry.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : entry.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                  {entry.status === 'Approved' ? <Activity size={16} /> : <ShieldAlert size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{entry.user}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{entry.action}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-800">{entry.reportId}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-1 dark:bg-slate-800">{entry.approvalRoute}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.status}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AuditTrail;
