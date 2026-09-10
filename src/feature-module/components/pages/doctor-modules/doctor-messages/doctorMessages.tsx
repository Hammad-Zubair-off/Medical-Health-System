import AppointmentChat from "../../chat/AppointmentChat";
import { all_routes } from "../../../../routes/all_routes";

const DoctorMessages = () => (
  <AppointmentChat audience="doctor" basePath={all_routes.doctorMessages} />
);

export default DoctorMessages;
