import { defineConfig } from "vite";

// Minimal config for production preview — avoids dev-only plugins in Docker.
export default defineConfig({
  build: {
    outDir: "build/client",
  },
  preview: {
    host: true,
    port: 3000,
  },
});
