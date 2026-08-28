export interface Toast {
  id: string;
  message: string;
  description?: string;
  type: "success" | "error" | "info";
}
