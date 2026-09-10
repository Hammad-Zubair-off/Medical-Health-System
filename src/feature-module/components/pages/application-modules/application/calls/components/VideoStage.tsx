import { useEffect, useRef, useState } from "react";

type VideoStageProps = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCameraOff: boolean;
  remoteLabel?: string;
};

/**
 * Remote video full-bleed, local preview PiP.
 * Local video is always muted to prevent feedback.
 */
const VideoStage = ({
  localStream,
  remoteStream,
  isCameraOff,
  remoteLabel = "Remote",
}: VideoStageProps) => {
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const localRef = useRef<HTMLVideoElement | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = remoteRef.current;
    if (!el) return;
    el.srcObject = remoteStream;
    if (!remoteStream) return;
    const play = el.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => setNeedsTap(true));
    }
  }, [remoteStream]);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.srcObject = localStream;
    if (localStream) void el.play().catch(() => undefined);
  }, [localStream]);

  return (
    <div
      className="position-relative bg-dark rounded overflow-hidden"
      style={{ minHeight: 420 }}
      data-testid="video-stage"
    >
      {remoteStream ? (
        <video
          ref={remoteRef}
          className="w-100 h-100"
          style={{ objectFit: "cover", minHeight: 420 }}
          autoPlay
          playsInline
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center text-white-50"
          style={{ minHeight: 420 }}
        >
          {remoteLabel}
        </div>
      )}

      {needsTap ? (
        <button
          type="button"
          className="btn btn-light position-absolute top-50 start-50 translate-middle"
          onClick={() => {
            void remoteRef.current?.play();
            setNeedsTap(false);
          }}
        >
          Tap to play
        </button>
      ) : null}

      <div
        className="position-absolute bottom-0 end-0 m-3 border border-white rounded overflow-hidden bg-secondary"
        style={{ width: 140, height: 100 }}
      >
        {localStream && !isCameraOff ? (
          <video
            ref={localRef}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fs-13">
            Camera off
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStage;
