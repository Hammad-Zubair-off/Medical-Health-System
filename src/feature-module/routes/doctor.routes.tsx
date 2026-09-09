import type { RouteObject } from "react-router";
import { lazyPage } from "./lazyPage";
import { all_routes } from "./all_routes";

const routes = all_routes;

const ComingSoonShared = lazyPage(() => import("../components/pages/shared/ComingSoon"));
const DoctorAppointments = lazyPage(() => import("../components/pages/doctor-modules/doctor-appointments/doctorAppointments"));
const DoctorDahboard = lazyPage(() => import("../components/pages/dashboard/doctor-dashboard/doctorDahboard"));
const DoctorSchedules = lazyPage(() => import("../components/pages/doctor-modules/doctors-schedules/doctorSchedules"));
const DoctorsAppointmentDetails = lazyPage(() => import("../components/pages/doctor-modules/doctors-appointment-details/doctorsAppointmentDetails"));
const DoctorsNotificationSettings = lazyPage(() => import("../components/pages/doctor-modules/doctors-notification-settings/doctorsNotificationSettings"));
const DoctorsPasswordSettings = lazyPage(() => import("../components/pages/doctor-modules/doctors-password-settings/doctorsPasswordSettings"));
const DoctorsPrescriptionDetails = lazyPage(() => import("../components/pages/doctor-modules/doctors-prescription-details/doctorsPrescriptionDetails"));
const DoctorsPrescriptions = lazyPage(() => import("../components/pages/doctor-modules/doctors-prescriptions/doctorsPrescriptions"));
const AddPrescription = lazyPage(() => import("../components/pages/doctor-modules/add-prescription/addPrescription"));
const EditPrescription = lazyPage(() => import("../components/pages/doctor-modules/edit-prescription/editPrescription"));
const DoctorsProfileSettings = lazyPage(() => import("../components/pages/doctor-modules/doctors-profile-settings/doctorsProfileSettings"));
const DoctorsReviews = lazyPage(() => import("../components/pages/doctor-modules/doctors-reviews/doctorsReviews"));
const DoctorsLeaves = lazyPage(() => import("../components/pages/doctor-modules/doctors-leaves/doctorsLeaves"));
const PatientDetails = lazyPage(() => import("../components/pages/clinic-modules/patient-details/patientDetails"));

export const doctorRoutes: RouteObject[] = [
  {
    path: routes.doctordashboard,
    element: <DoctorDahboard />,
  },
  {
    path: routes.patientDetails,
    element: <PatientDetails />,
  },
  {
    path: routes.doctorsappointments,
    element: <DoctorAppointments />,
  },
  {
    path: routes.doctorsappointmentdetails,
    element: <DoctorsAppointmentDetails />,
  },
  {
    path: routes.onlineconsultations,
    element: <ComingSoonShared title="Online Consultations" description="Online consultations feature is currently under development and will be available soon." />,
  },
  {
    path: routes.doctorschedule,
    element: <DoctorSchedules />,
  },
  {
    path: routes.doctorsprescriptions,
    element: <DoctorsPrescriptions />,
  },
  {
    path: routes.addPrescription,
    element: <AddPrescription />,
  },
  {
    path: routes.editPrescription,
    element: <EditPrescription />,
  },
  {
    path: routes.doctorsprescriptiondetails,
    element: <DoctorsPrescriptionDetails />,
  },
  {
    path: routes.doctorleaves,
    element: <DoctorsLeaves />,
  },
  {
    path: routes.doctorreviews,
    element: <DoctorsReviews />,
  },
  {
    path: routes.doctorsprofilesettings,
    element: <DoctorsProfileSettings />,
  },
  {
    path: routes.doctorspasswordsettings,
    element: <DoctorsPasswordSettings />,
  },
  {
    path: routes.doctorsnotificationsettings,
    element: <DoctorsNotificationSettings />,
  },
];
