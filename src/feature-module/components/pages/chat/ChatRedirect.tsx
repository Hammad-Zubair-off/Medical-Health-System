import { Navigate } from "react-router";
import { useAuth } from "../../../../core/context/AuthContext";
import { all_routes } from "../../../routes/all_routes";

/** Legacy `/application/chat` → role Messages inbox. */
const ChatRedirect = () => {
  const { role } = useAuth();
  if (role === "doctor") {
    return <Navigate to={all_routes.doctorMessages} replace />;
  }
  if (role === "patient") {
    return <Navigate to={all_routes.patientMessages} replace />;
  }
  return <Navigate to={all_routes.messages} replace />;
};

export default ChatRedirect;
