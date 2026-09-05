import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

const DEMO_APPROVAL_STORAGE_KEY = 'aris_demo_approval_flow';

const defaultReport = {
  id: 'AR-0826-01',
  professor: 'Amelia Torres',
  department: 'Computer Science',
  period: 'August 2026',
  status: 'Pending Review',
  submittedOn: 'May 28, 2026',
  summary: 'Implemented active learning projects, mentorship activities, and faculty support measures for the month.',
  evidence: [
    'Completed 3 classroom innovation outputs and supporting records.',
    'Captured attendance and mentoring reports for all assigned sections.',
    'Submitted research and service documentation with supporting files.',
  ],
  rejections: [
    {
      date: 'May 29, 2026',
      by: 'Grace Navarro',
      role: 'Secretary',
      remarks: 'The mentoring log is incomplete. Please attach the section attendance sheet.',
    },
    {
      date: 'May 30, 2026',
      by: 'Patricia Gomez',
      role: 'HR',
      remarks: 'Supporting file was not signed by the department chair.',
    },
    {
      date: 'May 31, 2026',
      by: 'Daniel Cruz',
      role: 'Accounting',
      remarks: 'Budget evidence is missing the official approval stamp.',
    },
  ],
};

const defaultApprovalFlow = [
  { name: 'Checker', owner: 'Karen Reyes', status: 'Approved', date: 'May 28, 2026', approvedBy: 'Karen Reyes' },
  { name: 'Secretary', owner: 'Grace Navarro', status: 'Waiting for approval', date: 'Pending', approvedBy: '—' },
  { name: 'Human Resources', owner: 'Patricia Gomez', status: 'Waiting for approval', date: 'Pending', approvedBy: '—' },
  { name: 'Accounting', owner: 'Daniel Cruz', status: 'Waiting for approval', date: 'Pending', approvedBy: '—' },
];

const reviewerRole = 'Checker';

const getStoredApprovals = () => {
  if (typeof window === 'undefined') {
    return defaultApprovalFlow;
  }

  const raw = window.localStorage.getItem(DEMO_APPROVAL_STORAGE_KEY);
  if (!raw) {
    return defaultApprovalFlow;
  }

  try {
    const parsed = JSON.parse(raw) as Array<{ name: string; owner: string; status: string; date: string; approvedBy: string }>;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultApprovalFlow;
    }
    return parsed;
  } catch {
    return defaultApprovalFlow;
  }
};

const ReportDetailsReview: React.FC = () => {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [approvalFlow, setApprovalFlow] = useState(getStoredApprovals());
  const [currentReviewerRole, setCurrentReviewerRole] = useState(() => {
    if (typeof window === 'undefined') return reviewerRole;
    return window.localStorage.getItem('aris_demo_current_staff_role') ?? reviewerRole;
  });

  const report = defaultReport;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEMO_APPROVAL_STORAGE_KEY, JSON.stringify(approvalFlow));
      window.localStorage.setItem('aris_demo_current_staff_role', currentReviewerRole);
    }
  }, [approvalFlow, currentReviewerRole]);

  const roleAlreadyApproved = approvalFlow.some(
    (step) => step.name === currentReviewerRole && step.status === 'Approved',
  );
  const isActionDisabled = roleAlreadyApproved;

  const handleDecision = () => {
    if (!decision || isActionDisabled) return;

    const nextFlow = approvalFlow.map((step) => {
      if (step.name === currentReviewerRole) {
        return {
          ...step,
          status: decision === 'approve' ? 'Approved' : 'Rejected',
          date: 'Today',
          approvedBy: 'Current reviewer',
        };
      }
      return step;
    });

    setApprovalFlow(nextFlow);
    setShowModal(false);
    setRemarks('');
    setDecision(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-6xl">

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Demo reviewer role</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use this to simulate checker, secretary, HR, and accounting approval flow.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span>Role</span>
              <select
                value={currentReviewerRole}
                onChange={(event) => setCurrentReviewerRole(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="Checker">Checker</option>
                <option value="Secretary">Secretary</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Accounting">Accounting</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <Card title="Accomplishment report details" accentColor="#047857">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Report ID</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{report.id}</h3>
                </div>
                <StatusBadge label={report.status} tone="warning" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Professor</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{report.professor}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Department</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{report.department}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Period</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">{report.period}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Date submitted</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{report.submittedOn}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Approved by</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Ms. Karen Reyes</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{report.summary}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Submitted evidence</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {report.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {report.rejections.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Rejection history</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-900/60">
                        <tr>
                          <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                          <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Reviewer</th>
                          <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Role</th>
                          <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-950/20">
                        {report.rejections.map((item, index) => (
                          <tr key={`${item.date}-${index}`}>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.date}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.by}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.role}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{item.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    if (isActionDisabled) return;
                    setDecision('approve');
                    setShowModal(true);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActionDisabled
                      ? 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <CheckCircle2 size={16} /> {isActionDisabled ? 'Already approved' : 'Approve report'}
                </button>
                <button
                  type="button"
                  disabled={isActionDisabled}
                  onClick={() => {
                    if (isActionDisabled) return;
                    setDecision('reject');
                    setShowModal(true);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                    isActionDisabled
                      ? 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
                      : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/25 dark:text-rose-300'
                  }`}
                >
                  <XCircle size={16} /> {isActionDisabled ? 'Locked' : 'Reject report'}
                </button>
              </div>

              {isActionDisabled && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This review step is already completed by another reviewer in the same role, so this user can only view the report and cannot approve or reject it.
                </p>
              )}
            </div>
          </Card>

          <Card title="Approval flow" accentColor="#047857">
            <div className="space-y-3">
              {approvalFlow.map((step) => (
                <div key={step.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{step.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{step.owner}</p>
                    </div>
                    <StatusBadge label={step.status} tone={step.status === 'Approved' ? 'success' : 'warning'} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{step.date === 'Pending' ? 'Pending action' : `Approved on ${step.date}`}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Review action</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {decision === 'approve' ? 'Approve report' : 'Reject report'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">✕</button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{report.professor}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.id} • {report.period}</p>
            </div>

            <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {decision === 'approve' ? 'Approval note (optional)' : 'Rejection remarks'}
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={5}
                placeholder={decision === 'approve' ? 'Add approval note for the reviewer log...' : 'State the reason for rejection and the required fix...'}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-0 transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecision}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${decision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}
              >
                {decision === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailsReview;
