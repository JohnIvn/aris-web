import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';

import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';

const pendingQueue = [
  { name: 'Prof. Amelia Torres', period: 'August 2026', status: 'Pending Review', id: 'AR-0826-01', approvedBy: ['Checker'] },
  { name: 'Prof. Marco Santos', period: 'August 2026', status: 'Awaiting HR', id: 'AR-0826-02', approvedBy: ['Checker', 'Secretary'] },
  { name: 'Prof. Liza Abad', period: 'July 2026', status: 'For Revision', id: 'AR-0726-01', approvedBy: ['Secretary'] },
];

const teamHighlights = [
  { label: 'Reports Reviewed', value: '128', tone: 'emerald' },
  { label: 'Pending Queue', value: '14', tone: 'amber' },
  { label: 'Approval SLA', value: '96%', tone: 'blue' },
];

const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentRole = 'Checker';

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-7xl">

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <StatCard
            icon={FileCheck2}
            iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
            valueColorClass="text-emerald-700 dark:text-emerald-400"
            label="Pending Reports"
            value="14"
            subLabel="Due this week"
            actionLabel="Review all"
            accentColor="#047857"
            onAction={() => navigate('/staff/reports')}
          />
          <StatCard
            icon={Clock3}
            iconBgClass="bg-amber-50 dark:bg-amber-900/30"
            iconColorClass="text-amber-600 dark:text-amber-400"
            valueColorClass="text-amber-700 dark:text-amber-400"
            label="Average Review Time"
            value="2.4d"
            subLabel="Below target"
            actionLabel="See timeline"
            accentColor="#047857"
            onAction={() => navigate('/staff/history')}
          />
          <StatCard
            icon={TrendingUp}
            iconBgClass="bg-blue-50 dark:bg-blue-900/30"
            iconColorClass="text-blue-600 dark:text-blue-400"
            valueColorClass="text-blue-700 dark:text-blue-400"
            label="Compliance Rate"
            value="96%"
            subLabel="Monthly average"
            actionLabel="View insights"
            accentColor="#047857"
            onAction={() => navigate('/staff/audit')}
          />
          <StatCard
            icon={BriefcaseBusiness}
            iconBgClass="bg-violet-50 dark:bg-violet-900/30"
            iconColorClass="text-violet-600 dark:text-violet-400"
            valueColorClass="text-violet-700 dark:text-violet-400"
            label="Assigned Units"
            value="9"
            subLabel="Faculty groups"
            actionLabel="Open queue"
            accentColor="#047857"
            onAction={() => navigate('/staff/reports')}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <Card title="Priority review queue" accentColor="#047857">
              <div className="space-y-3">
                {pendingQueue.map((item) => {
                  const isViewOnly = item.approvedBy.includes(currentRole);

                  return (
                    <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.period} • {item.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge label={item.status} tone={item.status === 'Pending Review' ? 'warning' : 'neutral'} />
                        <button
                          type="button"
                          onClick={() => navigate(`/staff/reports/${item.id}`)}
                          className={`inline-flex items-center gap-2 text-sm font-semibold ${
                            isViewOnly
                              ? 'text-slate-600 dark:text-slate-300'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {isViewOnly ? 'View' : 'Review'} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Operational snapshot" accentColor="#047857">
              <div className="grid gap-4 md:grid-cols-3">
                {teamHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Action center" accentColor="#047857">
              <div className="space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/40">
                  <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={18} />
                    <span className="font-semibold">5 reports approved today</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <BellRing size={18} className="text-amber-500" />
                    <span className="font-medium">2 faculty follow-ups pending</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <BadgeCheck size={18} className="text-blue-500" />
                    <span className="font-medium">Department compliance is on track</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
