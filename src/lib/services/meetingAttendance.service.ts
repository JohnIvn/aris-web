import type {
  MeetingAttendanceData,
  StartMeetingResult,
} from "../data/meetingAttendance.types";

const mockMeetingAttendanceData: MeetingAttendanceData = {
  todaysMeeting: {
    dateLabel: "May 28, 2026",
    timeLabel: "8:00 AM - 10:00 AM",
    isRecorded: true,
    note: "Your attendance for today's meeting has been recorded.",
  },
  monthFilterValue: "This Month",
  statusFilterValue: "All Status",
  meetingHistory: [
    {
      id: "meeting-2026-05-28",
      dateLabel: "May 28, 2026",
      timeLabel: "8:00 AM",
      title: "Faculty Meeting",
      purpose: "Monthly department coordination",
      durationLabel: "2 hours",
      durationTimeRange: "8:00 AM - 10:00 AM",
      isRecorded: true,
    },
  ],
  noteText: "Meeting attendance is recorded when you join an active meeting.",
};

export async function fetchMeetingAttendanceData(): Promise<MeetingAttendanceData> {
  // Replace this implementation with an httpRequest call when the API is available.
  return mockMeetingAttendanceData;
}

export async function startMeeting(meetingId?: string): Promise<StartMeetingResult> {
  // Replace this implementation with an httpRequest call when the API is available.
  return {
    meetingId: meetingId ?? crypto.randomUUID(),
    startedAt: new Date().toISOString(),
  };
}
