import { useEffect } from "react";
import { supabase } from "@/services/supabase";

export function useSupportRealtime(onChange: () => void) {
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("support-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_ticket_messages" }, onChange)
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [onChange]);
}
