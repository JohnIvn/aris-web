import { isDemoMode } from "@/services/dataSource";

export default function DataModeNotice() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 flex items-center gap-2 text-[11px] font-medium"
      style={{ color: isDemoMode ? "#996515" : "#2f7043" }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: isDemoMode ? "#d99a2b" : "#3a7d4e" }}
      />
      {isDemoMode ? "Demo data mode" : "API mode"}
    </div>
  );
}