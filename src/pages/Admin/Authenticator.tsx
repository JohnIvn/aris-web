import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

// ─── Types ───────────────────────────────────────────────────────────────────

type DeviceStatus = {
  connected: boolean;
  lastSeen: string | null;
  deviceId: string | null;
  ip: string | null;
  firmwareVersion: string | null;
};

type HardwareEvent = {
  id: string;
  time: string;
  event: string;
  status: "Success" | "Failure";
  details: string;
};

type ProvisionerStatus = {
  running: boolean;
  pid: number | null;
};

/** Minimal device info returned by the aris-biometric `hello` command */
type ArisHelloData = {
  protocol: string;
  deviceId?: string;
  firmwareVersion?: string;
  model?: string;
  enrollAuthRequired?: boolean;
  sensorStatus?: string;
};

type SerialPortInfo = {
  port: SerialPort;
  label: string; // display name we build
};

type UsbConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

// ─── Web Serial helpers ───────────────────────────────────────────────────────

const BAUD = 115200;
const LS_PROVISIONER_KEY = "aris:provisioner:running";

/** Returns true if the browser supports the Web Serial API */
function hasWebSerial(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

/** Build a human-readable label for a SerialPort */
function portLabel(port: SerialPort, idx: number): string {
  const info = port.getInfo();
  const vid = info.usbVendorId?.toString(16).toUpperCase().padStart(4, "0");
  const pid = info.usbProductId?.toString(16).toUpperCase().padStart(4, "0");
  if (vid && pid) return `USB Device VID:${vid} PID:${pid}`;
  return `Serial Port ${idx + 1}`;
}

/**
 * Send the aris-biometric `hello` command over an open serial port and wait
 * for the matching response (up to `timeoutMs`).
 */
async function arisHello(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs = 4000,
): Promise<ArisHelloData | null> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const reqId = "h" + Math.random().toString(36).slice(2, 10);
  const req = JSON.stringify({
    protocol: "aris-biometric",
    protocolVersion: 1,
    requestId: reqId,
    command: "hello",
  });
  await writer.write(enc.encode(req + "\n"));

  const deadline = Date.now() + timeoutMs;
  let buf = "";

  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await Promise.race([
        reader.read(),
        new Promise<ReadableStreamReadResult<Uint8Array>>((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), remaining),
        ),
      ]);
    } catch {
      break;
    }
    if (chunk.done) break;
    buf += dec.decode(chunk.value, { stream: true });

    // Parse line-by-line
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const obj = JSON.parse(trimmed) as {
          type?: string;
          requestId?: string;
          success?: boolean;
          data?: ArisHelloData;
        };
        if (obj.type === "response" && obj.requestId === reqId && obj.success) {
          return obj.data ?? null;
        }
      } catch {
        // skip non-JSON boot noise
      }
    }
  }
  return null;
}

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

type EventFilter = "All" | "Success" | "Failure";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Authenticator() {
  // ── Backend / network device state ──────────────────────────────────────
  const [netStatus, setNetStatus] = useState<DeviceStatus | null>(null);
  const [events, setEvents] = useState<HardwareEvent[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>("All");
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

  // ── Web Serial COM ports ─────────────────────────────────────────────────
  const [serialSupported] = useState(hasWebSerial);
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPortIdx, setSelectedPortIdx] = useState<number>(-1);
  const [usbState, setUsbState] = useState<UsbConnectionState>("idle");
  const [usbError, setUsbError] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<ArisHelloData | null>(null);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

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

  const fetchEvents = useCallback(async () => {
    try {
      const res = await apiClient.get<HardwareEvent[]>("/system/hardware/events");
      setEvents(res.data);
      setEventsError(null);
    } catch {
      setEventsError("Could not fetch hardware events.");
    } finally {
      setLoadingEvents(false);
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
    setLoadingEvents(true);
    setLastRefreshed(new Date());
    void fetchNetStatus();
    void fetchEvents();
    void fetchProvisioner();
  }, [fetchNetStatus, fetchEvents, fetchProvisioner]);

  // Initial load + 10-second polling
  useEffect(() => {
    void fetchNetStatus();
    void fetchEvents();
    void fetchProvisioner();
    const timer = setInterval(() => {
      void fetchNetStatus();
      void fetchEvents();
      void fetchProvisioner();
    }, 10_000);
    return () => clearInterval(timer);
  }, [fetchNetStatus, fetchEvents, fetchProvisioner]);

  // ── Web Serial: enumerate already-granted ports ───────────────────────────
  const refreshSerialPorts = useCallback(async () => {
    if (!serialSupported) return;
    try {
      const ports = await navigator.serial.getPorts();
      setAvailablePorts(ports.map((p, i) => ({ port: p, label: portLabel(p, i) })));
      if (selectedPortIdx >= ports.length) setSelectedPortIdx(-1);
    } catch {
      // permission denied or no ports
    }
  }, [serialSupported, selectedPortIdx]);

  // Listen for port connect / disconnect events
  useEffect(() => {
    if (!serialSupported) return;
    void refreshSerialPorts();

    const onConnect = () => void refreshSerialPorts();
    const onDisconnect = (e: Event) => {
      void refreshSerialPorts();
      if (portRef.current === (e as unknown as { target: SerialPort }).target) {
        void handleDisconnect();
      }
    };
    navigator.serial.addEventListener("connect", onConnect);
    navigator.serial.addEventListener("disconnect", onDisconnect);
    return () => {
      navigator.serial.removeEventListener("connect", onConnect);
      navigator.serial.removeEventListener("disconnect", onDisconnect);
    };
  }, [serialSupported]);

  // ── Web Serial: request a new port (shows browser picker) ────────────────
  const requestPort = useCallback(async () => {
    if (!serialSupported) return;
    try {
      // Filter for known ESP32 USB-UART VID: CP210x=0x10C4, CH340=0x1A86, FTDI=0x0403, Espressif=0x303A
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x10c4 },
          { usbVendorId: 0x1a86 },
          { usbVendorId: 0x0403 },
          { usbVendorId: 0x303a },
        ],
      });
      await refreshSerialPorts();
      // Auto-select the newly granted port
      const ports = await navigator.serial.getPorts();
      const idx = ports.indexOf(port);
      if (idx >= 0) setSelectedPortIdx(idx);
    } catch {
      // user cancelled picker
    }
  }, [serialSupported, refreshSerialPorts]);

  // ── Web Serial: connect ───────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    if (selectedPortIdx < 0 || selectedPortIdx >= availablePorts.length) return;
    setUsbState("connecting");
    setUsbError(null);
    setConnectedDevice(null);

    const { port } = availablePorts[selectedPortIdx];
    try {
      await port.open({ baudRate: BAUD, dataBits: 8, stopBits: 1, parity: "none" });
      portRef.current = port;

      const writer = port.writable!.getWriter();
      const reader = port.readable!.getReader();
      writerRef.current = writer;
      readerRef.current = reader;

      // Run the ARIS hello handshake
      const helloData = await arisHello(writer, reader);
      if (helloData && helloData.protocol === "aris-biometric") {
        setConnectedDevice(helloData);
        setUsbState("connected");
      } else {
        // Not an ARIS device — still mark connected but no device info
        setConnectedDevice(null);
        setUsbState("connected");
        setUsbError("Connected but device did not respond to ARIS handshake. It may not be an ARIS biometric device.");
      }
    } catch (e) {
      setUsbState("error");
      setUsbError(e instanceof Error ? e.message : "Failed to open serial port.");
      portRef.current = null;
    }
  }, [availablePorts, selectedPortIdx]);

  // ── Web Serial: disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    setUsbState("disconnecting");
    try {
      readerRef.current?.releaseLock();
      writerRef.current?.releaseLock();
      readerRef.current = null;
      writerRef.current = null;
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch {
      // ignore close errors
    }
    setConnectedDevice(null);
    setUsbState("idle");
    setUsbError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void handleDisconnect();
    };
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((e) => filter === "All" || e.status === filter),
    [events, filter],
  );

  const netConnected = netStatus?.connected ?? false;
  const usbConnected = usbState === "connected";
  const isConnecting = usbState === "connecting";
  const isDisconnecting = usbState === "disconnecting";

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
              : isDisconnecting
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
            {/* Port selector row */}
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
                  <option key={i} value={i}>
                    {p.label}
                  </option>
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

            {/* Connect / Disconnect */}
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

            {/* Device info from handshake */}
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

      {/* ── Wi-Fi / Network Connection Status ────────────── */}
      <Card className="mb-3 !p-4 sm:!p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#18251c]">
              Network Status
            </h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">
              Device connection detected via hardware event log
            </p>
          </div>
          {loadingStatus ? (
            <span className="text-[11px] text-[#8fa394]">Checking…</span>
          ) : (
            <Badge tone={netConnected ? "green" : "gray"} dot>
              {netConnected ? "Device Detected" : "No Recent Activity"}
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
            <span className={`flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full ${netConnected ? "bg-[#eaf4ee] text-[#3a7d4e]" : "bg-[#f1f4f1] text-[#9aaba0]"}`}>
              {netConnected
                ? <Wifi size={28} strokeWidth={1.5} aria-hidden />
                : <WifiOff size={28} strokeWidth={1.5} aria-hidden />}
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Network Status</p>
              <p className={`mt-0.5 text-[14px] font-semibold ${netConnected ? "text-[#347849]" : "text-[#8fa394]"}`}>
                {loadingStatus ? "Checking…" : netConnected ? "Active" : "Offline"}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">
                {netConnected
                  ? "Device is communicating with ARIS"
                  : "No recent communication from device"}
              </p>
            </div>
          </div>

          <div className="flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#e7ece8] p-3 sm:p-4">
            <span className={`flex h-14 w-14 aspect-square shrink-0 items-center justify-center rounded-full ${netConnected ? "bg-[#eaf4ee] text-[#3a7d4e]" : "bg-[#f1f4f1] text-[#9aaba0]"}`}>
              <Fingerprint size={28} strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-[11px] text-[#718076]">Last Seen</p>
              <p className={`mt-0.5 text-[14px] font-semibold ${netConnected ? "text-[#347849]" : "text-[#8fa394]"}`}>
                {loadingStatus ? "—" : timeAgo(netStatus?.lastSeen ?? null)}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8fa394]">
                {netStatus?.lastSeen ? fmtDate(netStatus.lastSeen) : "No connection recorded"}
              </p>
            </div>
          </div>
        </div>

        {/* Device info from backend */}
        {!loadingStatus && (netStatus?.deviceId || netStatus?.ip || netStatus?.firmwareVersion) && (
          <div className="mt-3 rounded-xl border border-[#e7ece8] bg-[#f8faf8] p-3 divide-y divide-[#edf0ed]">
            <InfoRow label="Device ID" value={netStatus.deviceId ?? "—"} />
            <InfoRow label="IP Address" value={netStatus.ip ?? "—"} />
            <InfoRow label="Firmware Version" value={netStatus.firmwareVersion ?? "—"} />
          </div>
        )}
      </Card>

      {/* ── Hardware Events Log ───────────────────────────── */}
      <Card className="!p-4 sm:!p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[14px] font-semibold text-[#18251c]">Hardware Event Log</h2>
            <p className="mt-0.5 text-[12px] text-[#8fa394]">
              Recent device transactions and connection events
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-[#f1f4f1] p-1" role="group" aria-label="Filter hardware events">
            {(["All", "Success", "Failure"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={filter === opt}
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${filter === opt ? "bg-white text-[#3d4a41] shadow-sm" : "text-[#8fa394] hover:text-[#3d4a41]"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {eventsError && (
          <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {eventsError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8faf8] text-[9px] uppercase tracking-wide text-[#9aaba0]">
                {["Time", "Event", "Status", "Details"].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-medium" style={{ borderBottom: "1px solid #edf0ed" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingEvents && events.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-[#8fa394]">Loading hardware events…</td></tr>
              )}
              {!loadingEvents && filteredEvents.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-[12px] text-[#8fa394]">No hardware events{filter !== "All" ? ` with status "${filter}"` : ""}.</td></tr>
              )}
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="text-[10px] text-[#536258]">
                  <td className="whitespace-nowrap px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{fmtDate(ev.time)}</td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{ev.event}</td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>
                    <Badge tone={ev.status === "Success" ? "green" : "red"} dot>{ev.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5" style={{ borderBottom: "1px solid #edf0ed" }}>{ev.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
