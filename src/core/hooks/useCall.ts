import { useCallback, useEffect, useRef, useState } from "react";
import {
  ICE_DISCONNECT_GRACE_MS,
  ICE_RESTART_MAX,
  RING_TIMEOUT_MS,
} from "../config/webrtc.config";
import {
  addIceCandidate,
  endCall,
  getCall,
  setAnswer,
  setOffer,
  subscribeCall,
  subscribeIceCandidates,
  updateCallStatus,
} from "../services/firestore/call.service";
import { updateAppointment } from "../services/firestore/appointments.service";
import {
  applyRemoteDescription,
  attachLocalStream,
  closePeerConnection,
  createAnswerSdp,
  createIceCandidateBuffer,
  createOfferSdp,
  createPeerConnection,
  onConnectionStateChange,
  onIceCandidate,
  onRemoteTrack,
} from "../services/webrtc/peer.service";
import type { CallDoc } from "../schemas/call.schema";
import type {
  CallParticipantRole,
  CallStatus,
} from "../types/call.types";
import { getUserMediaStream, stopMediaStream } from "../utils/media.utils";
import { serverTimestamp } from "firebase/firestore";

export type UseCallResult = {
  call: CallDoc | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: CallStatus | null;
  connectionState: RTCPeerConnectionState | null;
  isMuted: boolean;
  isCameraOff: boolean;
  durationSeconds: number;
  error: string | null;
  role: CallParticipantRole | null;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  hangUp: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  switchDevice: (kind: "audioinput" | "videoinput", deviceId: string) => Promise<void>;
};

/**
 * Orchestrates one WebRTC call end-to-end for the signed-in participant.
 */
export function useCall(
  callId: string | undefined,
  uid: string | undefined
): UseCallResult {
  const [call, setCall] = useState<CallDoc | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const iceBufferRef = useRef<ReturnType<typeof createIceCandidateBuffer> | null>(
    null
  );
  const iceRestartsRef = useRef(0);
  const startedRef = useRef(false);
  const answeredRef = useRef(false);
  const endingRef = useRef(false);
  const unsubsRef = useRef<Array<() => void>>([]);
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const role: CallParticipantRole | null =
    call && uid
      ? call.callerUid === uid
        ? "caller"
        : call.calleeUid === uid
          ? "callee"
          : null
      : null;

  const clearTimers = () => {
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  };

  const teardownMedia = useCallback(() => {
    clearTimers();
    for (const u of unsubsRef.current.splice(0, unsubsRef.current.length)) {
      try {
        u();
      } catch {
        // ignore
      }
    }
    iceBufferRef.current?.clear();
    iceBufferRef.current = null;
    closePeerConnection(pcRef.current, localRef.current);
    pcRef.current = null;
    localRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState(null);
  }, []);

  const hangUp = useCallback(async () => {
    if (!callId || !uid || endingRef.current) return;
    endingRef.current = true;
    try {
      await endCall(callId, uid, "hangup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end call");
    } finally {
      teardownMedia();
    }
  }, [callId, uid, teardownMedia]);

  const declineCall = useCallback(async () => {
    if (!callId || !uid || endingRef.current) return;
    endingRef.current = true;
    try {
      await endCall(callId, uid, "declined");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline call");
    } finally {
      teardownMedia();
    }
  }, [callId, uid, teardownMedia]);

  const wirePeer = useCallback(
    async (myRole: CallParticipantRole, stream: MediaStream) => {
      if (!callId || !uid) return;
      const pc = createPeerConnection();
      pcRef.current = pc;
      iceBufferRef.current = createIceCandidateBuffer(pc);
      attachLocalStream(pc, stream);
      onRemoteTrack(pc, (remote) => setRemoteStream(remote));
      onIceCandidate(pc, (candidate) => {
        void addIceCandidate(callId, myRole, candidate.toJSON());
      });
      onConnectionStateChange(pc, (state) => {
        setConnectionState(state);
        if (state === "connected") {
          if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
          }
          void updateCallStatus(
            callId,
            "connected",
            { startedAt: serverTimestamp() },
            uid
          ).catch(() => undefined);
          // Populate existing appointment video fields when the call connects.
          void getCall(callId).then((c) => {
            if (!c?.appointmentId) return;
            void updateAppointment(c.appointmentId, {
              isVideoCall: true,
              video_link: `/application/video-call/${callId}`,
            }).catch(() => undefined);
          });
        } else if (state === "disconnected") {
          if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
          disconnectTimerRef.current = setTimeout(() => {
            void endCall(callId, uid, "ice-failed").catch(() => undefined);
            setError(
              "Couldn't establish a direct connection. This can happen on restrictive networks. Try a different network, or switch to a phone call."
            );
            teardownMedia();
          }, ICE_DISCONNECT_GRACE_MS);
        } else if (state === "failed") {
          if (iceRestartsRef.current < ICE_RESTART_MAX) {
            iceRestartsRef.current += 1;
            void pc.restartIce();
            return;
          }
          void endCall(callId, uid, "ice-failed").catch(() => undefined);
          setError(
            "Couldn't establish a direct connection. This can happen on restrictive networks. Try a different network, or switch to a phone call."
          );
          teardownMedia();
        }
      });

      // Subscribe to the *remote* party's candidates
      const remoteRole: CallParticipantRole =
        myRole === "caller" ? "callee" : "caller";
      const unsubIce = subscribeIceCandidates(callId, remoteRole, (doc) => {
        void iceBufferRef.current?.add({
          candidate: doc.candidate,
          sdpMid: doc.sdpMid,
          sdpMLineIndex: doc.sdpMLineIndex,
          usernameFragment: doc.usernameFragment ?? undefined,
        });
      });
      unsubsRef.current.push(unsubIce);
    },
    [callId, uid, teardownMedia]
  );

  const startAsCaller = useCallback(async () => {
    if (!callId || !uid || startedRef.current) return;
    startedRef.current = true;
    try {
      const stream = await getUserMediaStream();
      localRef.current = stream;
      setLocalStream(stream);
      await wirePeer("caller", stream);
      const pc = pcRef.current!;
      const offer = await createOfferSdp(pc);
      // Keep ICE buffer closed until the answer is applied (see answer effect).
      await setOffer(callId, offer, uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
      await endCall(callId, uid, "error").catch(() => undefined);
      teardownMedia();
    }
  }, [callId, uid, wirePeer, teardownMedia]);

  const acceptCall = useCallback(async () => {
    if (!callId || !uid || !call || answeredRef.current) return;
    if (!call.offer) {
      setError("Waiting for caller… try again in a moment.");
      return;
    }
    answeredRef.current = true;
    try {
      if (call.status === "ringing") {
        await updateCallStatus(callId, "accepted", {}, uid);
      }
      const stream = await getUserMediaStream();
      localRef.current = stream;
      setLocalStream(stream);
      await wirePeer("callee", stream);
      const pc = pcRef.current!;
      // Callee: media attached BEFORE createAnswer
      const answer = await createAnswerSdp(pc, call.offer);
      iceBufferRef.current?.markRemoteDescriptionSet();
      await setAnswer(callId, answer, uid);
    } catch (err) {
      answeredRef.current = false;
      setError(err instanceof Error ? err.message : "Failed to accept call");
      await endCall(callId, uid, "error").catch(() => undefined);
      teardownMedia();
    }
  }, [callId, uid, call, wirePeer, teardownMedia]);

  // Subscribe to call doc
  useEffect(() => {
    if (!callId || !uid) return;
    endingRef.current = false;
    startedRef.current = false;
    answeredRef.current = false;
    iceRestartsRef.current = 0;

    const unsub = subscribeCall(
      callId,
      (next) => {
        setCall(next);
        if (!next) return;
        if (
          next.status === "ended" ||
          next.status === "declined" ||
          next.status === "missed" ||
          next.status === "failed"
        ) {
          teardownMedia();
          if (next.status === "declined") {
            setError("Call declined");
          } else if (next.status === "missed") {
            setError("Call was not answered");
          } else if (next.status === "failed" && next.endReason === "ice-failed") {
            setError(
              "Couldn't establish a direct connection. This can happen on restrictive networks. Try a different network, or switch to a phone call."
            );
          }
        }
      },
      (err) => setError(err.message)
    );

    return () => {
      unsub();
      teardownMedia();
    };
  }, [callId, uid, teardownMedia]);

  // Caller starts offer once call is ringing
  useEffect(() => {
    if (!call || !uid || call.callerUid !== uid) return;
    if (call.status !== "ringing") return;
    if (call.offer) return;
    void startAsCaller();
  }, [call, uid, startAsCaller]);

  // Callee auto-joins once the caller offer exists (modal Accept or Join button).
  useEffect(() => {
    if (!call || !uid || call.calleeUid !== uid) return;
    if (call.status !== "accepted" && call.status !== "ringing") return;
    if (!call.offer || answeredRef.current || localRef.current) return;
    void acceptCall();
  }, [call, uid, acceptCall]);

  // Caller applies answer when it arrives
  useEffect(() => {
    if (!call || !uid || call.callerUid !== uid) return;
    if (!call.answer || !pcRef.current) return;
    if (pcRef.current.remoteDescription) return;
    void (async () => {
      try {
        if (call.status === "ringing") {
          await updateCallStatus(callId!, "accepted", {}, uid).catch(
            () => undefined
          );
        }
        await applyRemoteDescription(pcRef.current!, call.answer!);
        iceBufferRef.current?.markRemoteDescriptionSet();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply answer");
      }
    })();
  }, [call, uid, callId]);

  // Ring timeout (caller side marks missed)
  useEffect(() => {
    if (!call || !uid || call.callerUid !== uid) return;
    if (call.status !== "ringing") return;
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    ringTimerRef.current = setTimeout(() => {
      void endCall(callId!, uid, "timeout").catch(() => undefined);
    }, RING_TIMEOUT_MS);
    return () => {
      if (ringTimerRef.current) {
        clearTimeout(ringTimerRef.current);
        ringTimerRef.current = null;
      }
    };
  }, [call, uid, callId]);

  // Duration clock when connected
  useEffect(() => {
    if (call?.status !== "connected") return;
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setDurationSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [call?.status]);

  // Tab close / unmount → end call
  useEffect(() => {
    if (!callId || !uid) return;
    const onUnload = () => {
      void endCall(callId, uid, "hangup");
      stopMediaStream(localRef.current);
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [callId, uid]);

  const toggleMute = () => {
    const stream = localRef.current;
    if (!stream) return;
    const next = !isMuted;
    for (const t of stream.getAudioTracks()) t.enabled = !next;
    setIsMuted(next);
  };

  const toggleCamera = () => {
    const stream = localRef.current;
    if (!stream) return;
    const next = !isCameraOff;
    for (const t of stream.getVideoTracks()) t.enabled = !next;
    setIsCameraOff(next);
  };

  const switchDevice = async (
    kind: "audioinput" | "videoinput",
    deviceId: string
  ) => {
    const stream = localRef.current;
    const pc = pcRef.current;
    if (!stream || !pc) return;
    const constraints: MediaStreamConstraints =
      kind === "audioinput"
        ? { audio: { deviceId: { exact: deviceId } }, video: false }
        : { audio: false, video: { deviceId: { exact: deviceId } } };
    const fresh = await getUserMediaStream(constraints);
    const newTrack =
      kind === "audioinput"
        ? fresh.getAudioTracks()[0]
        : fresh.getVideoTracks()[0];
    if (!newTrack) return;
    const oldTrack =
      kind === "audioinput"
        ? stream.getAudioTracks()[0]
        : stream.getVideoTracks()[0];
    if (oldTrack) {
      stream.removeTrack(oldTrack);
      oldTrack.stop();
    }
    stream.addTrack(newTrack);
    const sender = pc
      .getSenders()
      .find((s) => s.track?.kind === newTrack.kind);
    if (sender) await sender.replaceTrack(newTrack);
    setLocalStream(stream);
  };

  return {
    call,
    localStream,
    remoteStream,
    status: call?.status ?? null,
    connectionState,
    isMuted,
    isCameraOff,
    durationSeconds,
    error,
    role,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    toggleCamera,
    switchDevice,
  };
}
