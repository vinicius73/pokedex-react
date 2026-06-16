import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

function normalizeBasePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

const basePath = process.env.BASE_PATH ? normalizeBasePath(process.env.BASE_PATH) : "/";

export default defineConfig({
  base: basePath,
  plugins: [tailwindcss(), reactRouter()],
  build: {
    outDir: "build/client",
  },
  preview: {
    host: true,
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
