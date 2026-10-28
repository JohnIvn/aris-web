import { useEffect, useRef } from "react";
import { supabase } from "@/services/supabase";

export function useSupportRealtime(onChange: () => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const client = supabase;
    const channel = client
      ? client
          .channel(`support-tickets-sync-${Math.random().toString(36).slice(2, 9)}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "support_tickets" },
            () => {
              onChangeRef.current();
            },
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "support_ticket_messages" },
            () => {
              onChangeRef.current();
            },
          )
          .subscribe()
      : null;

    // Polling fallback to keep tickets fresh even if tab was suspended
    // or if realtime publication has latency
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        onChangeRef.current();
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (client && channel) {
        void client.removeChannel(channel);
      }
    };
  }, []);
}
