import type { ReactNode } from "react";
import { Avatar, Badge, initialsColor } from "@/components/ui";

/* ─── Shared submission detail ─────────────────────────────────────────────── */
// The AR / DTR "record + status" panel used by the Audit Logs modal and the
// professor Submission History modal. Mirrors the Submit Record page
// (/prof/submit): record info, faculty info, course tables, content, status.

export type RecordTable = {
  title: string;
  meta?: string;
  columns: string[];
  rows: (string | number)[][];
};

/** A filed AR / DTR payload, as captured on the Submit Record page. */
export type RecordPayload = {
  period: string;
  reference: string;
  facultyName: string;
  facultyNumber: string;
  college: string;
  tables: RecordTable[];
  topics?: string;
  tasks?: string;
  notes?: string;
  attachment?: string;
  reviewer: string;
  reviewedAt: string;
  remark: string;
};

export type RecordKind = "AR" | "DTR";

export type StatusKind =
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Flagged"
  | "Pending"
  | "Missing";

type Tone = "blue" | "green" | "red" | "amber" | "gray";

export const statusTone: Record<StatusKind, Tone> = {
  Submitted: "blue",
  Approved: "green",
  Rejected: "red",
  Flagged: "amber",
  Pending: "amber",
  Missing: "gray",
};

export const AR_COLUMNS = [
  "Code",
  "Program, Year & Section",
  "Units",
  "Days",
  "Time",
  "Campus",
];

export const DTR_COLUMNS = ["Date", "Time In", "Time Out", "Hours"];

export const arTable = (
  title: string,
  meta: string,
  rows: (string | number)[][],
): RecordTable => ({ title, meta, columns: AR_COLUMNS, rows });

export const dtrTable = (
  title: string,
  meta: string,
  rows: (string | number)[][],
): RecordTable => ({ title, meta, columns: DTR_COLUMNS, rows });

/* ─── Building blocks ──────────────────────────────────────────────────────── */

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p
        className="text-[10.5px] font-bold uppercase tracking-widest"
        style={{ color: "#8fa394" }}
      >
        {label}
      </p>
      <p
        className="text-[13px] mt-1 font-medium break-words"
        style={{ color: "#111c14" }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#eef1ef" }}>
      <p className="text-[12px] font-bold mb-3" style={{ color: "#111c14" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function DetailTable({ num, table }: { num: string; table: RecordTable }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "#eef1ef" }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b"
        style={{ background: "#fafbfa", borderColor: "#eef1ef" }}
      >
        <p
          className="text-[11.5px] font-bold tracking-wide"
          style={{ color: "#111c14" }}
        >
          {num} · {table.title}
        </p>
        {table.meta && (
          <p className="text-[11px]" style={{ color: "#8fa394" }}>
            {table.meta}
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr style={{ color: "#b6c3ba" }}>
              {table.columns.map((c) => (
                <th
                  key={c}
                  className="px-4 py-2 text-[10.5px] uppercase tracking-wide font-semibold whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-t"
                style={{ borderColor: "#f2f4f2" }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-2.5 text-[12.5px] whitespace-nowrap"
                    style={{
                      color: ci === 0 ? "#111c14" : "#5a6b5e",
                      fontWeight: ci === 0 ? 600 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Detail panel ─────────────────────────────────────────────────────────── */

export function SubmissionDetail({
  record: r,
  type,
  status,
  initials,
  colorIndex = 0,
  loggedAt,
  event,
}: {
  record: RecordPayload;
  type: RecordKind;
  status: StatusKind;
  initials: string;
  colorIndex?: number;
  loggedAt: string;
  /** Optional one-line event summary, e.g. "AR submitted · Sep Cycle 1 · 18 outputs". */
  event?: string;
}) {
  const nextNum = String(3 + r.tables.length).padStart(2, "0");
  const hasContent = Boolean(r.topics || r.tasks || r.notes || r.attachment);
  const tone = statusTone[status];

  return (
    <div className="space-y-3.5">
      {/* Subject + status */}
      <div
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
        style={{ background: "#fafbfa", border: "1px solid #eef1ef" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            initials={initials}
            color={
              status === "Rejected" ? "#c0392b" : initialsColor(colorIndex)
            }
            size={38}
          />
          <div className="min-w-0">
            <p
              className="text-[13.5px] font-semibold truncate"
              style={{ color: "#111c14" }}
            >
              {r.facultyName}
            </p>
            <p className="text-[11.5px] truncate" style={{ color: "#8fa394" }}>
              Faculty #{r.facultyNumber} · {r.college}
            </p>
          </div>
        </div>
        <Badge tone={tone} dot>
          {status}
        </Badge>
      </div>

      <DetailSection title="01 · Record Information">
        <div className="grid grid-cols-4 gap-4">
          <DetailField
            label="Record Type"
            value={
              type === "AR"
                ? "Accomplishment Report (AR)"
                : "Daily Time Record (DTR)"
            }
          />
          <DetailField label="Period" value={r.period} />
          <DetailField label="Reference" value={r.reference} />
          <DetailField label="Logged Time" value={loggedAt} />
        </div>
      </DetailSection>

      <DetailSection title="02 · Faculty Information">
        <div className="grid grid-cols-3 gap-4">
          <DetailField label="Name" value={r.facultyName} />
          <DetailField label="Faculty #" value={r.facultyNumber} />
          <DetailField label="College" value={r.college} />
        </div>
      </DetailSection>

      {r.tables.length > 0 ? (
        r.tables.map((t, i) => (
          <DetailTable
            key={t.title}
            num={String(3 + i).padStart(2, "0")}
            table={t}
          />
        ))
      ) : (
        <div
          className="rounded-2xl border px-4 py-6 text-center text-[12.5px]"
          style={{
            borderColor: "#eef1ef",
            background: "#fafbfa",
            color: "#8fa394",
          }}
        >
          No submission was received for this period.
        </div>
      )}

      {hasContent && (
        <DetailSection title={`${nextNum} · Content`}>
          <div className="space-y-3">
            {r.topics && (
              <DetailField
                label="Topics Covered"
                value={
                  <span className="whitespace-pre-line font-normal">
                    {r.topics}
                  </span>
                }
              />
            )}
            {r.tasks && (
              <DetailField
                label="Tasks & Activities"
                value={
                  <span className="whitespace-pre-line font-normal">
                    {r.tasks}
                  </span>
                }
              />
            )}
            {r.notes && (
              <DetailField
                label="Notes"
                value={
                  <span className="whitespace-pre-line font-normal">
                    {r.notes}
                  </span>
                }
              />
            )}
            <DetailField label="Attachment" value={r.attachment ?? "None"} />
          </div>
        </DetailSection>
      )}

      <DetailSection title="Status">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone={tone} dot>
              {status}
            </Badge>
            {event && (
              <span className="text-[12.5px]" style={{ color: "#5a6b5e" }}>
                {event}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Reviewed By" value={r.reviewer} />
            <DetailField label="Reviewed At" value={r.reviewedAt} />
          </div>
          <DetailField
            label="Remark"
            value={<span className="font-normal">{r.remark}</span>}
          />
        </div>
      </DetailSection>
    </div>
  );
}
