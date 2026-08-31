import React, { useState } from 'react';
import { ArrowUpRight, BadgeDollarSign, CalendarRange, CheckCircle2, Clock3, Wallet } from 'lucide-react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const payrollPeriods = [
  {
    period: 'August 1 – 15, 2026',
    status: 'Approved',
    amount: '₱ 18,450.00',
    date: 'Released on Aug 18, 2026',
    tone: 'emerald',
  },
  {
    period: 'July 16 – 31, 2026',
    status: 'Processed',
    amount: '₱ 18,120.00',
    date: 'Scheduled on Jul 31, 2026',
    tone: 'amber',
  },
  {
    period: 'July 1 – 15, 2026',
    status: 'Approved',
    amount: '₱ 17,980.00',
    date: 'Released on Jul 17, 2026',
    tone: 'emerald',
  },
];

const Payroll: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof payrollPeriods[number] | null>(null);

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
      <main className="mx-auto max-w-6xl">
        <div className="grid gap-5 md:grid-cols-3">
          <Card title="Net Pay" accentColor="#047857">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₱ 18,450.00</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">This cycle</p>
              </div>
            </div>
          </Card>

          <Card title="Release Date" accentColor="#047857">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <CalendarRange size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">August 31</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bi-monthly payroll</p>
              </div>
            </div>
          </Card>

          <Card title="Approved Reports" accentColor="#047857">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <BadgeDollarSign size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">4 reports</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Included in payroll</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card title="Payroll History" accentColor="#047857">
            <div className="space-y-4">
              {payrollPeriods.map((item) => (
                <div
                  key={item.period}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{item.period}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.date}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{item.amount}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          item.tone === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      aria-label={`View payroll details for ${item.period}`}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Payroll Rules" accentColor="#047857">
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                <p>Approved accomplishment reports are automatically included in the next payroll cycle.</p>
              </div>

              <div className="flex gap-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                <Clock3 className="mt-0.5 text-blue-600 dark:text-blue-400" size={18} />
                <p>Payroll runs every 15 days and also at the end of the month depending on the schedule.</p>
              </div>

              <div className="flex gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
                <BadgeDollarSign className="mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                <p>Only approved reports with completed review steps are eligible for salary computation.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {selectedPeriod && (
        <Modal
          isOpen={true}
          title="Payroll Details"
          description={`Period: ${selectedPeriod.period}`}
          onClose={() => setSelectedPeriod(null)}
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setSelectedPeriod(null)}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Close
            </button>
          }
        >
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Payroll period</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedPeriod.period}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedPeriod.status}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedPeriod.amount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Release information</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedPeriod.date}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payroll;
