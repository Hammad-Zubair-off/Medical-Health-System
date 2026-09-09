import type { RouteObject } from "react-router";
import { lazyPage } from "./lazyPage";
import { all_routes } from "./all_routes";

const routes = all_routes;

const PatientAppointmentDetails = lazyPage(() => import("../components/pages/patient-modules/patient-appointment-details/patientAppointmentDetails"));
const PatientAppointments = lazyPage(() => import("../components/pages/patient-modules/patient-appointments/patientAppointments"));
const PatientDashboard = lazyPage(() => import("../components/pages/dashboard/patient-dashboard/patientDashboard"));
const PatientDoctors = lazyPage(() => import("../components/pages/patient-modules/patient-doctors/patientDoctors"));
const PatientInvoiceDetails = lazyPage(() => import("../components/pages/patient-modules/patient-invoice-details/patientInvoiceDetails"));
const PatientInvoices = lazyPage(() => import("../components/pages/patient-modules/patient-invoices/patientInvoices"));
const PatientNotificationsSettings = lazyPage(() => import("../components/pages/patient-modules/patient-notifications-settings/patientNotificationsSettings"));
const PatientPasswordSettings = lazyPage(() => import("../components/pages/patient-modules/patient-password-settings/patientPasswordSettings"));
const PatientPrescriptionDetails = lazyPage(() => import("../components/pages/patient-modules/patient-prescription-details/patientPrescriptionDetails"));
const PatientPrescriptions = lazyPage(() => import("../components/pages/patient-modules/patient-prescriptions/patientPrescriptions"));
const PatientProfileSettings = lazyPage(() => import("../components/pages/patient-modules/patient-profile-settings/patientProfileSettings"));

export const patientRoutes: RouteObject[] = [
  {
    path: routes.patientdashboard,
    element: <PatientDashboard />,
  },
  {
    path: routes.patientappointments,
    element: <PatientAppointments />,
  },
  {
    path: routes.patientappointmentdetails,
    element: <PatientAppointmentDetails />,
  },
  {
    path: routes.patientdoctors,
    element: <PatientDoctors />,
  },
  {
    path: routes.patientPrescriptions,
    element: <PatientPrescriptions />,
  },
  {
    path: routes.patientprescriptiondetails,
    element: <PatientPrescriptionDetails />,
  },
  {
    path: routes.patientinvoices,
    element: <PatientInvoices />,
  },
  {
    path: routes.patientinvoicedetails,
    element: <PatientInvoiceDetails />,
  },
  {
    path: routes.patientprofilesettings,
    element: <PatientProfileSettings />,
  },
  {
    path: routes.patientpasswordsettings,
    element: <PatientPasswordSettings />,
  },
  {
    path: routes.patientnotificationssettings,
    element: <PatientNotificationsSettings />,
  },
];
