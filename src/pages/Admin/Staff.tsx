import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import ProfileDetailsModal, { ProfileModalData } from "@/components/ProfileDetailsModal";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Badge,
  Avatar,
  Tabs,
  StatCard,
  StatGrid,
  Modal,
} from "@/components/ui";

// Staff IDs are prefixed by role: CHK (Checker), SEC (Secretary), HR (HR), ACC (Accounting)
type StaffMember = {
  id?: string;
  employee_id?: string;
  name?: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  email: string;
  role?: string;
  position?: string | null;
  dept?: string;
  department?: string | null;
  status?: "Active" | "On Leave";
  is_banned?: boolean;
  phone?: string | null;
  address?: string | null;
};

const demoStaff: StaffMember[] = [
  { name: "James Reyes", email: "j.reyes@aris.edu.ph", id: "CHK-0142", role: "Checker", dept: "Attendance", status: "Active" as const },
  { name: "Marco Dela Cruz", email: "m.delacruz@aris.edu.ph", id: "CHK-0143", role: "Checker", dept: "Attendance", status: "Active" as const },
  { name: "Ben Salvador", email: "b.salvador@aris.edu.ph", id: "CHK-0144", role: "Checker", dept: "Records Review", status: "Active" as const },
  { name: "Carla Ramos", email: "c.ramos@aris.edu.ph", id: "SEC-0071", role: "Secretary", dept: "Dean's Office", status: "Active" as const },
  { name: "Liza Fernandez", email: "l.fernandez@aris.edu.ph", id: "SEC-0072", role: "Secretary", dept: "Registrar", status: "On Leave" as const },
  { name: "Ana Bautista", email: "a.bautista@aris.edu.ph", id: "HR-0035", role: "HR", dept: "Human Resources", status: "Active" as const },
  { name: "Rina Torres", email: "r.torres@aris.edu.ph", id: "HR-0036", role: "HR", dept: "Recruitment", status: "Active" as const },
  { name: "Paolo Garcia", email: "p.garcia@aris.edu.ph", id: "ACC-0028", role: "Accounting", dept: "Finance", status: "Active" as const },
  { name: "Nina Villanueva", email: "n.villanueva@aris.edu.ph", id: "ACC-0029", role: "Accounting", dept: "Payroll", status: "Active" as const },
];

const staffStatusTone = { Active: "green", "On Leave": "amber" } as const;
const statusDotColor = { Active: "#3a7d4e", "On Leave": "#d99a2b" } as const;
const roleColor: Record<string, string> = { Checker: "#3a7d4e", Secretary: "#3f8ecc", HR: "#8a63c4", Accounting: "#d99a2b" };

/* ------------------------------------------------------------------ */
/* Row action menu (portal, so it never gets clipped by the table)     */
/* ------------------------------------------------------------------ */

type MenuItem = { label: string; onClick: () => void; danger?: boolean };

function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos, close]);

  const toggle = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (pos) {
      close();
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = items.length * 36 + 8;
    const right = Math.max(8, window.innerWidth - rect.right);
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight && rect.top > menuHeight + 8;
    setPos(
      openUp
        ? { bottom: window.innerHeight - rect.top + 4, right }
        : { top: rect.bottom + 4, right },
    );
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(pos)}
        onClick={toggle}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0] active:bg-[#e8ece9]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[60] min-w-40 rounded-lg border bg-white p-1 shadow-lg"
            style={{ borderColor: "#e2e8e4", top: pos.top, bottom: pos.bottom, right: pos.right }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  item.onClick();
                }}
                className={`block h-9 w-full rounded-md px-3 text-left text-[12.5px] ${
                  item.danger ? "text-red-700 hover:bg-[#fbecec]" : "text-[#111c14] hover:bg-[#f4f6f5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Responsive data table (table on lg+, compact list on mobile)        */
/* ------------------------------------------------------------------ */

type TableColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  maxWidth?: number;
  minWidth?: number;
};

function DataTable<T>({
  rows,
  getKey,
  primaryHeader,
  renderPrimary,
  columns,
  getMenu,
  menuLabel,
  rowLabel,
  onRowClick,
  mobileMeta,
  emptyText,
}: {
  rows: T[];
  getKey: (row: T) => string;
  primaryHeader: string;
  renderPrimary: (row: T, index: number) => ReactNode;
  columns: TableColumn<T>[];
  getMenu: (row: T) => MenuItem[];
  menuLabel: (row: T) => string;
  rowLabel: (row: T) => string;
  onRowClick: (row: T) => void;
  mobileMeta?: (row: T) => ReactNode;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-[13px]" style={{ color: "#8fa394" }}>
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "#b6c3ba", background: "#fafbfa" }}
            >
              <th className="w-full whitespace-nowrap py-2.5 pl-5 pr-4 font-semibold">{primaryHeader}</th>
              {columns.map((c) => (
                <th key={c.header} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {c.header}
                </th>
              ))}
              <th className="whitespace-nowrap py-2.5 pl-4 pr-5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={getKey(row)}
                onClick={() => onRowClick(row)}
                className="cursor-pointer border-t transition-colors hover:bg-[#fafbfa]"
                style={{ borderColor: "#f2f4f2" }}
              >
                <td className="min-w-[240px] py-3 pl-5 pr-4 align-middle">
                  <button
                    type="button"
                    aria-label={rowLabel(row)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(row);
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    {renderPrimary(row, i)}
                  </button>
                </td>

                {columns.map((c) => (
                  <td key={c.header} className="px-4 py-3 align-middle text-[13px]" style={{ color: "#3d4a41" }}>
                    {c.maxWidth ? (
                      <div
                        className="whitespace-normal break-words"
                        style={{ maxWidth: c.maxWidth, minWidth: c.minWidth }}
                      >
                        {c.cell(row)}
                      </div>
                    ) : (
                      <div className="whitespace-nowrap">{c.cell(row)}</div>
                    )}
                  </td>
                ))}

                <td className="whitespace-nowrap py-3 pl-4 pr-5 text-right align-middle">
                  <RowMenu label={menuLabel(row)} items={getMenu(row)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile compact list */}
      <div className="divide-y lg:hidden" style={{ borderColor: "#f2f4f2" }}>
        {rows.map((row, i) => (
          <div
            key={getKey(row)}
            onClick={() => onRowClick(row)}
            className="flex cursor-pointer items-center justify-between gap-3 p-3 transition-colors active:bg-[#fafbfa]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">{renderPrimary(row, i)}</div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {mobileMeta && mobileMeta(row)}
              <RowMenu label={menuLabel(row)} items={getMenu(row)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PrimaryText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[13.5px] font-medium" style={{ color: "#111c14" }}>
        {title}
      </p>
      {subtitle && (
        <p className="truncate text-[11.5px]" style={{ color: "#8fa394" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Staff() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [pendingStatus, setPendingStatus] = useState<StaffMember | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: resourceStaff, setData: setResourceStaff } = useResource<StaffMember[]>("/staff", demoStaff);
  const { data: deptResources } = useResource<{ id: string; name: string }[]>("/curriculum/departments?active=true", []);

  const staff = resourceStaff.map((person) => ({
    ...person,
    id: person.id ?? person.employee_id ?? "",
    name: person.name ?? ([person.firstname, person.middlename, person.lastname].filter(Boolean).join(" ") || "Unknown staff member"),
    role: person.role ?? person.position ?? "Staff",
    dept: person.dept ?? person.department ?? "Unassigned",
    status: person.status ?? (person.is_banned ? "On Leave" : "Active"),
    phone: person.phone ?? null,
    address: person.address ?? null,
  }));
  const setStaff = (nextStaff: StaffMember[]) => setResourceStaff(nextStaff);
  const tabs = ["All", "Checker", "Secretary", "HR", "Accounting"];

  const loadedDeptNames = Array.isArray(deptResources) && deptResources.length > 0
    ? deptResources.map((d) => d.name)
    : ["Engineering", "Computer Science", "Business", "Sciences", "Arts & Humanities", "Human Resources", "Finance", "Payroll", "Registrar", "Dean's Office", "Attendance"];
  const departments = [...new Set(loadedDeptNames)].filter(Boolean);
  const modalDepartments = selected?.dept && selected.dept !== "Unassigned" && !departments.includes(selected.dept)
    ? [selected.dept, ...departments]
    : departments;

  const rows = staff.filter((person) => {
    const matchesRole = tab === "All" || person.role === tab;
    const matchesStatus = statusFilter === "All statuses" || person.status === statusFilter;
    const matchesSearch = `${person.name} ${person.email} ${person.id} ${person.role} ${person.dept}`.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getStaffModalData = (s: StaffMember | null): ProfileModalData | null => {
    if (!s) return null;
    let fn = s.firstname ?? "";
    let mn = s.middlename ?? "";
    let ln = s.lastname ?? "";
    if (!fn && !ln && s.name) {
      const parts = s.name.trim().split(/\s+/);
      fn = parts[0] || "";
      ln = parts.length > 1 ? parts[parts.length - 1] : "";
      mn = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
    }
    return {
      id: s.id,
      firstname: fn,
      middlename: mn,
      lastname: ln,
      email: s.email,
      department: s.dept ?? s.department ?? "",
      roleOrRank: s.role ?? s.position ?? "Checker",
      status: s.status ?? "Active",
      phone: s.phone || "",
      address: s.address || "",
    };
  };

  const handleSaveStaff = async (updatedData: ProfileModalData) => {
    if (!selected?.id) throw new Error("This staff member does not have a server ID.");
    const isActive = updatedData.status === "Active";
    const updated = await saveResource<StaffMember>(`/staff/${selected.id}`, {
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      email: updatedData.email.trim().toLowerCase(),
      position: updatedData.roleOrRank?.trim() || null,
      department: updatedData.department?.trim() || null,
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
      active: isActive,
      password: updatedData.password?.trim() || undefined,
    }, "PATCH");

    const updatedFullName = [updatedData.firstname.trim(), updatedData.middlename?.trim(), updatedData.lastname.trim()]
      .filter(Boolean)
      .join(" ");

    const updatedStaff: StaffMember = {
      ...selected,
      ...updated,
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      name: updatedFullName || selected.name,
      email: updatedData.email.trim().toLowerCase(),
      role: updatedData.roleOrRank,
      position: updatedData.roleOrRank,
      dept: updatedData.department?.trim() || "Unassigned",
      department: updatedData.department?.trim() || null,
      status: updatedData.status as "Active" | "On Leave",
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
      is_banned: !isActive,
    };

    setStaff(staff.map((item) => (item.id === selected.id ? updatedStaff : item)));
    setSelected(updatedStaff);
  };

  const updateStatus = async (person: StaffMember) => {
    const updated = staff.map((item) => item.id === person.id ? { ...item, status: item.status === "Active" ? "On Leave" as const : "Active" as const } : item);
    setStaff(updated);
    setPendingStatus(null);
    try {
      if (!person.id) throw new Error("This staff member does not have a server ID.");
      await saveResource<void>(`/staff/${person.id}/status`, { active: person.status !== "Active" }, "PATCH");
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to update staff status.");
    }
  };

  const deleteStaff = async (person: StaffMember) => {
    setPendingDelete(null);
    try {
      if (!person.id) throw new Error("This staff member does not have a server ID.");
      await saveResource<void>(`/staff/${person.id}`, undefined, "DELETE");
      setStaff(staff.filter((item) => item.id !== person.id));
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to delete staff member.");
    }
  };

  const counts = {
    Checker: staff.filter((s) => s.role === "Checker").length,
    Secretary: staff.filter((s) => s.role === "Secretary").length,
    HR: staff.filter((s) => s.role === "HR").length,
    Accounting: staff.filter((s) => s.role === "Accounting").length,
  };

  type Row = (typeof staff)[number];

  const columns: TableColumn<Row>[] = [
    { header: "Staff ID", cell: (s) => <span className="text-[12.5px] font-semibold tabular-nums">{s.id || "—"}</span> },
    {
      header: "Role",
      cell: (s) => (
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: roleColor[s.role] ?? "#b6c3ba" }} />
          {s.role}
        </span>
      ),
    },
    { header: "Department", maxWidth: 220, minWidth: 140, cell: (s) => s.dept },
    { header: "Status", cell: (s) => <Badge tone={staffStatusTone[s.status]} dot>{s.status}</Badge> },
  ];

  return (
    <div className="pb-2">
      <PageTitle
        title="Staff Management"
        subtitle="Support staff by role — checkers, secretaries, HR, and accounting."
        action={
          <PrimaryButton onClick={() => navigate("/staff/new")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            Add Staff
          </PrimaryButton>
        }
      />
      {saveError && <p role="alert" className="mb-3 text-[12px] text-red-700">{saveError}</p>}

      <StatGrid columns={5} className="mb-4">
        <StatCard label="Total Staff" value={staff.length} />
        {(["Checker", "Secretary", "HR", "Accounting"] as const).map((r) => (
          <StatCard key={r} label={<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: roleColor[r] }} />{r}</span>} value={counts[r]} />
        ))}
      </StatGrid>

      <Card className="min-w-0 overflow-hidden p-0">
        <div
          className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center lg:justify-between lg:p-4"
          style={{ borderColor: "#eef1ef" }}
        >
          <div className="min-w-0 overflow-x-auto [&_button]:flex-shrink-0 [&_button]:whitespace-nowrap">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <SearchInput placeholder="Search staff or ID" value={search} onChange={setSearch} className="w-full lg:w-60" />
            <label className="sr-only" htmlFor="staff-status-filter">Filter by status</label>
            <select
              id="staff-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 w-full rounded-xl border bg-white px-3 text-[12px] text-[#3d4a41] sm:max-w-44"
              style={{ borderColor: "#e2e8e4" }}
            >
              {["All statuses", "Active", "On Leave"].map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>

        <DataTable<Row>
          rows={rows}
          getKey={(s) => s.id || s.email}
          primaryHeader="Name"
          columns={columns}
          emptyText="No staff found matching your criteria."
          onRowClick={(s) => { setSelected(s); setModalMode("view"); }}
          rowLabel={(s) => `View details for ${s.name}`}
          menuLabel={(s) => `Actions for ${s.name}`}
          mobileMeta={(s) => (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: statusDotColor[s.status] }}
              aria-label={s.status}
            />
          )}
          renderPrimary={(s) => (
            <>
              <Avatar
                initials={s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                color={roleColor[s.role] ?? "#8fa394"}
              />
              {/* Desktop shows the email; mobile shows ID • role so the row stays brief */}
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium" style={{ color: "#111c14" }}>{s.name}</p>
                <p className="hidden truncate text-[11.5px] lg:block" style={{ color: "#8fa394" }}>{s.email}</p>
                <p className="truncate text-[11.5px] lg:hidden" style={{ color: "#8fa394" }}>
                  {s.id ? `${s.id} • ${s.role}` : s.role}
                </p>
              </div>
            </>
          )}
          getMenu={(s) => [
            { label: "View details", onClick: () => { setSelected(s); setModalMode("view"); } },
            { label: "Edit staff", onClick: () => { setSelected(s); setModalMode("edit"); } },
            { label: s.status === "Active" ? "Set on leave" : "Reactivate", onClick: () => setPendingStatus(s) },
            { label: "Delete", danger: true, onClick: () => setPendingDelete(s) },
          ]}
        />
      </Card>

      {/* Unified Profile Details & Edit Modal */}
      <ProfileDetailsModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Staff ID"
        initialMode={modalMode}
        data={getStaffModalData(selected)}
        departmentOptions={modalDepartments}
        roleOrRankOptions={["Checker", "Secretary", "HR", "Accounting"]}
        roleOrRankLabel="Role"
        statusOptions={[
          { label: "Active", value: "Active" },
          { label: "On Leave", value: "On Leave" },
        ]}
        onSave={handleSaveStaff}
      />

      <Modal isOpen={Boolean(pendingStatus)} onClose={() => setPendingStatus(null)} title={pendingStatus?.status === "Active" ? "Set staff member on leave?" : "Reactivate staff member?"} actions={<><GhostButton onClick={() => setPendingStatus(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingStatus && void updateStatus(pendingStatus)}>{pendingStatus?.status === "Active" ? "Set on leave" : "Reactivate"}</PrimaryButton></>}>
        {pendingStatus && <>Confirm status change for {pendingStatus.name}?</>}
      </Modal>
      <Modal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete staff member?" actions={<><GhostButton onClick={() => setPendingDelete(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingDelete && void deleteStaff(pendingDelete)}>Delete</PrimaryButton></>}>
        {pendingDelete && <>Are you sure you want to permanently delete {pendingDelete.name}? This action cannot be undone.</>}
      </Modal>
    </div>
  );
}