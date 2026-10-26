import { useState, useMemo } from "react";
import { BRAND } from "@/config/navigation";
import { Card, PageTitle, Badge, Tabs, initialsColor, GhostButton } from "@/components/ui";
import { useResource } from "@/hooks/useResource";
import { saveResource } from "@/services/dataSource";

const audienceColor: Record<string, string> = {
  Everyone: "#3a7d4e",
  HR: "#8a63c4",
  Checker: "#3f8ecc",
  Accounting: "#d99a2b",
  Secretary: "#c0653f",
  Professors: "#2b6ca3",
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tag: string;
  audience: string;
  pinned: boolean;
  publishedAt: string | null;
  initials: string;
  is_read?: boolean;
};

const toneForCategory = (category: string) =>
  category === "System" ? "amber" : category === "AI / ML" ? "blue" : "green";

const formatPublishedAt = (value: string | null) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const STORAGE_KEY = "aris_web_read_notifications";

export default function Announcements() {
  const [tab, setTab] = useState("All");
  const { data: rawPosts, loading, error } = useResource<NotificationItem[]>("/announcements", []);
  const posts = Array.isArray(rawPosts) ? rawPosts : [];

  // Local storage read state persistence
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markAsRead = async (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });

    try {
      await saveResource(`/notifications/${id}/read`, undefined, "PATCH");
    } catch {}
  };

  const toggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (readIds.has(id)) {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {}
        return next;
      });
    } else {
      markAsRead(id);
    }
  };

  const markAllAsRead = async () => {
    const allIds = posts.map((p) => p.id);
    setReadIds(new Set(allIds));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
      await saveResource("/notifications/read-all", undefined, "PATCH");
    } catch {}
  };

  const unreadCount = useMemo(() => {
    return posts.filter((p) => !readIds.has(p.id) && !p.is_read).length;
  }, [posts, readIds]);

  const tabs = ["All", `Unread (${unreadCount})`, "AR / DTR", "System", "AI / ML"];

  const visible = useMemo(() => {
    return posts.filter((p) => {
      const isRead = readIds.has(p.id) || Boolean(p.is_read);
      if (tab.startsWith("Unread")) return !isRead;
      if (tab === "All") return true;
      return p.tag === tab;
    });
  }, [posts, tab, readIds]);

  const groups = ["Everyone", "HR", "Checker", "Accounting", "Secretary"];

  return (
    <div className="pb-4">
      <PageTitle
        title="Notifications"
        subtitle="View your system notifications, reminders, and updates."
        action={
          unreadCount > 0 ? (
            <GhostButton onClick={markAllAsRead}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#3a7d4e]">
                <path d="M18 6L7 17l-5-5" />
                <path d="M22 10l-7.5 7.5-1.5-1.5" />
              </svg>
              Mark all as read
            </GhostButton>
          ) : (
            <span className="text-[12.5px] font-medium text-[#8fa394] flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#f0f4f1]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#3a7d4e]">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              All caught up
            </span>
          )
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>
          <div className="space-y-3">
            {loading && <p className="text-[13px]" style={{ color: "#8fa394" }}>Loading notifications...</p>}
            {error && <p role="alert" className="text-[13px] text-red-700">{error}</p>}
            {!loading && !error && visible.length === 0 && (
              <Card className="text-center py-8">
                <p className="text-[13px]" style={{ color: "#8fa394" }}>No notifications found.</p>
              </Card>
            )}
            {visible.map((p) => {
              const isRead = readIds.has(p.id) || Boolean(p.is_read);

              return (
                <Card
                  key={p.id}
                  onClick={() => !isRead && markAsRead(p.id)}
                  className={`flex gap-4 cursor-pointer transition-all border ${
                    isRead ? "bg-white/80 border-[#edf2ee]" : "bg-white border-[#c8e6d0] shadow-sm"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                    style={{ background: initialsColor(p.title.length), opacity: isRead ? 0.7 : 1 }}
                  >
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p
                          className={`text-[15px] truncate ${isRead ? "font-medium text-[#405145]" : "font-semibold text-[#111c14]"}`}
                        >
                          {p.title}
                        </p>
                        {p.pinned && (
                          <svg viewBox="0 0 24 24" fill={BRAND} stroke="none" className="w-3.5 h-3.5 flex-shrink-0">
                            <path d="M9 4v6l-2 4h10l-2-4V4M12 18v4M8 4h8" />
                          </svg>
                        )}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#3a7d4e] flex-shrink-0" title="Unread" />
                        )}
                      </div>

                      {/* Read status button */}
                      <button
                        type="button"
                        onClick={(e) => toggleRead(p.id, e)}
                        title={isRead ? "Mark as unread" : "Mark as read"}
                        className="text-[12px] font-medium px-2 py-0.5 rounded-lg border text-[#5a6b5e] hover:text-[#111c14] hover:bg-[#f4f6f5] transition-colors flex items-center gap-1 flex-shrink-0"
                        style={{ borderColor: "#e2e8e4" }}
                      >
                        {isRead ? (
                          <>
                            <span className="text-[#8fa394]">✓</span>
                            <span>Read</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[#3a7d4e] font-bold">✓</span>
                            <span className="text-[#3a7d4e]">Mark read</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p
                      className={`text-[13px] leading-relaxed line-clamp-2 ${isRead ? "text-[#7a8c7e]" : "text-[#5a6b5e]"}`}
                    >
                      {p.body}
                    </p>

                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#f4f6f5]">
                      <Badge tone={toneForCategory(p.tag)}>{p.tag}</Badge>
                      <Badge tone={isRead ? "gray" : "green"} dot={!isRead}>
                        {isRead ? "Read" : "Unread"}
                      </Badge>
                      <span
                        className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: audienceColor[p.audience], background: audienceColor[p.audience] + "14" }}
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

        <div className="space-y-4">
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>Pinned</p>
            <div className="space-y-3">
              {posts.filter((p) => p.pinned).length === 0 && (
                <p className="text-[12px]" style={{ color: "#8fa394" }}>No pinned notices.</p>
              )}
              {posts.filter((p) => p.pinned).map((p) => (
                <div key={p.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: BRAND }} />
                  <p className="text-[12.5px] leading-snug" style={{ color: "#3d4a41" }}>{p.title}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>Recipient groups</p>
            <div className="space-y-2.5">
              {groups.map((g) => {
                const n = posts.filter((p) => p.audience === g).length;
                return (
                  <div key={g} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: audienceColor[g] }} />
                    <span className="text-[13px] flex-1" style={{ color: "#3d4a41" }}>{g}</span>
                    <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "#8fa394" }}>{n}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
