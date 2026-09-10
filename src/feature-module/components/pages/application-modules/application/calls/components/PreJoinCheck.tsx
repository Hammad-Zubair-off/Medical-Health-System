import { useEffect, useRef, useState } from "react";
import {
  getUserMediaStream,
  stopMediaStream,
} from "../../../../../../../core/utils/media.utils";
import { useMediaDevices } from "../../../../../../../core/hooks/useMediaDevices";

type PreJoinCheckProps = {
  onReady: () => void;
  onCancel: () => void;
};

const PreJoinCheck = ({ onReady, onCancel }: PreJoinCheckProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { videoInputs, audioInputs } = useMediaDevices();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const s = await getUserMediaStream();
        if (!active) {
          stopMediaStream(s);
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play().catch(() => undefined);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Media preview failed");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      stopMediaStream(stream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => stopMediaStream(stream);
  }, [stream]);

  return (
    <div className="card" data-testid="prejoin-check">
      <div className="card-body">
        <h5 className="fw-bold mb-3">Ready to join?</h5>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div
            className="bg-dark rounded overflow-hidden mb-3"
            style={{ maxWidth: 420 }}
          >
            {loading ? (
              <div className="text-white-50 p-5 text-center">Starting camera…</div>
            ) : (
              <video
                ref={videoRef}
                className="w-100"
                style={{ maxHeight: 280, objectFit: "cover" }}
                autoPlay
                playsInline
                muted
              />
            )}
          </div>
        )}
        <p className="text-muted fs-13">
          {audioInputs.length} mic(s), {videoInputs.length} camera(s) detected.
        </p>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!error || loading}
            onClick={() => {
              stopMediaStream(stream);
              setStream(null);
              onReady();
            }}
            data-testid="prejoin-continue"
          >
            Join call
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreJoinCheck;
