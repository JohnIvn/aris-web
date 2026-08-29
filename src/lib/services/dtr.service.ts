import type { DtrData } from '../data/dtr.types';

const mockDtrData: DtrData = {
  summary: {
    totalDays: 30,
    presentDays: 24,
    lateDays: 3,
    onLeaveDays: 2,
    hoursWorked: '182.5 hrs',
  },
  records: [
    { id: 'dtr-01', date: '2026-08-01', day: 'Mon', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present', remarks: 'On time' },
    { id: 'dtr-02', date: '2026-08-02', day: 'Tue', timeIn: '08:20 AM', timeOut: '05:00 PM', hoursWorked: '8.7 hrs', status: 'Late', remarks: 'Traffic delay' },
    { id: 'dtr-03', date: '2026-08-03', day: 'Wed', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-04', date: '2026-08-04', day: 'Thu', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-05', date: '2026-08-05', day: 'Fri', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-06', date: '2026-08-06', day: 'Sat', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-07', date: '2026-08-07', day: 'Sun', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-08', date: '2026-08-08', day: 'Mon', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-09', date: '2026-08-09', day: 'Tue', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-10', date: '2026-08-10', day: 'Wed', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-11', date: '2026-08-11', day: 'Thu', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-12', date: '2026-08-12', day: 'Fri', timeIn: '08:40 AM', timeOut: '05:00 PM', hoursWorked: '8.3 hrs', status: 'Late', remarks: 'Late arrival' },
    { id: 'dtr-13', date: '2026-08-13', day: 'Sat', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-14', date: '2026-08-14', day: 'Sun', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-15', date: '2026-08-15', day: 'Mon', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-16', date: '2026-08-16', day: 'Tue', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-17', date: '2026-08-17', day: 'Wed', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-18', date: '2026-08-18', day: 'Thu', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-19', date: '2026-08-19', day: 'Fri', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-20', date: '2026-08-20', day: 'Sat', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-21', date: '2026-08-21', day: 'Sun', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-22', date: '2026-08-22', day: 'Mon', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-23', date: '2026-08-23', day: 'Tue', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-24', date: '2026-08-24', day: 'Wed', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-25', date: '2026-08-25', day: 'Thu', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-26', date: '2026-08-26', day: 'Fri', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-27', date: '2026-08-27', day: 'Sat', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-28', date: '2026-08-28', day: 'Sun', timeIn: '-', timeOut: '-', hoursWorked: '-', status: 'Holiday', remarks: 'Weekend' },
    { id: 'dtr-29', date: '2026-08-29', day: 'Mon', timeIn: '08:00 AM', timeOut: '05:00 PM', hoursWorked: '9 hrs', status: 'Present' },
    { id: 'dtr-30', date: '2026-08-30', day: 'Tue', timeIn: '08:30 AM', timeOut: '05:00 PM', hoursWorked: '8.5 hrs', status: 'Late', remarks: 'Doctor appointment' },
  ],
};

export async function fetchDtrData(): Promise<DtrData> {
  // Replace with httpRequest('/dtr', { method: 'GET' }) when backend is ready.
  return mockDtrData;
}

export async function submitDtrRecord(payload: { date: string; timeIn: string; timeOut: string; remarks?: string }) {
  // Replace with httpRequest('/dtr', { method: 'POST', data: payload }) when backend is ready.
  return {
    ok: true,
    message: 'DTR record submitted successfully.',
    payload,
  };
}
