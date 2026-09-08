import type { RouteObject } from "react-router";
import PatientAppointmentDetails from "../components/pages/patient-modules/patient-appointment-details/patientAppointmentDetails";
import PatientAppointments from "../components/pages/patient-modules/patient-appointments/patientAppointments";
import PatientDashboard from "../components/pages/dashboard/patient-dashboard/patientDashboard";
import PatientDoctors from "../components/pages/patient-modules/patient-doctors/patientDoctors";
import PatientInvoiceDetails from "../components/pages/patient-modules/patient-invoice-details/patientInvoiceDetails";
import PatientInvoices from "../components/pages/patient-modules/patient-invoices/patientInvoices";
import PatientNotificationsSettings from "../components/pages/patient-modules/patient-notifications-settings/patientNotificationsSettings";
import PatientPasswordSettings from "../components/pages/patient-modules/patient-password-settings/patientPasswordSettings";
import PatientPrescriptionDetails from "../components/pages/patient-modules/patient-prescription-details/patientPrescriptionDetails";
import PatientPrescriptions from "../components/pages/patient-modules/patient-prescriptions/patientPrescriptions";
import PatientProfileSettings from "../components/pages/patient-modules/patient-profile-settings/patientProfileSettings";
import { all_routes } from "./all_routes";

const routes = all_routes;

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
