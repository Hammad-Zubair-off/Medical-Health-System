import AppointmentChat from "../../chat/AppointmentChat";
import { all_routes } from "../../../../routes/all_routes";

const PatientMessages = () => (
  <AppointmentChat audience="patient" basePath={all_routes.patientMessages} />
);

export default PatientMessages;
