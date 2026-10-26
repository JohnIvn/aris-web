export default function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;

  if (raw && typeof raw === "string") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw.replace(/\/+$/, "");
    }
    // Assume HTTPS if protocol is missing
    return `https://${raw}`.replace(/\/+$/, "");
  }

  return import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://aris-server.up.railway.app";
}
