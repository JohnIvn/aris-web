import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { BRAND, BRAND_DARK } from "@/config/navigation";
import { Card, PageTitle, GhostButton, PrimaryButton, Badge } from "@/components/ui";
import getBaseUrl from "@/utils/GetBaseUrl";
import { useAuth } from "@/app/authContext";

export interface PayrollConfigState {
  baseHourlyRate: number;
  dtrHourlyRate: number;
  overloadRate: number;
  defaultCycleHours: number;
  allowancePerCycle: number;
  taxRatePercent: number;
  enableRankPricing: boolean;
  enableOverload: boolean;
  instructorRate: number;
  assistantProfRate: number;
  associateProfRate: number;
  professorRate: number;
  departmentHeadRate: number;
  lecturerRate: number;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_CONFIG: PayrollConfigState = {
  baseHourlyRate: 500,
  dtrHourlyRate: 250,
  overloadRate: 600,
  defaultCycleHours: 30,
  allowancePerCycle: 0,
  taxRatePercent: 0,
  enableRankPricing: true,
  enableOverload: false,
  instructorRate: 400,
  assistantProfRate: 500,
  associateProfRate: 650,
  professorRate: 800,
  departmentHeadRate: 900,
  lecturerRate: 450,
};

export default function PayrollSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "administrator" || user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  const [config, setConfig] = useState<PayrollConfigState>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Simulator State
  const [simRank, setSimRank] = useState<string>("Associate Professor");
  const [simType, setSimType] = useState<"AR" | "DTR">("AR");
  const [simHours, setSimHours] = useState<number>(30);

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await fetch(`${getBaseUrl()}/payroll/config`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === "object") {
            setConfig({ ...DEFAULT_CONFIG, ...data });
          }
        }
      } catch (err) {
        console.error("Failed to load payroll config", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      setSaveSuccess(false);

      const res = await fetch(`${getBaseUrl()}/payroll/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error(`Failed to save configuration (Status ${res.status})`);
      }

      const updated = await res.json();
      if (updated && typeof updated === "object") {
        setConfig((prev) => ({ ...prev, ...updated }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update configuration";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all rates and computation settings to institution defaults?")) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const updateNumberField = (field: keyof PayrollConfigState, value: string) => {
    const num = Number(value);
    setConfig((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  // Simulator calculation
  const simulation = useMemo(() => {
    const hours = Math.max(0, simHours);
    let effectiveRate = config.baseHourlyRate;

    if (simType === "DTR") {
      effectiveRate = config.dtrHourlyRate;
    } else if (config.enableRankPricing) {
      const lower = simRank.toLowerCase();
      if (lower.includes("dept") || lower.includes("head")) effectiveRate = config.departmentHeadRate;
      else if (lower.includes("assoc")) effectiveRate = config.associateProfRate;
      else if (lower.includes("assist")) effectiveRate = config.assistantProfRate;
      else if (lower.includes("prof")) effectiveRate = config.professorRate;
      else if (lower.includes("instructor")) effectiveRate = config.instructorRate;
      else if (lower.includes("lecturer") || lower.includes("adjunct")) effectiveRate = config.lecturerRate;
    }

    const cycleStd = Math.max(1, config.defaultCycleHours);
    let regularHours = hours;
    let overloadHours = 0;

    if (config.enableOverload && hours > cycleStd) {
      regularHours = cycleStd;
      overloadHours = hours - cycleStd;
    }

    const regularPay = Math.round(regularHours * effectiveRate);
    const overloadPay = Math.round(overloadHours * config.overloadRate);
    const allowance = config.allowancePerCycle;
    const gross = regularPay + overloadPay + allowance;
    const taxAmount = Math.round((gross * config.taxRatePercent) / 100);
    const net = Math.max(0, gross - taxAmount);

    return {
      rate: effectiveRate,
      regularHours,
      overloadHours,
      regularPay,
      overloadPay,
      allowance,
      gross,
      taxAmount,
      net,
    };
  }, [config, simRank, simType, simHours]);

  return (
    <div className="pb-6 max-w-6xl">
      {/* Top Breadcrumb and Actions */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate("/payroll")}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors hover:underline cursor-pointer"
          style={{ color: BRAND }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Payroll Records
        </button>

        {config.updatedAt && (
          <span className="text-[11.5px]" style={{ color: "#8fa394" }}>
            Last updated: {new Date(config.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <PageTitle
        title="Payroll Computation Settings"
        subtitle="Manage dynamic hourly rates, faculty academic rank multipliers, and deductions applied automatically when Accounting clears submissions."
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={handleReset} disabled={saving || loading}>
              Reset Defaults
            </GhostButton>
            <PrimaryButton onClick={handleSave} disabled={saving || loading}>
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving Rates...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Save Configuration
                </>
              )}
            </PrimaryButton>
          </div>
        }
      />

      {/* Notifications */}
      {saveSuccess && (
        <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Settings Saved!</span> All subsequent approvals and duty payouts will use these dynamic computation rates.
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-emerald-700 hover:text-emerald-900 font-bold px-2 cursor-pointer">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold">Error:</span> {errorMessage}
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold px-2 cursor-pointer">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Core Base Rates */}
          <Card>
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "#f0f2f0" }}>
              <div>
                <h3 className="text-[14px] font-bold text-[#111c14]">Base Hourly Rates</h3>
                <p className="text-[12px] text-[#8fa394]">Default rates applied when calculating teaching duty and staff attendance.</p>
              </div>
              <Badge tone="green">Active</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  AR / Teaching Base Rate (₱/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={config.baseHourlyRate}
                    onChange={(e) => updateNumberField("baseHourlyRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Standard accomplishment report rate</span>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  DTR Attendance Hourly Rate (₱/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={config.dtrHourlyRate}
                    onChange={(e) => updateNumberField("dtrHourlyRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Biometric / daily time record rate</span>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  Cycle Standard Hours (hrs)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={config.defaultCycleHours}
                  onChange={(e) => updateNumberField("defaultCycleHours", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                  style={{ borderColor: "#e2e8e4" }}
                />
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Standard duty hours expected per cycle</span>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  Overload Duty Rate (₱/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={config.overloadRate}
                    onChange={(e) => updateNumberField("overloadRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Rate for duty hours exceeding standard cycle</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "#f0f2f0" }}>
              <div>
                <p className="text-[12.5px] font-semibold text-[#111c14]">Enable Overload Rate Differential</p>
                <p className="text-[11.5px] text-[#8fa394]">Calculate hours beyond standard cycle at the overload rate instead of regular rate.</p>
              </div>
              <input
                type="checkbox"
                checked={config.enableOverload}
                onChange={(e) => setConfig((p) => ({ ...p, enableOverload: e.target.checked }))}
                className="w-4 h-4 accent-[#3a7d4e] cursor-pointer"
              />
            </div>
          </Card>

          {/* Card 2: Academic Rank Tiers */}
          <Card>
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "#f0f2f0" }}>
              <div>
                <h3 className="text-[14px] font-bold text-[#111c14]">Academic Rank Tier Rates</h3>
                <p className="text-[12px] text-[#8fa394]">Faculty teaching rate is resolved automatically from the professor's assigned position/rank.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-[12px] font-medium text-[#3d4a41]">
                <span>Rank Pricing</span>
                <input
                  type="checkbox"
                  checked={config.enableRankPricing}
                  onChange={(e) => setConfig((p) => ({ ...p, enableRankPricing: e.target.checked }))}
                  className="w-4 h-4 accent-[#3a7d4e]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Department Head Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.departmentHeadRate}
                    onChange={(e) => updateNumberField("departmentHeadRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Full Professor Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.professorRate}
                    onChange={(e) => updateNumberField("professorRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Associate Professor Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.associateProfRate}
                    onChange={(e) => updateNumberField("associateProfRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Assistant Professor Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.assistantProfRate}
                    onChange={(e) => updateNumberField("assistantProfRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Instructor Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.instructorRate}
                    onChange={(e) => updateNumberField("instructorRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5a6b5e] mb-1">
                  Lecturer / Adjunct Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    disabled={!config.enableRankPricing}
                    value={config.lecturerRate}
                    onChange={(e) => updateNumberField("lecturerRate", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13px] font-medium text-[#111c14] disabled:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Adjustments & Withholding Tax */}
          <Card>
            <div className="border-b pb-3 mb-4" style={{ borderColor: "#f0f2f0" }}>
              <h3 className="text-[14px] font-bold text-[#111c14]">Allowances & Tax Deductions</h3>
              <p className="text-[12px] text-[#8fa394]">Fixed allowances and withholding tax percentages applied to gross duty pay.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  Allowance Per Cycle (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-[#8fa394]">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={config.allowancePerCycle}
                    onChange={(e) => updateNumberField("allowancePerCycle", e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                </div>
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Transportation / communication allowance</span>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3d4a41] mb-1">
                  Withholding Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={config.taxRatePercent}
                    onChange={(e) => updateNumberField("taxRatePercent", e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border text-[13.5px] font-semibold text-[#111c14] focus:outline-none focus:ring-1 focus:ring-[#3a7d4e]"
                    style={{ borderColor: "#e2e8e4" }}
                  />
                  <span className="absolute right-3 top-2.5 text-[13px] text-[#8fa394]">%</span>
                </div>
                <span className="text-[11px] text-[#8fa394] mt-0.5 block">Deducted from gross duty pay (0% = none)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Interactive Calculator Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            className="sticky top-4"
            style={{
              background: BRAND_DARK,
              color: "#fff",
              boxShadow: "0 10px 30px rgba(13,26,16,0.22)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#1e3324" }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND }} />
                <h4 className="text-[13px] font-bold tracking-wide uppercase" style={{ color: "#cfe3d6" }}>
                  Live Calculation Simulator
                </h4>
              </div>
              <Badge tone="green">Preview</Badge>
            </div>

            <p className="text-[12px] mt-2 mb-4" style={{ color: "#8fa394" }}>
              Test how changes to rates affect calculations in real-time before saving.
            </p>

            {/* Simulator Controls */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11.5px] uppercase font-semibold mb-1" style={{ color: "#7aaa86" }}>
                  Submission Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimType("AR")}
                    className={`py-1.5 px-3 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                      simType === "AR"
                        ? "bg-[#3a7d4e] text-white border-transparent"
                        : "bg-[#142318] text-[#8fa394] border-[#223627] hover:text-white"
                    }`}
                  >
                    AR (Accomplishment)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimType("DTR")}
                    className={`py-1.5 px-3 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                      simType === "DTR"
                        ? "bg-[#3a7d4e] text-white border-transparent"
                        : "bg-[#142318] text-[#8fa394] border-[#223627] hover:text-white"
                    }`}
                  >
                    DTR (Attendance)
                  </button>
                </div>
              </div>

              {simType === "AR" && (
                <div>
                  <label className="block text-[11.5px] uppercase font-semibold mb-1" style={{ color: "#7aaa86" }}>
                    Faculty Position / Rank
                  </label>
                  <select
                    value={simRank}
                    onChange={(e) => setSimRank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-[12.5px] font-medium border bg-[#142318] text-white focus:outline-none"
                    style={{ borderColor: "#223627" }}
                  >
                    <option value="Department head">Department Head</option>
                    <option value="Professor">Full Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Lecturer">Lecturer / Adjunct</option>
                  </select>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11.5px] uppercase font-semibold" style={{ color: "#7aaa86" }}>
                    Rendered Duty Hours
                  </label>
                  <span className="text-[12px] font-bold text-white">{simHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="w-full accent-[#3a7d4e] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Breakdown Result */}
            <div className="rounded-2xl p-4 bg-[#142318] border space-y-2.5 text-[12.5px]" style={{ borderColor: "#223627" }}>
              <div className="flex justify-between items-center">
                <span style={{ color: "#8fa394" }}>Effective Hourly Rate</span>
                <span className="font-bold text-white">₱{simulation.rate.toLocaleString()} / hr</span>
              </div>

              <div className="flex justify-between items-center">
                <span style={{ color: "#8fa394" }}>
                  Regular Pay ({simulation.regularHours} hrs)
                </span>
                <span className="font-medium text-white">₱{simulation.regularPay.toLocaleString()}</span>
              </div>

              {simulation.overloadHours > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ color: "#8fa394" }}>
                    Overload Pay ({simulation.overloadHours} hrs @ ₱{config.overloadRate})
                  </span>
                  <span className="font-medium text-emerald-400">+₱{simulation.overloadPay.toLocaleString()}</span>
                </div>
              )}

              {simulation.allowance > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ color: "#8fa394" }}>Cycle Allowance</span>
                  <span className="font-medium text-emerald-400">+₱{simulation.allowance.toLocaleString()}</span>
                </div>
              )}

              {simulation.taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ color: "#8fa394" }}>Tax Deduction ({config.taxRatePercent}%)</span>
                  <span className="font-medium text-rose-400">-₱{simulation.taxAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t pt-3 flex items-baseline justify-between" style={{ borderColor: "#223627" }}>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold" style={{ color: "#7aaa86" }}>
                    Net Payable Duty Amount
                  </span>
                  <p className="text-[10px] mt-0.5" style={{ color: "#5a6b5e" }}>Formula logged to official payroll</p>
                </div>
                <span className="text-[26px] font-black tracking-tight text-white">
                  ₱{simulation.net.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#0f1d12] border text-[11px] leading-relaxed" style={{ borderColor: "#1e3324", color: "#8fa394" }}>
              <span className="font-semibold text-white">Automated Pipeline:</span> Whenever Accounting reviews a submission and clicks <span className="font-semibold text-emerald-400">"Approve &amp; Clear for Payroll"</span>, the backend queries these active configuration settings and records the calculated salary instantly.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
