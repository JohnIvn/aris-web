import { useState } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { Card, PageTitle, PrimaryButton, Badge, Tabs, initialsColor } from "@/components/ui";
import { useResource } from "@/hooks/useResource";

const audienceColor: Record<string, string> = {
  Everyone: "#3a7d4e", HR: "#8a63c4", Checker: "#3f8ecc", Accounting: "#d99a2b", Secretary: "#c0653f",
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  tag: string;
  audience: string;
  pinned: boolean;
  publishedAt: string | null;
  initials: string;
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

export default function Announcements() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const { data: posts, loading, error } = useResource<Announcement[]>("/announcements", []);
  const tabs = ["All", "AR / DTR", "System", "AI / ML"];
  const visible = posts.filter((p) => tab === "All" || p.tag === tab);

  const groups = ["Everyone", "HR", "Checker", "Accounting", "Secretary"];

  return (
    <div className="pb-2">
      <PageTitle title="Announcements" subtitle="AR / DTR, system, and AI/ML reminders — targeted to the right staff group." action={<PrimaryButton onClick={() => navigate("/announcements/new")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>New Reminder</PrimaryButton>} />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>
          <div className="space-y-3">
            {loading && <p className="text-[13px]" style={{ color: "#8fa394" }}>Loading announcements...</p>}
            {error && <p role="alert" className="text-[13px] text-red-700">{error}</p>}
            {!loading && !error && visible.length === 0 && <p className="text-[13px]" style={{ color: "#8fa394" }}>No announcements found.</p>}
            {visible.map((p) => (
              <Card key={p.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0" style={{ background: initialsColor(p.title.length) }}>{p.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[15px] font-semibold" style={{ color: "#111c14" }}>{p.title}</p>
                    {p.pinned && <svg viewBox="0 0 24 24" fill={BRAND} stroke="none" className="w-3.5 h-3.5"><path d="M9 4v6l-2 4h10l-2-4V4M12 18v4M8 4h8" /></svg>}
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#5a6b5e" }}>{p.body}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge tone={toneForCategory(p.tag)}>{p.tag}</Badge>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: audienceColor[p.audience], background: audienceColor[p.audience] + "14" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {p.audience}
                    </span>
                    <span className="text-[12px]" style={{ color: "#8fa394" }}>{formatPublishedAt(p.publishedAt)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "#111c14" }}>Pinned</p>
            <div className="space-y-3">
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
