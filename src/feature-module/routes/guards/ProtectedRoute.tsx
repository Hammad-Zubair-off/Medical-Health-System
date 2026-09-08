import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../../core/context/AuthContext";
import type { UserRole } from "../../../core/types/auth.types";

interface ProtectedRouteProps {
  /** Omit to allow any authenticated role. */
  allow?: UserRole[];
}

const Splash = () => (
  <div className="d-flex align-items-center justify-content-center vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading…</span>
    </div>
  </div>
);

/**
 * Email verification policy (Step 5.1): allow unverified users through.
 * Block only sensitive writes elsewhere; show a banner if needed later.
 */
const ProtectedRoute = ({ allow }: ProtectedRouteProps) => {
  const { status, role, isAuthenticated } = useAuth();
  const location = useLocation();

  // Never redirect while auth/profile is resolving — prevents flash 403/login.
  if (status === "loading") {
    return <Splash />;
  }

  if (status === "unauthenticated" || !isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  // Authenticated but role not ready yet (should be rare with loading status).
  if (!role) {
    return <Splash />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to="/error-403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
