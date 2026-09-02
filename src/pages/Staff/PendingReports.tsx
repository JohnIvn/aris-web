import React, { useMemo, useState } from 'react';
import { Bell, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

interface ReviewItem {
  id: string;
  professor: string;
  department: string;
  period: string;
  status: 'Pending Review' | 'Awaiting HR' | 'For Revision';
  submittedOn: string;
  approvedBy: string[];
}

const currentUserRole = 'Checker';

const seedItems: ReviewItem[] = [
  { id: 'AR-0826-01', professor: 'Prof. Amelia Torres', department: 'Computer Science', period: 'August 2026', status: 'Pending Review', submittedOn: 'May 28, 2026', approvedBy: ['Checker'] },
  { id: 'AR-0826-02', professor: 'Prof. Marco Santos', department: 'Business Management', period: 'August 2026', status: 'Awaiting HR', submittedOn: 'May 27, 2026', approvedBy: ['Checker', 'Secretary'] },
  { id: 'AR-0726-01', professor: 'Prof. Liza Abad', department: 'Education', period: 'July 2026', status: 'For Revision', submittedOn: 'May 25, 2026', approvedBy: ['Secretary'] },
  { id: 'AR-0826-03', professor: 'Prof. Renzo Velasquez', department: 'Engineering', period: 'August 2026', status: 'Pending Review', submittedOn: 'May 24, 2026', approvedBy: [] },
];

const PendingReports: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReviewItem['status']>('All');

  const filteredItems = useMemo(() => {
    return seedItems.filter((item) => {
      const matchesText = !keyword || `${item.professor} ${item.department} ${item.id}`.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [keyword, statusFilter]);

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl">
        <Card title="Report review queue" accentColor="#047857">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search professor, department, or report ID"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <SlidersHorizontal size={16} className="text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'All' | ReviewItem['status'])}
                  className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"
                >
                  <option className="dark:text-slate-600" value="All">All</option>
                  <option className="dark:text-slate-600" value="Pending Review">Pending Review</option>
                  <option className="dark:text-slate-600" value="Awaiting HR">Awaiting HR</option>
                  <option className="dark:text-slate-600" value="For Revision">For Revision</option>
                </select>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                <Bell size={14} />
                Notify queue
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="hidden grid-cols-[1.6fr_1.2fr_1fr_1fr_0.9fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400 md:grid">
              <span>Professor</span>
              <span>Department</span>
              <span>Period</span>
              <span>Status</span>
              <span>Submitted</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredItems.map((item) => {
                const isViewOnly = item.approvedBy.includes(currentUserRole);

                return (
                  <div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_1.2fr_1fr_1fr_0.9fr] md:items-center">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.professor}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.id}</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.department}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.period}</p>
                    <StatusBadge label={item.status} tone={item.status === 'Pending Review' ? 'warning' : 'neutral'} />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item.submittedOn}</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/staff/reports/${item.id}`)}
                        className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                          isViewOnly
                            ? 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        {isViewOnly ? 'View' : 'Review'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No reports match the selected filters.
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default PendingReports;
