import { BRAND, BRAND_DARK } from "@/config/navigation";
import { Card, PageTitle, GhostButton, Badge } from "@/components/ui";

// Each submitted AR / DTR record carries a computed amount (units × rate).
// The system classifies that amount by the record's approval outcome.
const records = [
  { name: "Dr. Maria Santos", type: "DTR", period: "Sep 1–15", units: "22 days", rate: "₱2,150", amount: "₱47,300", status: "Approved" as const },
  { name: "Prof. Lito Cruz", type: "AR", period: "Sep 1–15", units: "18 outputs", rate: "₱1,800", amount: "₱32,400", status: "Approved" as const },
  { name: "James Reyes", type: "DTR", period: "Sep 1–15", units: "22 days", rate: "₱1,420", amount: "₱31,240", status: "Approved" as const },
  { name: "Ana Bautista", type: "DTR", period: "Sep 1–15", units: "20 days", rate: "₱1,380", amount: "₱27,600", status: "Pending" as const },
  { name: "Dr. Elena Reyes", type: "AR", period: "Sep 1–15", units: "15 outputs", rate: "₱2,000", amount: "₱30,000", status: "Approved" as const },
  { name: "Marco Dela Cruz", type: "DTR", period: "Sep 1–15", units: "21 days", rate: "₱1,150", amount: "₱24,150", status: "Pending" as const },
  { name: "Prof. Grace Lim", type: "AR", period: "Sep 1–15", units: "12 outputs", rate: "₱1,600", amount: "₱19,200", status: "Rejected" as const },
  { name: "Paolo Garcia", type: "DTR", period: "Sep 1–15", units: "22 days", rate: "₱1,300", amount: "₱28,600", status: "Approved" as const },
];

const statusTone = { Approved: "green", Pending: "amber", Rejected: "red" } as const;

const classes = [
  { label: "Accepted", note: "312 records", value: "₱2.15M", pct: 84, color: "#4a9d62" },
  { label: "Pending", note: "48 records", value: "₱0.33M", pct: 13, color: "#e0a63a" },
  { label: "Rejected", note: "12 records", value: "₱0.08M", pct: 3, color: "#d0674a" },
];

export default function Payroll() {
  return (
    <div className="pb-2">
      <PageTitle
        title="Payroll Computation"
        subtitle="Amounts calculated from submitted AR / DTR records, classified by approval outcome."
        action={<GhostButton><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Export</GhostButton>}
      />

      {/* Computation hero */}
      <Card className="mb-4" style={{ background: BRAND_DARK, boxShadow: "0 8px 24px rgba(13,26,16,0.18)" }}>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-shrink-0">
            <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#5f8c6c" }}>Payable Now · Accepted</p>
            <p className="text-[40px] font-bold leading-none tracking-tight mt-2" style={{ color: "#fff" }}>₱2.15M</p>
            <p className="text-[12.5px] mt-2" style={{ color: "#7aaa86" }}>312 approved records · September Cycle 1</p>
            <div className="flex items-center gap-4 mt-4 text-[12.5px]">
              <span style={{ color: "#7aaa86" }}>Total computed <span className="font-semibold" style={{ color: "#cfe3d6" }}>₱2.56M</span></span>
              <span className="w-1 h-1 rounded-full" style={{ background: "#2c4433" }} />
              <span style={{ color: "#7aaa86" }}>Rejected excluded <span className="font-semibold" style={{ color: "#d0674a" }}>−₱0.08M</span></span>
            </div>
          </div>

          <div className="flex gap-8 flex-shrink-0">
            {classes.map((c) => (
              <div key={c.label}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <p className="text-[12px] font-medium" style={{ color: "#9cc0a7" }}>{c.label} Amount</p>
                </div>
                <p className="text-[22px] font-bold tracking-tight mt-1.5" style={{ color: "#fff" }}>{c.value}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: "#5f8c6c" }}>{c.note} · {c.pct}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-6">
          {classes.map((c) => <div key={c.label} style={{ width: `${c.pct}%`, background: c.color }} />)}
        </div>
      </Card>

      {/* Per-record computation, full width */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#eef1ef" }}>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Computed Records</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>September Cycle 1 · amount = units × rate · only accepted records count toward payable</p>
          </div>
          <button className="text-[12.5px] font-medium" style={{ color: BRAND }}>View all 372</button>
        </div>
        <div className="grid grid-cols-[2.2fr_0.7fr_1.1fr_1.2fr_1fr_1.2fr_1.2fr] gap-4 px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Employee</span><span>Type</span><span>Period</span><span>Units</span><span className="text-right">Rate</span><span className="text-right">Amount</span><span className="text-right">Class</span>
        </div>
        {records.map((r, i) => (
          <div key={i} className="grid grid-cols-[2.2fr_0.7fr_1.1fr_1.2fr_1fr_1.2fr_1.2fr] gap-4 items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa]" style={{ borderColor: "#f2f4f2" }}>
            <span className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{r.name}</span>
            <span className="text-[12px] font-semibold" style={{ color: r.type === "DTR" ? BRAND : "#3f8ecc" }}>{r.type}</span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{r.period}</span>
            <span className="text-[13px] tabular-nums" style={{ color: "#8fa394" }}>{r.units}</span>
            <span className="text-[13px] text-right tabular-nums" style={{ color: "#8fa394" }}>{r.rate}</span>
            <span className="text-[13px] font-semibold text-right tabular-nums" style={{ color: "#111c14" }}>{r.amount}</span>
            <span className="flex justify-end"><Badge tone={statusTone[r.status]} dot>{r.status === "Approved" ? "Accepted" : r.status === "Pending" ? "Pending" : "Rejected"}</Badge></span>
          </div>
        ))}
      </Card>
    </div>
  );
}
