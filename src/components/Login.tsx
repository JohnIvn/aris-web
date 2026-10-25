import { useRef, useState } from "react"
import { Mail } from "lucide-react"
import arisLogo from "@/assets/brand/image.png"
import { GhostButton, Modal, PrimaryButton } from "@/components/ui"

const BRAND = "#3a7d4e"
const BRAND_DARK = "#0d1a10"
const SUPPORT_EMAIL = "admin@ucc.edu.ph"

const supportMailto = (subject: string, body: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export default function Login({
  onSignIn,
  onCampusSso,
  audience = "administrator",
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onCampusSso?: () => Promise<void> | void;
  audience?: string;
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialog, setDialog] = useState<"forgot" | "contact" | null>(null)
  const resetFormRef = useRef<HTMLFormElement>(null)

  const handlePasswordReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = `Hello IT Administration,\n\nPlease help me reset the password for my ARIS ${audience} account.\n\nAccount email: ${email.trim()}`
    window.location.href = supportMailto(`ARIS ${audience} password reset`, body)
    setDialog(null)
  }

  const contactSupport = () => {
    const body = `Hello IT Administration,\n\nI need help with my ARIS ${audience} account.\n\nAccount email: ${email.trim() || "Not provided"}`
    window.location.href = supportMailto("ARIS support request", body)
    setDialog(null)
  }

  const startCampusSso = async () => {
    setError(null)
    if (!onCampusSso) {
      setError("Campus SSO is not configured yet. Contact IT administration for access.")
      return
    }
    setSubmitting(true)
    try {
      await onCampusSso()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start campus SSO.")
    } finally {
      setSubmitting(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSignIn(email, password)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="flex h-svh w-full overflow-x-hidden overflow-y-auto lg:h-screen lg:overflow-hidden"
      style={{
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        background: "#eef1ef",
      }}
    >
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: BRAND_DARK }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(58,125,78,0.35), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(58,125,78,0.18), transparent 70%)",
          }}
        />

        <div className="flex items-center gap-3 relative">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "#ffffff12" }}
          >
            <img src={arisLogo} alt="ARIS" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="text-white font-semibold text-[16px] leading-none tracking-tight">
              ARIS
            </p>
            <p className="text-[12px] mt-1" style={{ color: "#527a5e" }}>
              Administration
            </p>
          </div>
        </div>

        <div className="relative">
          <p
            className="text-[13px] font-medium tracking-widest uppercase mb-4"
            style={{ color: BRAND }}
          >
            Academic Records &amp; Information System
          </p>
          <h1
            className="text-white font-bold leading-[1.1] tracking-tight"
            style={{ fontSize: "40px" }}
          >
            Run your campus
            <br />
            with clarity.
          </h1>
          <p
            className="text-[15px] mt-5 leading-relaxed max-w-sm"
            style={{ color: "#8fb69b" }}
          >
            One secure place to manage your ARIS work.
            academic record — no clutter.
          </p>
        </div>

        <div
          className="relative flex items-center gap-6 text-[13px]"
          style={{ color: "#527a5e" }}
        >
          <span>4,821 students</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "#2c4433" }}
          />
          <span>312 faculty</span>
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "#2c4433" }}
          />
          <span>6 departments</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#f0f7f2" }}
            >
              <img
                src={arisLogo}
                alt="ARIS"
                className="w-6 h-6 object-contain"
              />
            </div>
            <p
              className="font-semibold text-[15px] tracking-tight"
              style={{ color: "#111c14" }}
            >
              ARIS
            </p>
          </div>

          <h2
            className="text-[26px] font-bold tracking-tight"
            style={{ color: "#111c14" }}
          >
            Welcome back
          </h2>
          <p className="text-[14px] mt-1.5" style={{ color: "#8fa394" }}>
            Sign in to your {audience} account.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span
                className="text-[12.5px] font-medium"
                style={{ color: "#3d4a41" }}
              >
                Email address
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ucc.edu.ph"
                className="mt-1.5 w-full h-11 px-3.5 rounded-xl bg-white border text-[14px] outline-none transition-colors focus:border-[#3a7d4e]"
                style={{ borderColor: "#e2e8e4", color: "#111c14" }}
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span
                  className="text-[12.5px] font-medium"
                  style={{ color: "#3d4a41" }}
                >
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => setDialog("forgot")}
                  className="text-[12.5px] font-medium transition-opacity hover:opacity-70"
                  style={{ color: BRAND }}
                >
                  Forgot?
                </button>
              </div>
              <div className="mt-1.5 relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-11 rounded-xl bg-white border text-[14px] outline-none transition-colors focus:border-[#3a7d4e]"
                  style={{ borderColor: "#e2e8e4", color: "#111c14" }}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#8fa394" }}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setRemember((r) => !r)}
                className="w-[18px] h-[18px] rounded-md flex items-center justify-center border transition-colors flex-shrink-0"
                style={{
                  background: remember ? BRAND : "#fff",
                  borderColor: remember ? BRAND : "#cdd8d0",
                }}
                aria-pressed={remember}
              >
                {remember && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
              <span className="text-[13px]" style={{ color: "#5a6b5e" }}>
                Keep me signed in
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl text-[14px] font-semibold text-white transition-transform active:scale-[0.99]"
              style={{
                background: BRAND,
                boxShadow: "0 4px 14px rgba(58,125,78,0.28)",
              }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
          </form>

          <div className="my-5 flex items-center gap-3 text-[10px] text-[#a0aaa2]">
            <span className="h-px flex-1 bg-[#e5eae5]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#e5eae5]" />
          </div>
          <button type="button" disabled={submitting} onClick={startCampusSso} className="flex h-11 w-full items-center justify-center gap-3 leading-[0px] rounded-xl border bg-white text-[13px] font-medium text-[#3d4a41] transition-colors hover:bg-[#f7f9f8] disabled:opacity-60" style={{ borderColor: "#e2e8e4" }}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Continue with campus SSO
          </button>

          <p
            className="text-[12.5px] text-center mt-8"
            style={{ color: "#8fa394" }}
          >
            Need access?{" "}
            <button
              type="button"
              onClick={() => setDialog("contact")}
              className="font-medium transition-opacity hover:opacity-70"
              style={{ color: BRAND }}
            >
              Contact IT administration
            </button>
          </p>
        </div>
      </div>
      <Modal
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog === "forgot" ? "Reset your password" : "Contact IT administration"}
        align="left"
        icon={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4ee] text-[#2f7043]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>
        }
        actions={
          dialog === "forgot" ? (
            <>
              <GhostButton onClick={() => setDialog(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={() => resetFormRef.current?.requestSubmit()}>
                Email IT
              </PrimaryButton>
            </>
          ) : (
            <>
              <GhostButton onClick={() => setDialog(null)}>Close</GhostButton>
              <PrimaryButton onClick={contactSupport}>Email IT</PrimaryButton>
            </>
          )
        }
      >
        {dialog === "forgot" ? (
          <>
            <p>
              Enter your account email. ARIS will open a prefilled request to IT;
              it does not send automatic reset links.
            </p>
            <form ref={resetFormRef} onSubmit={handlePasswordReset} className="mt-4">
              <label className="block text-[12.5px] font-medium" style={{ color: "#3d4a41" }}>
                Account email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3.5 text-[14px] outline-none focus:border-[#3a7d4e]"
                  style={{ borderColor: "#e2e8e4", color: "#111c14" }}
                />
              </label>
            </form>
          </>
        ) : (
          <div className="space-y-3">
            <p>
              For account access, password help, or technical support, contact
              IT administration.
            </p>
            <a
              href={supportMailto("ARIS support request", `Hello IT Administration,\n\nI need help with my ARIS ${audience} account.`)}
              className="font-semibold underline underline-offset-2"
              style={{ color: BRAND }}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        )}
      </Modal>
    </div>
  )
}
