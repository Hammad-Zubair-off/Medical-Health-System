import { Navigate } from "react-router";
import { useAuth } from "../../../core/context/AuthContext";
import type { UserRole } from "../../../core/types/auth.types";

export function roleHome(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "doctor":
      return "/doctor/doctor-dashboard";
    case "patient":
      return "/patient/patient-dashboard";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

/** Only honor deep-link `from` when the path is allowed for that role. */
export function pathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (!pathname || pathname === "/" || pathname === "/login") return false;
  if (pathname.startsWith("/error-")) return false;
  if (pathname.startsWith("/application")) return true;

  switch (role) {
    case "doctor":
      return pathname.startsWith("/doctor/");
    case "patient":
      return pathname.startsWith("/patient/");
    case "admin":
      return (
        !pathname.startsWith("/doctor/") && !pathname.startsWith("/patient/")
      );
    default:
      return false;
  }
}

export function resolvePostLoginPath(
  fromPathname: string | undefined,
  role: UserRole
): string {
  if (fromPathname && pathAllowedForRole(fromPathname, role)) {
    return fromPathname;
  }
  return roleHome(role);
}

const RoleLanding = () => {
  const { status, role, isAuthenticated } = useAuth();

  if (status === "loading") {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHome(role)} replace />;
};

export default RoleLanding;
