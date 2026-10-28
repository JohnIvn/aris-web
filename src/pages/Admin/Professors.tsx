import { useState } from "react";
import { useNavigate } from "react-router";
import ProfileDetailsModal, { ProfileModalData } from "@/components/ProfileDetailsModal";
import { Card, PageTitle, PrimaryButton, GhostButton, SearchInput, Badge, Avatar, Tabs, StatCard, StatGrid, initialsColor, Modal } from "@/components/ui";
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

/* FIX 1: one grid template shared by the header and every row.
   - minmax(0, Nfr) lets columns shrink/grow with the table instead of being
     sized by their content, so they stay dynamic.
   - gap-x-6 gives the exact same gap between every pair of columns.
   - The Action column is a fixed width so it never steals space from the rest. */
const ROW_GRID =
  "grid min-w-[1000px] items-center gap-x-6 px-5 " +
  "grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(110px,1fr)_minmax(100px,1.2fr)_64px]";

export default function Professors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [selected, setSelected] = useState<Professor | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [pendingToggle, setPendingToggle] = useState<Professor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Professor | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
    : [
        "Computer Studies Department",
        "Languages & Humanities Department",
        "Mathematics & Natural Sciences Department",
        "Business Administration Department",
        "Accountancy Department",
        "Criminal Justice Department",
        "Teacher Education Department",
        "Engineering Department",
      ];
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
      password: updatedData.password?.trim() || undefined,
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

  return (
    <div className="pb-2">
      <PageTitle title="Professor Management" subtitle={`${items.length} faculty across ${departments.length || 6} colleges.`} action={<PrimaryButton onClick={() => navigate("/professors/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>Add Professor</PrimaryButton>} />
      {saveError && <p role="alert" className="mb-3 text-[12px] text-red-700">{saveError}</p>}

      <StatGrid className="mb-4">
        {stats.map(([l, v]) => (
          <StatCard key={l} label={l} value={v} />
        ))}
      </StatGrid>

      <Card className="p-0 overflow-x-auto">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#eef1ef" }}>
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
          <div className="flex gap-2">
            <SearchInput placeholder="Search faculty" value={search} onChange={setSearch} />
            <label className="sr-only" htmlFor="professor-department-filter">Filter by department</label>
            <select id="professor-department-filter" value={department} onChange={(event) => setDepartment(event.target.value)} className="h-9 max-w-44 rounded-xl border bg-white px-3 text-[12px] text-[#3d4a41]" style={{ borderColor: "#e2e8e4" }}>
              <option>All departments</option>
              {departments.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>

        {/* Header row */}
        <div className={`${ROW_GRID} py-2.5 text-[11px] uppercase tracking-wide font-semibold [&>*]:min-w-0`} style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Name</span><span>Department</span><span>Rank</span><span>Courses</span><span>Status</span><span>OAuth</span><span className="text-right">Action</span>
        </div>

        {/* Body rows */}
        {rows.map((p, i) => (
          <div key={p.email} onClick={() => { setSelected(p); setModalMode("view"); }} className={`${ROW_GRID} py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer [&>*]:min-w-0`} style={{ borderColor: "#f2f4f2" }}>
            <button type="button" aria-label={`View details for ${p.name}`} onClick={(event) => { event.stopPropagation(); setSelected(p); setModalMode("view"); }} className="flex min-w-0 items-center gap-3 text-left">
              <Avatar initials={p.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()} color={initialsColor(i)} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{p.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{p.email}</p>
              </div>
            </button>
            <span className="break-words text-[13px]" style={{ color: "#3d4a41" }}>{p.dept}</span>
            <span className="break-words text-[13px]" style={{ color: "#3d4a41" }}>{p.rank}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>{p.courses}</span>
            <span><Badge tone={p.active ? "green" : "gray"} dot>{p.active ? "Active" : "Deactivated"}</Badge></span>
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
            <span className="relative flex justify-end">
              <button type="button" aria-label={`Actions for ${p.name}`} aria-expanded={openMenu === p.email} onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === p.email ? null : p.email); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
              </button>
              {openMenu === p.email && <div className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg" style={{ borderColor: "#e2e8e4" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(p); setModalMode("view"); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">View details</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(p); setModalMode("edit"); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] text-[#2d4a36] font-medium hover:bg-[#f4f6f5]">Edit professor</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setPendingToggle(p); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">{p.active ? "Deactivate" : "Reactivate"}</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setPendingDelete(p); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] text-red-700 hover:bg-[#fbecec]">Delete</button>
              </div>}
            </span>
          </div>
        ))}
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