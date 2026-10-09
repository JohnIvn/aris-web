import { useState } from "react"
import arisLogo from "@/assets/brand/image.png"
import { demoAccounts } from "@/data/demoAccounts"
import { isDemoMode } from "@/services/dataSource"

const BRAND = "#3a7d4e"
const BRAND_DARK = "#0d1a10"

export default function Login({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
            One quiet place to manage professors, staff, payroll, and every
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
            Sign in to your administrator account.
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
                placeholder="admin@aris.edu.ph"
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

          {isDemoMode && (
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "#e2e8e4" }}>
              <p className="text-[12px] font-semibold" style={{ color: "#111c14" }}>Demo accounts</p>
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className="mt-2 block text-left text-[11px]"
                  style={{ color: "#5a6b5e" }}
                >
                  {account.role === "administrator" ? "Administrator" : "Professor"}: {account.email} / {account.password}
                </button>
              ))}
            </div>
          )}

          {isDemoMode && <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#e2e8e4" }} />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ color: "#b6c3ba" }}
            >
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "#e2e8e4" }} />
          </div>}

          {isDemoMode && <button
            type="button"
            onClick={() => {
              const admin = demoAccounts[0]
              setEmail(admin.email)
              setPassword(admin.password)
            }}
            className="w-full h-11 rounded-xl text-[14px] font-medium bg-white border flex items-center justify-center gap-2.5 transition-colors hover:bg-[#f7f9f8]"
            style={{ borderColor: "#e2e8e4", color: "#3d4a41" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px]"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 8l9 6 9-6" />
            </svg>
            Fill administrator demo credentials
          </button>}

          <p
            className="text-[12.5px] text-center mt-8"
            style={{ color: "#8fa394" }}
          >
            Need access?{" "}
            <button
              className="font-medium transition-opacity hover:opacity-70"
              style={{ color: BRAND }}
            >
              Contact IT administration
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
