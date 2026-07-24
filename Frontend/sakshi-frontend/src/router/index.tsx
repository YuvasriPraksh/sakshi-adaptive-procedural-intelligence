import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthGuard }  from "./guards/AuthGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { ROUTES }     from "./routes";
import { PageSpinner } from "@/components/ui/feedback/Spinner";

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const LandingPage            = lazy(() => import("@/pages/LandingPage"));
const LoginPage              = lazy(() => import("@/pages/auth/LoginPage"));
const CitizenPortalPage      = lazy(() => import("@/pages/citizen/CitizenPortalPage"));
const DashboardPage          = lazy(() => import("@/pages/dashboard/DashboardPage"));
const PoliceDashboardPage    = lazy(() => import("@/pages/dashboard/PoliceDashboardPage"));
const HospitalDashboardPage  = lazy(() => import("@/pages/dashboard/HospitalDashboardPage"));
const CWCDashboardPage       = lazy(() => import("@/pages/dashboard/CWCDashboardPage"));
const FSLDashboardPage       = lazy(() => import("@/pages/dashboard/FSLDashboardPage"));
const SupervisorDashboardPage= lazy(() => import("@/pages/dashboard/SupervisorDashboardPage"));
const CasesPage              = lazy(() => import("@/pages/cases/CasesPage"));
const CaseDetailPage         = lazy(() => import("@/pages/cases/CaseDetailPage"));
const TimelinePage           = lazy(() => import("@/pages/timeline/TimelinePage"));
const GraphPage              = lazy(() => import("@/pages/graph/GraphPage"));
const AIAssistantPage        = lazy(() => import("@/pages/ai/AIAssistantPage"));
const AnalyticsPage          = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const NotificationsPage      = lazy(() => import("@/pages/notifications/NotificationsPage"));
const AuditPage              = lazy(() => import("@/pages/audit/AuditPage"));
const DocumentsPage          = lazy(() => import("@/pages/documents/DocumentsPage"));
const SettingsPage           = lazy(() => import("@/pages/settings/SettingsPage"));
const ProfilePage            = lazy(() => import("@/pages/profile/ProfilePage"));
const NotFoundPage           = lazy(() => import("@/pages/NotFoundPage"));

// ─── Wrap with Suspense ───────────────────────────────────────────────────────
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public routes ─────────────────────────────────────────────────────────
  { path: ROUTES.HOME,           element: <S><LandingPage /></S> },
  { path: ROUTES.CITIZEN_PORTAL, element: <S><CitizenPortalPage /></S> },

  // ── Guest-only (redirect if authed) ───────────────────────────────────────
  {
    element: <GuestGuard />,
    children: [
      { path: ROUTES.LOGIN,    element: <S><LoginPage /></S> },
      { path: ROUTES.REGISTER, element: <S><LoginPage /></S> },
      { path: ROUTES.FORGOT_PASSWORD, element: <S><LoginPage /></S> },
      { path: ROUTES.RESET_PASSWORD,  element: <S><LoginPage /></S> },
    ],
  },

  // ── Authenticated routes ──────────────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      { path: ROUTES.DASHBOARD,            element: <S><DashboardPage /></S> },
      { path: ROUTES.POLICE_DASHBOARD,     element: <S><PoliceDashboardPage /></S> },
      { path: ROUTES.HOSPITAL_DASHBOARD,   element: <S><HospitalDashboardPage /></S> },
      { path: ROUTES.CWC_DASHBOARD,        element: <S><CWCDashboardPage /></S> },
      { path: ROUTES.FSL_DASHBOARD,        element: <S><FSLDashboardPage /></S> },
      { path: ROUTES.SUPERVISOR_DASHBOARD, element: <S><SupervisorDashboardPage /></S> },
      { path: ROUTES.CASES,                element: <S><CasesPage /></S> },
      { path: ROUTES.CASE_DETAIL,          element: <S><CaseDetailPage /></S> },
      { path: ROUTES.CASE_NEW,             element: <S><CasesPage /></S> },
      { path: ROUTES.CASE_WORKFLOW,        element: <S><CaseDetailPage /></S> },
      { path: ROUTES.TIMELINE,             element: <S><TimelinePage /></S> },
      { path: ROUTES.TIMELINE_CASE,        element: <S><TimelinePage /></S> },
      { path: ROUTES.GRAPH,                element: <S><GraphPage /></S> },
      { path: ROUTES.GRAPH_CASE,           element: <S><GraphPage /></S> },
      { path: ROUTES.AI_ASSISTANT,         element: <S><AIAssistantPage /></S> },
      { path: ROUTES.ANALYTICS,            element: <S><AnalyticsPage /></S> },
      { path: ROUTES.NOTIFICATIONS,        element: <S><NotificationsPage /></S> },
      { path: ROUTES.AUDIT,                element: <S><AuditPage /></S> },
      { path: ROUTES.DOCUMENTS,            element: <S><DocumentsPage /></S> },
      { path: ROUTES.DOCUMENT_DETAIL,      element: <S><DocumentsPage /></S> },
      { path: ROUTES.SETTINGS,             element: <S><SettingsPage /></S> },
      { path: ROUTES.SETTINGS_PROFILE,     element: <S><SettingsPage /></S> },
      { path: ROUTES.SETTINGS_TEAM,        element: <S><SettingsPage /></S> },
      { path: ROUTES.SETTINGS_SECURITY,    element: <S><SettingsPage /></S> },
      { path: ROUTES.SETTINGS_API_KEYS,    element: <S><SettingsPage /></S> },
      { path: ROUTES.PROFILE,              element: <S><ProfilePage /></S> },
    ],
  },

  // ── 404 ──────────────────────────────────────────────────────────────────
  { path: ROUTES.NOT_FOUND, element: <S><NotFoundPage /></S> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
