import { useState, type ReactNode } from "react";
import { BRAND } from "@/config/navigation";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 ${className}`}
      style={{ boxShadow: "0 1px 2px rgba(16,32,20,0.05)", ...style }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  valueColor = "#111c14",
  detail,
  badge,
  footer,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  valueColor?: string;
  detail?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`py-4 ${className}`}>
      <p className="text-[12px]" style={{ color: "#8fa394" }}>{label}</p>
      <div className="flex flex-wrap items-end justify-between gap-2 mt-1">
        <p className="text-[24px] font-bold tracking-tight tabular-nums" style={{ color: valueColor }}>{value}</p>
        {badge}
      </div>
      {detail && <div className="text-[11.5px] mt-1" style={{ color: "#8fa394" }}>{detail}</div>}
      {footer}
    </Card>
  );
}

export function StatGrid({
  children,
  columns = 4,
  className = "",
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const columnClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
  }[columns];

  return <div className={`grid ${columnClass} gap-3 ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold" style={{ color: "#111c14" }}>{title}</h2>
        {description && <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

const toneMap: Record<string, { bg: string; c: string }> = {
  green: { bg: "#eaf4ee", c: "#2f7043" },
  amber: { bg: "#fbf1de", c: "#996515" },
  red: { bg: "#fbecec", c: "#c0392b" },
  blue: { bg: "#e7f1fa", c: "#2b6ca3" },
  gray: { bg: "#f0f2f0", c: "#5a6b5e" },
};

export function Badge({
  children,
  tone = "gray",
  dot = false,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
  dot?: boolean;
}) {
  const t = toneMap[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: t.bg, color: t.c }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: t.c }}
        />
      )}
      {children}
    </span>
  );
}

export function Avatar({
  initials,
  color = BRAND,
  size = 36,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color + "22",
        color,
        fontSize: size * 0.32,
      }}
    >
      {initials}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ color: "#111c14" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13.5px] mt-0.5" style={{ color: "#8fa394" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-transform active:scale-[0.99]"
      style={{ background: BRAND }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium bg-white border transition-colors hover:bg-[#f7f9f8]"
      style={{ borderColor: "#e2e8e4", color: "#3d4a41" }}
    >
      {children}
    </button>
  );
}

export function SearchInput({
  placeholder = "Search",
  value,
  onChange,
  className = "w-44",
}: {
  placeholder?: string;
  /** Provide to control the field from the parent; omit for internal state. */
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState("");
  const v = value ?? internal;
  const update = (next: string) => {
    setInternal(next);
    onChange?.(next);
  };
  return (
    <div
      className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white border"
      style={{ borderColor: "#e2e8e4" }}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="#8fa394"
        strokeWidth="1.6"
        className="w-4 h-4 flex-shrink-0"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5l3 3" />
      </svg>
      <input
        value={v}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent outline-none text-[13px] ${className}`}
        style={{ color: "#111c14" }}
      />
    </div>
  );
}

export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0"
      style={{ background: on ? BRAND : "#d6ded8" }}
      role="switch"
      aria-checked={on}
    >
      <span
        className="block w-5 h-5 rounded-full bg-white transition-transform"
        style={{
          transform: on ? "translateX(16px)" : "translateX(0)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex gap-1 p-0.5 rounded-xl w-fit"
      style={{ background: "#f0f2f0" }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: value === t ? "#fff" : "transparent",
            color: value === t ? "#111c14" : "#8fa394",
            boxShadow: value === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export const initialsColor = (i: number) =>
  ["#3a7d4e", "#3f8ecc", "#d99a2b", "#8a63c4", "#c0563a", "#2b9c8a"][i % 6];

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  icon,
  size = "sm",
  align = "center",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  /** Dialog width: `sm` for confirms, `lg` for detail panels. */
  size?: "sm" | "lg";
  /** Content alignment. Confirm dialogs center, detail panels left-align. */
  align?: "center" | "left";
}) {
  if (!isOpen) return null;
  const isWide = size === "lg";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`bg-white rounded-3xl w-full ${
          isWide ? "max-w-3xl" : "max-w-sm"
        } shadow-2xl p-6 flex flex-col ${
          align === "center" ? "items-center text-center" : "text-left"
        } max-h-[88vh] transform transition-all scale-100`}
      >
        {icon && <div className="mb-4">{icon}</div>}
        <h2
          className="text-[18px] font-bold mb-2 tracking-tight"
          style={{ color: "#111c14" }}
        >
          {title}
        </h2>
        <div
          className={`text-[14px] mb-6 leading-relaxed ${
            isWide ? "overflow-y-auto pr-1 min-h-0" : ""
          }`}
          style={{ color: "#5a6b5e" }}
        >
          {children}
        </div>
        {actions && (
          <div className="flex w-full items-center justify-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

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
  | "Disapproved"
  | "Rejected"
  | "Flagged"
  | "Pending"
  | "Missing";

export const statusTone: Record<
  StatusKind,
  "blue" | "green" | "red" | "amber" | "gray"
> = {
  Submitted: "blue",
  Approved: "green",
  Disapproved: "red",
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
