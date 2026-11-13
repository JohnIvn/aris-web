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

interface SerialContextValue {
  serialSupported: boolean;
  availablePorts: SerialPortInfo[];
  selectedPortIdx: number;
  setSelectedPortIdx: (idx: number) => void;
  usbState: UsbConnectionState;
  usbError: string | null;
  connectedDevice: ArisHelloData | null;
  refreshSerialPorts: () => Promise<void>;
  requestPort: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

// ─── Constants & Helpers ─────────────────────────────────────────────────────

const BAUD = 115200;

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
        // ignore non-JSON boot logs
      }
    }
  }
  return null;
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

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

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

  // Listen to browser USB plug/unplug events
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
      // user closed the browser port picker
    }
  }, [serialSupported, refreshSerialPorts]);

  const connect = useCallback(async () => {
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

      const helloData = await arisHello(writer, reader);
      if (helloData && helloData.protocol === "aris-biometric") {
        setConnectedDevice(helloData);
        setUsbState("connected");
        void apiClient
          .post("/system/hardware/ping", {
            deviceId: helloData.deviceId,
            firmwareVersion: helloData.firmwareVersion,
          })
          .catch(() => undefined);
      } else {
        setConnectedDevice(null);
        setUsbState("connected");
        void apiClient
          .post("/system/hardware/ping", {
            deviceId: "ARIS-USB-Device",
          })
          .catch(() => undefined);
        setUsbError(
          "Connected but device did not respond to ARIS handshake. It may not be an ARIS biometric device.",
        );
      }
    } catch (e) {
      setUsbState("error");
      setUsbError(e instanceof Error ? e.message : "Failed to open serial port.");
      portRef.current = null;
    }
  }, [availablePorts, selectedPortIdx]);

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
        refreshSerialPorts,
        requestPort,
        connect,
        disconnect,
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
