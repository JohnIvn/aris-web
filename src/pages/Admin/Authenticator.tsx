import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Fingerprint,
  RefreshCw,
  Wifi,
  WifiOff,
  Usb,
  Clock,
  Terminal,
  Plug,
  PlugZap,
  AlertTriangle,
} from "lucide-react";
import { Badge, Card, PageTitle } from "@/components/ui";
import { apiClient } from "@/services/apiClient";
import { useSerial } from "@/app/serialContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceStatus = {
  connected: boolean;
  lastSeen: string | null;
  deviceId: string | null;
  ip: string | null;
  firmwareVersion: string | null;
};

type ProvisionerStatus = {
  running: boolean;
  pid: number | null;
};

const LS_PROVISIONER_KEY = "aris:provisioner:running";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#edf0ed] last:border-0">
      <span className="text-[11px] text-[#8fa394] shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-[#18251c] text-right truncate max-w-[200px]">
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Authenticator() {
  // ── Global Web Serial connection state ───────────────────────────────────
  const {
    serialSupported,
    availablePorts,
    selectedPortIdx,
    setSelectedPortIdx,
    usbState,
    usbError,
    connectedDevice,
    refreshSerialPorts,
    requestPort,
    connect: handleConnect,
    disconnect: handleDisconnect,
  } = useSerial();

  // ── Backend / network state ──────────────────────────────────────────────
  const [netStatus, setNetStatus] = useState<DeviceStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // ── PowerShell provisioner ───────────────────────────────────────────────
  const [provisioner, setProvisioner] = useState<ProvisionerStatus>(() => {
    try {
      const cached = localStorage.getItem(LS_PROVISIONER_KEY);
      return cached ? (JSON.parse(cached) as ProvisionerStatus) : { running: false, pid: null };
    } catch {
      return { running: false, pid: null };
    }
  });

  // ── Fetch backend data ────────────────────────────────────────────────────
  const fetchNetStatus = useCallback(async () => {
    try {
      const res = await apiClient.get<DeviceStatus>("/system/hardware/status");
      setNetStatus(res.data);
      setStatusError(null);
    } catch {
      setStatusError("Could not fetch device status.");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchProvisioner = useCallback(async () => {
    try {
      const res = await apiClient.get<ProvisionerStatus>("/system/provisioner/status");
      const ps = res.data;
      setProvisioner(ps);
      localStorage.setItem(LS_PROVISIONER_KEY, JSON.stringify(ps));
    } catch {
      // keep last known value from localStorage
    }
  }, []);

  const refreshAll = useCallback(() => {
    setLoadingStatus(true);
    setLastRefreshed(new Date());
    void fetchNetStatus();
    void fetchProvisioner();
    void refreshSerialPorts();
  }, [fetchNetStatus, fetchProvisioner, refreshSerialPorts]);

  useEffect(() => {
    void fetchNetStatus();
    void fetchProvisioner();
    const timer = setInterval(() => {
      void fetchNetStatus();
      void fetchProvisioner();
    }, 10_000);
    return () => clearInterval(timer);
  }, [fetchNetStatus, fetchProvisioner]);

  // "Online" = backend reports a successful Device Connected event within the last 60s
  const netOnline = (() => {
    if (!netStatus?.connected) return false;
    if (!netStatus.lastSeen) return false;
    return Date.now() - new Date(netStatus.lastSeen).getTime() < 60_000;
  })();

  const usbConnected = usbState === "connected";
  const isConnecting = usbState === "connecting";

  return (
    <div className="pb-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <PageTitle
          title="Authenticator"
          subtitle="Detect and connect to the ARIS biometric ESP32 device via USB or Wi-Fi."
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8fa394] flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={refreshAll}
            className="flex items-center gap-1.5 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3d4a41] hover:bg-[#f7f9f8] transition-colors"
          >
            <RefreshCw size={13} aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {/* ── PowerShell Provisioner Banner ─────────────────── */}
      <div
        className={`mb-3 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          provisioner.running
            ? "border-[#3a7d4e] bg-[#eaf4ee]"
            : "border-[#e2e8e4] bg-white"
        }`}
      >
        <Terminal
          size={16}
          className={provisioner.running ? "text-[#3a7d4e]" : "text-[#9aaba0]"}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#18251c]">
            ARIS Provisioner (PowerShell)
          </p>
          <p className="text-[11px] text-[#8fa394]">
            {provisioner.running
              ? `Running${provisioner.pid ? ` — PID ${provisioner.pid}` : ""}. Watching for new USB-serial COM ports.`
              : "Not detected. Run ArisProvisioner.ps1 to automatically detect and provision the ESP32 device."}
          </p>
        </div>
        <Badge tone={provisioner.running ? "green" : "gray"} dot>
          {provisioner.running ? "Running" : "Stopped"}
        </Badge>
      </div>

      {/* ── USB COM Port Connection ───────────────────────── */}
      <Card className="mb-3 !p-4 sm:!p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#18251c] flex items-center gap-2">
              <Usb size={15} className="text-[#3a7d4e]" aria-hidden />
              USB Connection
            </h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">
              Connect directly to the ARIS biometric device via USB serial (Chrome / Edge only).
            </p>
          </div>
          <Badge tone={usbConnected ? "green" : usbState === "error" ? "red" : "gray"} dot>
            {isConnecting
              ? "Connecting…"
              : usbState === "disconnecting"
                ? "Disconnecting…"
                : usbConnected
                  ? "Connected"
                  : usbState === "error"
                    ? "Error"
                    : "Disconnected"}
          </Badge>
        </div>

        {!serialSupported && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
            <AlertTriangle size={13} aria-hidden />
            Web Serial API not supported in this browser. Use Chrome or Edge to connect via USB.
          </div>
        )}

        {usbError && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden />
            {usbError}
          </div>
        )}

        {serialSupported && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <select
                className="flex-1 min-w-0 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12px] text-[#3d4a41] focus:outline-none focus:ring-2 focus:ring-[#3a7d4e]/30 disabled:opacity-50"
                value={selectedPortIdx}
                onChange={(e) => setSelectedPortIdx(Number(e.target.value))}
                disabled={usbConnected || isConnecting}
              >
                <option value={-1}>
                  {availablePorts.length === 0 ? "No ports granted — click Add Port" : "Select a COM port"}
                </option>
                {availablePorts.map((p, i) => (
                  <option key={i} value={i}>{p.label}</option>
                ))}
              </select>

              <button
                onClick={() => void refreshSerialPorts()}
                disabled={usbConnected || isConnecting}
                className="flex items-center gap-1 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3d4a41] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} aria-hidden />
                Refresh
              </button>

              <button
                onClick={() => void requestPort()}
                disabled={usbConnected || isConnecting}
                className="flex items-center gap-1 rounded-xl border border-[#e2e8e4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3d4a41] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
              >
                <Plug size={12} aria-hidden />
                Add Port…
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => void handleConnect()}
                disabled={selectedPortIdx < 0 || usbConnected || isConnecting}
                className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12px] font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: "#3a7d4e" }}
              >
                <PlugZap size={13} aria-hidden />
                {isConnecting ? "Connecting…" : "Connect"}
              </button>
              <button
                onClick={() => void handleDisconnect()}
                disabled={!usbConnected && usbState !== "error"}
                className="flex items-center gap-1 rounded-xl border border-[#e2e8e4] bg-white px-4 py-1.5 text-[12px] font-medium text-[#3d4a41] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
              >
                Disconnect
              </button>
            </div>

            {usbConnected && connectedDevice && (
              <div className="mt-3 rounded-xl border border-[#e7ece8] bg-[#f8faf8] p-3 divide-y divide-[#edf0ed]">
                <InfoRow label="Device ID" value={connectedDevice.deviceId ?? "—"} />
                <InfoRow label="Firmware" value={connectedDevice.firmwareVersion ?? "—"} />
                <InfoRow label="Sensor Model" value={connectedDevice.model ?? "—"} />
                <InfoRow label="Sensor Status" value={connectedDevice.sensorStatus ?? "—"} />
                <InfoRow
                  label="Enroll Auth Required"
                  value={connectedDevice.enrollAuthRequired != null
                    ? connectedDevice.enrollAuthRequired ? "Yes" : "No"
                    : "—"}
                />
              </div>
            )}

            {usbConnected && !connectedDevice && (
              <p className="mt-3 text-[11px] text-[#8fa394]">
                Port open — no ARIS handshake response yet.
              </p>
            )}
          </>
        )}
      </Card>

      {/* ── Network Status (from backend event log) ───────── */}
      <Card className="!p-4 sm:!p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#18251c]">Network Status</h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">
              Device connection status via backend hardware event log
            </p>
          </div>
          {loadingStatus ? (
            <span className="text-[11px] text-[#8fa394]">Checking…</span>
          ) : (
            <Badge tone={netOnline ? "green" : "gray"} dot>
              {netOnline ? "Online" : "Offline"}
            </Badge>
          )}
        </div>

        {statusError && (
          <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {statusError}
          </p>
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#e7ece8] p-3 sm:p-4">
            <span className={`flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full ${netOnline ? "bg-[#eaf4ee] text-[#3a7d4e]" : "bg-[#f1f4f1] text-[#9aaba0]"}`}>
              {netOnline
                ? <Wifi size={28} strokeWidth={1.5} aria-hidden />
                : <WifiOff size={28} strokeWidth={1.5} aria-hidden />}
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Network Status</p>
              <p className={`mt-0.5 text-[14px] font-semibold ${netOnline ? "text-[#347849]" : "text-[#8fa394]"}`}>
                {loadingStatus ? "Checking…" : netOnline ? "Online" : "Offline"}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">
                {netOnline
                  ? "Device successfully connected to ARIS"
                  : "No active connection in the last 60 seconds"}
              </p>
            </div>
          </div>

          <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#e7ece8] p-3 sm:p-4">
            <span className={`flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full ${netOnline ? "bg-[#eaf4ee] text-[#3a7d4e]" : "bg-[#f1f4f1] text-[#9aaba0]"}`}>
              <Fingerprint size={28} strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Last Seen</p>
              <p className={`mt-0.5 text-[14px] font-semibold ${netOnline ? "text-[#347849]" : "text-[#8fa394]"}`}>
                {loadingStatus ? "—" : timeAgo(netStatus?.lastSeen ?? null)}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">
                {netStatus?.lastSeen ? fmtDate(netStatus.lastSeen) : "No connection recorded"}
              </p>
            </div>
          </div>
        </div>

        {!loadingStatus && (netStatus?.deviceId || netStatus?.ip || netStatus?.firmwareVersion) && (
          <div className="mt-3 rounded-xl border border-[#e7ece8] bg-[#f8faf8] p-3 divide-y divide-[#edf0ed]">
            <InfoRow label="Device ID" value={netStatus.deviceId ?? "—"} />
            <InfoRow label="IP Address" value={netStatus.ip ?? "—"} />
            <InfoRow label="Firmware Version" value={netStatus.firmwareVersion ?? "—"} />
          </div>
        )}
      </Card>
    </div>
  );
}
