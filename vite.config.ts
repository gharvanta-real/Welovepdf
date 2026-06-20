import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": "http://127.0.0.1:8080",
      "/engine": "http://127.0.0.1:8080",
      "/tools": "http://127.0.0.1:8080",
      "/capabilities": "http://127.0.0.1:8080",
      "/jobs": "http://127.0.0.1:8080",
      "/inspect": "http://127.0.0.1:8080",
      "/upload": "http://127.0.0.1:8080",
      "/download": "http://127.0.0.1:8080",
      "/api": "http://127.0.0.1:8080",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("lucide-react")) return "vendor-lucide";
            if (id.includes("@hugeicons")) return "vendor-hugeicons";
            return "vendor-core";
          }
        },
      },
    },
  },
});

