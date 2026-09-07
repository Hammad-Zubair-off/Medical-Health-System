import { Route, Routes } from "react-router";
import AuthFeature from "../feathure-components/authFeature";
import Feature from "../feathure-components/feature";
import Error403 from "../components/auth/error-modules/error403";
import Error404 from "../components/auth/error-modules/error404";
import { adminRoutes } from "./admin.routes";
import { authOpenRoutes, authPublicOnlyRoutes } from "./auth.routes";
import { doctorRoutes } from "./doctor.routes";
import { patientRoutes } from "./patient.routes";
import { sharedRoutes } from "./shared.routes";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicOnlyRoute from "./guards/PublicOnlyRoute";
import RoleLanding from "./guards/RoleLanding";

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
        <Route element={<Feature />}>
          {adminRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={`admin-${idx}`} />
          ))}
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["doctor"]} />}>
        <Route element={<Feature />}>
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
        <Route element={<Feature />}>
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
        <Route element={<Feature />}>
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
