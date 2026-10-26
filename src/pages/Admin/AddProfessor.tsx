import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { PrimaryButton, GhostButton, Toggle } from "@/components/ui";
import { saveResource } from "@/services/dataSource";
import { useResource } from "@/hooks/useResource";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import PasswordField, { isPasswordValid } from "@/components/PasswordField";

type DeptItem = { id?: string; name: string; is_active?: boolean };
type RankItem = { id?: string; name: string; is_active?: boolean };
type Toast = { id: number; message: string };
type NameKey = "firstname" | "middlename" | "lastname";

const fallbackDepts: DeptItem[] = [
  { name: "Engineering" },
  { name: "Computer Science" },
  { name: "Business" },
  { name: "Sciences" },
  { name: "Arts & Humanities" },
];

const fallbackRanks: RankItem[] = [
  { name: "Professor" },
  { name: "Associate Prof." },
  { name: "Assistant Prof." },
  { name: "Lecturer" },
  { name: "Adjunct" },
];

// Letters (any language), spaces, apostrophes, hyphens and periods only. No digits.
const cleanName = (value: string) => value.replace(/[^\p{L}\s.'-]/gu, "");
const digitsOnly = (value: string) => value.replace(/\D/g, "");

const NAME_HINT = "Numbers and special characters are not allowed.";

export default function AddProfessor() {
  const navigate = useNavigate();
  const close = () => navigate("/professors");

  const { data: deptData } = useResource<DeptItem[]>("/curriculum/departments?active=true", fallbackDepts);
  const { data: rankData } = useResource<RankItem[]>("/curriculum/ranks?active=true", fallbackRanks);

  const depts = (deptData && deptData.length > 0 ? deptData : fallbackDepts).map((d) => d.name);
  const ranks = (rankData && rankData.length > 0 ? rankData : fallbackRanks).map((r) => r.name);

  const [employeeNumber, setEmployeeNumber] = useState(""); // "PROF-" is a fixed prefix
  const [username, setUsername] = useState("");
  const [names, setNames] = useState<Record<NameKey, string>>({ firstname: "", middlename: "", lastname: "" });
  const [nameErrors, setNameErrors] = useState<Partial<Record<NameKey, string>>>({});
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [rank, setRank] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [oauthToken, setOauthToken] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!dept && depts.length > 0) {
      setDept(depts[0]);
    }
  }, [dept, depts]);

  useEffect(() => {
    if (!rank && ranks.length > 0) {
      setRank(ranks[0]);
    }
  }, [rank, ranks]);

  // Escape closes the modal (replaces the removed X button for keyboard users).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pushToast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  // Live name validation: invalid characters are removed as the user types,
  // and a hint shows under that field.
  const onName = (key: NameKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const cleaned = cleanName(raw);
    setNames((prev) => ({ ...prev, [key]: cleaned }));
    setNameErrors((prev) => ({ ...prev, [key]: cleaned !== raw ? NAME_HINT : undefined }));
  };

  const submit = async () => {
    if (submitting) return;
    const errors: string[] = [];
    if (!employeeNumber) errors.push("Employee ID number is required.");
    if (!username.trim()) errors.push("Username is required.");
    if (!names.firstname.trim()) errors.push("First name is required.");
    if (!names.lastname.trim()) errors.push("Last name is required.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.push("Enter a valid email address.");
    if (!oauthToken && !password) errors.push("Password is required (or connect a Google account).");
    if (!oauthToken && password && !isPasswordValid(password)) {
      errors.push("Password needs 8–15 characters with a capital letter, a number and a symbol.");
    }
    if (phone && !/^\d{10,11}$/.test(phone)) errors.push("Phone number must be 10–11 digits.");

    if (errors.length) {
      errors.forEach(pushToast);
      return;
    }

    setSubmitting(true);
    try {
      await saveResource("/professors", {
        employee_id: `PROF-${employeeNumber}`,
        username: username.trim(),
        firstname: names.firstname.trim(),
        middlename: names.middlename.trim() || undefined,
        lastname: names.lastname.trim(),
        email: email.trim().toLowerCase(),
        ...(password ? { password } : {}),
        department: dept || depts[0],
        position: rank || ranks[0],
        ...(phone ? { phone } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(oauthToken ? { provider: "google", oauth_id_token: oauthToken } : {}),
        active,
      });
      close();
    } catch (reason) {
      pushToast(reason instanceof Error ? reason.message : "Unable to add professor.");
    } finally {
      setSubmitting(false);
    }
  };

  const nameBorder = (key: NameKey) => (nameErrors[key] ? "#f1a5a5" : "#e2e8e4");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(13,26,16,0.45)", backdropFilter: "blur(2px)", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }} onClick={close}>
      {/* Toast notifications, top-right */}
      <div className="fixed right-4 top-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="assertive" onClick={(e) => e.stopPropagation()}>
        {toasts.map((toast) => (
          <div key={toast.id} role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800 shadow-lg">
            <span>{toast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="text-red-700 hover:text-red-900">✕</button>
          </div>
        ))}
      </div>

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
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="employee-number" className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Employee ID</label>
            <div className="flex">
              <span className="flex h-10 items-center rounded-l-xl border border-r-0 bg-[#f4f6f5] px-3.5 text-[13.5px] font-medium" style={{ borderColor: "#e2e8e4", color: "#536258" }}>PROF-</span>
              <input
                id="employee-number"
                inputMode="numeric"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(digitsOnly(e.target.value))}
                placeholder="0001"
                className="w-full h-10 px-3.5 rounded-r-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4" }}
              />
            </div>
          </div>

          <div>
            <input aria-label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4" }} />
          </div>

          {oauthToken ? (
            <div>
              <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Password</label>
              <input aria-label="Password" disabled placeholder="Not needed for Google" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] bg-[#f4f6f5] text-[#8fa394]" style={{ borderColor: "#e2e8e4" }} />
            </div>
          ) : (
            <PasswordField value={password} onChange={setPassword} />
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <input aria-label="First name" value={names.firstname} onChange={onName("firstname")} placeholder="First name" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: nameBorder("firstname") }} />
              {nameErrors.firstname && <p className="mt-1 pl-0.5 text-[11px] text-red-700">{nameErrors.firstname}</p>}
            </div>
            <div>
              <input aria-label="Middle name" value={names.middlename} onChange={onName("middlename")} placeholder="Middle name" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: nameBorder("middlename") }} />
              {nameErrors.middlename && <p className="mt-1 pl-0.5 text-[11px] text-red-700">{nameErrors.middlename}</p>}
            </div>
            <div>
              <input aria-label="Last name" value={names.lastname} onChange={onName("lastname")} placeholder="Last name" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: nameBorder("lastname") }} />
              {nameErrors.lastname && <p className="mt-1 pl-0.5 text-[11px] text-red-700">{nameErrors.lastname}</p>}
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@aris.edu.ph" disabled={Boolean(oauthToken)} className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f4f6f5] disabled:text-[#8fa394]" style={{ borderColor: "#e2e8e4", color: "#111c14" }} />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Phone number <span style={{ color: "#8fa394" }}>(optional)</span></label>
            <input inputMode="numeric" maxLength={11} value={phone} onChange={(e) => setPhone(digitsOnly(e.target.value))} placeholder="9171234567" autoComplete="tel" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4" }} />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Address <span style={{ color: "#8fa394" }}>(optional)</span></label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, province" autoComplete="street-address" className="w-full h-10 px-3.5 rounded-xl border text-[13.5px] outline-none focus:border-[#3a7d4e]" style={{ borderColor: "#e2e8e4" }} />
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>OAuth account <span style={{ color: "#8fa394" }}>(optional)</span></label>
            <GoogleOAuthButton
              token={oauthToken}
              onVerified={(token, profile) => {
                setOauthToken(token);
                setNames((prev) => ({ ...prev, firstname: cleanName(profile.firstname), lastname: cleanName(profile.lastname) }));
                setNameErrors({});
                setEmail(profile.email);
                setUsername(profile.email.split("@")[0]);
                setPassword("");
              }}
              onClear={() => setOauthToken("")}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <PrimaryButton onClick={() => void submit()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            {submitting ? "Saving…" : "Add Professor"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}