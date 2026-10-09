import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, CartesianGrid,
} from "recharts";
import { BRAND } from "@/config/navigation";
import { Card, CardHeader, Badge, Avatar, StatCard, StatGrid, initialsColor } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

// ─── Data ────────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["All Departments", "College of Engineering", "College of Business", "Arts & Sciences"] as const;
type Dept = (typeof DEPARTMENTS)[number];

const reports = [
  { id: "r01", dept: "College of Engineering", teacher: "Prof. Lito Cruz",    init: "LC", subject: "IT101",   subjectFull: "Intro to Computing",  date: "Sep 16", topic: "Flowcharts and Pseudocode",   activity: "Login system flowchart exercise.",          status: "Aligned" },
  { id: "r02", dept: "College of Engineering", teacher: "Dr. Maria Santos",   init: "MS", subject: "CS102",   subjectFull: "Web Development",     date: "Sep 16", topic: "Introduction to HTML tags",   activity: "Basic webpage creation using Notepad.",     status: "Not Aligned", notes: "Curriculum specifies CSS introduction this week." },
  { id: "r03", dept: "College of Engineering", teacher: "James Reyes",        init: "JR", subject: "CS301",   subjectFull: "Data Structures",     date: "Sep 15", topic: "Arrays and Pointers",         activity: "C++ dynamic arrays implementation.",        status: "Under Review", notes: "Topic is advanced for week 2." },
  { id: "r04", dept: "College of Engineering", teacher: "Dr. Nestor Villar",  init: "NV", subject: "CS102",   subjectFull: "Web Development",     date: "Sep 14", topic: "CSS Flexbox Layout",          activity: "Responsive card grid design exercise.",     status: "Aligned" },
  { id: "r05", dept: "College of Business",    teacher: "Prof. Grace Lim",    init: "GL", subject: "BUS101",  subjectFull: "Business Comm",       date: "Sep 16", topic: "Public Speaking",             activity: "Impromptu speech delivery.",                status: "Aligned" },
  { id: "r06", dept: "College of Business",    teacher: "Ana Bautista",       init: "AB", subject: "MKT201",  subjectFull: "Marketing Principles", date: "Sep 15", topic: "Market Segmentation",        activity: "Case study: Jollibee vs McDonald's.",      status: "Aligned" },
  { id: "r07", dept: "College of Business",    teacher: "Paolo Garcia",       init: "PG", subject: "FIN301",  subjectFull: "Financial Mgt",       date: "Sep 14", topic: "Time Value of Money",         activity: "Compound interest worksheet.",              status: "Not Aligned", notes: "Curriculum calls for ratio analysis this week." },
  { id: "r08", dept: "College of Business",    teacher: "Rina Torres",        init: "RT", subject: "BUS101",  subjectFull: "Business Comm",       date: "Sep 13", topic: "Memo and Report Writing",     activity: "Draft a formal business memo.",             status: "Aligned" },
  { id: "r09", dept: "Arts & Sciences",        teacher: "Dr. Elena Reyes",    init: "ER", subject: "MATH201", subjectFull: "Discrete Math",       date: "Sep 16", topic: "Set Theory",                  activity: "Venn diagram exercises in groups.",         status: "Aligned" },
  { id: "r10", dept: "Arts & Sciences",        teacher: "Prof. Carla Ramos",  init: "CR", subject: "ENG101",  subjectFull: "Comm Skills",         date: "Sep 15", topic: "Essay Structure",             activity: "Write a 5-paragraph argumentative essay.",  status: "Aligned" },
  { id: "r11", dept: "Arts & Sciences",        teacher: "Marco Dela Cruz",    init: "MD", subject: "SCI101",  subjectFull: "Natural Science",     date: "Sep 14", topic: "Cell Biology",                activity: "Microscope lab: observe plant cells.",      status: "Under Review", notes: "Sequence does not match semester plan." },
  { id: "r12", dept: "Arts & Sciences",        teacher: "Prof. Lito Cruz",    init: "LC", subject: "PHIL101", subjectFull: "Philosophy",          date: "Sep 13", topic: "Ethics and Morality",         activity: "Socratic seminar on trolley problem.",      status: "Aligned" },
];

// Weekly trend — per department
const weeklyAll    = [{ wk:"Wk 1",aligned:18,notAligned:4,review:2 },{ wk:"Wk 2",aligned:22,notAligned:3,review:4 },{ wk:"Wk 3",aligned:17,notAligned:5,review:2 },{ wk:"Wk 4",aligned:25,notAligned:4,review:4 },{ wk:"Wk 5",aligned:24,notAligned:2,review:1 }];
const weeklyEng    = [{ wk:"Wk 1",aligned:6, notAligned:2,review:1 },{ wk:"Wk 2",aligned:8, notAligned:1,review:2 },{ wk:"Wk 3",aligned:5, notAligned:3,review:1 },{ wk:"Wk 4",aligned:9, notAligned:2,review:2 },{ wk:"Wk 5",aligned:8, notAligned:1,review:0 }];
const weeklyBus    = [{ wk:"Wk 1",aligned:7, notAligned:1,review:1 },{ wk:"Wk 2",aligned:9, notAligned:1,review:1 },{ wk:"Wk 3",aligned:6, notAligned:1,review:0 },{ wk:"Wk 4",aligned:10,notAligned:1,review:1 },{ wk:"Wk 5",aligned:10,notAligned:0,review:0 }];
const weeklyArts   = [{ wk:"Wk 1",aligned:5, notAligned:1,review:0 },{ wk:"Wk 2",aligned:5, notAligned:1,review:1 },{ wk:"Wk 3",aligned:6, notAligned:1,review:1 },{ wk:"Wk 4",aligned:6, notAligned:1,review:1 },{ wk:"Wk 5",aligned:6, notAligned:1,review:1 }];
const weeklyByDept: Record<Dept, typeof weeklyAll> = {
  "All Departments":       weeklyAll,
  "College of Engineering":weeklyEng,
  "College of Business":   weeklyBus,
  "Arts & Sciences":       weeklyArts,
};

// Dept overview cards
const deptMeta = [
  { dept: "College of Engineering", short: "Engineering", color: BRAND,     reports: 4, aligned: 2, notAligned: 1, review: 1, score: 62 },
  { dept: "College of Business",    short: "Business",    color: "#3f8ecc", reports: 4, aligned: 3, notAligned: 1, review: 0, score: 87 },
  { dept: "Arts & Sciences",        short: "Arts & Sci",  color: "#8a63c4", reports: 4, aligned: 3, notAligned: 0, review: 1, score: 82 },
];
const demoCurriculum = { reports, weeklyByDept, deptMeta };

// ─── Constants ───────────────────────────────────────────────────────────────

const C_ALIGNED = "#3a7d4e";
const C_BAD     = "#e05252";
const C_REVIEW  = "#d99a2b";
const DEPT_COLORS: Record<string, string> = {
  "College of Engineering": BRAND,
  "College of Business":    "#3f8ecc",
  "Arts & Sciences":        "#8a63c4",
};

const STATUS_META: Record<string, { tone: "green" | "red" | "amber" }> = {
  "Aligned":      { tone: "green" },
  "Not Aligned":  { tone: "red"   },
  "Under Review": { tone: "amber" },
};
const ALIGNMENT_TABS = ["All", "Aligned", "Not Aligned", "Under Review"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ChartTipEntry = { name?: string; color?: string; fill?: string; value?: string | number };
type ChartTipProps = { active?: boolean; payload?: ChartTipEntry[]; label?: string | number };

function ChartTip({ active, payload, label }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg px-3 py-2 text-[12px]" style={{ borderColor: "#e2e8e4" }}>
      {label && <p className="font-semibold mb-1" style={{ color: "#111c14" }}>{label}</p>}
      {payload.map((p, index) => (
        <p key={p.name ?? index} style={{ color: p.color ?? p.fill }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

function CardHead({ title, sub }: { title: string; sub?: string }) {
  return <CardHeader title={title} description={sub} className="mb-3" />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Curriculum() {
  const { data } = useResource("/curriculum", demoCurriculum);
  const { reports: reportData, weeklyByDept: weeklyData, deptMeta: departmentData } = data;
  const [dept, setDept]       = useState<Dept>("All Departments");
  const [statusTab, setStatusTab] = useState<(typeof ALIGNMENT_TABS)[number]>("All");
  const [search, setSearch]   = useState("");

  const deptReports = dept === "All Departments" ? reportData : reportData.filter((r) => r.dept === dept);
  const total    = deptReports.length;
  const aligned  = deptReports.filter((r) => r.status === "Aligned").length;
  const bad      = deptReports.filter((r) => r.status === "Not Aligned").length;
  const review   = deptReports.filter((r) => r.status === "Under Review").length;
  const pct      = total ? Math.round((aligned / total) * 100) : 0;

  const pieData = [
    { name: "Aligned",      value: aligned, color: C_ALIGNED },
    { name: "Not Aligned",  value: bad,     color: C_BAD },
    { name: "Under Review", value: review,  color: C_REVIEW },
  ];

  // Subjects in current dept for bar chart
  const subjectSet = [...new Set(deptReports.map((r) => r.subject))];
  const bySubject = subjectSet.map((s) => {
    const sub = deptReports.filter((r) => r.subject === s);
    return {
      s,
      aligned:    sub.filter((r) => r.status === "Aligned").length,
      notAligned: sub.filter((r) => r.status === "Not Aligned").length,
      review:     sub.filter((r) => r.status === "Under Review").length,
    };
  });

  // Teachers in current dept for score bars
  const teacherSet = [...new Map(deptReports.map((r) => [r.init, r])).values()];
  const teacherScores = teacherSet.map((t) => {
    const mine = deptReports.filter((r) => r.init === t.init);
    const score = mine.length ? Math.round((mine.filter((r) => r.status === "Aligned").length / mine.length) * 100) : 0;
    const col = score >= 80 ? C_ALIGNED : score >= 50 ? C_REVIEW : C_BAD;
    return { ...t, score, color: col };
  }).sort((a, b) => b.score - a.score);

  // Radar data
  const radarData = bySubject.map((s) => ({
    ax: s.s,
    score: s.aligned + s.notAligned + s.review
      ? Math.round((s.aligned / (s.aligned + s.notAligned + s.review)) * 100)
      : 0,
  }));

  const trend = weeklyData[dept];

  const filtered = deptReports.filter((r) => {
    const matchTab = statusTab === "All" || r.status === statusTab;
    const q = search.toLowerCase();
    const matchSearch = !q || r.teacher.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const activeDeptColor = dept === "All Departments" ? BRAND : DEPT_COLORS[dept] ?? BRAND;

  return (
    <div className="pb-8 space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#111c14" }}>Curriculum Tracker</h1>
          <p className="text-[13.5px] mt-0.5" style={{ color: "#8fa394" }}>Monitor AR topic reports against the standard curriculum across departments.</p>
        </div>
        <div className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white" style={{ background: activeDeptColor }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
          {pct}% Aligned — {dept === "All Departments" ? "All Depts" : dept.replace("College of ", "")}
        </div>
      </div>

      {/* ── Department selector tabs ── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DEPARTMENTS.map((d) => {
          const isActive = dept === d;
          const dc = d === "All Departments" ? "#5a6b5e" : DEPT_COLORS[d];
          const meta = departmentData.find((m) => m.dept === d);
          return (
            <button
              key={d}
              onClick={() => setDept(d)}
              className="flex min-w-0 items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-left transition-all"
              style={{
                background: isActive ? dc + "12" : "#fff",
                borderColor: isActive ? dc : "#e2e8e4",
                boxShadow: isActive ? `0 0 0 1.5px ${dc}` : "none",
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isActive ? dc : "#d1ddd5" }} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold truncate" style={{ color: isActive ? dc : "#3d4a41" }}>
                  {d === "All Departments" ? "All Departments" : d.replace("College of ", "")}
                </p>
                {meta ? (
                  <p className="text-[11px] mt-0.5" style={{ color: "#8fa394" }}>
                    {meta.score}% aligned · {meta.reports} reports
                  </p>
                ) : (
                  <p className="text-[11px] mt-0.5" style={{ color: "#8fa394" }}>
                    {reportData.length} reports · {pct}% aligned
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── KPI row ── */}
      <StatGrid>
        {[
          { label: "Total Reports", value: total, color: "#5a6b5e" },
          { label: "Aligned", value: aligned, color: C_ALIGNED },
          { label: "Not Aligned", value: bad, color: C_BAD },
          { label: "Under Review", value: review, color: C_REVIEW },
        ].map(({ label, value, color }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            valueColor={color}
            footer={<div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#f0f2f0" }}><div className="h-full rounded-full" style={{ width: `${total ? (value / total) * 100 : 0}%`, background: color }} /></div>}
          />
        ))}
      </StatGrid>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" style={{ minHeight: 220 }}>

        {/* Donut */}
        <Card className="flex flex-col">
          <CardHead title="Alignment Breakdown" sub={`${total} reports in ${dept === "All Departments" ? "all departments" : dept.replace("College of ", "")}`} />
          <div className="flex flex-1 min-h-0 gap-4 items-center">
            <div className="flex-1 min-w-0" style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius="56%" outerRadius="84%" paddingAngle={3} strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-shrink-0 w-28">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[11.5px] flex-1" style={{ color: "#5a6b5e" }}>{d.name}</span>
                  <span className="text-[13px] font-bold" style={{ color: "#111c14" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar by subject */}
        <Card className="flex flex-col">
          <CardHead title="By Subject" sub="Aligned vs. not aligned per course" />
          <div className="flex-1 min-h-0" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} barSize={7} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f0" vertical={false} />
                <XAxis dataKey="s" tick={{ fontSize: 10, fill: "#8fa394" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8fa394" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="aligned"    name="Aligned"      fill={C_ALIGNED} radius={[4,4,0,0]} />
                <Bar dataKey="notAligned" name="Not Aligned"  fill={C_BAD}     radius={[4,4,0,0]} />
                <Bar dataKey="review"     name="Under Review" fill={C_REVIEW}  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Area weekly trend */}
        <Card className="flex flex-col">
          <CardHead title="Weekly Trend" sub="Alignment over 5 weeks" />
          <div className="flex-1 min-h-0" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C_ALIGNED} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C_ALIGNED} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C_BAD} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={C_BAD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f0" vertical={false} />
                <XAxis dataKey="wk" tick={{ fontSize: 10, fill: "#8fa394" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8fa394" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="aligned"    name="Aligned"      stroke={C_ALIGNED} fill="url(#ga)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="notAligned" name="Not Aligned"  stroke={C_BAD}     fill="url(#gb)" strokeWidth={2}   dot={false} />
                <Area type="monotone" dataKey="review"     name="Under Review" stroke={C_REVIEW}  fill="none"     strokeWidth={2}   dot={false} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Second row: radar + teacher scores ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="flex flex-col">
          <CardHead title="Subject Health Radar" sub="Alignment score per course" />
          <div className="flex-1 min-h-[160px]">
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#e2e8e4" />
                  <PolarAngleAxis dataKey="ax" tick={{ fill: "#8fa394", fontSize: 10 }} />
                  <Radar dataKey="score" name="Alignment %" stroke={activeDeptColor} fill={activeDeptColor} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<ChartTip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[12px]" style={{ color: "#8fa394" }}>
                Not enough subjects for radar
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHead title="Teacher Alignment Score" sub="Based on submitted reports this cycle" />
          <div className="space-y-3 mt-1">
            {teacherScores.map((t, i) => (
              <div key={t.init} className="flex items-center gap-3">
                <Avatar initials={t.init} color={initialsColor(i)} size={26} />
                <div className="w-40 flex-shrink-0">
                  <p className="text-[12.5px] font-medium truncate" style={{ color: "#111c14" }}>{t.teacher}</p>
                  <p className="text-[11px]" style={{ color: "#8fa394" }}>{t.dept.replace("College of ", "")}</p>
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f0f2f0" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.score}%`, background: t.color }} />
                </div>
                <span className="text-[12px] font-bold w-9 text-right" style={{ color: t.color }}>{t.score}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Department summary strip (only when All Depts selected) ── */}
      {dept === "All Departments" && (
        <div className="grid grid-cols-3 gap-3">
          {departmentData.map((d) => (
            <button
              key={d.dept}
              onClick={() => setDept(d.dept as Dept)}
              className="text-left p-4 rounded-2xl border transition-all hover:shadow-md"
              style={{ background: d.color + "08", borderColor: d.color + "40" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>{d.short}</p>
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: d.color + "20", color: d.color }}>{d.score}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["Aligned", d.aligned, C_ALIGNED], ["Not Aligned", d.notAligned, C_BAD], ["Review", d.review, C_REVIEW]].map(([l, v, c]) => (
                  <div key={l as string}>
                    <p className="text-[18px] font-bold leading-tight" style={{ color: c as string }}>{v as number}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: "#8fa394" }}>{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#f0f2f0" }}>
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Reports table ── */}
      <Card className="p-0 overflow-x-auto">
        <div className="flex flex-col gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: "#eef1ef" }}>
          <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: "#f0f2f0" }}>
            {ALIGNMENT_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setStatusTab(t)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: statusTab === t ? "#fff" : "transparent",
                  color: statusTab === t ? "#111c14" : "#8fa394",
                  boxShadow: statusTab === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white border" style={{ borderColor: "#e2e8e4" }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#8fa394" strokeWidth="1.6" className="w-4 h-4 flex-shrink-0"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3 3" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teacher, subject, topic…"
              className="bg-transparent outline-none text-[13px] w-52"
              style={{ color: "#111c14" }}
            />
          </div>
        </div>

        <div
          className="grid min-w-[900px] px-5 py-2.5 text-[10.5px] uppercase tracking-wider font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa", gridTemplateColumns: "1.5fr 0.9fr 1.3fr 1.5fr 2fr 1fr" }}
        >
          <span>Teacher</span>
          <span>Dept</span>
          <span>Subject · Date</span>
          <span>Topic Discussed</span>
          <span>Task / Activity Description</span>
          <span className="text-right">Alignment</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>No reports match your filter.</div>
        )}

        {filtered.map((r, i) => {
          const meta = STATUS_META[r.status];
          const dc = DEPT_COLORS[r.dept] ?? BRAND;
          return (
            <div
              key={r.id}
              className="grid min-w-[900px] items-start px-5 py-4 border-t transition-colors hover:bg-[#fafbfa]"
              style={{ borderColor: "#f2f4f2", gridTemplateColumns: "1.5fr 0.9fr 1.3fr 1.5fr 2fr 1fr" }}
            >
              <div className="flex items-center gap-2.5 min-w-0 pt-0.5">
                <Avatar initials={r.init} color={initialsColor(i)} size={28} />
                <span className="text-[13px] font-medium truncate" style={{ color: "#111c14" }}>{r.teacher}</span>
              </div>

              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: dc + "15", color: dc }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: dc }} />
                  {r.dept.replace("College of ", "")}
                </span>
              </div>

              <div className="pr-3 pt-0.5">
                <div className="text-[12.5px] font-semibold" style={{ color: BRAND }}>{r.subject}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: "#8fa394" }}>{r.subjectFull} · {r.date}</div>
              </div>

              <div className="pr-3 pt-0.5 text-[13px] leading-snug" style={{ color: "#3d4a41" }}>
                {r.topic}
              </div>

              <div className="pr-3 pt-0.5 text-[12.5px] leading-relaxed" style={{ color: "#5a6b5e" }}>
                {r.activity}
                {r.notes && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] px-2 py-1.5 rounded-lg" style={{ background: "#fdf3f2", color: "#c0392b", border: "1px solid #fbecec" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 mt-px"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                    {r.notes}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-0.5">
                <Badge tone={meta.tone} dot>{r.status}</Badge>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
