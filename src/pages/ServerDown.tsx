import { getBaseUrl } from "../lib/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";

interface LogLine {
  id: number;
  text: string;
  state: "pending" | "ok" | "fail";
}

const RETRY_SECONDS = 10;
const HEALTH_ENDPOINT = "/health";

export default function ServerMaintenancePage() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [phase, setPhase] = useState<"checking" | "down" | "restored">(
    "checking",
  );
  const [countdown, setCountdown] = useState(RETRY_SECONDS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reducedMotion, setReducedMotion] = useState(false);
  const lineId = useRef(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const appendLine = useCallback((text: string, state: LogLine["state"]) => {
    lineId.current += 1;
    const entry: LogLine = { id: lineId.current, text, state };
    setLines((prev) => [...prev, entry]);
    return entry.id;
  }, []);

  const updateLine = useCallback((id: number, patch: Partial<LogLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const runDiagnostics = useCallback(async () => {
    setPhase("checking");
    setLines([]);

    appendLine("checking local session cache...", "ok");

    const pingId = appendLine(`pinging ${HEALTH_ENDPOINT}...`, "pending");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${getBaseUrl()}${HEALTH_ENDPOINT}`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        updateLine(pingId, {
          text: "server responded, connection ok",
          state: "ok",
        });
        appendLine("redirecting...", "ok");
        setPhase("restored");
        setTimeout(() => {
          window.location.href = "/";
        }, 900);
        return;
      }

      updateLine(pingId, {
        text: `server responded with status ${res.status}`,
        state: "fail",
      });
      setPhase("down");
    } catch {
      clearTimeout(timeout);
      updateLine(pingId, {
        text: "no response (timeout or connection refused)",
        state: "fail",
      });
      setPhase("down");
    }
  }, [appendLine, updateLine]);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  // Countdown + auto-retry loop, only while confirmed down.
  useEffect(() => {
    if (phase !== "down") return;

    setCountdown(RETRY_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          runDiagnostics();
          return RETRY_SECONDS;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [phase, runDiagnostics]);

  const handleRetryNow = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    runDiagnostics();
  };

  return (
    <div className="maint-root">
      <style>{`
        .maint-root {
          min-height: 100vh;
          width: 100%;
          background: #0c0f14;
          color: #c9d1d9;
          font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .maint-scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.015) 0px,
            rgba(255, 255, 255, 0.015) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.5;
        }
        .maint-panel {
          position: relative;
          width: 100%;
          max-width: 640px;
          background: #12161d;
          border: 1px solid #23292f;
          border-radius: 6px;
          padding: 28px 28px 24px;
        }
        .maint-eyebrow {
          font-size: 12px;
          letter-spacing: 0.06em;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
        }
        .maint-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff6b6b;
        }
        .maint-dot.ok { background: #5fd98b; }
        .maint-heading {
          font-size: 22px;
          font-weight: 700;
          color: #ffb454;
          margin: 0 0 6px;
        }
        .maint-sub {
          font-size: 13.5px;
          color: #9099a3;
          margin: 0 0 22px;
          line-height: 1.5;
        }
        .maint-log {
          background: #0c0f14;
          border: 1px solid #1d2229;
          border-radius: 4px;
          padding: 14px 16px;
          font-size: 13px;
          line-height: 1.9;
          min-height: 84px;
        }
        .maint-log-line { display: flex; gap: 10px; }
        .maint-log-line .tag {
          flex-shrink: 0;
          width: 46px;
          color: #4b535c;
        }
        .maint-log-line.ok .tag { color: #5fd98b; }
        .maint-log-line.fail .tag { color: #ff6b6b; }
        .maint-log-line.pending .tag { color: #ffb454; }
        .maint-cursor {
          display: inline-block;
          width: 7px;
          height: 14px;
          background: #ffb454;
          margin-left: 4px;
          animation: blink 1s steps(1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .maint-cursor { animation: none; }
        }
        @keyframes blink { 50% { opacity: 0; } }
        .maint-footer {
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .maint-countdown {
          font-size: 13px;
          color: #6b7280;
        }
        .maint-retry-btn {
          background: transparent;
          border: 1px solid #3a4148;
          color: #ffb454;
          font-family: inherit;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .maint-retry-btn:hover { border-color: #ffb454; background: #1a1508; }
        .maint-retry-btn:focus-visible {
          outline: 2px solid #ffb454;
          outline-offset: 2px;
        }
      `}</style>

      <div className="maint-scanlines" aria-hidden="true" />

      <div className="maint-panel" role="status" aria-live="polite">
        <div className="maint-eyebrow">
          <span className={`maint-dot ${phase === "restored" ? "ok" : ""}`} />
          NTC-TMS · SYSTEM STATUS
        </div>

        <h1 className="maint-heading">
          {phase === "restored" ? "connection restored" : "server unreachable"}
        </h1>
        <p className="maint-sub">
          {phase === "restored"
            ? "back online — taking you back now."
            : "we can't reach the server right now. this page will reconnect automatically once it's back."}
        </p>

        <div className="maint-log">
          {lines.map((line) => (
            <div key={line.id} className={`maint-log-line ${line.state}`}>
              <span className="tag">
                {line.state === "ok"
                  ? "[ok]"
                  : line.state === "fail"
                    ? "[fail]"
                    : "[...]"}
              </span>
              <span>{line.text}</span>
            </div>
          ))}
          {phase === "checking" && (
            <span className="maint-cursor" aria-hidden="true" />
          )}
        </div>

        {phase === "down" && (
          <div className="maint-footer">
            <span className="maint-countdown">retrying in {countdown}s...</span>
            <button
              className="maint-retry-btn"
              onClick={handleRetryNow}
              type="button"
            >
              &gt; retry_connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
