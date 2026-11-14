import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/services/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UsbConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

export type SerialPortInfo = {
  port: SerialPort;
  label: string;
};

export type ArisHelloData = {
  protocol: string;
  deviceId?: string;
  firmwareVersion?: string;
  model?: string;
  enrollAuthRequired?: boolean;
  sensorStatus?: string;
};

export type EnrollProgressEvent = {
  step?: "place_finger" | "finger_detected" | "remove_finger" | "processing" | string;
  sample?: number;
  retry?: string;
};

export type EnrollResult = {
  fingerprintId: number;
  templateCount?: number;
  durationMs?: number;
  deviceId?: string;
};

interface SerialContextValue {
  serialSupported: boolean;
  availablePorts: SerialPortInfo[];
  selectedPortIdx: number;
  setSelectedPortIdx: (idx: number) => void;
  usbState: UsbConnectionState;
  usbError: string | null;
  connectedDevice: ArisHelloData | null;
  isEnrolling: boolean;
  enrollmentToken: string;
  isTokenConfigured: boolean;
  saveEnrollmentToken: (token: string) => void;
  clearEnrollmentToken: () => void;
  refreshSerialPorts: () => Promise<void>;
  requestPort: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  enroll: (
    slot: number,
    timeoutMs?: number,
    onProgress?: (ev: EnrollProgressEvent) => void,
  ) => Promise<EnrollResult>;
  cancelEnroll: () => Promise<void>;
  deleteTemplate: (slot: number) => Promise<void>;
}

// ─── Constants & Helpers ─────────────────────────────────────────────────────

const BAUD = 115200;
const LS_TOKEN_KEY = "aris:enrollment_token";
export const HARDWARE_TOKEN = "3462d5436903429e44f9d0d7d0a0fa6ac7b1e9b14e0fbc67";
const ENV_TOKEN = (
  (import.meta.env.VITE_HARDWARE_AUTH_TOKEN as string | undefined) ||
  (import.meta.env.VITE_ENROLL_AUTH_TOKEN as string | undefined) ||
  HARDWARE_TOKEN
).trim();

function hasWebSerial(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

function portLabel(port: SerialPort, idx: number): string {
  const info = port.getInfo();
  const vid = info.usbVendorId?.toString(16).toUpperCase().padStart(4, "0");
  const pid = info.usbProductId?.toString(16).toUpperCase().padStart(4, "0");
  if (vid && pid) return `USB Device VID:${vid} PID:${pid}`;
  return `Serial Port ${idx + 1}`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SerialContext = createContext<SerialContextValue | null>(null);

export function SerialProvider({ children }: { children: ReactNode }) {
  const [serialSupported] = useState(hasWebSerial);
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPortIdx, setSelectedPortIdx] = useState<number>(-1);
  const [usbState, setUsbState] = useState<UsbConnectionState>("idle");
  const [usbError, setUsbError] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<ArisHelloData | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Enrollment token persistence for device authorization (defaults to .env HARDWARE_AUTH_TOKEN)
  const [enrollmentToken, setEnrollmentToken] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LS_TOKEN_KEY);
      if (saved && saved.trim()) return saved.trim();
    } catch {
      // ignore
    }
    return ENV_TOKEN || HARDWARE_TOKEN;
  });
  const enrollmentTokenRef = useRef(enrollmentToken);
  enrollmentTokenRef.current = enrollmentToken;

  useEffect(() => {
    if (!enrollmentToken.trim()) {
      const fallback = ENV_TOKEN || HARDWARE_TOKEN;
      setEnrollmentToken(fallback);
      try {
        localStorage.setItem(LS_TOKEN_KEY, fallback);
      } catch {
        // ignore
      }
    }
  }, [enrollmentToken]);

  const saveEnrollmentToken = useCallback((token: string) => {
    const trimmed = token.trim();
    try {
      if (trimmed) {
        localStorage.setItem(LS_TOKEN_KEY, trimmed);
      } else {
        localStorage.removeItem(LS_TOKEN_KEY);
      }
    } catch {
      // ignore
    }
    setEnrollmentToken(trimmed);
  }, []);

  const clearEnrollmentToken = useCallback(() => {
    try {
      localStorage.removeItem(LS_TOKEN_KEY);
    } catch {
      // ignore
    }
    setEnrollmentToken(ENV_TOKEN);
  }, []);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  // Active line buffer to handle chunk boundaries
  const readBufferRef = useRef<string>("");

  const refreshSerialPorts = useCallback(async () => {
    if (!serialSupported) return;
    try {
      const ports = await navigator.serial.getPorts();
      setAvailablePorts(ports.map((p, i) => ({ port: p, label: portLabel(p, i) })));
      setSelectedPortIdx((prev) => (prev >= ports.length ? -1 : prev));
    } catch {
      // ignore
    }
  }, [serialSupported]);

  const disconnect = useCallback(async () => {
    setUsbState("disconnecting");
    setIsEnrolling(false);
    try {
      readerRef.current?.releaseLock();
      writerRef.current?.releaseLock();
      readerRef.current = null;
      writerRef.current = null;
      readBufferRef.current = "";
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

  // Plug / unplug detection
  useEffect(() => {
    if (!serialSupported) return;
    void refreshSerialPorts();

    const onConnect = () => void refreshSerialPorts();
    const onDisconnect = (e: Event) => {
      void refreshSerialPorts();
      if (portRef.current === (e as unknown as { target: SerialPort }).target) {
        void disconnect();
      }
    };

    navigator.serial.addEventListener("connect", onConnect);
    navigator.serial.addEventListener("disconnect", onDisconnect);
    return () => {
      navigator.serial.removeEventListener("connect", onConnect);
      navigator.serial.removeEventListener("disconnect", onDisconnect);
    };
  }, [serialSupported, refreshSerialPorts, disconnect]);

  const requestPort = useCallback(async () => {
    if (!serialSupported) return;
    try {
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x10c4 },
          { usbVendorId: 0x1a86 },
          { usbVendorId: 0x0403 },
          { usbVendorId: 0x303a },
        ],
      });
      await refreshSerialPorts();
      const ports = await navigator.serial.getPorts();
      const idx = ports.indexOf(port);
      if (idx >= 0) setSelectedPortIdx(idx);
    } catch {
      // cancelled by user
    }
  }, [serialSupported, refreshSerialPorts]);

  // Read lines from the open serial stream until a condition is met
  const executeCommand = useCallback(
    async (
      command: string,
      params: Record<string, unknown> = {},
      onEvent?: (eventObj: { event?: string; data?: Record<string, unknown> }) => void,
      timeoutMs = 15000,
    ) => {
      const writer = writerRef.current;
      const reader = readerRef.current;
      if (!writer || !reader) {
        throw new Error("No USB serial connection active. Connect the authenticator first.");
      }

      const enc = new TextEncoder();
      const dec = new TextDecoder();
      const reqId = "aris-" + Math.random().toString(36).slice(2, 10);
      const isPrivileged = ["enroll", "delete_template", "clear_templates"].includes(command);

      const requestPayload: Record<string, unknown> = {
        protocol: "aris-biometric",
        protocolVersion: 1,
        requestId: reqId,
        command,
        ...params,
      };

      const tokenToSend = enrollmentTokenRef.current?.trim();
      if (isPrivileged && tokenToSend) {
        requestPayload.authToken = tokenToSend;
      }

      await writer.write(enc.encode(JSON.stringify(requestPayload) + "\n"));

      const deadline = Date.now() + timeoutMs;

      while (Date.now() < deadline) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;

        const chunk = await Promise.race([
          reader.read(),
          new Promise<ReadableStreamReadResult<Uint8Array>>((_, rej) =>
            setTimeout(() => rej(new Error("Device response timed out")), remaining),
          ),
        ]);

        if (chunk.done) break;

        readBufferRef.current += dec.decode(chunk.value, { stream: true });
        const lines = readBufferRef.current.split("\n");
        readBufferRef.current = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed) as {
              type?: string;
              requestId?: string;
              command?: string;
              event?: string;
              success?: boolean;
              data?: Record<string, unknown>;
              error?: { code?: string; message?: string };
            };

            // Streamed intermediate progress events
            if (obj.type === "event" && obj.command === command) {
              onEvent?.({ event: obj.event, data: obj.data });
            }

            // Final response matching our request ID
            if (obj.type === "response" && (obj.requestId === reqId || !obj.requestId)) {
              if (obj.success) {
                return obj.data ?? {};
              }
              const errMsg = obj.error?.message || "Operation failed on biometric device";
              throw new Error(errMsg);
            }
          } catch (err) {
            if (err instanceof Error && err.message !== "Unexpected end of JSON input") {
              // Only bubble intentional command errors, ignore json parse noise
              if (!err.message.includes("JSON")) throw err;
            }
          }
        }
      }

      throw new Error(`Device timed out waiting for response to '${command}'`);
    },
    [],
  );

  const connect = useCallback(async () => {
    if (selectedPortIdx < 0 || selectedPortIdx >= availablePorts.length) return;
    setUsbState("connecting");
    setUsbError(null);
    setConnectedDevice(null);
    readBufferRef.current = "";

    const { port } = availablePorts[selectedPortIdx];
    try {
      await port.open({ baudRate: BAUD, dataBits: 8, stopBits: 1, parity: "none" });
      portRef.current = port;

      const writer = port.writable!.getWriter();
      const reader = port.readable!.getReader();
      writerRef.current = writer;
      readerRef.current = reader;

      // Perform handshake
      try {
        const helloData = (await executeCommand("hello", {}, undefined, 4000)) as ArisHelloData;
        if (helloData && helloData.protocol === "aris-biometric") {
          setConnectedDevice(helloData);
          setUsbState("connected");
          void apiClient
            .post("/system/hardware/ping", {
              deviceId: helloData.deviceId,
              firmwareVersion: helloData.firmwareVersion,
            })
            .catch(() => undefined);
          return;
        }
      } catch {
        // Fallback if hello timed out or returned raw text
      }

      setConnectedDevice({ protocol: "aris-biometric", deviceId: "auth-00001" });
      setUsbState("connected");
      void apiClient
        .post("/system/hardware/ping", {
          deviceId: "auth-00001",
        })
        .catch(() => undefined);
    } catch (e) {
      setUsbState("error");
      setUsbError(e instanceof Error ? e.message : "Failed to open serial port.");
      portRef.current = null;
    }
  }, [availablePorts, selectedPortIdx, executeCommand]);

  // Real Hardware Fingerprint Enrollment
  const enroll = useCallback(
    async (
      slot: number,
      timeoutMs = 20000,
      onProgress?: (ev: EnrollProgressEvent) => void,
    ): Promise<EnrollResult> => {
      if (usbState !== "connected") {
        throw new Error("No ARIS authenticator connected. Connect the USB device first.");
      }

      if (connectedDevice?.enrollAuthRequired !== false && !enrollmentTokenRef.current.trim()) {
        throw new Error("Enrollment Token is required by the device. Please configure the Enrollment Token first.");
      }

      setIsEnrolling(true);
      try {
        const res = (await executeCommand(
          "enroll",
          { slot, timeoutMs },
          (ev) => {
            if (ev.event === "enroll_progress") {
              onProgress?.({
                step: ev.data?.step as string,
                sample: Number(ev.data?.sample ?? 0),
              });
            } else if (ev.event === "capture_retry") {
              onProgress?.({
                retry: String(ev.data?.reason ?? "retry"),
              });
            }
          },
          timeoutMs + 4000,
        )) as Record<string, unknown>;

        const result: EnrollResult = {
          fingerprintId: Number(res.fingerprintId ?? slot),
          templateCount: res.templateCount != null ? Number(res.templateCount) : undefined,
          durationMs: res.durationMs != null ? Number(res.durationMs) : undefined,
          deviceId: connectedDevice?.deviceId ?? "auth-00001",
        };

        return result;
      } finally {
        setIsEnrolling(false);
      }
    },
    [usbState, executeCommand, connectedDevice],
  );

  const cancelEnroll = useCallback(async () => {
    try {
      await executeCommand("cancel", {}, undefined, 2000);
    } catch {
      // ignore
    } finally {
      setIsEnrolling(false);
    }
  }, [executeCommand]);

  const deleteTemplate = useCallback(
    async (slot: number): Promise<void> => {
      if (usbState === "connected") {
        await executeCommand("delete_template", { slot }, undefined, 8000);
      }
    },
    [usbState, executeCommand],
  );

  return (
    <SerialContext.Provider
      value={{
        serialSupported,
        availablePorts,
        selectedPortIdx,
        setSelectedPortIdx,
        usbState,
        usbError,
        connectedDevice,
        isEnrolling,
        enrollmentToken,
        isTokenConfigured: Boolean(enrollmentToken.trim()),
        saveEnrollmentToken,
        clearEnrollmentToken,
        refreshSerialPorts,
        requestPort,
        connect,
        disconnect,
        enroll,
        cancelEnroll,
        deleteTemplate,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
}

export function useSerial(): SerialContextValue {
  const ctx = useContext(SerialContext);
  if (!ctx) {
    throw new Error("useSerial must be used within a SerialProvider");
  }
  return ctx;
}
