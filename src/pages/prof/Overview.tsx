import { useNavigate } from "react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { BRAND, BRAND_DARK } from "@/config/navigation";
import { Card, PageTitle, PrimaryButton, Badge } from "@/components/ui";

const trend = [
  { m: "Apr", v: 4 }, { m: "May", v: 6 }, { m: "Jun", v: 5 }, { m: "Jul", v: 8 }, { m: "Aug", v: 7 }, { m: "Sep", v: 9 },
];

const recent = [
  { type: "AR", label: "September Cycle 1 · 18 outputs", time: "2 hours ago", status: "Approved" as const },
  { type: "DTR", label: "September Cycle 1 · 22 days", time: "2 hours ago", status: "Pending" as const },
  { type: "AR", label: "August Cycle 2 · 16 outputs", time: "2 weeks ago", status: "Approved" as const },
  { type: "DTR", label: "August Cycle 2 · 21 days", time: "2 weeks ago", status: "Rejected" as const },
];

const statusTone = { Approved: "green", Pending: "amber", Rejected: "red" } as const;

export default function ProfOverview() {
  const navigate = useNavigate();
  return (
    <div className="pb-2">
      <PageTitle title="Overview" subtitle="Your AR / DTR submissions at a glance." action={<PrimaryButton onClick={() => navigate("/prof/submit")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>New Submission</PrimaryButton>} />

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ["My Submissions", "39", "green", "+3 this cycle"],
          ["On-time Rate", "92%", "green", "+4.0%"],
          ["Approved", "34", "green", "87%"],
          ["Pending Review", "2", "amber", "awaiting HR"],
        ].map(([l, v, tone, d]) => (
          <Card key={l} className="py-4">
            <p className="text-[12px]" style={{ color: "#8fa394" }}>{l}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-[24px] font-bold tracking-tight" style={{ color: "#111c14" }}>{v}</p>
              <Badge tone={tone as "green" | "amber"}>{d}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 items-start">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>Submission activity</p>
              <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>Records submitted over the last 6 months</p>
            </div>
            <Badge tone="green" dot>On track</Badge>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8fa394" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1ef", fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke={BRAND} strokeWidth={2.5} fill="url(#pg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card style={{ background: BRAND_DARK }}>
            <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#5f8c6c" }}>Next deadline</p>
            <p className="text-[22px] font-bold tracking-tight mt-1.5" style={{ color: "#fff" }}>Friday · 5:00 PM</p>
            <p className="text-[12.5px] mt-1" style={{ color: "#7aaa86" }}>September Cycle 1 — AR & DTR</p>
          </Card>
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>Recent submissions</p>
            <div className="space-y-3">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold w-8" style={{ color: r.type === "DTR" ? BRAND : "#3f8ecc" }}>{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] truncate" style={{ color: "#3d4a41" }}>{r.label}</p>
                    <p className="text-[11px]" style={{ color: "#8fa394" }}>{r.time}</p>
                  </div>
                  <Badge tone={statusTone[r.status]} dot>{r.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
