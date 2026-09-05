import React from 'react';
import { History, ShieldCheck } from 'lucide-react';

import Card from '../../components/ui/Card';

const history = [
  {
    id: 'APP-1001',
    title: 'AR-0826-01 approved by checker',
    date: 'May 28, 2026',
    actor: 'Ms. Karen Reyes',
    reportId: 'AR-0826-01',
    professor: 'Prof. Amelia Torres',
    department: 'Computer Science',
    submittedOn: 'May 26, 2026',
    approvedOn: 'May 28, 2026',
    approvedBy: 'Ms. Karen Reyes',
    status: 'Approved',
    rejections: [],
  },
  {
    id: 'APP-1000',
    title: 'AR-0716-05 returned for revision',
    date: 'May 27, 2026',
    actor: 'Ms. Grace Navarro',
    reportId: 'AR-0716-05',
    professor: 'Prof. Marco Santos',
    department: 'Business Management',
    submittedOn: 'May 23, 2026',
    approvedOn: '—',
    approvedBy: '—',
    status: 'Rejected',
    rejections: [
      { date: 'May 27, 2026', by: 'Ms. Grace Navarro', role: 'Secretary', remarks: 'Please attach the signed attendance sheet and mentoring log.' },
      { date: 'May 29, 2026', by: 'Ms. Patricia Gomez', role: 'HR', remarks: 'Department chair signature is missing from the document set.' },
      { date: 'May 30, 2026', by: 'Mr. Daniel Cruz', role: 'Accounting', remarks: 'Budget report is still inconsistent with the submitted breakdown.' },
    ],
  },
  {
    id: 'APP-0999',
    title: 'AR-0712-08 approved by secretary',
    date: 'May 25, 2026',
    actor: 'Ms. Grace Navarro',
    reportId: 'AR-0712-08',
    professor: 'Prof. Liza Abad',
    department: 'Education',
    submittedOn: 'May 20, 2026',
    approvedOn: 'May 25, 2026',
    approvedBy: 'Ms. Grace Navarro',
    status: 'Approved',
    rejections: [],
  },
];

const ApprovalHistory: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-5xl">
        <Card title="Recent actions" accentColor="#047857">
          <div className="space-y-5">
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {item.status === 'Approved' ? <ShieldCheck size={16} /> : <History size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.actor}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950/20 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Professor</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">{item.professor}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Department</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">{item.department}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Date submitted</p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{item.submittedOn}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Date approved</p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{item.approvedOn}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Approved by</p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{item.approvedBy}</p>
                      </div>
                    </div>

                    {item.rejections.length > 0 && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/70">
                        <div className="bg-rose-50 px-3 py-2 text- font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Rejection timeline ({item.rejections.length})</div>
                        <table className="min-w-full divide-y divide-rose-200 text-left text-sm dark:divide-rose-900/70">
                          <thead className="bg-rose-50 dark:bg-rose-950/25">
                            <tr>
                              <th className="px-3 py-2 font-semibold text-rose-700 dark:text-rose-300">Date</th>
                              <th className="px-3 py-2 font-semibold text-rose-700 dark:text-rose-300">Reviewer</th>
                              <th className="px-3 py-2 font-semibold text-rose-700 dark:text-rose-300">Role</th>
                              <th className="px-3 py-2 font-semibold text-rose-700 dark:text-rose-300">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-slate-950/10">
                            {item.rejections.map((rejection, index) => (
                              <tr key={`${rejection.date}-${index}`} className="align-top">
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{rejection.date}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{rejection.by}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{rejection.role}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{rejection.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ApprovalHistory;
