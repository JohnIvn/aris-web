import { useState } from "react";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import {
  Card,
  PageTitle,
  GhostButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  Modal,
  Toggle,
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

/** The next stage in the routing order, or undefined at the final stage. */
const nextStageOf = (stage: StageRole): StageRole | undefined =>
  STAGES[STAGES.indexOf(stage) + 1] as StageRole | undefined;

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

const demoApprovalQueue: ApprovalItem[] = [
  {
    id: "a1",
    faculty: "Marco Dela Cruz",
    facultyNumber: "342",
    type: "AR",
    period: "Sep Cycle 1",
    reference: "AR-2026-0906-0094",
    submitted: "Sep 6, 2026 · 3:04 PM",
    stage: "Checker",
    status: "Pending",
    event: "AR submitted · Sep Cycle 1 · 12 outputs",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0906-0094",
      facultyName: "Marco Dela Cruz",
      facultyNumber: "342",
      college: "Arts & Sciences",
      tables: [
        arTable("GE 101 — UNDERSTANDING THE SELF", "September 1–5, 2026", [
          ["GE 101", "BSIT 1A", 3, "Wednesday", "9:00AM–12:00PM", "CONGRESS"],
          ["GE 101", "BSIT 1B", 3, "Friday", "1:00PM–4:00PM", "CONGRESS"],
        ]),
      ],
      topics:
        "a) The self from a philosophical perspective\nb) Self-concept and identity",
      tasks:
        "a) Lecture and small-group discussion.\nb) Reflection paper assigned and collected.",
      attachment: "AR_DelaCruz_SepCycle1.pdf · 870 KB",
      reviewer: "System — Intake",
      reviewedAt: "Sep 6, 2026 · 3:04 PM",
      remark: "Received and queued for checker validation.",
    },
  },
  {
    id: "a2",
    faculty: "Juan M. Rivera",
    facultyNumber: "289",
    type: "DTR",
    period: "Sep Cycle 1",
    reference: "DTR-2026-0906-0088",
    submitted: "Sep 6, 2026 · 12:39 PM",
    stage: "Secretary",
    status: "Pending",
    event: "DTR submitted · Sep Cycle 1 · 22 days",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0906-0088",
      facultyName: "Juan M. Rivera",
      facultyNumber: "289",
      college: "College of Liberal Arts and Sciences",
      tables: [
        dtrTable("DTR — September 1–5, 2026", "22 duty days logged", [
          ["Sep 01", "7:52 AM", "5:04 PM", 8.2],
          ["Sep 02", "8:05 AM", "5:10 PM", 8.1],
          ["Sep 03", "7:58 AM", "5:00 PM", 8.1],
        ]),
      ],
      attachment: "DTR_Rivera_SepCycle1.xlsx · 82 KB",
      reviewer: "Prof. R. Alonzo (Checker)",
      reviewedAt: "Sep 6, 2026 · 1:15 PM",
      remark:
        "22 days verified against the attendance log. Endorsed to the college secretary.",
    },
  },
  {
    id: "a3",
    faculty: "Dr. Maria Santos",
    facultyNumber: "214",
    type: "AR",
    period: "Sep Cycle 1",
    reference: "AR-2026-0906-0092",
    submitted: "Sep 6, 2026 · 12:41 PM",
    stage: "HR",
    status: "Pending",
    event: "AR submitted · Sep Cycle 1 · 18 outputs",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0906-0092",
      facultyName: "Dr. Maria Santos",
      facultyNumber: "214",
      college: "College of Engineering",
      tables: [
        arTable("CS 102 — WEB DEVELOPMENT", "September 1–5, 2026", [
          ["CS 102", "BSIT 3A", 3, "Monday", "7:00AM–10:00AM", "CONGRESS"],
          ["CS 102", "BSIT 3B", 3, "Tuesday", "1:00PM–4:00PM", "CONGRESS"],
        ]),
      ],
      topics: "a) HTML document structure\nb) Semantic tags and accessibility",
      tasks:
        "a) Discussed semantic elements and their use.\nb) Hands-on activity: build a personal profile page.",
      attachment: "AR_Santos_SepCycle1.pdf · 1.2 MB",
      reviewer: "L. Bautista (Secretary)",
      reviewedAt: "Sep 7, 2026 · 9:40 AM",
      remark: "Documents complete. Endorsed to HR for validation.",
    },
  },
  {
    id: "a4",
    faculty: "Prof. Grace Lim",
    facultyNumber: "178",
    type: "DTR",
    period: "Sep Cycle 1",
    reference: "DTR-2026-0906-0090",
    submitted: "Sep 6, 2026 · 1:07 PM",
    stage: "Accounting",
    status: "Pending",
    event: "DTR approved by HR · Sep Cycle 1 · 21 days",
    record: {
      period: "September Cycle 1",
      reference: "DTR-2026-0906-0090",
      facultyName: "Prof. Grace Lim",
      facultyNumber: "178",
      college: "College of Business",
      tables: [
        dtrTable("DTR — September 1–5, 2026", "21 duty days logged", [
          ["Sep 01", "8:02 AM", "5:07 PM", 8.1],
          ["Sep 02", "8:15 AM", "5:11 PM", 7.9],
          ["Sep 03", "7:58 AM", "5:01 PM", 8.1],
        ]),
      ],
      attachment: "DTR_Lim_SepCycle1.xlsx · 78 KB",
      reviewer: "Ana Bautista (HR)",
      reviewedAt: "Sep 8, 2026 · 10:22 AM",
      remark: "Validated and endorsed to accounting for payroll.",
    },
  },
  {
    id: "a5",
    faculty: "James Reyes",
    facultyNumber: "301",
    type: "AR",
    period: "Sep Cycle 1",
    reference: "AR-2026-0906-0081",
    submitted: "Sep 5, 2026 · 4:12 PM",
    stage: "Accounting",
    status: "Approved",
    event: "AR approved by Accounting · Sep Cycle 1 · 15 outputs",
    record: {
      period: "September Cycle 1",
      reference: "AR-2026-0906-0081",
      facultyName: "James Reyes",
      facultyNumber: "301",
      college: "College of Engineering",
      tables: [
        arTable("CS 301 — DATA STRUCTURES", "September 1–5, 2026", [
          ["CS 301", "BSCS 3A", 3, "Thursday", "8:00AM–11:00AM", "CONGRESS"],
        ]),
      ],
      topics: "a) Arrays and pointers",
      tasks:
        "a) Lecture on pointer arithmetic.\nb) Graded exercise on dynamic arrays.",
      attachment: "AR_Reyes_SepCycle1.pdf · 940 KB",
      reviewer: "Payroll Office (Accounting)",
      reviewedAt: "Sep 9, 2026 · 3:15 PM",
      remark: "Approved and cleared for payroll.",
    },
  },
  {
    id: "a6",
    faculty: "Paolo Garcia",
    facultyNumber: "398",
    type: "DTR",
    period: "Aug Cycle 2",
    reference: "DTR-2026-0822-0231",
    submitted: "Aug 22, 2026 · 3:58 PM",
    stage: "HR",
    status: "Disapproved",
    event: "DTR disapproved by HR · Aug Cycle 2 · 21 days",
    record: {
      period: "August Cycle 2",
      reference: "DTR-2026-0822-0231",
      facultyName: "Paolo Garcia",
      facultyNumber: "398",
      college: "College of Business",
      tables: [
        dtrTable("DTR — August 11–22, 2026", "21 duty days logged", [
          ["Aug 11", "8:02 AM", "5:07 PM", 8.1],
          ["Aug 12", "—", "5:03 PM", 0],
          ["Aug 13", "8:11 AM", "5:00 PM", 7.8],
        ]),
      ],
      attachment: "DTR_Garcia_AugCycle2.xlsx · 79 KB",
      reviewer: "Ana Bautista (HR)",
      reviewedAt: "Aug 23, 2026 · 11:12 AM",
      remark:
        "Disapproved: three biometric entries were logged under an unregistered employee number. Refile with corrected entries.",
    },
  },
];

/** How a submission reads from the acting role's point of view. */
function stageStatus(
  it: ApprovalItem,
  role: StageRole,
): { label: string; tone: "green" | "amber" | "red" | "gray"; note: string } {
  const mine = STAGES.indexOf(role);
  const at = STAGES.indexOf(it.stage);
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

/* ─── Page ─────────────────────────────────────────────────────────────────── */

/* ─── Page ─────────────────────────────────────────────────────────────────── */

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
      className="w-full text-left bg-white rounded-2xl p-3 border transition-all hover:shadow-md"
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
  const { data: queue, setData: setQueue } = useResource("/approvals", demoApprovalQueue);
  const [role, setRole] = useState<StageRole>("Secretary");
  const [query, setQuery] = useState("");
  const [showDecided, setShowDecided] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const open = queue.find((it) => it.id === openId) ?? null;
  const openStatus = open ? stageStatus(open, role) : null;
  const canAct = !!open && open.status === "Pending" && open.stage === role;
  const next = open ? nextStageOf(open.stage) : undefined;

  const q = query.trim().toLowerCase();
  const visible = queue.filter((it) => {
    if (!showDecided && it.status !== "Pending") return false;
    if (!q) return true;
    return (
      it.faculty.toLowerCase().includes(q) ||
      it.reference.toLowerCase().includes(q) ||
      it.period.toLowerCase().includes(q)
    );
  });
  const column = (s: StageRole) => visible.filter((it) => it.stage === s);

  const awaiting = queue.filter(
    (it) => it.status === "Pending" && it.stage === role,
  ).length;
  const inPipeline = queue.filter((it) => it.status === "Pending").length;

  const decide = async (item: ApprovalItem, action: "Approve" | "Disapprove") => {
    const reviewer = `${STAGE_OWNER[role]} (${role})`;
    const target = nextStageOf(item.stage);
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
              reviewedAt: NOW,
              remark:
                remark.trim() ||
                `Disapproved at the ${role} stage. Returned to the faculty for correction.`,
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
            reviewedAt: NOW,
            remark:
              remark.trim() ||
              (target
                ? `Approved at the ${role} stage. Forwarded to ${target}.`
                : "Approved at the final stage and cleared for payroll."),
          },
        };
      });
    try {
      await saveResource("/approvals", updatedQueue, "PUT");
      setQueue(updatedQueue);
    } catch (reason) {
      setFlash(reason instanceof Error ? reason.message : "Unable to save the decision.");
      return;
    }
    setOpenId(null);
    setRemark("");
  };

  const close = () => {
    setOpenId(null);
    setRemark("");
  };

  return (
    <div className="pb-2">
      <PageTitle
        title="Approvals"
        subtitle={`${awaiting} submission${
          awaiting === 1 ? "" : "s"
        } awaiting your action · ${inPipeline} in the pipeline`}
        action={
          <SearchInput
            placeholder="Search faculty, reference or period"
            value={query}
            onChange={setQuery}
            className="w-60"
          />
        }
      />

      <Card className="mb-3">
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
                Acting as {role}
              </p>
              <p className="text-[11.5px]" style={{ color: "#8fa394" }}>
                {STAGE_OWNER[role]} · {awaiting} to review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <label
              className="flex items-center gap-2 text-[12px] font-medium select-none cursor-pointer"
              style={{ color: "#5a6b5e" }}
            >
              <Toggle on={showDecided} onChange={setShowDecided} />
              Show decided
            </label>
            <Tabs
              tabs={[...STAGES]}
              value={role}
              onChange={(v) => {
                setRole(v as StageRole);
                setFlash(null);
              }}
            />
          </div>
        </div>
      </Card>

      {flash && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl mb-3 text-[12.5px] font-medium"
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
            className="transition-opacity hover:opacity-60"
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

      {/* Pipeline board — one column per stage */}
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {STAGES.map((s) => {
          const cards = column(s);
          const isMine = s === role;
          return (
            <div
              key={s}
              className="rounded-3xl p-2.5 min-h-[440px] flex flex-col"
              style={{
                background: isMine ? "#f0f7f2" : "#f4f6f5",
                boxShadow: isMine ? `inset 0 0 0 1.5px ${BRAND}33` : "none",
              }}
            >
              <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STAGE_COLOR[s] }}
                  />
                  <p
                    className="text-[12.5px] font-bold truncate"
                    style={{ color: "#111c14" }}
                  >
                    {s}
                  </p>
                  {isMine && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white flex-shrink-0"
                      style={{ color: BRAND }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md bg-white flex-shrink-0"
                  style={{ color: "#8fa394" }}
                >
                  {cards.length}
                </span>
              </div>
              <p
                className="text-[10.5px] px-1.5 pt-0.5 pb-2.5 truncate"
                style={{ color: "#b6c3ba" }}
              >
                {STAGE_OWNER[s]}
              </p>

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
                    className="text-center text-[11.5px] py-10 rounded-2xl border border-dashed"
                    style={{ color: "#b6c3ba", borderColor: "#e2e8e4" }}
                  >
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review + decide */}
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
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold border transition-colors hover:bg-[#fdf3f2]"
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
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-transform active:scale-[0.99]"
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
