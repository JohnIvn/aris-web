import type {
  MeetingAttendanceData,
  StartMeetingResult,
} from "../data/meetingAttendance.types";
import { httpRequest } from "../utils/api";

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
  const generatedMeetingId = meetingId ?? crypto.randomUUID();
  const startedAt = new Date().toISOString();

  const backendUrl = import.meta.env.VITE_MEET_START_ENDPOINT;
  const workspaceModeEnabled = import.meta.env.VITE_GOOGLE_WORKSPACE_MODE === "true";

  if (backendUrl) {
    try {
      const result = await httpRequest<StartMeetingResult>(backendUrl, {
        method: "POST",
        data: {
          meetingId: generatedMeetingId,
          startedAt,
          source: "aris-web",
          workspaceMode: workspaceModeEnabled,
        },
      });

      if (result.ok && result.data) {
        return {
          ...result.data,
          meetingId: result.data.meetingId ?? generatedMeetingId,
          startedAt: result.data.startedAt ?? startedAt,
        };
      }
    } catch {
      // Fall back below when the backend is unavailable.
    }
  }

  const meetingCode = `aris-${Math.random().toString(36).slice(2, 8)}`;

  return {
    meetingId: generatedMeetingId,
    meetingCode,
    meetingUrl: `https://meet.google.com/${meetingCode}`,
    startedAt,
    workspaceRequired: !workspaceModeEnabled,
    message: workspaceModeEnabled
      ? "Google Workspace is enabled. Connect the backend endpoint to create a real organization-managed Meet room."
      : "Demo mode is active. Once a Workspace account and backend endpoint are ready, this flow will create the live Google Meet room.",
  };
}
