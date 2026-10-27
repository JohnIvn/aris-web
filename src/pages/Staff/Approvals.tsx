import { useState, useMemo } from "react";
import { useAuth } from "@/app/authContext";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import {
  Card,
  PageTitle,
  GhostButton,
  PrimaryButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  Modal,
  Toggle,
  initialsColor,
  arTable,
  dtrTable,
  SubmissionDetail,
  type RecordKind,
  type RecordPayload,
  type StatusKind,
} from "@/components/ui";

// Where each support stage acts on the AR / DTR submissions routed to it:
// Checker → Secretary → HR → Accounting.

const STAGES = ["Checker", "Secretary", "HR", "Accounting"] as const;
type StageRole = (typeof STAGES)[number];

/** Staff account signed in at each stage. */
const STAGE_OWNER: Record<StageRole, string> = {
  Checker: "Prof. R. Alonzo",
  Secretary: "L. Bautista",
  HR: "Ana Bautista",
  Accounting: "Payroll Office",
};

const STAGE_COLOR: Record<StageRole, string> = {
  Checker: "#3a7d4e",
  Secretary: "#3f8ecc",
  HR: "#8a63c4",
  Accounting: "#d99a2b",
};

const statusTone: Record<string, "green" | "amber" | "red" | "gray" | "blue"> = {
  Approved: "green",
  Pending: "amber",
  Disapproved: "red",
  Flagged: "red",
};

/** The next stage in the routing order, or undefined at the final stage. */
const nextStageOf = (stage: StageRole): StageRole | undefined =>
  STAGES[STAGES.indexOf(stage) + 1] as StageRole | undefined;

export function normalizeStaffRole(position?: string | null): StageRole {
  if (!position) return "Checker";
  const p = position.trim().toLowerCase();
  if (p.includes("check")) return "Checker";
  if (p.includes("sec")) return "Secretary";
  if (p.includes("hr") || p.includes("human")) return "HR";
  if (p.includes("account") || p.includes("payroll")) return "Accounting";
  return "Checker";
}

type ApprovalItem = {
  id: string;
  faculty: string;
  facultyNumber: string;
  type: RecordKind;
  period: string;
  reference: string;
  submitted: string;
  /** Stage the submission currently sits at. */
  stage: StageRole;
  status: StatusKind;
  event: string;
  record: RecordPayload;
};

/** Fixed "current time" for the mock decision log. */
const NOW = "Sep 17, 2026 · 2:45 PM";

const initialsOf = (name: string) =>
  name
    .replace(/^(Dr\.|Prof\.)\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

const approvalQueue: ApprovalItem[] = [];

/** Where an item sits relative to the role looking at it. */
function stageStatus(
  it: ApprovalItem,
  role: StageRole,
): { label: string; tone: "green" | "amber" | "red" | "gray"; note: string } {
  const at = STAGES.indexOf(it.stage);
  const mine = STAGES.indexOf(role);

  if (it.status === "Disapproved") {
    return { label: "Disapproved", tone: "red", note: `at ${it.stage}` };
  }
  if (it.status === "Approved") {
    return { label: "Done", tone: "green", note: "cleared by Accounting" };
  }
  // Already approved at this role — it moved on to the next stage.
  if (at > mine) {
    return { label: "Done", tone: "green", note: `to ${it.stage}` };
  }
  if (at === mine) {
    return { label: "Pending", tone: "amber", note: "awaiting you" };
  }
  // Still upstream — it has not reached this role yet.
  return { label: "Waiting", tone: "gray", note: `at ${it.stage}` };
}

/* ─── Stage progress rail ──────────────────────────────────────────────────── */

function StageProgress({ item }: { item: ApprovalItem }) {
  const at = STAGES.indexOf(item.stage);
  const finished = item.status === "Approved";
  const rejected = item.status === "Disapproved";

  return (
    <div className="flex items-center gap-1.5 mt-4 flex-wrap">
      {STAGES.map((s, i) => {
        const isRejected = rejected && i === at;
        const isDone = !isRejected && (finished || i < at);
        const isCurrent = !isRejected && !isDone && i === at;
        const bg = isRejected
          ? "#fbecec"
          : isDone
            ? "#eaf4ee"
            : isCurrent
              ? "#fbf1de"
              : "#f4f6f5";
        const fg = isRejected
          ? "#c0392b"
          : isDone
            ? "#2f7043"
            : isCurrent
              ? "#996515"
              : "#b6c3ba";
        return (
          <span key={s} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d6ded8"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="w-3 h-3 flex-shrink-0"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            )}
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold"
              style={{
                background: bg,
                color: fg,
                boxShadow: isCurrent ? "0 0 0 1px #e6cf9b inset" : "none",
              }}
            >
              {isDone && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isRejected && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="w-3 h-3"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
              {s}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function QueueCard({
  item,
  role,
  onOpen,
}: {
  item: ApprovalItem;
  role: StageRole;
  onOpen: () => void;
}) {
  const st = stageStatus(item, role);
  const decided = item.status !== "Pending";
  const accent =
    item.status === "Approved"
      ? "#2f7043"
      : item.status === "Disapproved"
        ? "#c0392b"
        : STAGE_COLOR[item.stage];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left bg-white rounded-2xl p-3 border transition-all hover:shadow-md cursor-pointer"
      style={{
        borderColor: decided
          ? item.status === "Approved"
            ? "#cfe6d8"
            : "#f0cfcb"
          : "#e8eeea",
      }}
    >
      <div className="flex items-start gap-2.5">
        <Avatar initials={initialsOf(item.faculty)} color={accent} size={28} />
        <div className="flex-1 min-w-0">
          <p
            className="text-[12.5px] font-semibold truncate"
            style={{ color: "#111c14" }}
          >
            {item.faculty}
          </p>
          <p className="text-[10.5px] truncate" style={{ color: "#8fa394" }}>
            {item.reference}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2.5">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
          style={{
            background: item.type === "AR" ? "#e7f1fa" : "#eaf4ee",
            color: item.type === "AR" ? "#2b6ca3" : "#2f7043",
          }}
        >
          {item.type}
        </span>
        <span className="text-[10.5px] truncate" style={{ color: "#8fa394" }}>
          {item.period}
        </span>
      </div>

      <div
        className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t"
        style={{ borderColor: "#f4f6f5" }}
      >
        <span
          className="text-[10.5px] tabular-nums"
          style={{ color: "#b6c3ba" }}
        >
          {item.submitted.replace(", 2026", "")}
        </span>
        {decided ? (
          <Badge tone={st.tone} dot>
            {item.status === "Approved" ? "Approved" : "Disapproved"}
          </Badge>
        ) : (
          <span
            className="text-[10.5px] font-semibold"
            style={{ color: st.label === "Pending" ? "#996515" : "#8fa394" }}
          >
            {st.label === "Pending" ? "Awaiting you" : st.label}
          </span>
        )}
      </div>
    </button>
  );
}

export default function Approvals() {
  const { user } = useAuth();
  const { data: profile } = useResource<{
    position?: string | null;
    department?: string | null;
    firstname?: string;
    lastname?: string;
  }>("/users/me/profile", {});

  const staffPosition = profile?.position || user?.position || "";
  const role: StageRole = normalizeStaffRole(staffPosition);
  const staffName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(" ") ||
    user?.name ||
    STAGE_OWNER[role];

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [showDecided, setShowDecided] = useState(true);
  const { data: rawQueue, setData: setQueue, loading, error, reload } = useResource<ApprovalItem[]>("/approvals", []);
  const queue = Array.isArray(rawQueue) ? rawQueue : [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const tabs = ["All", "Pending", "Approved", "Disapproved"];

  // Filter items strictly scoped to the staff member's position/stage
  const scopedQueue = useMemo(() => {
    return queue.filter((it) => it.stage === role);
  }, [queue, role]);

  const open = scopedQueue.find((it) => it.id === openId) ?? null;
  const openStatus = open ? stageStatus(open, role) : null;
  const canAct = !!open && open.status === "Pending" && open.stage === role;
  const next = open ? nextStageOf(open.stage) : undefined;

  const awaiting = scopedQueue.filter((it) => it.status === "Pending").length;
  const inPipeline = scopedQueue.filter((it) => it.status === "Pending").length;

  // Filtered rows for the Table (strictly scoped to this role)
  const filteredQueue = useMemo(() => {
    return scopedQueue.filter((it) => {
      if (tab === "Pending" && it.status !== "Pending") return false;
      if (tab === "Approved" && it.status !== "Approved") return false;
      if (tab === "Disapproved" && it.status !== "Disapproved" && it.status !== "Flagged") return false;

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchesFaculty = it.faculty.toLowerCase().includes(q);
        const matchesNumber = it.facultyNumber.toLowerCase().includes(q);
        const matchesRef = it.reference.toLowerCase().includes(q);
        const matchesType = it.type.toLowerCase().includes(q);
        const matchesPeriod = it.period.toLowerCase().includes(q);
        const matchesStage = it.stage.toLowerCase().includes(q);
        const matchesEvent = it.event.toLowerCase().includes(q);
        const matchesCollege = (it.record?.college || "").toLowerCase().includes(q);

        if (
          !matchesFaculty &&
          !matchesNumber &&
          !matchesRef &&
          !matchesType &&
          !matchesPeriod &&
          !matchesStage &&
          !matchesEvent &&
          !matchesCollege
        ) {
          return false;
        }
      }
      return true;
    });
  }, [scopedQueue, tab, query]);

  // Board visibility filtering strictly for this role
  const visibleForBoard = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedQueue.filter((it) => {
      if (!showDecided && it.status !== "Pending") return false;
      if (!q) return true;
      return (
        it.faculty.toLowerCase().includes(q) ||
        it.reference.toLowerCase().includes(q) ||
        it.period.toLowerCase().includes(q)
      );
    });
  }, [scopedQueue, showDecided, query]);

  const decide = async (item: ApprovalItem, action: "Approve" | "Disapprove") => {
    const reviewer = `${staffName} (${role})`;
    const target = nextStageOf(item.stage);
    const nowStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const defaultRemark =
      action === "Disapprove"
        ? `Disapproved at the ${role} stage. Returned to the faculty for correction.`
        : target
          ? `Approved at the ${role} stage. Forwarded to ${target}.`
          : "Approved at the final stage and cleared for payroll.";

    const decisionRemark = remark.trim() || defaultRemark;

    setFlash(
      action === "Disapprove"
        ? `Disapproved · ${item.faculty}'s ${item.type} returned for correction`
        : target
          ? `Approved · ${item.type} forwarded to ${target}`
          : `Approved · ${item.type} cleared for payroll`,
    );

    const updatedQueue = queue.map((it) => {
      if (it.id !== item.id) return it;
      if (action === "Disapprove") {
        return {
          ...it,
          status: "Disapproved" as StatusKind,
          record: {
            ...it.record,
            reviewer,
            reviewedAt: nowStr,
            remark: decisionRemark,
          },
        };
      }
      return {
        ...it,
        stage: target ?? it.stage,
        status: target ? ("Pending" as StatusKind) : ("Approved" as StatusKind),
        record: {
          ...it.record,
          reviewer,
          reviewedAt: nowStr,
          remark: decisionRemark,
        },
      };
    });

    setQueue(updatedQueue);

    try {
      await saveResource(`/approvals/${item.id}`, {
        action,
        remark: decisionRemark,
        stage: item.stage,
        role,
      }, "PATCH");
    } catch (err) {
      console.error("Failed to save approval decision:", err);
      setFlash(err instanceof Error ? err.message : "Unable to save decision to database.");
    }

    setOpenId(null);
    setRemark("");
  };

  const close = () => {
    setOpenId(null);
    setRemark("");
  };

  const handleExportCsv = () => {
    if (filteredQueue.length === 0) return;

    const headers = [
      "Reference ID",
      "Type",
      "Faculty Name",
      "Faculty Number",
      "College / Dept",
      "Coverage Period",
      "Current Stage",
      "Stage Reviewer",
      "Status",
      "Submitted At",
      "Reviewer Remark",
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvContent = [
      headers.join(","),
      ...filteredQueue.map((r) =>
        [
          escapeCsv(r.reference),
          escapeCsv(r.type),
          escapeCsv(r.faculty),
          escapeCsv(r.facultyNumber),
          escapeCsv(r.record?.college),
          escapeCsv(r.period),
          escapeCsv(r.stage),
          escapeCsv(STAGE_OWNER[r.stage]),
          escapeCsv(r.status),
          escapeCsv(r.submitted),
          escapeCsv(r.record?.remark),
        ].join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `aris-approvals-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportConfirm(false);
    setShowExportSuccess(true);
  };

  return (
    <div className="pb-4">
      {/* Page Title with Search and Export */}
      <PageTitle
        title="Approvals"
        subtitle={`${awaiting} submission${
          awaiting === 1 ? "" : "s"
        } awaiting your action · ${inPipeline} in the pipeline`}
        action={
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 p-0.5 rounded-xl border"
              style={{ borderColor: "#e2e8e4", background: "#f7f9f8" }}
            >
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                style={{
                  background: viewMode === "table" ? "#fff" : "transparent",
                  color: viewMode === "table" ? "#111c14" : "#5a6b5e",
                  boxShadow:
                    viewMode === "table" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="w-3.5 h-3.5"
                >
                  <rect x="2" y="2" width="12" height="12" rx="1.5" />
                  <path d="M2 6h12M6 2v12" />
                </svg>
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
                style={{
                  background: viewMode === "board" ? "#fff" : "transparent",
                  color: viewMode === "board" ? "#111c14" : "#5a6b5e",
                  boxShadow:
                    viewMode === "board" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="w-3.5 h-3.5"
                >
                  <rect x="2" y="2" width="3.5" height="12" rx="1" />
                  <rect x="6.25" y="2" width="3.5" height="12" rx="1" />
                  <rect x="10.5" y="2" width="3.5" height="12" rx="1" />
                </svg>
                Pipeline Board
              </button>
            </div>
            <GhostButton onClick={() => setShowExportConfirm(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="w-4 h-4"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </GhostButton>
          </div>
        }
      />

      {/* Staff Scope Banner */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: STAGE_COLOR[role] }}
            >
              {role.slice(0, 3).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#111c14" }}
              >
                {role} Approval Stage
              </p>
              <p className="text-[11.5px]" style={{ color: "#8fa394" }}>
                {staffName} · {awaiting} submission(s) awaiting your action
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {viewMode === "board" && (
              <label
                className="flex items-center gap-2 text-[12px] font-medium select-none cursor-pointer"
                style={{ color: "#5a6b5e" }}
              >
                <Toggle on={showDecided} onChange={setShowDecided} />
                Show decided
              </label>
            )}
            <Badge tone={awaiting > 0 ? "amber" : "green"} dot>
              {awaiting > 0 ? `${awaiting} Awaiting Review` : "All Caught Up"}
            </Badge>
          </div>
        </div>
      </Card>

      {flash && (
        <div
          className="mb-4 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl text-[12.5px] font-medium"
          style={{ background: "#eaf4ee", color: "#2f7043" }}
        >
          <span className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            {flash}
          </span>
          <button
            type="button"
            onClick={() => setFlash(null)}
            aria-label="Dismiss"
            className="transition-opacity hover:opacity-60 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="w-3.5 h-3.5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── TABLE VIEW: EXACT SYSTEM LOGS FORMAT ────────────────────────────── */}
      {viewMode === "table" && (
        <Card className="p-0 overflow-x-auto">
          {/* Table Toolbar */}
          <div
            className="flex items-center justify-between p-4 border-b flex-wrap gap-3"
            style={{ borderColor: "#eef1ef" }}
          >
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
            <div className="flex gap-2 items-center">
              <SearchInput
                placeholder="Search by faculty, type, reference..."
                value={query}
                onChange={setQuery}
                className="w-64"
              />
            </div>
          </div>

          {/* Column Header matching SystemLogs */}
          <div
            className="grid min-w-[960px] grid-cols-[1.8fr_0.8fr_1.4fr_1.4fr_1.4fr_0.9fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold"
            style={{ color: "#b6c3ba", background: "#fafbfa" }}
          >
            <span>Faculty / Submitter</span>
            <span>Type</span>
            <span>Reference ID</span>
            <span>Review Stage</span>
            <span>Submitted Date & Time</span>
            <span className="text-right">Status</span>
          </div>

          {/* Loading / Error / Empty State */}
          {loading && queue.length === 0 ? (
            <div className="py-12 text-center text-[12.5px] text-[#8fa394]">
              <div
                className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mb-2"
                style={{ borderColor: "#3a7d4e", borderTopColor: "transparent" }}
              />
              <p>Loading approval submissions from database...</p>
            </div>
          ) : error && queue.length === 0 ? (
            <div className="py-8 text-center text-[12.5px] text-[#c0392b]">
              <p className="font-semibold mb-1">Failed to load submissions from database</p>
              <p className="text-[#8fa394] mb-3">{error}</p>
              <GhostButton onClick={() => reload()}>Retry</GhostButton>
            </div>
          ) : filteredQueue.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-[#8fa394]">
              {query || tab !== "All"
                ? "No matching submissions found."
                : "No submissions recorded in this queue."}
            </p>
          ) : null}

          {/* Table Rows matching SystemLogs */}
          {filteredQueue.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                setOpenId(item.id);
                setRemark("");
                setFlash(null);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(item.id);
                  setRemark("");
                  setFlash(null);
                }
              }}
              className="grid min-w-[960px] grid-cols-[1.8fr_0.8fr_1.4fr_1.4fr_1.4fr_0.9fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#f6f9f7] active:bg-[#edf3ef] cursor-pointer"
              style={{ borderColor: "#f2f4f2" }}
              title="Click to review submission"
            >
              {/* 1. Faculty / Submitter */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Avatar
                  initials={initialsOf(item.faculty)}
                  color={initialsColor(idx)}
                  size={32}
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[13px] font-semibold truncate text-[#111c14]"
                    title={item.faculty}
                  >
                    {item.faculty}
                  </span>
                  <span className="text-[11px] text-[#8fa394] truncate">
                    #{item.facultyNumber} · {item.record.college || "Faculty Member"}
                  </span>
                </div>
              </div>

              {/* 2. Type */}
              <div>
                <Badge tone={item.type === "AR" ? "blue" : "green"}>
                  {item.type}
                </Badge>
              </div>

              {/* 3. Reference ID */}
              <div className="flex flex-col min-w-0">
                <span className="text-[12.5px] font-mono font-medium text-[#111c14] truncate">
                  {item.reference}
                </span>
                <span className="text-[11px] text-[#8fa394]">
                  {item.period}
                </span>
              </div>

              {/* 4. Review Stage */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: STAGE_COLOR[item.stage] }}
                />
                <span className="text-[12.5px] font-medium text-[#2d3830] truncate">
                  {item.stage}
                </span>
                <span className="text-[11px] text-[#8fa394] truncate">
                  ({STAGE_OWNER[item.stage]})
                </span>
              </div>

              {/* 5. Submitted Date & Time */}
              <div className="flex flex-col text-[12px] leading-tight min-w-0">
                <span className="font-medium text-[#2d3830] truncate">
                  {item.submitted.split(" · ")[0]}
                </span>
                <span className="text-[11px] text-[#8fa394] font-mono">
                  {item.submitted.split(" · ")[1] || "—"}
                </span>
              </div>

              {/* 6. Status + Arrow */}
              <span className="flex justify-end items-center gap-2">
                <Badge tone={statusTone[item.status] || "gray"} dot>
                  {item.status}
                </Badge>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#b6c3ba"
                  strokeWidth="1.6"
                  className="w-3.5 h-3.5 opacity-60"
                >
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* ─── BOARD VIEW: STATUS COLUMNS FOR THIS ROLE ─────────────────────────── */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          {[
            { key: "Pending" as StatusKind, label: "Awaiting Action", color: "#996515" },
            { key: "Approved" as StatusKind, label: "Approved / Endorsed", color: "#2f7043" },
            { key: "Disapproved" as StatusKind, label: "Disapproved / Flagged", color: "#c0392b" },
          ].map((col) => {
            const cards = visibleForBoard.filter((it) =>
              col.key === "Disapproved"
                ? it.status === "Disapproved" || it.status === "Flagged"
                : it.status === col.key
            );
            return (
              <div
                key={col.key}
                className="rounded-3xl p-3 min-h-[440px] flex flex-col"
                style={{ background: "#f4f6f5" }}
              >
                <div className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: col.color }}
                    />
                    <p
                      className="text-[13px] font-bold truncate"
                      style={{ color: "#111c14" }}
                    >
                      {col.label}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md bg-white flex-shrink-0 shadow-xs"
                    style={{ color: "#5a6b5e" }}
                  >
                    {cards.length}
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[520px] pr-0.5">
                  {cards.map((it) => (
                    <QueueCard
                      key={it.id}
                      item={it}
                      role={role}
                      onOpen={() => {
                        setOpenId(it.id);
                        setRemark("");
                        setFlash(null);
                      }}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div
                      className="text-center text-[11.5px] py-12 rounded-2xl border border-dashed"
                      style={{ color: "#b6c3ba", borderColor: "#e2e8e4" }}
                    >
                      No {col.label.toLowerCase()} submissions
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Export */}
      <Modal
        isOpen={showExportConfirm}
        onClose={() => setShowExportConfirm(false)}
        title="Confirm Export"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#e7f1fa] text-[#2b6ca3]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        }
        actions={
          <>
            <GhostButton onClick={() => setShowExportConfirm(false)}>
              Cancel
            </GhostButton>
            <PrimaryButton onClick={handleExportCsv}>
              Yes, Export
            </PrimaryButton>
          </>
        }
      >
        Export {filteredQueue.length}{" "}
        {filteredQueue.length === 1 ? "submission" : "submissions"} matching current
        filters to a CSV file?
      </Modal>

      {/* Success Modal for Export */}
      <Modal
        isOpen={showExportSuccess}
        onClose={() => setShowExportSuccess(false)}
        title="Export Successful"
        icon={
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#eaf4ee] text-[#2f7043]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        }
        actions={
          <PrimaryButton onClick={() => setShowExportSuccess(false)}>
            OK
          </PrimaryButton>
        }
      >
        The approvals report has been successfully exported and downloaded to your computer.
      </Modal>

      {/* Review & Decide Modal */}
      <Modal
        isOpen={!!open}
        onClose={close}
        title={open ? `${open.faculty} · ${open.type}` : "Submission"}
        size="lg"
        align="left"
        actions={
          canAct && open ? (
            <div className="w-full space-y-3">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={2}
                placeholder="Add a remark — required context when disapproving…"
                className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none resize-none"
                style={{
                  borderColor: "#e8eeea",
                  color: "#111c14",
                  background: "#fafbfa",
                }}
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[11.5px]" style={{ color: "#8fa394" }}>
                  {next
                    ? `Approving forwards this to ${next}.`
                    : "Final stage — approving clears it for payroll."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decide(open, "Disapprove")}
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold border transition-colors hover:bg-[#fdf3f2] cursor-pointer"
                    style={{
                      borderColor: "#edc9c5",
                      color: "#c0392b",
                      background: "#fff",
                    }}
                  >
                    Disapprove &amp; return
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(open, "Approve")}
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-transform active:scale-[0.99] cursor-pointer"
                    style={{ background: BRAND }}
                  >
                    {next ? "Approve & forward" : "Approve & clear"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <GhostButton onClick={close}>Close</GhostButton>
          )
        }
      >
        {open && openStatus && (
          <div className="space-y-3.5">
            <div
              className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 flex-wrap"
              style={{ background: "#fafbfa", border: "1px solid #eef1ef" }}
            >
              <div className="flex items-center gap-2.5">
                <Badge tone={openStatus.tone} dot>
                  {openStatus.label}
                </Badge>
                <span className="text-[12.5px]" style={{ color: "#5a6b5e" }}>
                  {openStatus.note}
                </span>
              </div>
              <span className="text-[11.5px]" style={{ color: "#b6c3ba" }}>
                Ref {open.reference} · filed {open.submitted}
              </span>
            </div>

            <StageProgress item={open} />

            {!canAct && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[12.5px]"
                style={{
                  background: openStatus.tone === "red" ? "#fbecec" : "#eaf4ee",
                  color: openStatus.tone === "red" ? "#c0392b" : "#2f7043",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 flex-shrink-0"
                >
                  {openStatus.tone === "red" ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M5 13l4 4L19 7" />
                  )}
                </svg>
                <span>
                  {open.status === "Approved"
                    ? "Fully approved — no further action needed."
                    : open.status === "Disapproved"
                      ? `Disapproved at the ${open.stage} stage and returned to the faculty.`
                      : openStatus.label === "Done"
                        ? `Already approved by you — it is now with ${open.stage}.`
                        : `Not yet at your stage — currently with ${open.stage}.`}
                </span>
              </div>
            )}

            <SubmissionDetail
              record={open.record}
              type={open.type}
              status={open.status}
              initials={initialsOf(open.faculty)}
              colorIndex={STAGES.indexOf(open.stage)}
              loggedAt={open.submitted}
              event={open.event}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export { STAGES, STAGE_COLOR, STAGE_OWNER, approvalQueue };
export type { StageRole, ApprovalItem };
