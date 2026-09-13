/**
 * Central application configuration.
 * All env vars are consumed here so the rest of the app
 * never imports from `import.meta.env` directly.
 */
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME ?? "SAKSHI",
  version: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
    timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  },
  features: {
    devtools: import.meta.env.VITE_ENABLE_DEVTOOLS === "true",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
