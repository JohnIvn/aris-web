export interface DtrRecord {
  id: string;
  date: string;
  day: string;
  timeIn: string;
  timeOut: string;
  hoursWorked: string;
  status: 'Present' | 'Late' | 'On Leave' | 'Holiday';
  remarks?: string;
}

export interface DtrSummary {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  onLeaveDays: number;
  hoursWorked: string;
}

export interface DtrData {
  summary: DtrSummary;
  records: DtrRecord[];
}
