import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import {
  Card,
  PageTitle,
  PrimaryButton,
  GhostButton,
  Badge,
  Tabs,
  initialsColor,
  SearchInput,
  StatCard,
  StatGrid,
  Modal,
  Toggle,
} from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  tag: string;
  category?: string;
  audience: string;
  pinned: boolean;
  isPinned?: boolean;
  status: "draft" | "scheduled" | "sent" | "archived" | string;
  publishedAt: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  initials: string;
};

const audienceColor: Record<string, string> = {
  Everyone: "#3a7d4e",
  HR: "#8a63c4",
  Checker: "#3f8ecc",
  Accounting: "#d99a2b",
  Secretary: "#c0653f",
  Professors: "#2b6ca3",
};

const audienceOptions = [
  "Everyone",
  "HR",
  "Checker",
  "Accounting",
  "Secretary",
  "Professors",
];

const categoryOptions = [
  { key: "AR / DTR", desc: "Submission & verification", tone: "green" as const, color: "#3a7d4e" },
  { key: "System", desc: "Maintenance & operations", tone: "amber" as const, color: "#d99a2b" },
  { key: "AI / ML", desc: "Analytics & anomalies", tone: "blue" as const, color: "#3f8ecc" },
  { key: "General", desc: "General information & notices", tone: "gray" as const, color: "#5a6b5e" },
  { key: "Urgent", desc: "High priority immediate attention", tone: "red" as const, color: "#c0392b" },
];

const toneForCategory = (category: string): "green" | "amber" | "blue" | "red" | "gray" => {
  if (category === "System") return "amber";
  if (category === "AI / ML") return "blue";
  if (category === "Urgent") return "red";
  if (category === "General") return "gray";
  return "green";
};

const statusToneMap: Record<string, "green" | "gray" | "blue" | "amber"> = {
  sent: "green",
  draft: "gray",
  scheduled: "blue",
  archived: "amber",
};

const statusLabelMap: Record<string, string> = {
  sent: "Sent",
  draft: "Draft",
  scheduled: "Scheduled",
  archived: "Archived",
};

const formatPublishedAt = (value: string | null | undefined) => {
  if (!value) return "Unpublished";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function Announcements() {
  const navigate = useNavigate();

  // Data fetching
  const { data: rawPosts, setData: setPosts, loading, error, reload } =
    useResource<Announcement[]>("/announcements", []);

  // Normalization: Ensure all items conform to standard structure
  const posts: Announcement[] = useMemo(() => {
    return (rawPosts || []).map((p) => ({
      ...p,
      id: String(p.id),
      tag: p.tag || p.category || "General",
      category: p.category || p.tag || "General",
      audience: p.audience || "Everyone",
      pinned: Boolean(p.pinned ?? p.isPinned),
      status: p.status || "sent",
      initials: p.initials || (p.title ? p.title.slice(0, 2).toUpperCase() : "AN"),
    }));
  }, [rawPosts]);

  // Filters & search state
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [activeItem, setActiveItem] = useState<Announcement | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Edit / Create Form state
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategory, setFormCategory] = useState("AR / DTR");
  const [formAudience, setFormAudience] = useState("Everyone");
  const [formStatus, setFormStatus] = useState<"sent" | "draft" | "scheduled" | "archived">("sent");
  const [formPinned, setFormPinned] = useState(false);
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Status message for feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const tabs = ["All", "AR / DTR", "System", "AI / ML", "General", "Urgent"];

  // Filtered rows
  const visible = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = tab === "All" || p.tag === tab;
      const matchAudience = audienceFilter === "All" || p.audience === audienceFilter;
      const matchStatus = statusFilter === "All" || p.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        search.trim() === "" ||
        `${p.title} ${p.body} ${p.audience} ${p.tag}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchCategory && matchAudience && matchStatus && matchSearch;
    });
  }, [posts, tab, audienceFilter, statusFilter, search]);

  // Summary counts
  const totalCount = posts.length;
  const sentCount = posts.filter((p) => p.status === "sent").length;
  const pinnedCount = posts.filter((p) => p.pinned).length;
  const draftOrScheduledCount = posts.filter(
    (p) => p.status === "draft" || p.status === "scheduled"
  ).length;

  // Handlers for Create / Edit Modal
  const openCreateModal = () => {
    setFormMode("create");
    setFormId(null);
    setFormTitle("");
    setFormBody("");
    setFormCategory("AR / DTR");
    setFormAudience("Everyone");
    setFormStatus("sent");
    setFormPinned(false);
    setFormExpiresAt("");
    setFormError(null);
    setEditModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setFormMode("edit");
    setFormId(item.id);
    setFormTitle(item.title);
    setFormBody(item.body);
    setFormCategory(item.tag || item.category || "AR / DTR");
    setFormAudience(item.audience || "Everyone");
    setFormStatus((item.status as "sent" | "draft" | "scheduled" | "archived") || "sent");
    setFormPinned(item.pinned);
    setFormExpiresAt(item.expiresAt ? item.expiresAt.slice(0, 16) : "");
    setFormError(null);
    setEditModalOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!formTitle.trim() || !formBody.trim()) {
      setFormError("Title and message body are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        title: formTitle.trim(),
        body: formBody.trim(),
        category: formCategory,
        audience: formAudience,
        status: formStatus,
        isPinned: formPinned,
        expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      };

      if (formMode === "create") {
        const created = await saveResource<Announcement>("/announcements", payload, "POST");
        setPosts([created, ...posts]);
        setActionNotice("Notification/announcement created successfully.");
      } else if (formId) {
        const updated = await saveResource<Announcement>(`/announcements/${formId}`, payload, "PATCH");
        setPosts(posts.map((p) => (p.id === formId ? { ...p, ...updated } : p)));
        setActionNotice("Announcement updated successfully.");
      }
      setEditModalOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  // Handler for Pin Toggle
  const togglePin = async (item: Announcement) => {
    const nextPinned = !item.pinned;
    // Optimistic update
    setPosts(posts.map((p) => (p.id === item.id ? { ...p, pinned: nextPinned } : p)));
    try {
      await saveResource(`/announcements/${item.id}/pin`, { isPinned: nextPinned }, "PATCH");
      setActionNotice(`Announcement ${nextPinned ? "pinned to top" : "unpinned"}.`);
    } catch {
      // Revert on failure
      setPosts(posts.map((p) => (p.id === item.id ? { ...p, pinned: !nextPinned } : p)));
      setActionNotice("Failed to update pin status.");
    }
  };

  // Handler for Delete
  const confirmDelete = async () => {
    if (!activeItem) return;
    try {
      await saveResource(`/announcements/${activeItem.id}`, undefined, "DELETE");
      setPosts(posts.filter((p) => p.id !== activeItem.id));
      setActionNotice("Announcement deleted successfully.");
      setDeleteModalOpen(false);
      setActiveItem(null);
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : "Failed to delete announcement.");
    }
  };

  const groups = audienceOptions;

  return (
    <div className="pb-8 space-y-5">
      {/* Page Title & Action */}
      <PageTitle
        title="Announcements"
        subtitle="Create, edit, and broadcast system notifications and announcements to staff and faculty."
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => navigate("/announcements/new")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Reminder (Form)
            </GhostButton>
            <PrimaryButton onClick={openCreateModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Announcement
            </PrimaryButton>
          </div>
        }
      />

      {/* Action Notice feedback banner */}
      {actionNotice && (
        <div
          role="status"
          className="flex items-center justify-between px-4 py-3 rounded-2xl border text-[13px] bg-[#f0f9f3] text-[#2f7043] border-[#c2e4cc]"
        >
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[#2f7043] opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stat Cards Overview */}
      <StatGrid columns={4}>
        <StatCard
          label="Total Broadcasts"
          value={totalCount}
          detail="All notifications in the system"
          badge={<Badge tone="gray">Total</Badge>}
        />
        <StatCard
          label="Active & Sent"
          value={sentCount}
          valueColor="#2f7043"
          detail="Currently live for recipients"
          badge={<Badge tone="green">Active</Badge>}
        />
        <StatCard
          label="Pinned Reminders"
          value={pinnedCount}
          valueColor="#3a7d4e"
          detail="Highlighted at top of feeds"
          badge={<Badge tone="blue">Pinned</Badge>}
        />
        <StatCard
          label="Drafts / Scheduled"
          value={draftOrScheduledCount}
          valueColor="#996515"
          detail="Upcoming or pending broadcast"
          badge={<Badge tone="amber">Pending</Badge>}
        />
      </StatGrid>

      {/* Search, Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <SearchInput
              placeholder="Search announcements, tags, or message…"
              value={search}
              onChange={setSearch}
              className="w-64"
            />
            {/* Audience filter */}
            <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#5a6b5e" }}>
              <span>Audience:</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="h-9 px-2.5 rounded-xl border bg-white text-[12.5px] outline-none"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="All">All Audiences</option>
                {audienceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#5a6b5e" }}>
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 rounded-xl border bg-white text-[12.5px] outline-none"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="All">All Statuses</option>
                <option value="sent">Sent / Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {(search || audienceFilter !== "All" || statusFilter !== "All" || tab !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setAudienceFilter("All");
                setStatusFilter("All");
                setTab("All");
              }}
              className="text-[12px] font-medium text-[#c0392b] hover:underline self-end lg:self-center"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Grid: Feed + Right Stats Sidebar */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {/* Category Tabs */}
          <div className="mb-4">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>

          {/* List Feed */}
          <div className="space-y-3">
            {loading && (
              <Card className="text-center py-10">
                <p className="text-[13px]" style={{ color: "#8fa394" }}>
                  Loading notifications & announcements…
                </p>
              </Card>
            )}
            {error && (
              <Card className="text-center py-6 border border-red-200 bg-red-50">
                <p role="alert" className="text-[13px] text-red-700 font-medium">
                  {error}
                </p>
              </Card>
            )}
            {!loading && !error && visible.length === 0 && (
              <Card className="text-center py-12">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#f0f4f1] text-[#3a7d4e]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold" style={{ color: "#111c14" }}>
                  No announcements found
                </p>
                <p className="text-[12.5px] mt-1" style={{ color: "#8fa394" }}>
                  Try adjusting your search criteria or create a new notification broadcast.
                </p>
                <div className="mt-4">
                  <GhostButton onClick={openCreateModal}>Create Announcement</GhostButton>
                </div>
              </Card>
            )}

            {visible.map((p) => {
              const statusKey = p.status.toLowerCase();
              const statusTone = statusToneMap[statusKey] || "gray";
              const statusLabel = statusLabelMap[statusKey] || p.status;

              return (
                <Card
                  key={p.id}
                  className="flex flex-col sm:flex-row gap-4 transition-shadow hover:shadow-md border border-transparent hover:border-[#e2e8e4]"
                >
                  {/* Avatar Icon */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                    style={{ background: initialsColor(p.title.length) }}
                  >
                    {p.initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p
                          onClick={() => {
                            setActiveItem(p);
                            setDetailModalOpen(true);
                          }}
                          className="text-[15px] font-semibold cursor-pointer hover:text-[#3a7d4e] transition-colors truncate"
                          style={{ color: "#111c14" }}
                        >
                          {p.title}
                        </p>
                        {p.pinned && (
                          <span
                            title="Pinned Announcement"
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#eaf4ee] text-[#2f7043]"
                          >
                            <svg viewBox="0 0 24 24" fill={BRAND} stroke="none" className="w-3 h-3">
                              <path d="M9 4v6l-2 4h10l-2-4V4M12 18v4M8 4h8" />
                            </svg>
                            Pinned
                          </span>
                        )}
                      </div>

                      {/* Card Action Controls: Quick Pin, Edit, Delete */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePin(p)}
                          title={p.pinned ? "Unpin this announcement" : "Pin this announcement"}
                          className="p-1.5 rounded-lg border text-[#5a6b5e] hover:bg-[#f4f6f5] hover:text-[#111c14] transition-colors"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill={p.pinned ? BRAND : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="w-3.5 h-3.5"
                          >
                            <path d="M9 4v6l-2 4h10l-2-4V4M12 18v4M8 4h8" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          title="Edit Announcement"
                          className="p-1.5 rounded-lg border text-[#5a6b5e] hover:bg-[#f4f6f5] hover:text-[#111c14] transition-colors"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveItem(p);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Announcement"
                          className="p-1.5 rounded-lg border text-[#c0392b] hover:bg-red-50 transition-colors"
                          style={{ borderColor: "#e2e8e4" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p
                      onClick={() => {
                        setActiveItem(p);
                        setDetailModalOpen(true);
                      }}
                      className="text-[13px] leading-relaxed line-clamp-2 cursor-pointer"
                      style={{ color: "#5a6b5e" }}
                    >
                      {p.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2 border-t border-[#f0f4f1]">
                      <Badge tone={toneForCategory(p.tag)}>{p.tag}</Badge>
                      <Badge tone={statusTone} dot>
                        {statusLabel}
                      </Badge>
                      <span
                        className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: audienceColor[p.audience] || "#3a7d4e",
                          background: (audienceColor[p.audience] || "#3a7d4e") + "14",
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
                          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.audience}
                      </span>
                      <span className="text-[12px] ml-auto" style={{ color: "#8fa394" }}>
                        {formatPublishedAt(p.publishedAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Pinned Reminders Card */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>
                Pinned Reminders
              </p>
              <Badge tone="blue">{posts.filter((p) => p.pinned).length}</Badge>
            </div>
            <div className="space-y-2.5">
              {posts.filter((p) => p.pinned).length === 0 && (
                <p className="text-[12px]" style={{ color: "#8fa394" }}>
                  No pinned announcements.
                </p>
              )}
              {posts
                .filter((p) => p.pinned)
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveItem(p);
                      setDetailModalOpen(true);
                    }}
                    className="flex items-start gap-2 p-2 rounded-xl hover:bg-[#f7f9f8] cursor-pointer transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: BRAND }} />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium leading-snug line-clamp-1" style={{ color: "#3d4a41" }}>
                        {p.title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#8fa394" }}>
                        {p.audience} • {formatPublishedAt(p.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recipient Groups Card */}
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>
              Recipient Groups
            </p>
            <div className="space-y-2">
              {groups.map((g) => {
                const count = posts.filter((p) => p.audience === g).length;
                const active = audienceFilter === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setAudienceFilter(active ? "All" : g)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#f7f9f8] transition-colors text-left"
                    style={{ background: active ? (audienceColor[g] || BRAND) + "12" : "transparent" }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: audienceColor[g] || "#3a7d4e" }}
                    />
                    <span className="text-[13px] flex-1 font-medium" style={{ color: "#3d4a41" }}>
                      {g}
                    </span>
                    <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "#8fa394" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Broadcast Status Card */}
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>
              Status Breakdown
            </p>
            <div className="space-y-2">
              {[
                { key: "sent", label: "Sent / Published", tone: "green" as const },
                { key: "draft", label: "Drafts", tone: "gray" as const },
                { key: "scheduled", label: "Scheduled", tone: "blue" as const },
                { key: "archived", label: "Archived", tone: "amber" as const },
              ].map((st) => {
                const count = posts.filter((p) => p.status.toLowerCase() === st.key).length;
                const active = statusFilter === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setStatusFilter(active ? "All" : st.key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-[#f7f9f8] transition-colors text-left"
                    style={{ background: active ? "#eef1ef" : "transparent" }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone={st.tone} dot>
                        {st.label}
                      </Badge>
                    </div>
                    <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "#8fa394" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={formMode === "create" ? "New Announcement" : "Edit Announcement"}
        size="lg"
        align="left"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <GhostButton onClick={() => setEditModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={saveAnnouncement}>
              {saving ? (
                <span>Saving…</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {formMode === "create" ? "Create Broadcast" : "Save Changes"}
                </>
              )}
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px]">
              {formError}
            </div>
          )}

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Announcement Title *
            </label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. AR submission closes Friday 5 PM"
              className="w-full h-10 px-3.5 rounded-xl border bg-white text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
              Announcement Message Body *
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={4}
              placeholder="Write the detailed message, reminders, or instructions…"
              className="w-full px-3.5 py-2.5 rounded-xl border bg-white text-[13.5px] leading-relaxed outline-none resize-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categoryOptions.map((c) => {
                const on = formCategory === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFormCategory(c.key)}
                    className="rounded-xl border px-3 py-2 text-left transition-all"
                    style={{ borderColor: on ? c.color : "#e2e8e4", background: on ? c.color + "12" : "#fff" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-[12.5px] font-semibold" style={{ color: on ? c.color : "#111c14" }}>
                        {c.key}
                      </span>
                    </span>
                    <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "#8fa394" }}>
                      {c.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map((a) => {
                const on = formAudience === a;
                const col = audienceColor[a] || BRAND;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setFormAudience(a)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12.5px] font-medium transition-all"
                    style={{
                      borderColor: on ? col : "#e2e8e4",
                      background: on ? col + "14" : "#fff",
                      color: on ? col : "#5a6b5e",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: col }} />
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) =>
                  setFormStatus(e.target.value as "sent" | "draft" | "scheduled" | "archived")
                }
                className="w-full h-10 px-3 rounded-xl border bg-white text-[13px] outline-none"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              >
                <option value="sent">Sent / Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-[12.5px] font-medium block mb-1" style={{ color: "#3d4a41" }}>
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border bg-white text-[13px] outline-none"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f9f8] border border-[#e2e8e4]">
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#111c14" }}>
                Pin to top of feed
              </p>
              <p className="text-[11.5px]" style={{ color: "#8fa394" }}>
                Keep this notification highlighted at the top of recipient notification lists.
              </p>
            </div>
            <Toggle on={formPinned} onChange={setFormPinned} />
          </div>
        </div>
      </Modal>

      {/* DETAIL VIEW MODAL */}
      <Modal
        isOpen={detailModalOpen && Boolean(activeItem)}
        onClose={() => setDetailModalOpen(false)}
        title={activeItem?.title || "Announcement Details"}
        size="lg"
        align="left"
        actions={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {activeItem && (
                <button
                  type="button"
                  onClick={() => {
                    const itm = activeItem;
                    setDetailModalOpen(false);
                    openEditModal(itm);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12.5px] font-medium hover:bg-[#f7f9f8]"
                  style={{ borderColor: "#e2e8e4", color: "#111c14" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
            <PrimaryButton onClick={() => setDetailModalOpen(false)}>Close</PrimaryButton>
          </div>
        }
      >
        {activeItem && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={toneForCategory(activeItem.tag)}>{activeItem.tag}</Badge>
              <Badge
                tone={statusToneMap[activeItem.status.toLowerCase()] || "gray"}
                dot
              >
                {statusLabelMap[activeItem.status.toLowerCase()] || activeItem.status}
              </Badge>
              <span
                className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: audienceColor[activeItem.audience] || "#3a7d4e",
                  background: (audienceColor[activeItem.audience] || "#3a7d4e") + "14",
                }}
              >
                Audience: {activeItem.audience}
              </span>
              {activeItem.pinned && (
                <span className="text-[12px] font-semibold text-[#2f7043] flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill={BRAND} stroke="none" className="w-3 h-3">
                    <path d="M9 4v6l-2 4h10l-2-4V4M12 18v4M8 4h8" />
                  </svg>
                  Pinned
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#f7f9f8] border border-[#eef1ef]">
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: "#111c14" }}>
                {activeItem.body}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12px]" style={{ color: "#8fa394" }}>
              <div>
                <span className="font-semibold block text-[#3d4a41]">Published Date:</span>
                <span>{formatPublishedAt(activeItem.publishedAt)}</span>
              </div>
              <div>
                <span className="font-semibold block text-[#3d4a41]">Expiration Date:</span>
                <span>{activeItem.expiresAt ? formatPublishedAt(activeItem.expiresAt) : "None"}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModalOpen && Boolean(activeItem)}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Announcement?"
        size="sm"
        align="center"
        icon={
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-red-100 text-[#c0392b]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        }
        actions={
          <div className="flex items-center justify-center gap-2 w-full">
            <GhostButton onClick={() => setDeleteModalOpen(false)}>Cancel</GhostButton>
            <button
              onClick={confirmDelete}
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-[#c0392b] hover:bg-[#a5281c] transition-colors"
            >
              Delete Announcement
            </button>
          </div>
        }
      >
        <p className="text-[13px]" style={{ color: "#5a6b5e" }}>
          Are you sure you want to delete{" "}
          <strong className="text-[#111c14]">"{activeItem?.title}"</strong>?
          This action will immediately remove the broadcast from recipient view.
        </p>
      </Modal>
    </div>
  );
}
