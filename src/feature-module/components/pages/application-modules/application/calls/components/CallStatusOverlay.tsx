import type { CallStatus } from "../../../../../../../core/types/call.types";

type CallStatusOverlayProps = {
  status: CallStatus | null;
  connectionState: RTCPeerConnectionState | null;
  error: string | null;
  durationSeconds?: number;
};

function formatDuration(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const CallStatusOverlay = ({
  status,
  connectionState,
  error,
  durationSeconds = 0,
}: CallStatusOverlayProps) => {
  let message: string | null = null;
  if (error) message = error;
  else if (connectionState === "disconnected") message = "Reconnecting…";
  else if (status === "ringing") message = "Ringing…";
  else if (status === "accepted" || connectionState === "connecting")
    message = "Connecting…";
  else if (status === "connected") message = formatDuration(durationSeconds);
  else if (status === "declined") message = "Call declined";
  else if (status === "missed") message = "Call missed";
  else if (status === "ended") message = "Call ended";
  else if (status === "failed") message = "Call failed";

  if (!message) return null;

  return (
    <div
      className={`alert ${error || status === "failed" ? "alert-danger" : "alert-light"} mb-3`}
      role="status"
      data-testid="call-status-overlay"
    >
      {message}
    </div>
  );
};

export default CallStatusOverlay;
