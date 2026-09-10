import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../../../../core/context/AuthContext";
import { startOrJoinCall } from "../../../../../../../core/services/firestore/call.service";
import { videoCallPath } from "../../../../../../routes/all_routes";

type StartVideoCallButtonProps = {
  appointmentId: string;
  /** Show only for video appointments. */
  isVideoAppointment: boolean;
  /** False for walk-in patients with no linked login. */
  hasPatientLogin: boolean;
  className?: string;
};

const StartVideoCallButton = ({
  appointmentId,
  isVideoAppointment,
  hasPatientLogin,
  className = "btn btn-outline-success",
}: StartVideoCallButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isVideoAppointment) return null;

  const disabled = !user?.uid || !hasPatientLogin || opening;
  const title = !hasPatientLogin
    ? "This patient has no account — video call unavailable."
    : "Join video call";

  return (
    <>
      <button
        type="button"
        className={className}
        data-testid="appointment-video-call-cta"
        disabled={disabled}
        title={title}
        onClick={() => {
          if (!user?.uid || !appointmentId) return;
          setOpening(true);
          setError(null);
          void (async () => {
            try {
              const call = await startOrJoinCall(appointmentId, user.uid, "video");
              navigate(videoCallPath(call._id));
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Failed to start video call"
              );
            } finally {
              setOpening(false);
            }
          })();
        }}
      >
        <i className="ti ti-video me-1" />
        {opening ? "Starting…" : "Join video call"}
      </button>
      {error ? (
        <div className="alert alert-danger mt-2 mb-0 py-2" role="alert">
          {error}
        </div>
      ) : null}
    </>
  );
};

export default StartVideoCallButton;
