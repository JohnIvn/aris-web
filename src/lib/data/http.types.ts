export type ApiCallResponse<T = unknown> = {
  status?: string | null;
  ok: boolean;
  data: T | null;
  message?: string | null;
  error?: string | null;
  serverDown?: boolean;
};

export interface ServerDownEventDetail {
  endpoint: string;
  reason: "network" | "timeout";
  timestamp: number;
}
