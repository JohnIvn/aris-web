import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  build: {
    outDir: mode === "desktop" ? "dist/desktop" : "dist/admin",
    rollupOptions: {
      input: mode === "desktop" ? "desktop.html" : "index.html",
    },
  },
  server: {
    port: mode === "desktop" ? 1420 : 5173,
    strictPort: true,
  },
}));
