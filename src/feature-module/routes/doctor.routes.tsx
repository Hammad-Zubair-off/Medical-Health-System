import type { RouteObject } from "react-router";
import ComingSoonShared from "../components/pages/shared/ComingSoon";
import DoctorAppointments from "../components/pages/doctor-modules/doctor-appointments/doctorAppointments";
import DoctorDahboard from "../components/pages/dashboard/doctor-dashboard/doctorDahboard";
import DoctorSchedules from "../components/pages/doctor-modules/doctors-schedules/doctorSchedules";
import DoctorsAppointmentDetails from "../components/pages/doctor-modules/doctors-appointment-details/doctorsAppointmentDetails";
import DoctorsNotificationSettings from "../components/pages/doctor-modules/doctors-notification-settings/doctorsNotificationSettings";
import DoctorsPasswordSettings from "../components/pages/doctor-modules/doctors-password-settings/doctorsPasswordSettings";
import DoctorsPrescriptionDetails from "../components/pages/doctor-modules/doctors-prescription-details/doctorsPrescriptionDetails";
import DoctorsProfileSettings from "../components/pages/doctor-modules/doctors-profile-settings/doctorsProfileSettings";
import DoctorsReviews from "../components/pages/doctor-modules/doctors-reviews/doctorsReviews";
import { all_routes } from "./all_routes";

const routes = all_routes;

export const doctorRoutes: RouteObject[] = [
  {
    path: routes.doctordashboard,
    element: <DoctorDahboard />,
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
    element: <ComingSoonShared title="Prescriptions" description="Prescriptions feature is currently under development and will be available soon." />,
  },
  {
    path: routes.doctorsprescriptiondetails,
    element: <DoctorsPrescriptionDetails />,
  },
  {
    path: routes.doctorleaves,
    element: <ComingSoonShared title="Leave Management" description="Leave management feature is currently under development and will be available soon." />,
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
