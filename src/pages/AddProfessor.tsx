import { useState } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { PrimaryButton, GhostButton, Toggle } from "@/components/ui";

const depts = ["Engineering", "Computer Science", "Business", "Sciences", "Arts & Humanities"];
const ranks = ["Professor", "Associate Prof.", "Assistant Prof.", "Lecturer", "Adjunct"];

export default function AddProfessor() {
  const navigate = useNavigate();
  const close = () => navigate("/professors");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState(depts[0]);
  const [rank, setRank] = useState(ranks[0]);
  const [courses, setCourses] = useState("");
  const [active, setActive] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(13,26,16,0.45)", backdropFilter: "blur(2px)", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} onClick={close}>
      <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(13,26,16,0.35)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "#eef1ef" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: BRAND }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#111c14" }}>Add Professor</p>
              <p className="text-[12.5px] mt-0.5" style={{ color: "#8fa394" }}>Register a new faculty member.</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#f4f6f5]" style={{ color: "#8fa394" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Maria Santos" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@aris.edu.ph" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Department</label>
              <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }}>
                {depts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Rank</label>
              <select value={rank} onChange={(e) => setRank(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }}>
                {ranks.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Assigned courses</label>
            <input value={courses} onChange={(e) => setCourses(e.target.value)} type="number" min="0" placeholder="0" className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#111c14" }}>Active on creation</p>
              <p className="text-[12px] mt-0.5" style={{ color: "#8fa394" }}>Allow this professor to sign in immediately.</p>
            </div>
            <Toggle on={active} onChange={setActive} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "#eef1ef", background: "#fafbfa" }}>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            Add Professor
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
