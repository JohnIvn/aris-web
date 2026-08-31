import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  FileClock,
  Filter,
  Plus,
  Search,
  UserRoundCheck,
} from 'lucide-react';

import Modal from '../../components/ui/Modal';
import { fetchDtrData, submitDtrRecord } from '../../lib/services/dtr.service';
import type { DtrData, DtrRecord } from '../../lib/data/dtr.types';


const statusStyles: Record<DtrRecord['status'], string> = {
  Present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'On Leave': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Holiday: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

const MyDTR: React.FC = () => {
  const [data, setData] = useState<DtrData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DtrRecord | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    timeIn: '08:00',
    timeOut: '17:00',
    remarks: '',
  });

  useEffect(() => {
    let cancelled = false;

    fetchDtrData()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load DTR data.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data.records;

    return data.records.filter((record) =>
      record.date.toLowerCase().includes(query) ||
      record.day.toLowerCase().includes(query) ||
      record.status.toLowerCase().includes(query) ||
      (record.remarks ?? '').toLowerCase().includes(query),
    );
  }, [data, search]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await submitDtrRecord(form);
      if (data) {
        const nextRecord: DtrRecord = {
          id: `dtr-${Date.now()}`,
          date: form.date,
          day: new Date(`${form.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
          timeIn: form.timeIn,
          timeOut: form.timeOut,
          hoursWorked: '8.5 hrs',
          status: 'Present',
          remarks: form.remarks || 'Manual entry',
        };

        setData({
          summary: {
            ...data.summary,
            totalDays: data.summary.totalDays + 1,
            presentDays: data.summary.presentDays + 1,
            hoursWorked: `${(Number.parseFloat(data.summary.hoursWorked) + 8.5).toFixed(1)} hrs`,
          },
          records: [nextRecord, ...data.records],
        });
      }
      setIsModalOpen(false);
      setForm({
        date: new Date().toISOString().slice(0, 10),
        timeIn: '08:00',
        timeOut: '17:00',
        remarks: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save DTR change.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRecordDetails = (record: DtrRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 transition-colors">
      <main className="flex-1 min-w-0">
        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
            Loading DTR record...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              {[
                { label: 'Total Days', value: data.summary.totalDays },
                { label: 'Present', value: data.summary.presentDays },
                { label: 'Late', value: data.summary.lateDays },
                { label: 'Hours Worked', value: data.summary.hoursWorked },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Time Record</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Monitor attendance, logs, and work hours.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </button>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search date, status, or remarks"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Day</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Time In</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Time Out</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Hours</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/70">
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{record.date}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{record.day}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{record.timeIn}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{record.timeOut}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{record.hoursWorked}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status]}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openRecordDetails(record)}
                              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                            >
                              <FileClock className="h-3.5 w-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <Modal
        isOpen={isModalOpen}
        title={selectedRecord ? 'DTR Details' : 'Add DTR Entry'}
        description={
          selectedRecord
            ? 'Review the daily time record details and status.'
            : 'Enter your daily time in and out for backend submission.'
        }
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        size="lg"
        footer={
          selectedRecord ? (
            <>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRecord(null);
                }}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  setIsModalOpen(false);
                  setForm({
                    date: new Date().toISOString().slice(0, 10),
                    timeIn: '08:00',
                    timeOut: '17:00',
                    remarks: '',
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </>
          )
        }
      >
        {selectedRecord ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selectedRecord.date}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Day</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selectedRecord.day}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Time In</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selectedRecord.timeIn}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Time Out</p>
                <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{selectedRecord.timeOut}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {selectedRecord.status}
              </p>
            </div>

            {selectedRecord.remarks && (
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Remarks</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedRecord.remarks}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                />
              </label>

              <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CalendarClock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Ready for backend sync</span>
                </div>
                <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Swap the sample submit call with your API URL when the backend is ready.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Time In
                <input
                  type="time"
                  value={form.timeIn}
                  onChange={(event) => setForm({ ...form, timeIn: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Time Out
                <input
                  type="time"
                  value={form.timeOut}
                  onChange={(event) => setForm({ ...form, timeOut: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Remarks
              <textarea
                rows={4}
                value={form.remarks}
                onChange={(event) => setForm({ ...form, remarks: event.target.value })}
                placeholder="Add remarks, leave note, or manual adjustment"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-emerald-900/40"
              />
            </label>

            <div className="flex gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <UserRoundCheck className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              This form is prepared for backend integration by swapping the sample service URL in the DTR service file.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyDTR;
