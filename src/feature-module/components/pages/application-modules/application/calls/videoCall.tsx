import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../../../../../../core/context/AuthContext";
import { useCall } from "../../../../../../core/hooks/useCall";
import {
  all_routes,
  doctorsAppointmentDetailsPath,
  patientAppointmentDetailsPath,
} from "../../../../../routes/all_routes";
import CallControls from "./components/CallControls";
import CallStatusOverlay from "./components/CallStatusOverlay";
import DevicePicker from "./components/DevicePicker";
import VideoStage from "./components/VideoStage";

const VideoCall = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [showDevices, setShowDevices] = useState(false);
  const {
    call,
    localStream,
    remoteStream,
    status,
    connectionState,
    isMuted,
    isCameraOff,
    durationSeconds,
    error,
    role: callRole,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    toggleCamera,
    switchDevice,
  } = useCall(callId, user?.uid);

  const peerName =
    callRole === "caller"
      ? call?.callerUid === call?.doctorUserId
        ? call?.patientName || "Patient"
        : call?.doctorName || "Doctor"
      : call?.calleeUid === call?.doctorUserId
        ? call?.callerUid === call?.patientUserId
          ? call?.patientName || "Patient"
          : call?.doctorName || "Doctor"
        : call?.callerUid === call?.doctorUserId
          ? call?.doctorName || "Doctor"
          : call?.patientName || "Patient";

  const backPath = call?.appointmentId
    ? role === "doctor"
      ? doctorsAppointmentDetailsPath(call.appointmentId)
      : role === "patient"
        ? patientAppointmentDetailsPath(call.appointmentId)
        : all_routes.callHistory
    : all_routes.callHistory;

  const leave = async () => {
    await hangUp();
    navigate(backPath);
  };

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold mb-1" data-testid="video-call-title">
              Video call
            </h4>
            <p className="text-muted mb-0 fs-13">
              {peerName}
              {call?.appointmentId ? (
                <>
                  {" · "}
                  <Link to={backPath} className="link-primary">
                    Appointment
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <Link to={all_routes.callHistory} className="btn btn-light btn-sm">
            Call history
          </Link>
        </div>

        <CallStatusOverlay
          status={status}
          connectionState={connectionState}
          error={error}
          durationSeconds={durationSeconds}
        />

        {callRole === "callee" && status === "ringing" && !localStream ? (
          <div className="card mb-3" data-testid="in-room-ringing">
            <div className="card-body d-flex gap-2 align-items-center">
              <span className="flex-grow-1">Incoming call from {peerName}</span>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void declineCall().then(() => navigate(backPath))}
              >
                Decline
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => void acceptCall()}
                data-testid="in-room-accept"
              >
                Accept
              </button>
            </div>
          </div>
        ) : null}

        <VideoStage
          localStream={localStream}
          remoteStream={remoteStream}
          isCameraOff={isCameraOff}
          remoteLabel={
            status === "ringing"
              ? "Waiting for the other person to join…"
              : "Connecting…"
          }
        />

        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onHangUp={() => void leave()}
          onOpenDevices={() => setShowDevices((v) => !v)}
          disabled={!localStream}
        />

        {showDevices ? (
          <DevicePicker
            onClose={() => setShowDevices(false)}
            onSelectAudio={(id) => void switchDevice("audioinput", id)}
            onSelectVideo={(id) => void switchDevice("videoinput", id)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default VideoCall;
