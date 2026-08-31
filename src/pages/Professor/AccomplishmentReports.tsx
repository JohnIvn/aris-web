import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  Plus,
  Search,
} from 'lucide-react';

import Topbar from '../../components/Topbar';
import Modal from '../../components/ui/Modal';

export type ReportStatus = 'Submitted' | 'Pending Review' | 'Approved' | 'Returned / Revised';

export interface ApprovalStage {
  name: string;
  owner: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface AccomplishmentReportItem {
  id: string;
  period: string;
  periodTitle: string;
  submittedOn: string;
  submittedAt: string;
  status: ReportStatus;
  reviewer: string;
  updatedOn: string;
  summary: string;
  rejectionCount: number;
  approvalFlow: ApprovalStage[];
  details: string[];
}

const reportsSeed: AccomplishmentReportItem[] = [
  {
    id: 'rep-aug-2026',
    period: 'August 1 - August 31, 2026',
    periodTitle: 'August 2026',
    submittedOn: 'May 28, 2026',
    submittedAt: '8:15 AM',
    status: 'Pending Review',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'May 28, 2026',
    summary: 'Faculty performance, classroom outputs, and student engagement measures for the month.',
    rejectionCount: 0,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Pending' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Pending' },
    ],
    details: [
      'Completed all required teaching and mentoring tasks for the month.',
      'Prepared and delivered instructional materials for 3 class sections.',
      'Submitted supporting documentation and attendance records for review.',
    ],
  },
  {
    id: 'rep-jul-2026',
    period: 'July 1 - July 31, 2026',
    periodTitle: 'July 2026',
    submittedOn: 'Apr 28, 2026',
    submittedAt: '9:02 AM',
    status: 'Approved',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'May 1, 2026',
    summary: 'Reviewed and approved monthly accomplishment report with no additional revisions needed.',
    rejectionCount: 0,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Approved' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Approved' },
    ],
    details: [
      'Approved by the checker after validating all supporting documents.',
      'Faculty deliverables were completed and archived for recordkeeping.',
      'No follow-up corrections were required.',
    ],
  },
  {
    id: 'rep-jun-2026',
    period: 'June 1 - June 30, 2026',
    periodTitle: 'June 2026',
    submittedOn: 'Mar 28, 2026',
    submittedAt: '7:18 AM',
    status: 'Approved',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'Apr 3, 2026',
    summary: 'Performance report for June completed, validated, and approved at department level.',
    rejectionCount: 0,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Approved' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Approved' },
    ],
    details: [
      'Final report approved by designated reviewers and department staff.',
      'Supporting attachments were checked and stored in the archive.',
      'Faculty contribution records align with the monthly report.',
    ],
  },
  {
    id: 'rep-may-2026',
    period: 'May 1 - May 31, 2026',
    periodTitle: 'May 2026',
    submittedOn: 'Feb 28, 2026',
    submittedAt: '8:06 AM',
    status: 'Returned / Revised',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'Mar 2, 2026',
    summary: 'Returned for revision due to a missing supporting document and incomplete narrative section.',
    rejectionCount: 1,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Approved' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Rejected' },
    ],
    details: [
      'Revisions requested for a missing proof of attendance record.',
      'Narrative must include a clearer description of research contribution.',
      'Additional documentation is pending before final approval.',
    ],
  },
  {
    id: 'rep-apr-2026',
    period: 'April 1 - April 30, 2026',
    periodTitle: 'April 2026',
    submittedOn: 'Jan 28, 2026',
    submittedAt: '11:40 AM',
    status: 'Approved',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'Feb 2, 2026',
    summary: 'April report was approved after all required department documentation was submitted.',
    rejectionCount: 0,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Approved' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Approved' },
    ],
    details: [
      'Department compliance requirements were satisfied on first review.',
      'Research and teaching outputs were all included in the submitted packet.',
      'Report approved and archived successfully.',
    ],
  },
  {
    id: 'rep-mar-2026',
    period: 'March 1 - March 31, 2026',
    periodTitle: 'March 2026',
    submittedOn: 'Dec 28, 2025',
    submittedAt: '7:18 AM',
    status: 'Approved',
    reviewer: 'Dr. Maria Santos',
    updatedOn: 'Jan 3, 2026',
    summary: 'Approved monthly faculty report with documented service and teaching accomplishments.',
    rejectionCount: 0,
    approvalFlow: [
      { name: 'Checker', owner: 'Dr. Maria Santos', status: 'Approved' },
      { name: 'Secretary', owner: 'Ms. Grace Pagud', status: 'Approved' },
      { name: 'Human Resources', owner: 'Ms. Carla Diaz', status: 'Approved' },
      { name: 'Accounting', owner: 'Mr. Dante Cruz', status: 'Approved' },
    ],
    details: [
      'Teaching duties and mentoring activities completed as expected.',
      'No deficiencies were found during the approval process.',
      'The report was accepted and moved to official record storage.',
    ],
  },
];

const statusStyles: Record<ReportStatus, string> = {
  Submitted: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Pending Review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Returned / Revised': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const summaryCards = [
  { label: 'Submitted', value: '2', tone: 'text-slate-800', accent: 'bg-slate-100 text-slate-700' },
  { label: 'Pending Review', value: '1', tone: 'text-amber-600', accent: 'bg-amber-100 text-amber-700' },
  { label: 'Approved', value: '3', tone: 'text-emerald-600', accent: 'bg-emerald-100 text-emerald-700' },
  { label: 'Returned / Revised', value: '1', tone: 'text-rose-600', accent: 'bg-rose-100 text-rose-700' },
  { label: 'Total Reports', value: '7', tone: 'text-indigo-600', accent: 'bg-indigo-100 text-indigo-700' },
];

const AccomplishmentReports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Periods');
  const [selectedId, setSelectedId] = useState(reportsSeed[0].id);
  const [modal, setModal] = useState<{ title: string; description: string; body: string } | null>(null);

  const visibleReports = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reportsSeed.filter((item) => {
      const matchesQuery =
        !q ||
        item.period.toLowerCase().includes(q) ||
        item.periodTitle.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
      const matchesPeriod = periodFilter === 'All Periods' || item.periodTitle === periodFilter;

      return matchesQuery && matchesStatus && matchesPeriod;
    });
  }, [periodFilter, search, statusFilter]);

  const selectedReport = visibleReports.find((item) => item.id === selectedId) ?? visibleReports[0] ?? reportsSeed[0];

  const openModal = (title: string, description: string, body: string) => {
    setModal({ title, description, body });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 transition-colors">
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <Topbar
          title="My Accomplishment Reports"
          subtitle={
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <button type="button" className="hover:underline">Dashboard</button>
              <ChevronRight size={14} />
              <span className="font-medium text-slate-700 dark:text-slate-300">Reports</span>
            </div>
          }
          dateLabel="August 2026"
          dayTimeLabel="Accomplishment Report"
          unreadCount={2}
          accentColor="#047857"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                  <p className={`mt-3 text-2xl font-bold ${card.tone}`}>{card.value}</p>
                </div>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}>
                  <BadgeCheck size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report title, period, or summary..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option>All Status</option>
                  <option>Submitted</option>
                  <option>Pending Review</option>
                  <option>Approved</option>
                  <option>Returned / Revised</option>
                </select>
                <Filter size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={periodFilter}
                  onChange={(event) => setPeriodFilter(event.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option>All Periods</option>
                  {Array.from(new Set(reportsSeed.map((item) => item.periodTitle))).map((period) => (
                    <option key={period}>{period}</option>
                  ))}
                </select>
                <CalendarRange size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={() => openModal('New Accomplishment Report', 'Start a report from the web interface', 'This button is prepared for a create-report endpoint. Replace the placeholder action with your new report submission API URL when the backend is live.')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
              >
                <Plus size={16} />
                New Accomplishment Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Report Title / Period</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Date Submitted</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Reviewed By</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {visibleReports.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${selectedReport.id === item.id ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                      >
                        <td className="px-4 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="text-left"
                          >
                            <span className="block font-semibold text-slate-900 dark:text-white">{item.period}</span>
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.periodTitle}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                          <span className="block">{item.submittedOn}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{item.submittedAt}</span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex max-w-[12rem] items-center justify-center rounded-full px-2.5 py-1 text-center text-xs font-semibold leading-tight ${statusStyles[item.status]} whitespace-normal break-words`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                          <span className="block">{item.reviewer}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{item.updatedOn}</span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                          >
                            <FileText size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected Report</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{selectedReport.period}</h3>
                </div>
                <span className={`inline-flex max-w-[12rem] items-center justify-center rounded-full px-2.5 py-1 text-center text-xs font-semibold leading-tight ${statusStyles[selectedReport.status]} whitespace-normal break-words`}>
                  {selectedReport.status}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Submitted</p>
                <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {selectedReport.submittedOn} at {selectedReport.submittedAt}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">By Prof. Juan Dela Cruz</p>
              </div>

              <div className="mt-4 rounded-xl border border-lime-200 bg-lime-50 p-3 dark:border-lime-900 dark:bg-lime-950/30">
                <p className="text-xs uppercase tracking-wide text-lime-700 dark:text-lime-300">Review Note</p>
                <p className="mt-2 text-sm text-lime-800 dark:text-lime-200">{selectedReport.summary}</p>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Approval Flow</p>
                <div className="mt-3 space-y-2">
                  {selectedReport.approvalFlow.map((stage, index) => (
                    <div key={stage.name} className="flex items-center gap-2">
                      <div
                        className={`flex flex-1 items-center justify-between rounded-xl border px-3 py-2 text-left ${
                          stage.status === 'Approved'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : stage.status === 'Rejected'
                              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold">{stage.name}</div>
                          <div className="text-[10px] opacity-80">{stage.status}</div>
                        </div>
                        <ChevronRight size={14} className="opacity-80" />
                      </div>
                      {index < selectedReport.approvalFlow.length - 1 && (
                        <span className="text-slate-400 dark:text-slate-500">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Review Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  {selectedReport.approvalFlow.map((stage) => (
                    <div key={stage.name} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-700/50">
                      <div>
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{stage.owner}</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        stage.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : stage.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rejection History</p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{selectedReport.rejectionCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total rejections recorded for this report</p>
              </div>

              <div className="mt-4 space-y-2">
                {selectedReport.details.map((detail) => (
                  <div key={detail} className="flex items-start gap-2 rounded-xl bg-white p-2.5 dark:bg-slate-800">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-slate-700 dark:text-slate-200">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => openModal('View Full Report', 'Open detailed accomplishment report', `Report period: ${selectedReport.period}. This modal is ready for a report PDF or detailed API response. Connect it to your backend endpoint to load the full content.`)}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
                >
                  View Full Report
                </button>

                {selectedReport.status === 'Returned / Revised' && (
                  <button
                    type="button"
                    onClick={() => openModal('Submit Revision', 'Professor resubmission flow', `This action is prepared for the professor's revision submission for ${selectedReport.period}. Once the backend is live, this will resubmit the AR back to Checker for re-approval.`)}
                    className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
                  >
                    Submit Revision
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400 dark:text-slate-500">
          <span>Showing {visibleReports.length} of {reportsSeed.length} entries</span>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            <button type="button" className="rounded-md px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">1</button>
            <button type="button" className="rounded-md px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
            <button type="button" className="rounded-md px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">© 2026 ARIS. All rights reserved.</p>
      </main>

      <Modal
        isOpen={!!modal}
        title={modal?.title ?? 'Report action'}
        description={modal?.description ?? ''}
        onClose={() => setModal(null)}
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setModal(null)}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
          >
            Close
          </button>
        }
      >
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{modal?.body}</p>
      </Modal>
    </div>
  );
};

export default AccomplishmentReports;
