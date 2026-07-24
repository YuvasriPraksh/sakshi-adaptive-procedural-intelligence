export const ROUTES = {
  // Public
  HOME:              "/",
  LOGIN:             "/login",
  REGISTER:          "/register",
  FORGOT_PASSWORD:   "/forgot-password",
  RESET_PASSWORD:    "/reset-password/:token",
  CITIZEN_PORTAL:    "/citizen",

  // Core app
  DASHBOARD:         "/dashboard",
  CASES:             "/cases",
  CASE_DETAIL:       "/cases/:caseId",
  CASE_NEW:          "/cases/new",
  CASE_WORKFLOW:     "/cases/:caseId/workflow",

  // Role dashboards
  POLICE_DASHBOARD:  "/dashboard/police",
  HOSPITAL_DASHBOARD:"/dashboard/hospital",
  CWC_DASHBOARD:     "/dashboard/cwc",
  FSL_DASHBOARD:     "/dashboard/fsl",
  SUPERVISOR_DASHBOARD:"/dashboard/supervisor",

  // Investigation tools
  TIMELINE:          "/timeline",
  TIMELINE_CASE:     "/timeline/:caseId",
  GRAPH:             "/graph",
  GRAPH_CASE:        "/graph/:caseId",
  AI_ASSISTANT:      "/ai-assistant",

  // Analytics & reporting
  ANALYTICS:         "/analytics",

  // Documents & evidence
  DOCUMENTS:         "/documents",
  DOCUMENT_DETAIL:   "/documents/:docId",

  // Audit & notifications
  AUDIT:             "/audit",
  NOTIFICATIONS:     "/notifications",

  // Account
  SETTINGS:          "/settings",
  SETTINGS_PROFILE:  "/settings/profile",
  SETTINGS_TEAM:     "/settings/team",
  SETTINGS_SECURITY: "/settings/security",
  SETTINGS_API_KEYS: "/settings/api-keys",
  PROFILE:           "/profile",

  // Errors
  NOT_FOUND:         "*",
} as const;

export type RouteKey = keyof typeof ROUTES;
