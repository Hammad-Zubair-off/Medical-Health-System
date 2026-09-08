import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import AuthFeature from "../feathure-components/authFeature";
import Error403 from "../components/auth/error-modules/error403";
import Error404 from "../components/auth/error-modules/error404";
import { authOpenRoutes, authPublicOnlyRoutes } from "./auth.routes";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicOnlyRoute from "./guards/PublicOnlyRoute";
import RoleLanding from "./guards/RoleLanding";
import { PageSplash } from "./lazyPage";
import { adminRoutes } from "./admin.routes";
import { doctorRoutes } from "./doctor.routes";
import { patientRoutes } from "./patient.routes";
import { sharedRoutes } from "./shared.routes";

/** Heavy shell (header/sidebars) — only load after auth, not on /login. */
const Feature = lazy(() => import("../feathure-components/feature"));

function FeatureLayout() {
  return (
    <Suspense fallback={<PageSplash />}>
      <Feature />
    </Suspense>
  );
}

const ALLRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleLanding />} />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthFeature />}>
          {authPublicOnlyRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={route.element}
              key={`auth-public-${idx}`}
            />
          ))}
        </Route>
      </Route>

      <Route element={<AuthFeature />}>
        {authOpenRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={route.element}
            key={`auth-open-${idx}`}
          />
        ))}
      </Route>

      <Route element={<ProtectedRoute allow={["admin"]} />}>
        <Route element={<FeatureLayout />}>
          {adminRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`admin-${idx}`} />
          ))}
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["doctor"]} />}>
        <Route element={<FeatureLayout />}>
          {doctorRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={route.element}
              key={`doctor-${idx}`}
            />
          ))}
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["patient"]} />}>
        <Route element={<FeatureLayout />}>
          {patientRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={route.element}
              key={`patient-${idx}`}
            />
          ))}
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<FeatureLayout />}>
          {sharedRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={route.element}
              key={`shared-${idx}`}
            />
          ))}
        </Route>
      </Route>

      <Route path="/error-403" element={<Error403 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default ALLRoutes;
