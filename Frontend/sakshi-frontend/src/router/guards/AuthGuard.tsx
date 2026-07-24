import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export function AuthGuard() {
  const location = useLocation();
  const token = localStorage.getItem("sakshi_access_token");
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  return <Outlet />;
}
