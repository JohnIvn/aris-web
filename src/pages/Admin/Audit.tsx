import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import {
  Card,
  PageTitle,
  GhostButton,
  PrimaryButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  initialsColor,
  Modal,
  arTable,
  dtrTable,
  statusTone,
  SubmissionDetail,
  StatCard,
  StatGrid,
  type RecordKind,
  type RecordPayload,
  type StatusKind,
} from "@/components/ui";

export type ApprovalStage = {
  id: string;
  stage_key: string;
  label: string;
  stage_order: number;
  is_active: boolean;
  report_count?: number;
};

// Audit trail scoped to AR (Accomplishment Report) / DTR (Daily Time Record) submissions.
export type AuditLog = {
  id?: string;
  actor: string;
  init: string;
  type: RecordKind;
  action: string;
  target: string;
  time: string;
  result: StatusKind;
  stage?: string;
  stage_order?: number;
  payroll_availability?: boolean;
  payroll_received?: boolean;
  record: RecordPayload;
};

export type AuditApiResponse = {
  logs: AuditLog[];
  stats?: {
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
    flagged: number;
    missing: number;
  };
  stages?: ApprovalStage[];
};

const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const formatExportTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#e2e8e4] p-3 text-[12px] space-y-1">
        <p className="font-bold text-[#111c14] border-b border-[#eef1ef] pb-1">
          {data.name} ({label})
        </p>
        <p className="text-[#2f7043] flex items-center justify-between gap-4">
          <span>Accomplishment Reports:</span>
          <span className="font-semibold">{data.ar}</span>
        </p>
        <p className="text-[#2b6ca3] flex items-center justify-between gap-4">
          <span>DTR Records:</span>
          <span className="font-semibold">{data.dtr}</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-[#e2e8e4] p-2.5 text-[12px]">
        <p className="font-bold text-[#111c14]">{data.name}</p>
        <p className="text-[#5a6b5e] mt-0.5">
          <span className="font-semibold text-[#111c14]">{data.value} records</span>
        </p>
      </div>
    );
  }
  return null;
}

const demoAuditLogs: AuditLog[] = [
  {
    actor: "Dr. Maria Santos",
    init: "MS",
    type: "AR",
    action: "AR submitted",
    target: "Sep Cycle 1 · 18 outputs",
    time: "12:41 PM",
    result: "Submitted",
    stage: "Pending",
    stage_order: 1,
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0142",
      facultyName: "Dr. Maria Santos",
      facultyNumber: "214",
      college: "College of Engineering",
      tables: [
        arTable("CS 102 — WEB DEVELOPMENT", "September 1–12, 2026", [
          ["CS 102", "BSIT 3A", 3, "Monday", "7:00AM–10:00AM", "CONGRESS"],
          ["CS 102", "BSIT 3B", 3, "Tuesday", "1:00PM–4:00PM", "CONGRESS"],
          ["CS 301", "BSCS 3A", 3, "Thursday", "8:00AM–11:00AM", "CONGRESS"],
        ]),
      ],
      topics: "a) HTML document structure\nb) Semantic tags and accessibility",
      tasks:
        "a) Discussed semantic elements and their use.\nb) Hands-on activity: build a personal profile page.\nc) Uploaded reference materials to G-Class.",
      notes: "Class suspended on September 8 due to typhoon; make-up session held on September 12.",
      attachment: "AR_Santos_SepCycle1.pdf · 1.2 MB",
      reviewer: "Department Chairperson",
      reviewedAt: "September 17, 2026 · 12:41 PM",
      remark: "Received and queued for Department validation.",
    },
  },
  {
    actor: "Ana Bautista (HR)",
    init: "AB",
    type: "AR",
    action: "AR rejected by HR",
    target: "Missing output attachments",
    time: "12:19 PM",
    result: "Rejected",
    stage: "HR",
    stage_order: 3,
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0917-0138",
      facultyName: "Marco Dela Cruz",
      facultyNumber: "342",
      college: "Arts & Sciences",
      tables: [
        arTable("GE 101 — UNDERSTANDING THE SELF", "September 2–11, 2026", [
          ["GE 101", "BSIT 1A", 3, "Wednesday", "9:00AM–12:00PM", "CONGRESS"],
        ]),
      ],
      topics: "a) The self from a philosophical perspective",
      tasks: "a) Lecture and small-group discussion.\nb) Reflection paper assigned and collected.",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 12:19 PM",
      remark: "Returned to faculty. No output attachments were included for the September 11 session.",
    },
  },
  {
    actor: "James Reyes",
    init: "JR",
    type: "DTR",
    action: "DTR flagged · wrong name",
    target: "Name mismatch vs. roster",
    time: "11:58 AM",
    result: "Flagged",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0917-0121",
      facultyName: "James Reyes",
      facultyNumber: "301",
      college: "College of Engineering",
      tables: [
        dtrTable("DTR — September 1–15, 2026", "22 days logged", [
          ["Sep 01", "7:52 AM", "5:04 PM", 8.2],
          ["Sep 02", "8:31 AM", "5:10 PM", 7.7],
          ["Sep 03", "7:45 AM", "5:00 PM", 8.3],
        ]),
      ],
      attachment: "DTR_Reyes_SepCycle1.xlsx · 84 KB",
      reviewer: "HR Office — Ana Bautista",
      reviewedAt: "September 17, 2026 · 11:58 AM",
      remark: "Biometric entry “J. Reyes” does not match the roster entry “James R. Reyes”. Awaiting HR confirmation.",
    },
  },
];

export default function Audit() {
  const { data: rawData, loading, error, reload } = useResource<AuditApiResponse | AuditLog[]>(
    "/audit",
    demoAuditLogs,
  );

  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "AR" | "DTR">("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [selected, setSelected] = useState<{
    log: AuditLog;
    idx: number;
  } | null>(null);

  // Normalize data from either array or enveloped response
  const logs: AuditLog[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray((rawData as AuditApiResponse).logs)) {
      return (rawData as AuditApiResponse).logs;
    }
    return demoAuditLogs;
  }, [rawData]);

  const stages: ApprovalStage[] = useMemo(() => {
    if (rawData && !Array.isArray(rawData) && Array.isArray((rawData as AuditApiResponse).stages)) {
      return (rawData as AuditApiResponse).stages || [];
    }
    return [
      { id: "1", stage_key: "AR-AP-STG-1", label: "Pending", stage_order: 1, is_active: true },
      { id: "2", stage_key: "AR-AP-STG-2", label: "Department", stage_order: 2, is_active: true },
      { id: "3", stage_key: "AR-AP-STG-3", label: "HR", stage_order: 3, is_active: true },
      { id: "4", stage_key: "AR-AP-STG-4", label: "Accounting", stage_order: 4, is_active: true },
    ];
  }, [rawData]);

  const tabs = [
    "All",
    "Submitted",
    "Approved",
    "Pending",
    "Rejected",
    "Flagged",
    "Missing",
  ];

  const typeTabs = ["All", "AR", "DTR"];

  const normalizedSearch = search.trim().toLowerCase();

  const rows = useMemo(() => {
    return logs.filter((l) => {
      const matchesTab = tab === "All" || l.result === tab;
      const matchesType = typeFilter === "All" || l.type === typeFilter;
      const matchesStage =
        stageFilter === "All" || (l.stage && l.stage.toLowerCase() === stageFilter.toLowerCase());

      const matchesSearch =
        !normalizedSearch ||
        [l.actor, l.action, l.target, l.record.reference, l.record.college, l.stage || ""]
          .some((val) => val.toLowerCase().includes(normalizedSearch));

      return matchesTab && matchesType && matchesStage && matchesSearch;
    });
  }, [logs, tab, typeFilter, stageFilter, normalizedSearch]);

  const count = (r: string) => logs.filter((l) => l.result === r).length;

  const stats = [
    ["Total Submissions", String(logs.length)],
    ["Approved / Released", String(count("Approved"))],
    ["Pending / Submitted", String(count("Pending") + count("Submitted"))],
    ["Flagged / Overdue", String(count("Flagged") + count("Missing"))],
  ];

  // --- CHART 1: Pipeline across Stages ---
  const stageChartData = useMemo(() => {
    return stages.map((stg) => {
      const arCount = logs.filter(
        (l) => l.type === "AR" && l.stage && l.stage.toLowerCase() === stg.label.toLowerCase(),
      ).length;
      const dtrCount = logs.filter(
        (l) => l.type === "DTR" && (stg.stage_order === 3 || stg.label === "HR"),
      ).length;
      return {
        name: stg.label,
        code: `Stage ${stg.stage_order}`,
        ar: arCount || stg.report_count || 0,
        dtr: stg.stage_order === 3 ? (dtrCount || 6) : 0,
      };
    });
  }, [stages, logs]);

  // --- CHART 2: Outcomes Distribution ---
  const outcomePalette: Record<string, string> = {
    Approved: BRAND,
    Submitted: "#3f8ecc",
    Pending: "#d99a2b",
    Flagged: "#e67e22",
    Rejected: "#c0392b",
    Missing: "#8fa394",
  };

  const outcomeChartData = useMemo(() => {
    const categories: StatusKind[] = ["Approved", "Submitted", "Pending", "Flagged", "Rejected", "Missing"];
    return categories
      .map((cat) => ({
        name: cat,
        value: logs.filter((l) => l.result === cat).length,
        color: outcomePalette[cat] || "#8fa394",
      }))
      .filter((entry) => entry.value > 0);
  }, [logs]);

  const totalOutcomeCount = useMemo(() => {
    return outcomeChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [outcomeChartData]);

  const exportRows = () => {
    const header = ["Actor", "Type", "Approval Stage", "Event", "Details", "Time", "Result", "Reference"];
    const body = rows.map((log) => [
      log.actor,
      log.type,
      log.stage || "—",
      log.action,
      log.target,
      formatExportTime(log.time),
      log.result,
      log.record.reference,
    ]);
    const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}\r\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aris-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setShowExportConfirm(false);
    setShowExportSuccess(true);
  };

  return (
    <div className="pb-2">
      <PageTitle
        title="Audit Logs"
        subtitle="Immutable trail of every AR (Accomplishment Report) & DTR submission, verified across approval stages."
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={reload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </GhostButton>
            <GhostButton onClick={() => setShowExportConfirm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </GhostButton>
          </div>
        }
      />

      {/* Confirm Export Modal */}
      <Modal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="Confirm Export"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowExportConfirm(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={exportRows}>Yes, Export ({rows.length} rows)</PrimaryButton>
          </>
        }
      >
        Are you sure you want to export the filtered audit log records to a CSV spreadsheet?
      </Modal>

      {/* Export Success Modal */}
      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export Successful"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        }
        actions={<PrimaryButton onClick={() => setShowExportSuccess(false)}>OK</PrimaryButton>}
      >
        The audit log records have been exported and downloaded.
      </Modal>

      {/* Submission Detail Modal on Row Click */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.log.type} Submission Detail · ${selected.log.record.reference}` : "Submission Detail"}
        size="lg"
        align="left"
        actions={<GhostButton onClick={() => setSelected(null)}>Close</GhostButton>}
      >
        {selected && (
          <SubmissionDetail
            record={selected.log.record}
            type={selected.log.type}
            status={selected.log.result}
            initials={selected.log.init}
            colorIndex={selected.idx}
            loggedAt={selected.log.time}
            event={`${selected.log.action} · ${selected.log.target}`}
          />
        )}
      </Modal>

      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      {/* --- VISUAL ANALYTICS & GRAPHS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Graph 1: Approval Pipeline & Submission Volume (Bar Chart) */}
        <Card className="flex flex-col min-h-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">Approval Pipeline &amp; Submissions</h2>
              <p className="text-[12px] text-[#8fa394]">Volume verified across official approval stages</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND }} /> AR Reports
              </span>
              <span className="flex items-center gap-1.5 text-[#3d4a41]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3f8ecc" }} /> DTR Attendance
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={{ stroke: "#eef1ef" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#8fa394", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="ar" fill={BRAND} radius={[5, 5, 0, 0]} maxBarSize={24} />
                <Bar dataKey="dtr" fill="#3f8ecc" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graph 2: Audit Outcomes & Compliance Distribution (Donut Chart) */}
        <Card className="flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111c14]">Audit Outcomes &amp; Compliance</h2>
              <p className="text-[12px] text-[#8fa394]">Status proportion across current cycle submissions</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-1/2 h-[190px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={outcomeChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {outcomeChartData.map((entry, index) => (
                      <Cell key={`outcome-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#111c14] leading-none">
                  {totalOutcomeCount}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[#8fa394] mt-0.5 font-semibold">
                  Records
                </span>
              </div>
            </div>
            <div className="w-full sm:w-1/2 space-y-2 pr-1">
              {outcomeChartData.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 truncate" style={{ color: "#3d4a41" }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="font-semibold text-[#111c14] ml-2 font-mono">
                    {r.value}{" "}
                    <span className="text-[#8fa394] text-[11px] font-normal">
                      ({totalOutcomeCount ? Math.round((r.value / totalOutcomeCount) * 100) : 0}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* --- TABLE CARD --- */}
      <Card className="p-0 overflow-x-auto">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#eef1ef" }}>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
            <Tabs tabs={typeTabs} value={typeFilter} onChange={(v) => setTypeFilter(v as any)} />

            {/* Approval Stage Selector */}
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-[11.5px] uppercase font-semibold text-[#8fa394]">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="text-[12px] font-medium py-1 px-2.5 rounded-lg border bg-white focus:outline-none"
                style={{ borderColor: "#e2e8e4", color: "#3d4a41" }}
              >
                <option value="All">All Stages</option>
                {stages.map((stg) => (
                  <option key={stg.id || stg.stage_key} value={stg.label}>
                    Stage {stg.stage_order}: {stg.label} {stg.report_count ? `(${stg.report_count})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <SearchInput placeholder="Search faculty, reference, stage..." value={search} onChange={setSearch} className="w-52 sm:w-64" />
          </div>
        </div>

        {/* Header Grid */}
        <div
          className="grid min-w-[980px] grid-cols-[1.8fr_0.9fr_1.8fr_1.8fr_0.9fr_1fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
          style={{ color: "#b6c3ba", background: "#fafbfa" }}
        >
          <span>Actor / Faculty</span>
          <span>Record Type</span>
          <span>Event &amp; Approval Stage</span>
          <span>Details &amp; Reference</span>
          <span>Time Logged</span>
          <span className="text-right">Result</span>
        </div>

        {loading && (
          <p className="p-5 text-[13px]" style={{ color: "#8fa394" }}>
            Loading audit logs from accomplishment reports and approval stages...
          </p>
        )}
        {error && (
          <p role="alert" className="p-5 text-[13px] text-red-700">
            {error}
          </p>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="p-5 text-[13px]" style={{ color: "#8fa394" }}>
            No audit logs found matching your criteria.
          </p>
        )}

        {rows.map((l, i) => (
          <button
            key={l.id ?? `${l.actor}-${l.time}-${i}`}
            type="button"
            onClick={() => setSelected({ log: l, idx: i })}
            title="Click to view full course outputs and submission breakdown"
            className="grid min-w-[980px] w-full text-left grid-cols-[1.8fr_0.9fr_1.8fr_1.8fr_0.9fr_1fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer"
            style={{ borderColor: "#f2f4f2" }}
          >
            {/* Actor */}
            <span className="flex items-center gap-2.5 min-w-0 pr-2">
              <Avatar
                initials={l.init}
                color={l.result === "Rejected" ? "#c0392b" : initialsColor(i)}
                size={32}
              />
              <div className="min-w-0">
                <span className="text-[13px] font-medium truncate block" style={{ color: "#111c14" }}>
                  {l.actor}
                </span>
                <span className="text-[11.5px] truncate block" style={{ color: "#8fa394" }}>
                  {l.record.college || "Faculty"}
                </span>
              </div>
            </span>

            {/* Type */}
            <span className="flex items-center gap-1.5">
              <span
                className="text-[11.5px] font-bold px-2 py-0.5 rounded"
                style={{
                  background: l.type === "DTR" ? "#eaf4ee" : "#e7f1fa",
                  color: l.type === "DTR" ? BRAND : "#2b6ca3",
                }}
              >
                {l.type}
              </span>
              <span className="text-[11px] text-[#8fa394] truncate">
                {l.type === "AR" ? `${l.record.tables.length} course(s)` : "Attendance"}
              </span>
            </span>

            {/* Event & Stage */}
            <div className="min-w-0 pr-2">
              <span className="text-[13px] font-medium truncate block" style={{ color: "#3d4a41" }}>
                {l.action}
              </span>
              {l.stage && (
                <span className="text-[11.5px] text-[#2b6ca3] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2b6ca3]" />
                  Stage: {l.stage} {l.payroll_availability ? "· Payroll Ready" : ""}
                </span>
              )}
            </div>

            {/* Details & Reference */}
            <div className="min-w-0 pr-2">
              <span className="text-[13px] truncate block" style={{ color: "#111c14" }}>
                {l.target}
              </span>
              <span className="text-[11.5px] font-mono text-[#8fa394] block mt-0.5">
                {l.record.reference}
              </span>
            </div>

            {/* Time */}
            <span className="text-[12.5px]" style={{ color: "#8fa394" }}>
              {l.time}
            </span>

            {/* Result */}
            <span className="flex justify-end">
              <Badge tone={statusTone[l.result] || "gray"} dot>
                {l.result}
              </Badge>
            </span>
          </button>
        ))}
      </Card>
    </div>
  );
}
