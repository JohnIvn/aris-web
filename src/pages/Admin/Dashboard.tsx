import { useState } from "react";
import { LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { BRAND } from "@/config/navigation";
import { Card, CardHeader } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

const enrollTrend = [22, 30, 26, 38, 33, 45, 40, 52, 48, 58, 54, 63].map((v, i) => ({ i, v }));
const payrollArea = [
  { m: "FEB", v: 30 }, { m: "MAR", v: 45 }, { m: "APR", v: 38 },
  { m: "MAY", v: 60 }, { m: "JUN", v: 52 }, { m: "JUL", v: 72 },
];
const radarData = [
  { axis: "Logins", a: 90, b: 70 }, { axis: "Grading", a: 65, b: 80 },
  { axis: "Payroll", a: 55, b: 40 }, { axis: "Enrollment", a: 80, b: 60 },
  { axis: "Reports", a: 45, b: 75 }, { axis: "Approvals", a: 70, b: 50 },
];
const programs = [
  { name: "College of Engineering", value: "1,204", delta: "+4.5%", up: true },
  { name: "College of Business", value: "986", delta: "+2.8%", up: true },
  { name: "Arts & Sciences", value: "742", delta: "-1.2%", up: false },
];
const departments = [
  { name: "Engineering", pct: "28%", total: "128", dot: BRAND },
  { name: "Business", pct: "23%", total: "96", dot: "#d99a2b" },
  { name: "Sciences", pct: "32%", total: "142", dot: "#3f8ecc" },
];
const demoDashboard = { enrollTrend, payrollArea, radarData, programs, departments };

function Delta({ v, up }: { v: string; up: boolean }) {
  return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: up ? "#eaf4ee" : "#fbecec", color: up ? "#2f7043" : "#c0392b" }}>{v}</span>
  );
}
function CardHead({ title, action }: { title: string; action: string }) {
  return (
    <CardHeader
      title={title}
      className="mb-3 items-center"
      action={<button className="text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-colors hover:bg-[#f4f6f5]" style={{ color: "#3d4a41", borderColor: "#e2e8e4" }}>{action}</button>}
    />
  );
}

export default function Dashboard() {
  const [range, setRange] = useState("1M");
  const { data } = useResource("/dashboard", demoDashboard);
  const { enrollTrend: enrollmentData, payrollArea: payrollData, radarData: activityData, programs: programData, departments: departmentData } = data;
  return (
    <div className="grid auto-rows-[minmax(16rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {/* Enrollment */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Total Enrollment" action="Report" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>4,821</p>
          <Delta v="+3.2%" up />
        </div>
        <div className="flex gap-1 mt-3 p-0.5 rounded-lg w-fit" style={{ background: "#f4f6f5" }}>
          {["1W", "1M", "1S", "1Y"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors" style={{ background: range === r ? "#fff" : "transparent", color: range === r ? "#111c14" : "#8fa394", boxShadow: range === r ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>{r}</button>
          ))}
        </div>
        <div className="flex-1 min-h-0 my-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrollmentData} margin={{ top: 6, right: 6, bottom: 0, left: 6 }}>
              <Line type="monotone" dataKey="v" stroke={BRAND} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {programData.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
              <span className="text-[12.5px] flex-1 truncate" style={{ color: "#3d4a41" }}>{p.name}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "#111c14" }}>{p.value}</span>
              <span className="text-[11px] font-medium w-12 text-right" style={{ color: p.up ? "#2f7043" : "#c0392b" }}>{p.up ? "↑" : "↓"} {p.delta}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Community */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Campus Community" action="Details" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>5,281</p>
          <Delta v="+0.9%" up />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 flex-1 content-start">
          {[{ label: "Students", pct: "91%" }, { label: "Faculty", pct: "6%" }, { label: "Staff", pct: "3%" }].map((d) => (
            <div key={d.label}>
              <p className="text-[12px]" style={{ color: "#8fa394" }}>{d.label}</p>
              <p className="text-[22px] font-bold leading-tight mt-1" style={{ color: "#111c14" }}>{d.pct}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-2">
          <div style={{ width: "91%", background: BRAND }} />
          <div style={{ width: "6%", background: "#3f8ecc" }} />
          <div style={{ width: "3%", background: "#d99a2b" }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 text-[11px] font-medium">
          <span style={{ color: "#2f7043" }}>↑ +0.4%</span>
          <span style={{ color: "#2f7043" }}>↑ +1.1%</span>
          <span style={{ color: "#c0392b" }}>↓ -0.6%</span>
        </div>
      </Card>

      {/* Payroll */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Payroll This Cycle" action="Details" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>₱2.4M</p>
          <Delta v="+2.1%" up />
        </div>
        <div className="space-y-2 mt-4">
          {[{ l: "Processed", v: "284", d: "+1.8%", up: true }, { l: "Pending", v: "42", d: "-1.2%", up: false }, { l: "Disbursed", v: "218", d: "+2.4%", up: true }].map((r) => (
            <div key={r.l} className="flex items-center">
              <span className="text-[12.5px] flex-1" style={{ color: "#5a6b5e" }}>{r.l}</span>
              <span className="text-[12.5px] font-semibold mr-3" style={{ color: "#111c14" }}>{r.v}</span>
              <span className="text-[11px] font-medium w-12 text-right" style={{ color: r.up ? "#2f7043" : "#c0392b" }}>{r.up ? "↑" : "↓"} {r.d}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 min-h-0 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payrollData} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={BRAND} strokeWidth={2.5} fill="url(#pg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] font-medium mt-1" style={{ color: "#b6c3ba" }}>
          {payrollData.map((p) => <span key={p.m}>{p.m}</span>)}
        </div>
      </Card>

      {/* Department load */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Department Load" action="Details" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>78%</p>
          <Delta v="-0.4%" up={false} />
        </div>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-4">
          <div style={{ width: "40%", background: BRAND }} />
          <div style={{ width: "35%", background: "#3f8ecc" }} />
          <div style={{ width: "25%", background: "#d99a2b" }} />
        </div>
        <div className="flex gap-4 mt-2.5 text-[11px]">
          {[["Academic", BRAND], ["Admin", "#3f8ecc"], ["Support", "#d99a2b"]].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}><span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}</span>
          ))}
        </div>
        <div className="mt-4 flex-1 min-h-0">
          <div className="flex text-[10px] uppercase tracking-wide font-semibold pb-2" style={{ color: "#b6c3ba" }}>
            <span className="flex-1">Department</span><span className="w-14 text-right">Share</span><span className="w-16 text-right">Faculty</span>
          </div>
          {departmentData.map((d) => (
            <div key={d.name} className="flex items-center py-1.5 text-[12.5px]">
              <span className="flex-1 flex items-center gap-2" style={{ color: "#3d4a41" }}><span className="w-2 h-2 rounded-full" style={{ background: d.dot }} />{d.name}</span>
              <span className="w-14 text-right" style={{ color: "#8fa394" }}>{d.pct}</span>
              <span className="w-16 text-right font-semibold" style={{ color: "#111c14" }}>{d.total}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Attendance Rate" action="Details" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>94%</p>
          <Delta v="+2.0%" up />
        </div>
        <div className="flex-1 min-h-0 mt-4 grid grid-rows-6 gap-1">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="grid grid-cols-12 gap-1">
              {Array.from({ length: 12 }).map((_, c) => {
                const t = ((Math.sin(r * 1.7 + c * 0.9) + 1) / 2) * 0.85 + 0.12;
                return <div key={c} className="rounded-[3px]" style={{ background: BRAND, opacity: t }} />;
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: "#8fa394" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          Last 12 weeks — updated 1:51 PM
        </div>
      </Card>

      {/* Weekly activity */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Weekly Activity" action="Details" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>16,008</p>
          <Delta v="+1.1%" up />
        </div>
        <div className="flex gap-4 mt-2 text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}><span className="w-2 h-2 rounded-full" style={{ background: BRAND }} />This week</span>
          <span className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}><span className="w-2 h-2 rounded-full" style={{ background: "#c9b04a" }} />Last week</span>
        </div>
        <div className="flex-1 min-h-0 -my-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={activityData} outerRadius="72%">
              <PolarGrid stroke="#e2e8e4" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#8fa394", fontSize: 10 }} />
              <Radar dataKey="b" stroke="#c9b04a" fill="#c9b04a" fillOpacity={0.12} strokeWidth={2} />
              <Radar dataKey="a" stroke={BRAND} fill={BRAND} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
