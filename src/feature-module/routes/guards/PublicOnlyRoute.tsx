import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../../core/context/AuthContext";
import { roleHome } from "./RoleLanding";

const Splash = () => (
  <div className="d-flex align-items-center justify-content-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading…</span>
    </div>
  </div>
);

const PublicOnlyRoute = () => {
  const { status, role, isAuthenticated } = useAuth();

  if (status === "loading") {
    return <Splash />;
  }

  if (status === "authenticated" && isAuthenticated && role) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
