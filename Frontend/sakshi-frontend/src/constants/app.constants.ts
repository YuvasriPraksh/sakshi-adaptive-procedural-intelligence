/** Application-wide constants */

export const APP_NAME    = "SAKSHI";
export const APP_TAGLINE = "AI-Powered Procedural Intelligence Platform";
export const APP_VERSION = "1.0.0";

// ─── Pagination defaults ──────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE   = 20;
export const PAGE_SIZE_OPTIONS   = [10, 20, 50, 100];

// ─── Debounce delays ─────────────────────────────────────────────────────────
export const SEARCH_DEBOUNCE_MS  = 400;
export const RESIZE_DEBOUNCE_MS  = 200;

// ─── Date formats ─────────────────────────────────────────────────────────────
export const DATE_FORMAT         = "DD/MM/YYYY";
export const DATETIME_FORMAT     = "DD/MM/YYYY HH:mm";
export const TIME_FORMAT         = "HH:mm";

// ─── Toast durations ──────────────────────────────────────────────────────────
export const TOAST_SUCCESS_MS    = 3000;
export const TOAST_ERROR_MS      = 6000;
export const TOAST_PERSISTENT    = 0;

// ─── POCSO-specific status labels ─────────────────────────────────────────────
export const CASE_STATUSES = {
  PENDING:      "pending",
  IN_PROGRESS:  "in_progress",
  REVIEW:       "under_review",
  COMPLETED:    "completed",
  ESCALATED:    "escalated",
  CLOSED:       "closed",
} as const;

export type CaseStatus = (typeof CASE_STATUSES)[keyof typeof CASE_STATUSES];

// ─── User roles ───────────────────────────────────────────────────────────────
export const USER_ROLES = {
  ADMIN:       "admin",
  SUPERVISOR:  "supervisor",
  POLICE:      "police",
  HOSPITAL:    "hospital",
  FSL:         "fsl",
  CWC:         "cwc",
  CITIZEN:     "citizen",
  VIEWER:      "viewer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN:   "sakshi_access_token",
  REFRESH_TOKEN:  "sakshi_refresh_token",
  THEME:          "sakshi_theme",
  PREFERENCES:    "sakshi_preferences",
  SIDEBAR:        "sakshi_sidebar_collapsed",
} as const;

// ─── HTTP status codes ────────────────────────────────────────────────────────
export const HTTP = {
  OK:                 200,
  CREATED:            201,
  NO_CONTENT:         204,
  BAD_REQUEST:        400,
  UNAUTHORIZED:       401,
  FORBIDDEN:          403,
  NOT_FOUND:          404,
  UNPROCESSABLE:      422,
  TOO_MANY_REQUESTS:  429,
  SERVER_ERROR:       500,
} as const;
