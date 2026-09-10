/** WebRTC ICE / peer connection config — STUN now; TURN slots left empty. */

export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
  // TURN goes here when needed — see VIDEO_CALL_PLAN.md §0.2.
  // { urls: "turn:...", username: "...", credential: "..." },
];

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,
};

/** Unanswered ringing call → "missed". */
export const RING_TIMEOUT_MS = 45_000;

/** Max ICE restart attempts before status "failed". */
export const ICE_RESTART_MAX = 2;

/** Brief disconnect grace before treating ICE as failed. */
export const ICE_DISCONNECT_GRACE_MS = 10_000;
