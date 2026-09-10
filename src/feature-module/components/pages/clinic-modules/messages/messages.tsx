import AppointmentChat from "../../chat/AppointmentChat";
import { all_routes } from "../../../../routes/all_routes";

const Messages = () => (
  <AppointmentChat audience="admin" basePath={all_routes.messages} />
);

export default Messages;
