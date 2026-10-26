import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BRAND } from "@/config/navigation";
import { PrimaryButton, GhostButton } from "@/components/ui";
import { saveResource } from "@/services/dataSource";
import { useResource } from "@/hooks/useResource";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";
import PasswordField, { isPasswordValid } from "@/components/PasswordField";

type Toast = { id: number; message: string };
type NameKey = "firstname" | "middlename" | "lastname";

// Role -> Staff ID prefix, matching the Staff Management page.
const roles = [
  { key: "Checker", prefix: "CHK", color: "#3a7d4e" },
  { key: "Secretary", prefix: "SEC", color: "#3f8ecc" },
  { key: "HR", prefix: "HR", color: "#8a63c4" },
  { key: "Accounting", prefix: "ACC", color: "#d99a2b" },
];

// Letters (any language), spaces, apostrophes, hyphens and periods only. No digits.
const cleanName = (value: string) => value.replace(/[^\p{L}\s.'-]/gu, "");
const digitsOnly = (value: string) => value.replace(/\D/g, "");

const NAME_HINT = "Numbers and special characters are not allowed.";
const EMAIL_HINT = "Enter a valid email address.";
const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

export default function AddStaff() {
  const navigate = useNavigate();
  const close = () => navigate("/staff");

  const { data: deptResources } = useResource<{ id: string; name: string }[]>("/curriculum/departments?active=true", []);

  const [employeeNumber, setEmployeeNumber] = useState(""); // role prefix is fixed, e.g. "CHK-"
  const [username, setUsername] = useState("");
  const [names, setNames] = useState<Record<NameKey, string>>({ firstname: "", middlename: "", lastname: "" });
  const [nameErrors, setNameErrors] = useState<Partial<Record<NameKey, string>>>({});
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [role, setRole] = useState("Checker");
  const [dept, setDept] = useState("");
  const [password, setPassword] = useState("");
  const [oauthToken, setOauthToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const prefix = roles.find((r) => r.key === role)!.prefix;

  // Escape closes the modal.
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
    if (!isValidEmail(email)) {
      errors.push(EMAIL_HINT);
      setEmailError(EMAIL_HINT);
    }
    if (!oauthToken && !password) errors.push("Password is required (or connect a Google account).");
    if (!oauthToken && password && !isPasswordValid(password)) {
      errors.push("Password needs 8–15 characters with a capital letter, a number and a symbol.");
    }

    if (errors.length) {
      errors.forEach(pushToast);
      return;
    }

    setSubmitting(true);
    try {
      await saveResource("/staff", {
        employee_id: `${prefix}-${employeeNumber}`,
        email: email.trim().toLowerCase(),
        username: username.trim(),
        firstname: names.firstname.trim(),
        middlename: names.middlename.trim() || undefined,
        lastname: names.lastname.trim(),
        ...(password ? { password } : {}),
        position: role,
        department: dept.trim(),
        ...(oauthToken ? { provider: "google", oauth_id_token: oauthToken } : {}),
      });
      close();
    } catch (reason) {
      pushToast(reason instanceof Error ? reason.message : "Unable to add staff member.");
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold" style={{ color: "#111c14" }}>Add Staff</p>
              <p className="text-[12.5px] mt-0.5" style={{ color: "#8fa394" }}>Register a support staff member.</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[#f4f6f5]" style={{ color: "#8fa394" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="employee-number" className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Employee ID</label>
            <div className="flex">
              <span className="flex h-10 items-center rounded-l-xl border border-r-0 bg-[#f4f6f5] px-3.5 text-[13.5px] font-medium" style={{ borderColor: "#e2e8e4", color: "#536258" }}>{prefix}-</span>
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
            <label htmlFor="staff-email" className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Email</label>
            <input
              id="staff-email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(undefined);
              }}
              onBlur={() => setEmailError(email && !isValidEmail(email) ? EMAIL_HINT : undefined)}
              placeholder="name@aris.edu.ph"
              disabled={Boolean(oauthToken)}
              className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e] disabled:bg-[#f4f6f5] disabled:text-[#8fa394]"
              style={{ borderColor: emailError ? "#f1a5a5" : "#e2e8e4", color: "#111c14" }}
            />
            {emailError && <p className="mt-1 pl-0.5 text-[11px] text-red-700">{emailError}</p>}
          </div>

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Role</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((r) => {
                const on = role === r.key;
                return (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)} className="flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all" style={{ borderColor: on ? r.color : "#e2e8e4", background: on ? r.color + "10" : "#fff" }}>
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

          <div>
            <label className="text-[12.5px] font-medium block mb-1.5" style={{ color: "#3d4a41" }}>Department / Office</label>
            <input
              list="staff-departments-list"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="e.g. Attendance, Computer Science, Registrar"
              className="w-full h-10 px-3.5 rounded-xl bg-white border text-[13.5px] outline-none focus:border-[#3a7d4e]"
              style={{ borderColor: "#e2e8e4", color: "#111c14" }}
            />
            <datalist id="staff-departments-list">
              {Array.isArray(deptResources) && deptResources.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
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
                setEmailError(undefined);
                setUsername(profile.email.split("@")[0]);
                setPassword("");
              }}
              onClear={() => setOauthToken("")}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "#eef1ef", background: "#fafbfa" }}>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={() => void submit()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>
            {submitting ? "Saving…" : "Add Staff"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}