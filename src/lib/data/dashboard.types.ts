import type { TimelineStep } from "../../components/ui/ReportTimeline";

export interface DashboardStatSummary {
  label: string;
  value: string;
  subLabel: string;
  actionLabel: string;
}

export type DashboardNotificationType = "submitted" | "meeting" | "attendance";

export interface DashboardNotification {
  id: string;
  type: DashboardNotificationType;
  message: string;
  time: string;
}

export interface DashboardData {
  username: string;
  dateLabel: string;
  dayTimeLabel: string;
  unreadCount: number;
  arStatus: DashboardStatSummary;
  dtrSummary: DashboardStatSummary;
  attendanceSummary: DashboardStatSummary;
  meetingSummary: DashboardStatSummary;
  reportPeriodLabel: string;
  reportSubmittedLabel: string;
  reportStatusMessage: string;
  reportSteps: TimelineStep[];
  notifications: DashboardNotification[];
  meetingSessionTitle: string;
  meetingSessionTimeLabel: string;
  meetingProofTimeLabel: string;
  reminders: string[];
}
