export interface TodaysMeeting {
  dateLabel: string;
  timeLabel: string;
  isRecorded: boolean;
  note: string;
}

export interface MeetingHistoryItem {
  id: string;
  dateLabel: string;
  timeLabel: string;
  title: string;
  purpose: string;
  durationLabel: string;
  durationTimeRange: string;
  isRecorded: boolean;
}

export interface MeetingAttendanceData {
  todaysMeeting: TodaysMeeting;
  monthFilterValue: string;
  statusFilterValue: string;
  meetingHistory: MeetingHistoryItem[];
  noteText: string;
}

export interface StartMeetingResult {
  meetingId: string;
  meetingCode?: string;
  meetingUrl?: string;
  startedAt: string;
  workspaceRequired?: boolean;
  message?: string;
}
