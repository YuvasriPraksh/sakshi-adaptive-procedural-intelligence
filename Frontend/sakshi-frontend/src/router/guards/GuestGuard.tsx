import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export function GuestGuard() {
  const token = localStorage.getItem("sakshi_access_token");
  if (token) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <Outlet />;
}
