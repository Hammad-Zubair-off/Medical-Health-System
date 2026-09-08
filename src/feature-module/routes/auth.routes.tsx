import type { RouteObject } from "react-router";
import ComingSoon from "../components/pages/pages-modules/coming-soon/comingSoon";
import EmailVerificationBasic from "../components/auth/email-verification/emailVerificationBasic";
import Error404 from "../components/auth/error-modules/error404";
import Error500 from "../components/auth/error-modules/error500";
import ForgotPasswordBasic from "../components/auth/forgot-password/forgotPasswordBasic";
import LockScreen from "../components/auth/lock-screen/lockScreen";
import Login from "../components/auth/login/login";
import LoginBasic from "../components/auth/login/loginBasic";
import RegisterBasic from "../components/auth/register/registerBasic";
import ResetPasswordBasic from "../components/auth/reset-password/resetPasswordBasic";
import TwoStepVerificationBasic from "../components/auth/two-step-verification/twoStepVerificationBasic";
import UnderMaintenance from "../components/pages/pages-modules/under-maintenance/underMaintenance";
import { all_routes } from "./all_routes";

const routes = all_routes;

/** Bounces authenticated users to their role home. */
export const authPublicOnlyRoutes: RouteObject[] = [
  { path: routes.login, element: <Login /> },
  { path: routes.loginbasic, element: <LoginBasic /> },
  { path: routes.registerbasic, element: <RegisterBasic /> },
  { path: routes.forgotpasswordbasic, element: <ForgotPasswordBasic /> },
];

/** Accessible whether or not the user is signed in. */
export const authOpenRoutes: RouteObject[] = [
  { path: routes.resetpasswordbasic, element: <ResetPasswordBasic /> },
  { path: routes.emailverificationbasic, element: <EmailVerificationBasic /> },
  { path: routes.twostepverificationbasic, element: <TwoStepVerificationBasic /> },
  { path: routes.lockscreen, element: <LockScreen /> },
  { path: routes.error404, element: <Error404 /> },
  { path: routes.error500, element: <Error500 /> },
  { path: routes.comingSoon, element: <ComingSoon /> },
  { path: routes.underMaintenance, element: <UnderMaintenance /> },
];

/** @deprecated Prefer authPublicOnlyRoutes + authOpenRoutes */
export const authRoutes: RouteObject[] = [
  ...authPublicOnlyRoutes,
  ...authOpenRoutes,
];
