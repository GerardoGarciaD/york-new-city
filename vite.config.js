import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Local API from server/dev.js. Online, Vercel serves /api itself.
    proxy: { "/api": "http://localhost:3001" },
  },
});
