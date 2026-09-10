/**
 * getUserMedia helpers + human-readable permission / device errors.
 */

export function hasMediaSupport(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export function isSecureMediaContext(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  );
}

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  audio: true,
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

export function mapMediaError(err: unknown): string {
  const name =
    typeof err === "object" && err !== null && "name" in err
      ? String((err as { name: unknown }).name)
      : "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera and microphone access was blocked. Allow access in your browser's address bar.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera or microphone found.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your camera is in use by another app.";
    case "OverconstrainedError":
      return "Camera constraints could not be satisfied.";
    case "SecurityError":
      return "Video calls require a secure (HTTPS) connection.";
    default:
      if (!isSecureMediaContext()) {
        return "Video calls require a secure (HTTPS) connection.";
      }
      return err instanceof Error
        ? err.message
        : "Could not access camera or microphone.";
  }
}

export async function getUserMediaStream(
  constraints: MediaStreamConstraints = DEFAULT_CONSTRAINTS
): Promise<MediaStream> {
  if (!hasMediaSupport()) {
    throw new Error("This browser does not support camera/microphone access.");
  }
  if (!isSecureMediaContext()) {
    throw new Error("Video calls require a secure (HTTPS) connection.");
  }
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    const name =
      typeof err === "object" && err !== null && "name" in err
        ? String((err as { name: unknown }).name)
        : "";
    if (name === "OverconstrainedError") {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      } catch (retryErr) {
        throw new Error(mapMediaError(retryErr));
      }
    }
    throw new Error(mapMediaError(err));
  }
}

export async function enumerateMediaDevices(): Promise<MediaDeviceInfo[]> {
  if (!hasMediaSupport()) return [];
  try {
    return await navigator.mediaDevices.enumerateDevices();
  } catch {
    return [];
  }
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // ignore
    }
  }
}
