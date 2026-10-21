import { useState } from "react";
import { useNavigate } from "react-router";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import { Card, PageTitle, PrimaryButton, GhostButton, SearchInput, Badge, Avatar, Tabs, StatCard, StatGrid, initialsColor, Modal } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

const people = [
  { name: "Dr. Maria Santos", email: "m.santos@aris.edu.ph", dept: "Engineering", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Lito Cruz", email: "l.cruz@aris.edu.ph", dept: "Computer Science", rank: "Associate Prof.", courses: 3, active: true },
  { name: "Dr. Elena Reyes", email: "e.reyes@aris.edu.ph", dept: "Business", rank: "Professor", courses: 5, active: true },
  { name: "Dr. Ramon Aquino", email: "r.aquino@aris.edu.ph", dept: "Sciences", rank: "Assistant Prof.", courses: 2, active: false },
  { name: "Prof. Grace Lim", email: "g.lim@aris.edu.ph", dept: "Arts & Humanities", rank: "Lecturer", courses: 3, active: true },
  { name: "Dr. Nestor Villar", email: "n.villar@aris.edu.ph", dept: "Engineering", rank: "Adjunct", courses: 1, active: false },
  { name: "Dr. Sofia Mendoza", email: "s.mendoza@aris.edu.ph", dept: "Computer Science", rank: "Professor", courses: 4, active: true },
  { name: "Prof. Daniel Ong", email: "d.ong@aris.edu.ph", dept: "Business", rank: "Associate Prof.", courses: 3, active: false },
];

export default function Professors() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [selected, setSelected] = useState<(typeof people)[number] | null>(null);
  const [pendingToggle, setPendingToggle] = useState<(typeof people)[number] | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: items, setData: setItems } = useResource("/professors", people);
  const tabs = ["All", "Active", "Deactivated"];

  const toggle = async (person: (typeof people)[number]) => {
    const updatedItems = items.map((item) => item.email === person.email ? { ...item, active: !item.active } : item);
    setItems(updatedItems);
    setPendingToggle(null);
    try {
      await saveResource("/professors", updatedItems, "PUT");
      setSaveError(null);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to update professor.");
    }
  };
  const departments = [...new Set(items.map((person) => person.dept))];
  const rows = items.filter((person) => {
    const matchesTab = tab === "All" || (tab === "Active" ? person.active : !person.active);
    const matchesDepartment = department === "All departments" || person.dept === department;
    const matchesSearch = `${person.name} ${person.email} ${person.dept} ${person.rank}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesDepartment && matchesSearch;
  });

  const activeCount = items.filter((p) => p.active).length;
  const stats = [["Total Faculty", String(items.length)], ["Active", String(activeCount)], ["Deactivated", String(items.length - activeCount)], ["Colleges", "6"]];

  return (
    <div className="pb-2">
      <PageTitle title="Professor Management" subtitle="312 faculty across 6 colleges." action={<PrimaryButton onClick={() => navigate("/professors/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>Add Professor</PrimaryButton>} />
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
        <div className="grid min-w-[900px] grid-cols-[2.2fr_1.4fr_1.2fr_0.7fr_1fr_1.2fr] px-5 py-2.5 text-[11px] uppercase tracking-wide font-semibold" style={{ color: "#b6c3ba", background: "#fafbfa" }}>
          <span>Name</span><span>Department</span><span>Rank</span><span>Courses</span><span>Status</span><span className="text-right">Action</span>
        </div>
        {rows.map((p, i) => (
          <div key={p.email} onClick={() => setSelected(p)} className="grid min-w-[900px] grid-cols-[2.2fr_1.4fr_1.2fr_0.7fr_1fr_1.2fr] items-center px-5 py-3 border-t transition-colors hover:bg-[#fafbfa] cursor-pointer" style={{ borderColor: "#f2f4f2" }}>
            <button type="button" aria-label={`View details for ${p.name}`} onClick={(event) => { event.stopPropagation(); setSelected(p); }} className="flex min-w-0 items-center gap-3 text-left">
              <Avatar initials={p.name.split(" ").slice(-1)[0].slice(0, 2).toUpperCase()} color={initialsColor(i)} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium truncate" style={{ color: "#111c14" }}>{p.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#8fa394" }}>{p.email}</p>
              </div>
            </button>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{p.dept}</span>
            <span className="text-[13px]" style={{ color: "#3d4a41" }}>{p.rank}</span>
            <span className="text-[13px] font-medium" style={{ color: "#111c14" }}>{p.courses}</span>
            <span><Badge tone={p.active ? "green" : "gray"} dot>{p.active ? "Active" : "Deactivated"}</Badge></span>
            <span className="relative flex justify-end">
              <button type="button" aria-label={`Actions for ${p.name}`} aria-expanded={openMenu === p.email} onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === p.email ? null : p.email); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b5e] hover:bg-[#f0f2f0]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
              </button>
              {openMenu === p.email && <div className="absolute right-0 top-9 z-10 min-w-36 rounded-lg border bg-white p-1 shadow-lg" style={{ borderColor: "#e2e8e4" }}>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(p); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">View details</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setPendingToggle(p); setOpenMenu(null); }} className="w-full rounded-md px-3 py-2 text-left text-[12px] hover:bg-[#f4f6f5]">{p.active ? "Deactivate" : "Reactivate"}</button>
              </div>}
            </span>
          </div>
        ))}
      </Card>
      <ProfileDetailsModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Professor ID"
        name={selected?.name ?? ""}
        role="Professor"
        fields={[
          { label: "Email", value: selected?.email ?? "" },
          { label: "Department", value: selected?.dept ?? "" },
          { label: "Phone", value: "Not provided" },
          { label: "Address", value: "Not provided", wide: true },
        ]}
      />
      <Modal isOpen={Boolean(pendingToggle)} onClose={() => setPendingToggle(null)} title={pendingToggle?.active ? "Deactivate professor?" : "Reactivate professor?"} actions={<><GhostButton onClick={() => setPendingToggle(null)}>Cancel</GhostButton><PrimaryButton onClick={() => pendingToggle && void toggle(pendingToggle)}>{pendingToggle?.active ? "Deactivate" : "Reactivate"}</PrimaryButton></>}>
        {pendingToggle && <>Are you sure you want to {pendingToggle.active ? "deactivate" : "reactivate"} {pendingToggle.name}?</>}
      </Modal>
    </div>
  );
}
