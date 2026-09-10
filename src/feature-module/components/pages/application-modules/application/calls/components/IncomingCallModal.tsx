import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../../../../../core/context/AuthContext";
import { useIncomingCall } from "../../../../../../../core/hooks/useIncomingCall";
import { videoCallPath } from "../../../../../../routes/all_routes";

/**
 * App-wide ringing UI. Renders nothing when there is no live incoming call,
 * or when the user is already on that call's room.
 */
const IncomingCallModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { incoming, accept, decline, error } = useIncomingCall(user?.uid);

  if (error && !incoming) {
    return (
      <div
        className="position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 2000, maxWidth: 360 }}
        data-testid="incoming-call-error"
      >
        <div className="alert alert-warning mb-0 shadow">
          Couldn’t listen for incoming calls: {error}
        </div>
      </div>
    );
  }

  if (!incoming) return null;

  const alreadyOnThisCall = location.pathname === videoCallPath(incoming._id);
  if (alreadyOnThisCall) return null;

  const title =
    incoming.callerUid === incoming.doctorUserId
      ? incoming.doctorName || "Doctor"
      : incoming.patientName || "Patient";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 2000, background: "rgba(10, 27, 57, 0.45)" }}
      data-testid="incoming-call-modal"
    >
      <div className="card shadow-lg border-0" style={{ minWidth: 320, maxWidth: 420 }}>
        <div className="card-body text-center p-4">
          <div className="avatar avatar-xl bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
            <i className="ti ti-video fs-24" />
          </div>
          <p className="text-primary fs-13 mb-1 text-uppercase fw-semibold">
            Incoming {incoming.callType} call
          </p>
          <h4 className="fw-bold mb-1">{title}</h4>
          <p className="text-muted fs-13 mb-4">Accept to join the consultation</p>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-danger flex-fill"
              onClick={() => void decline()}
              data-testid="incoming-decline"
            >
              Decline
            </button>
            <button
              type="button"
              className="btn btn-success flex-fill"
              onClick={() => {
                void (async () => {
                  const call = await accept();
                  if (call) navigate(videoCallPath(call._id));
                })();
              }}
              data-testid="incoming-accept"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
