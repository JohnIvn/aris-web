import { useState } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { PrimaryButton, GhostButton } from "@/components/ui";
import { saveResource } from "@/services/dataSource";

// Role → Staff ID prefix, matching the Staff Management page.
const roles = [
  { key: "Checker", prefix: "CHK", color: "#3a7d4e" },
  { key: "Secretary", prefix: "SEC", color: "#3f8ecc" },
  { key: "HR", prefix: "HR", color: "#8a63c4" },
  { key: "Accounting", prefix: "ACC", color: "#d99a2b" },
];

export default function AddStaff() {
  const navigate = useNavigate();
  const close = () => navigate("/staff");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Checker");
  const [dept, setDept] = useState("");
  const [error, setError] = useState<string | null>(null);

  const prefix = roles.find((r) => r.key === role)!.prefix;

  const submit = async () => {
    if (!name.trim() || !email.trim() || !dept.trim()) {
      setError("Name, email, and department are required.");
      return;
    }
    try {
      await saveResource("/staff", {
        id: `${prefix}-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        dept: dept.trim(),
        status: "Active",
      });
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to add staff member.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(13,26,16,0.45)", backdropFilter: "blur(2px)", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} onClick={close}>
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(13,26,16,0.35)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#eef1ef" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: BRAND }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#111c14" }}>Add Staff</p>
              <p className="text-[12.5px] mt-0.5" style={{ color: "#8fa394" }}>Register a support staff member.</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#f4f6f5]" style={{ color: "#8fa394" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. James Reyes" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@aris.edu.ph" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Role</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((r) => {
                const on = role === r.key;
                return (
                  <button key={r.key} onClick={() => setRole(r.key)} className="flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all" style={{ borderColor: on ? r.color : "#e2e8e4", background: on ? r.color + "10" : "#fff" }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span className="text-[13px] font-semibold" style={{ color: on ? r.color : "#111c14" }}>{r.key}</span>
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: "#8fa394" }}>{r.prefix}-</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Department</label>
              <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Attendance" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
            </div>
            <div>
              <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Staff ID</label>
              <div className="w-full h-10 px-3.5 rounded-xl border flex items-center text-[13.5px] font-semibold tabular-nums" style={{ borderColor: "#e2e8e4", background: "#f7f9f8", color: "#3d4a41" }}>{prefix}-0000 <span className="ml-1.5 text-[11px] font-normal" style={{ color: "#b6c3ba" }}>· auto</span></div>
            </div>
          </div>
          {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "#eef1ef", background: "#fafbfa" }}>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={submit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            Add Staff
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
