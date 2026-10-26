import { useState } from "react";
import { useNavigate } from "react-router";
import { LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { BRAND } from "@/config/navigation";
import { Card, CardHeader } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

type Person = { department?: string | null; dept?: string | null; status?: string };
type PayrollItem = { amount?: string | number; status?: string };
type DashboardAudit = { action?: string; result?: string };
type DashboardTicket = { status?: string };
type CurriculumDepartment = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  professor_count?: number;
  staff_count?: number;
};

function Delta({ v, up }: { v: string; up: boolean }) {
  return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: up ? "#eaf4ee" : "#fbecec", color: up ? "#2f7043" : "#c0392b" }}>{v}</span>
  );
}
function CardHead({ title, action, onActionClick }: { title: string; action?: string; onActionClick?: () => void }) {
  return (
    <CardHeader
      title={title}
      titleColor={"#6B7A6F"}
      className="mb-3 items-center"
      action={action ? <button type="button" onClick={onActionClick} className="text-[12px] font-medium px-2.5 py-1 rounded-lg border transition-colors hover:bg-[#f4f6f5]" style={{ color: "#3d4a41", borderColor: "#e2e8e4" }}>{action}</button> : undefined}
    />
  );
}

const fallbackDepts: CurriculumDepartment[] = [
  { id: "1", code: "ENG", name: "Engineering", is_active: true },
  { id: "2", code: "CS", name: "Computer Science", is_active: true },
  { id: "3", code: "BUS", name: "Business", is_active: true },
  { id: "4", code: "SCI", name: "Sciences", is_active: true },
  { id: "5", code: "HUM", name: "Arts & Humanities", is_active: true },
];

export default function Dashboard() {
  const [range, setRange] = useState("1M");
  const navigate = useNavigate();
  const { data: rawProfessors } = useResource<Person[]>("/professors", []);
  const { data: rawStaff } = useResource<Person[]>("/staff", []);
  const { data: rawPayroll } = useResource<{ records?: PayrollItem[]; classes?: unknown[] }>("/payroll", { records: [], classes: [] });
  const { data: rawAnnouncements } = useResource<unknown[]>("/announcements", []);
  const { data: rawAudit } = useResource<DashboardAudit[] | { logs?: DashboardAudit[] }>("/audit", []);
  const { data: rawTickets } = useResource<DashboardTicket[]>("/support/tickets", []);
  const { data: curriculumDepartments } = useResource<CurriculumDepartment[]>("/curriculum/departments", fallbackDepts);

  const professors = Array.isArray(rawProfessors) ? rawProfessors : [];
  const staff = Array.isArray(rawStaff) ? rawStaff : [];
  const announcements = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];
  const auditLogs: DashboardAudit[] = Array.isArray(rawAudit)
    ? rawAudit
    : Array.isArray((rawAudit as { logs?: DashboardAudit[] })?.logs)
      ? (rawAudit as { logs: DashboardAudit[] }).logs
      : [];
  const tickets = Array.isArray(rawTickets) ? rawTickets : [];
  const payroll = rawPayroll && typeof rawPayroll === "object" ? rawPayroll : { records: [], classes: [] };

  const payrollRecords = payroll.records ?? [];
  const approvedPayroll = payrollRecords.filter((record) => record.status === "Approved");
  const pendingPayroll = payrollRecords.filter((record) => record.status === "Pending");
  const rejectedPayroll = payrollRecords.filter((record) => record.status === "Rejected");
  const totalPayroll = payrollRecords.reduce((total, record) => {
    const amount = typeof record.amount === "number" ? record.amount : Number(String(record.amount ?? "").replace(/[^\d.-]/g, ""));
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const formatAmount = (amount: number) => amount ? `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}` : "₱0";
  const enrollmentTotal = professors.length + staff.length;
  const enrollmentData = [professors.length, staff.length, announcements.length, auditLogs.length].map((v, i) => ({ i, v }));
  const payrollData = [
    { m: "TOTAL", v: totalPayroll },
    { m: "APPROVED", v: approvedPayroll.length },
    { m: "PENDING", v: pendingPayroll.length },
    { m: "REJECTED", v: rejectedPayroll.length },
  ];
  const activityData = [
    { axis: "Announcements", a: announcements.length, b: announcements.length },
    { axis: "Payroll", a: payrollRecords.length, b: approvedPayroll.length },
    { axis: "Audit", a: auditLogs.length, b: auditLogs.filter((log) => log.result === "Approved").length },
    { axis: "Tickets", a: tickets.length, b: tickets.filter((ticket) => ticket.status === "Open").length },
  ];
  const programData = [
    { name: "Professors", value: professors.length.toLocaleString(), delta: "", up: true },
    { name: "Staff", value: staff.length.toLocaleString(), delta: "", up: true },
    { name: "Announcements", value: announcements.length.toLocaleString(), delta: "", up: true },
  ];

  // Curriculum-based Department Load calculation
  const depts = Array.isArray(curriculumDepartments) && curriculumDepartments.length > 0
    ? curriculumDepartments
    : fallbackDepts;

  const facultyTotal = professors.length || 1;
  const palette = [BRAND, "#d99a2b", "#3f8ecc", "#8a63c4", "#c0563a", "#2b9c8a", "#1b4d3e"];

  const departmentData = depts.map((dept, index) => {
    // Check professor_count from curriculum or cross-reference professors data
    const count = dept.professor_count !== undefined && dept.professor_count !== null && dept.professor_count > 0
      ? dept.professor_count
      : professors.filter((p) => {
          const personDept = (p.department ?? p.dept ?? "").toLowerCase().trim();
          const targetName = dept.name.toLowerCase().trim();
          const targetCode = (dept.code || "").toLowerCase().trim();
          return personDept === targetName || (targetCode && personDept === targetCode);
        }).length;

    const pctNumber = Math.round((count / facultyTotal) * 100);
    return {
      name: dept.name,
      code: dept.code,
      count,
      pct: `${pctNumber}%`,
      pctNumber,
      total: String(count),
      dot: palette[index % palette.length],
      isActive: dept.is_active !== false,
    };
  });

  const totalAssignedFaculty = departmentData.reduce((acc, d) => acc + d.count, 0);
  const departmentLoadRate = facultyTotal > 0 ? Math.min(100, Math.round((totalAssignedFaculty / facultyTotal) * 100)) : 100;

  const submissionTotal = payrollRecords.length;
  const submissionRate = submissionTotal ? Math.round((approvedPayroll.length / submissionTotal) * 100) : 0;
  const openTickets = tickets.filter((ticket) => ticket.status === "Open").length;

  return (
    <div className="grid auto-rows-[minmax(16rem,auto)] grid-cols-1 gap-3 sm:grid-cols-3 2xl:grid-cols-3">
      {/* Enrollment */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Department Tracker" />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>{enrollmentTotal.toLocaleString()}</p>
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
              {p.delta && <span className="text-[11px] font-medium w-12 text-right" style={{ color: p.up ? "#2f7043" : "#c0392b" }}>{p.up ? "▲" : "▼"} {p.delta}</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Community */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Report Ratio" action="Details" onActionClick={() => navigate("/audit")} />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>{(professors.length + staff.length).toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 flex-1 content-start">
          {[{ label: "Professors", pct: `${enrollmentTotal ? Math.round((professors.length / enrollmentTotal) * 100) : 0}%` }, { label: "Staff", pct: `${enrollmentTotal ? Math.round((staff.length / enrollmentTotal) * 100) : 0}%` }, { label: "Tickets", pct: `${tickets.length}` }].map((d) => (
            <div key={d.label}>
              <p className="text-[12px]" style={{ color: "#8fa394" }}>{d.label}</p>
              <p className="text-[22px] font-bold leading-tight mt-1" style={{ color: "#111c14" }}>{d.pct}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-2">
          <div style={{ width: `${enrollmentTotal ? (professors.length / enrollmentTotal) * 100 : 0}%`, background: BRAND }} />
          <div style={{ width: `${enrollmentTotal ? (staff.length / enrollmentTotal) * 100 : 0}%`, background: "#3f8ecc" }} />
          <div style={{ width: `${enrollmentTotal ? (tickets.length / enrollmentTotal) * 100 : 0}%`, background: "#d99a2b" }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3 text-[11px] font-medium">
          <span style={{ color: "#2f7043" }}>{professors.length} professors</span>
          <span style={{ color: "#2f7043" }}>{staff.length} staff</span>
          <span style={{ color: "#2f7043" }}>{tickets.length} tickets</span>
        </div>
      </Card>

      {/* Payroll */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Payroll This Cycle" action="Details" onActionClick={() => navigate("/payroll")} />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>{formatAmount(totalPayroll)}</p>
        </div>
        <div className="space-y-2 mt-4">
          {[{ l: "Processed", v: approvedPayroll.length }, { l: "Pending", v: pendingPayroll.length }, { l: "Rejected", v: rejectedPayroll.length }].map((r) => (
            <div key={r.l} className="flex items-center">
              <span className="text-[12.5px] flex-1" style={{ color: "#5a6b5e" }}>{r.l}</span>
              <span className="text-[12.5px] font-semibold mr-3" style={{ color: "#111c14" }}>{r.v}</span>
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

      {/* Department load (using Curriculum Data) */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Department Load" action="Manage" onActionClick={() => navigate("/curriculum")} />
        <div className="flex items-baseline gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>
            {departmentLoadRate}%
          </p>
          <span className="text-[12px]" style={{ color: "#8fa394" }}>
            {totalAssignedFaculty} faculty in {depts.length} colleges
          </span>
        </div>
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mt-4">
          {departmentData.map((department) => (
            <div
              key={department.name}
              style={{ width: department.pct, background: department.dot }}
              title={`${department.name}: ${department.total} faculty (${department.pct})`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px]">
          {departmentData.slice(0, 4).map((department) => (
            <span key={department.name} className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: department.dot }} />
              {department.name}
            </span>
          ))}
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto max-h-[160px]">
          <div className="flex text-[10px] uppercase tracking-wide font-semibold pb-2" style={{ color: "#b6c3ba" }}>
            <span className="flex-1">Department</span>
            <span className="w-14 text-right">Share</span>
            <span className="w-16 text-right">Faculty</span>
          </div>
          {departmentData.map((d) => (
            <div
              key={d.name}
              onClick={() => navigate("/curriculum")}
              className="flex items-center py-1.5 text-[12.5px] hover:bg-[#fafbfa] rounded-lg px-1 transition-colors cursor-pointer"
            >
              <span className="flex-1 flex items-center gap-2 truncate" style={{ color: "#3d4a41" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.dot }} />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="w-14 text-right" style={{ color: "#8fa394" }}>{d.pct}</span>
              <span className="w-16 text-right font-semibold" style={{ color: "#111c14" }}>{d.total}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance / Submission */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Submission Rate" action="Details" onActionClick={() => navigate("/audit")} />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>{submissionRate}%</p>
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
          {submissionTotal} payroll records · {openTickets} open tickets
        </div>
      </Card>

      {/* Weekly activity */}
      <Card className="flex flex-col min-h-0">
        <CardHead title="Weekly Activity" action="Details" onActionClick={() => navigate("/audit")} />
        <div className="flex items-center gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: "#111c14" }}>{auditLogs.length.toLocaleString()}</p>
        </div>
        <div className="flex gap-4 mt-2 text-[11px]">
          <span className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}><span className="w-2 h-2 rounded-full" style={{ background: BRAND }} />Audit activity</span>
          <span className="flex items-center gap-1.5" style={{ color: "#5a6b5e" }}><span className="w-2 h-2 rounded-full" style={{ background: "#c9b04a" }} />Announcements</span>
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
