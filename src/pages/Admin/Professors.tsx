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
import { Card, PageTitle, PrimaryButton, GhostButton, SearchInput, Badge, Avatar, Tabs, StatCard, StatGrid, initialsColor, Modal } from "@/components/ui";
import { BRAND } from "@/config/navigation";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

type Professor = {
  id?: string;
  name?: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  email: string;
  dept?: string;
  department?: string | null;
  rank?: string;
  position?: string | null;
  courses?: number;
  provider?: "local" | "google";
  active?: boolean;
  is_banned?: boolean;
  phone?: string | null;
  address?: string | null;
};

const people: Professor[] = [
  { name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", dept: "Engineering", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", dept: "Computer Science", rank: "Associate Prof.", courses: 3, active: true },
  { name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", dept: "Business", rank: "Professor", courses: 5, active: true },
  { name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", dept: "Sciences", rank: "Assistant Prof.", courses: 2, active: false },
  { name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", dept: "Arts & Humanities", rank: "Lecturer", courses: 3, active: true },
  { name: "Dr. Nestor Villar", email: "n.villar@aris.edu.ph", dept: "Engineering", rank: "Adjunct", courses: 1, active: false },
  { name: "Dr. Sofia Mendoza", email: "s.mendoza@aris.edu.ph", dept: "Computer Science", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Daniel Ong", email: "d.ong@aris.edu.ph", dept: "Business", rank: "Associate Prof.", courses: 3, active: false },
];

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

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: active ? BRAND : "#b6c3ba" }}
      aria-label={active ? "Active" : "Deactivated"}
    />
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

export default function Professors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [selected, setSelected] = useState<Professor | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [pendingToggle, setPendingToggle] = useState<Professor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Professor | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: resourceItems, setData: setResourceItems } = useResource<Professor[]>("/professors", people);
  const { data: deptResources } = useResource<{ id: string; name: string }[]>("/curriculum/departments?active=true", []);
  const { data: rankResources } = useResource<{ id: string; name: string }[]>("/curriculum/ranks?active=true", []);

  const items = resourceItems.map((person) => ({
    ...person,
    name: person.name ?? ([person.firstname, person.middlename, person.lastname].filter(Boolean).join(" ") || "Unknown professor"),
    dept: person.dept ?? person.department ?? "Unassigned",
    rank: person.rank ?? person.position ?? "Professor",
    courses: person.courses ?? 0,
    active: person.active ?? !person.is_banned,
    phone: person.phone ?? null,
    address: person.address ?? null,
  }));
  const setItems = (nextItems: Professor[]) => setResourceItems(nextItems);
  const tabs = ["All", "Active", "Deactivated"];

  const loadedDeptNames = Array.isArray(deptResources) && deptResources.length > 0
    ? deptResources.map((d) => d.name)
    : ["Engineering", "Computer Science", "Business", "Sciences", "Arts & Humanities"];
  const departments = [...new Set(loadedDeptNames)].filter(Boolean);
  const modalDepartments = selected?.dept && selected.dept !== "Unassigned" && !departments.includes(selected.dept)
    ? [selected.dept, ...departments]
    : departments;

  const loadedRankNames = Array.isArray(rankResources) && rankResources.length > 0
    ? rankResources.map((r) => r.name)
    : ["Professor", "Associate Prof.", "Assistant Prof.", "Lecturer", "Adjunct"];
  const ranksList = [...new Set(loadedRankNames)].filter(Boolean);
  const modalRanksList = selected?.rank && !ranksList.includes(selected.rank)
    ? [selected.rank, ...ranksList]
    : ranksList;

  const getProfessorModalData = (p: Professor | null): ProfileModalData | null => {
    if (!p) return null;
    let fn = p.firstname ?? "";
    let mn = p.middlename ?? "";
    let ln = p.lastname ?? "";
    if (!fn && !ln && p.name) {
      const parts = p.name.replace(/^(dr|prof)\.?\s+/i, "").trim().split(/\s+/);
      fn = parts[0] || "";
      ln = parts.length > 1 ? parts[parts.length - 1] : "";
      mn = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";
    }
    return {
      id: p.id,
      firstname: fn,
      middlename: mn,
      lastname: ln,
      email: p.email,
      department: p.dept ?? p.department ?? "",
      roleOrRank: p.rank ?? p.position ?? "Professor",
      status: p.active ? "Active" : "Deactivated",
      phone: p.phone || "",
      address: p.address || "",
      oauthConnected: p.provider === "google",
    };
  };

  const handleSaveProfessor = async (updatedData: ProfileModalData) => {
    if (!selected?.id) throw new Error("This professor does not have a server ID.");
    const isActive = updatedData.status === "Active";
    const updated = await saveResource<Professor>(`/professors/${selected.id}`, {
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      email: updatedData.email.trim().toLowerCase(),
      department: updatedData.department?.trim() || null,
      position: updatedData.roleOrRank?.trim() || null,
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
      active: isActive,
    }, "PATCH");

    const updatedFullName = [updatedData.firstname.trim(), updatedData.middlename?.trim(), updatedData.lastname.trim()]
      .filter(Boolean)
      .join(" ");

    const updatedProf: Professor = {
      ...selected,
      ...updated,
      firstname: updatedData.firstname.trim(),
      middlename: updatedData.middlename?.trim() || null,
      lastname: updatedData.lastname.trim(),
      name: updatedFullName || selected.name,
      email: updatedData.email.trim().toLowerCase(),
      dept: updatedData.department?.trim() || "Unassigned",
      department: updatedData.department?.trim() || null,
      rank: updatedData.roleOrRank?.trim() || "Professor",
      position: updatedData.roleOrRank?.trim() || null,
      phone: updatedData.phone?.trim() || null,
      address: updatedData.address?.trim() || null,
      active: isActive,
    };

    setItems(items.map((item) => (item.id === selected.id ? updatedProf : item)));
    setSelected(updatedProf);
  };

  const toggle = async (person: Professor) => {
    const updatedItems = items.map((item) => item.email === person.email ? { ...item, active: !item.active } : item);
    setItems(updatedItems);
    setPendingToggle(null);
    try {
      if (!person.id) throw new Error("This professor does not have a server ID.");
      await saveResource<void>(`/professors/${person.id}/status`, { active: !person.active }, "PATCH");
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to update professor.");
    }
  };

  const deleteProfessor = async (person: Professor) => {
    setPendingDelete(null);
    try {
      if (!person.id) throw new Error("This professor does not have a server ID.");
      await saveResource<void>(`/professors/${person.id}`, undefined, "DELETE");
      setItems(items.filter((item) => item.id !== person.id));
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to delete professor.");
    }
  };

  const rows = items.filter((person) => {
    const matchesTab = tab === "All" || (tab === "Active" ? person.active : !person.active);
    const matchesDepartment = department === "All departments" || person.dept === department;
    const matchesSearch = `${person.name} ${person.email} ${person.dept} ${person.rank}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesDepartment && matchesSearch;
  });

  const activeCount = items.filter((p) => p.active).length;
  const stats = [
    ["Total Faculty", String(items.length)],
    ["Active", String(activeCount)],
    ["Deactivated", String(items.length - activeCount)],
    ["Colleges", String(departments.length || 6)],
  ];

  type Row = (typeof items)[number];

  const columns: TableColumn<Row>[] = [
    { header: "Department", maxWidth: 220, minWidth: 140, cell: (p) => p.dept },
    { header: "Rank", cell: (p) => p.rank },
    { header: "Courses", cell: (p) => <span className="font-medium" style={{ color: "#111c14" }}>{p.courses}</span> },
    {
      header: "Status",
      cell: (p) => (
        <Badge tone={p.active ? "green" : "gray"} dot>
          {p.active ? "Active" : "Deactivated"}
        </Badge>
      ),
    },
    {
      header: "OAuth",
      cell: (p) => (
        <span aria-label={p.provider === "google" ? "Connected via Google" : "OAuth not connected"}>
          <Badge tone={p.provider === "google" ? "green" : "gray"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8.5 12h7" />
              <path d="M10.5 8.5 8.7 6.7a3.2 3.2 0 0 0-4.5 4.5l2.6 2.6a3.2 3.2 0 0 0 4.5 0l1.2-1.2" />
              <path d="m13.5 15.5 1.8 1.8a3.2 3.2 0 0 0 4.5-4.5l-2.6-2.6a3.2 3.2 0 0 0-4.5 0l-1.2 1.2" />
            </svg>
            {p.provider === "google" ? "Google" : "None"}
          </Badge>
        </span>
      ),
    },
  ];

  return (
    <div className="pb-2">
      <PageTitle
        title="Professor Management"
        subtitle={`${items.length} faculty across ${departments.length || 6} colleges.`}
        action={
          <PrimaryButton onClick={() => navigate("/professors/new")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            Add Professor
          </PrimaryButton>
        }
      />
      {saveError && <p role="alert" className="mb-3 text-[12px] text-red-700">{saveError}</p>}

      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
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
            <SearchInput placeholder="Search faculty" value={search} onChange={setSearch} className="w-full lg:w-60" />
            <label className="sr-only" htmlFor="professor-department-filter">Filter by department</label>
            <select
              id="professor-department-filter"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-9 w-full rounded-xl border bg-white px-3 text-[12px] text-[#3d4a41] sm:max-w-44"
              style={{ borderColor: "#e2e8e4" }}
            >
              <option>All departments</option>
              {departments.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>

        <DataTable<Row>
          rows={rows}
          getKey={(p) => p.id ?? p.email}
          primaryHeader="Name"
          columns={columns}
          emptyText="No faculty found matching your criteria."
          onRowClick={(p) => { setSelected(p); setModalMode("view"); }}
          rowLabel={(p) => `View details for ${p.name}`}
          menuLabel={(p) => `Actions for ${p.name}`}
          mobileMeta={(p) => <StatusDot active={p.active} />}
          renderPrimary={(p, i) => (
            <>
              <Avatar initials={p.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()} color={initialsColor(i)} />
              {/* Desktop shows the email; mobile shows rank • department so the row stays brief */}
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium" style={{ color: "#111c14" }}>{p.name}</p>
                <p className="hidden truncate text-[11.5px] lg:block" style={{ color: "#8fa394" }}>{p.email}</p>
                <p className="truncate text-[11.5px] lg:hidden" style={{ color: "#8fa394" }}>{p.rank} • {p.dept}</p>
              </div>
            </>
          )}
          getMenu={(p) => [
            { label: "View details", onClick: () => { setSelected(p); setModalMode("view"); } },
            { label: "Edit professor", onClick: () => { setSelected(p); setModalMode("edit"); } },
            { label: p.active ? "Deactivate" : "Reactivate", onClick: () => setPendingToggle(p) },
            { label: "Delete", danger: true, onClick: () => setPendingDelete(p) },
          ]}
        />
      </Card>

      {/* Unified Profile Details & Edit Modal */}
      <ProfileDetailsModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Professor ID"
        initialMode={modalMode}
        data={getProfessorModalData(selected)}
        departmentOptions={modalDepartments}
        roleOrRankOptions={modalRanksList}
        roleOrRankLabel="Rank"
        statusOptions={[
          { label: "Active", value: "Active" },
          { label: "Deactivated", value: "Deactivated" },
        ]}
        onSave={handleSaveProfessor}
      />

      <Modal isOpen={Boolean(pendingToggle)} onClose={() => setPendingToggle(null)} title={pendingToggle?.active ? "Deactivate professor?" : "Reactivate professor?"} actions={<><GhostButton onClick={() => setPendingToggle(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingToggle && void toggle(pendingToggle)}>{pendingToggle?.active ? "Deactivate" : "Reactivate"}</PrimaryButton></>}>
        {pendingToggle && <>Are you sure you want to {pendingToggle.active ? "deactivate" : "reactivate"} {pendingToggle.name}?</>}
      </Modal>
      <Modal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete professor?" actions={<><GhostButton onClick={() => setPendingDelete(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingDelete && void deleteProfessor(pendingDelete)}>Delete</PrimaryButton></>}>
        {pendingDelete && <>Are you sure you want to permanently delete {pendingDelete.name}? This action cannot be undone.</>}
      </Modal>
    </div>
  );
}