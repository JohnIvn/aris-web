import { useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, EyeOff, GraduationCap, Mail, ShieldCheck } from "lucide-react";

interface AdminLoginProps {
  onLogin?: (email: string, password: string, remember: boolean) => void;
  onCampusSso?: () => void;
  error?: string | null;
}

function Login({ onLogin, onCampusSso, error }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin?.(email, password, remember);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2ef] p-3 text-[#17251c] sm:p-5">
      <div className="mx-auto grid min-h-[620px] w-full max-w-5xl overflow-hidden bg-[#f8faf8] shadow-[0_24px_80px_rgba(19,44,27,0.12)] sm:h-[min(620px,calc(100svh-2.5rem))] sm:min-h-[520px] sm:grid-cols-[0.92fr_1.08fr] sm:rounded-lg">
        <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#0b1b11] px-6 py-6 text-white sm:min-h-0 sm:px-7 sm:py-8 lg:px-9">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 78% 14%, rgba(72,143,83,.35), transparent 34%), linear-gradient(115deg, transparent 60%, rgba(47,104,57,.12))" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9e9d8] text-[#163921]">
              <GraduationCap size={17} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em]">ARIS</p>
              <p className="text-[9px] leading-tight text-[#b4c7b5]">Academic Reports &amp; Information System</p>
            </div>
          </div>

          <div className="relative z-10 my-8 max-w-md sm:my-0">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86b68d]">Academic records &amp; information system</p>
            <h1 className="max-w-sm text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[32px] lg:text-[36px]">
              Run your campus with clarity.
            </h1>
            <p className="mt-4 max-w-xs text-xs leading-[1.8] text-[#b8c8ba]">
              One quiet place to manage professors, staff, payroll, and every academic record, with no clutter.
            </p>
          </div>

          <div className="relative z-10 hidden items-center gap-5 text-[10px] text-[#9cb29f] sm:flex">
            <span>4,821 students</span><span className="h-1 w-1 rounded-full bg-[#75a57b]" />
            <span>32 faculty</span><span className="h-1 w-1 rounded-full bg-[#75a57b]" />
            <span>6 departments</span>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 sm:py-8 lg:px-10">
          <div className="w-full max-w-[340px]">
            <div className="mb-7">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-[#e6efe7] text-[#36794b]">
                <ShieldCheck size={19} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h2 className="text-[23px] font-semibold tracking-[-0.03em]">Welcome back</h2>
              <p className="mt-1 text-xs text-[#89948b]">Sign in to your administrator account</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-[11px] font-medium text-[#435147]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1aaa3]" size={14} aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="admin@uc.edu.ph"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-10 w-full rounded-md border border-[#e3e8e3] bg-white pl-9 pr-3 text-xs text-[#233128] outline-none transition focus:border-[#438158] focus:ring-2 focus:ring-[#438158]/15 placeholder:text-[#aab1ab]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="admin-password" className="text-[11px] font-medium text-[#435147]">Password</label>
                  <a href="/forgot-password" className="text-[11px] font-medium text-[#397c4d] hover:text-[#245f37]">Forgot?</a>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 w-full rounded-md border border-[#e3e8e3] bg-white py-2 pl-3 pr-10 text-xs text-[#233128] outline-none transition focus:border-[#438158] focus:ring-2 focus:ring-[#438158]/15 placeholder:text-[#aab1ab]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a39a] hover:text-[#435147] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#438158]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2 text-[11px] text-[#657168]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#397c4d]"
                />
                Keep me signed in
              </label>

              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

              <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#397c4d] text-xs font-semibold text-white shadow-[0_3px_8px_rgba(34,92,51,.2)] transition hover:bg-[#2e6c41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397c4d] focus-visible:ring-offset-2">
                Sign in
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[10px] text-[#a0aaa2]">
              <span className="h-px flex-1 bg-[#e5eae5]" />
              <span>OR</span>
              <span className="h-px flex-1 bg-[#e5eae5]" />
            </div>

            <button type="button" onClick={onCampusSso} className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#e3e8e3] bg-white text-[11px] font-medium text-[#39473d] transition hover:border-[#b9cabb] hover:bg-[#fbfdfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#438158]">
              <Mail size={13} aria-hidden="true" />
              Continue with campus SSO
            </button>

            <p className="mt-5 text-center text-[11px] text-[#9aa49c]">
              Need access? <a href="mailto:admin@aris.edu.ph" className="font-medium text-[#397c4d] hover:underline">Contact IT administration</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
