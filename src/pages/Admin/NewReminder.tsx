import { useState } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { PrimaryButton, GhostButton, Toggle } from "@/components/ui";
import { saveResource } from "@/services/dataSource";

const categories = [
  { key: "AR / DTR", desc: "Submission & verification", tone: "#3a7d4e" },
  { key: "System", desc: "Maintenance & operations", tone: "#d99a2b" },
  { key: "AI / ML", desc: "Analytics & anomalies", tone: "#3f8ecc" },
];

const audiences = [
  { key: "Everyone", color: "#3a7d4e" },
  { key: "HR", color: "#8a63c4" },
  { key: "Checker", color: "#3f8ecc" },
  { key: "Accounting", color: "#d99a2b" },
  { key: "Secretary", color: "#c0653f" },
];

export default function NewReminder() {
  const navigate = useNavigate();
  const close = () => navigate("/announcements");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("AR / DTR");
  const [audience, setAudience] = useState("Everyone");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("A title and message are required.");
      return;
    }
    try {
      await saveResource("/announcements", {
        id: `announcement-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        tag: category,
        tone: category === "System" ? "amber" : category === "AI / ML" ? "blue" : "green",
        audience,
        initials: title.trim().slice(0, 2).toUpperCase(),
        date: "Just now",
        pinned,
      });
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send reminder.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(13,26,16,0.45)", backdropFilter: "blur(2px)", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} onClick={close}>
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(13,26,16,0.35)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#eef1ef" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: BRAND }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#111c14" }}>New Reminder</p>
              <p className="text-[12.5px] mt-0.5" style={{ color: "#8fa394" }}>Broadcast to a specific staff group.</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#f4f6f5]" style={{ color: "#8fa394" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AR submission closes Friday 5 PM" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Write the reminder details…" className="w-full px-3.5 py-2.5 rounded-xl bg-white border text-[13.5px] leading-relaxed outline-none resize-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => {
                const on = category === c.key;
                return (
                  <button key={c.key} onClick={() => setCategory(c.key)} className="rounded-xl border px-3 py-2.5 text-left transition-all" style={{ borderColor: on ? c.tone : "#e2e8e4", background: on ? c.tone + "10" : "#fff" }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.tone }} />
                      <span className="text-[12.5px] font-semibold" style={{ color: on ? c.tone : "#111c14" }}>{c.key}</span>
                    </span>
                    <p className="text-[11px] mt-1" style={{ color: "#8fa394" }}>{c.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Send to</label>
            <div className="flex flex-wrap gap-2">
              {audiences.map((a) => {
                const on = audience === a.key;
                return (
                  <button key={a.key} onClick={() => setAudience(a.key)} className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[13px] font-medium transition-all" style={{ borderColor: on ? a.color : "#e2e8e4", background: on ? a.color + "14" : "#fff", color: on ? a.color : "#5a6b5e" }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    {a.key}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#111c14" }}>Pin to top</p>
              <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>Keep this reminder highlighted.</p>
            </div>
            <Toggle on={pinned} onChange={setPinned} />
          </div>
          {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "#eef1ef", background: "#fafbfa" }}>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={submit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            Send Reminder
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
