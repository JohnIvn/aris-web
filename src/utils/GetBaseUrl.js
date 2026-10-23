export default function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;

  if (raw && typeof raw === "string") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    // Assume HTTPS if protocol is missing
    return `https://${raw}`;
  }

  // Production default
  return "https://nutribin-user-backend-production.up.railway.app";
}
