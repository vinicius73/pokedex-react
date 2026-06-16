import type { Config } from "@react-router/dev/config";

function normalizeBasePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

const basePath = process.env.BASE_PATH ? normalizeBasePath(process.env.BASE_PATH) : undefined;

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  ...(basePath ? { basename: basePath } : {}),
} satisfies Config;
