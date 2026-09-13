/**
 * Demo mode configuration.
 * When VITE_DEMO_MODE=true (default in dev) — all services use mock data.
 * When VITE_DEMO_MODE=false and VITE_API_BASE_URL is set — services hit real APIs.
 *
 * To enable live backend: set VITE_DEMO_MODE=false in .env
 */
export const DEMO_MODE: boolean =
  import.meta.env.VITE_DEMO_MODE === "false" ? false : true;

/**
 * Simulated network delay (ms) to mimic realistic API response times in demo mode.
 * Randomized between min and max for realism.
 */
export const DEMO_DELAY = (base = 500, jitter = 300): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, base + Math.random() * jitter));

export const DEMO_BANNER = DEMO_MODE;
