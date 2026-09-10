import { RTC_CONFIG } from "../../config/webrtc.config";
import { stopMediaStream } from "../../utils/media.utils";
import type { SessionDescriptionPayload } from "../../types/call.types";

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection(RTC_CONFIG);
}

export function attachLocalStream(
  pc: RTCPeerConnection,
  stream: MediaStream
): void {
  for (const track of stream.getTracks()) {
    pc.addTrack(track, stream);
  }
}

export function onRemoteTrack(
  pc: RTCPeerConnection,
  cb: (stream: MediaStream) => void
): void {
  pc.ontrack = (event) => {
    if (event.streams[0]) {
      cb(event.streams[0]);
      return;
    }
    const stream = new MediaStream();
    stream.addTrack(event.track);
    cb(stream);
  };
}

export async function createOfferSdp(
  pc: RTCPeerConnection
): Promise<SessionDescriptionPayload> {
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);
  return { type: offer.type!, sdp: offer.sdp! };
}

export async function createAnswerSdp(
  pc: RTCPeerConnection,
  offer: SessionDescriptionPayload
): Promise<SessionDescriptionPayload> {
  await pc.setRemoteDescription(
    new RTCSessionDescription({
      type: offer.type as RTCSdpType,
      sdp: offer.sdp,
    })
  );
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return { type: answer.type!, sdp: answer.sdp! };
}

export async function applyRemoteDescription(
  pc: RTCPeerConnection,
  desc: SessionDescriptionPayload
): Promise<void> {
  await pc.setRemoteDescription(
    new RTCSessionDescription({
      type: desc.type as RTCSdpType,
      sdp: desc.sdp,
    })
  );
}

export function onIceCandidate(
  pc: RTCPeerConnection,
  cb: (candidate: RTCIceCandidate) => void
): void {
  pc.onicecandidate = (event) => {
    if (event.candidate) cb(event.candidate);
  };
}

export function onConnectionStateChange(
  pc: RTCPeerConnection,
  cb: (state: RTCPeerConnectionState) => void
): void {
  pc.onconnectionstatechange = () => {
    cb(pc.connectionState);
  };
}

/**
 * Buffer remote ICE until setRemoteDescription has resolved, then flush.
 * Candidates can arrive before the remote SDP is applied.
 */
export function createIceCandidateBuffer(pc: RTCPeerConnection) {
  let ready = false;
  const pending: RTCIceCandidateInit[] = [];

  return {
    markRemoteDescriptionSet() {
      ready = true;
      for (const c of pending.splice(0, pending.length)) {
        void pc.addIceCandidate(c).catch(() => undefined);
      }
    },
    async add(candidate: RTCIceCandidateInit) {
      if (!ready) {
        pending.push(candidate);
        return;
      }
      await pc.addIceCandidate(candidate);
    },
    clear() {
      pending.length = 0;
      ready = false;
    },
  };
}

export function closePeerConnection(
  pc: RTCPeerConnection | null | undefined,
  localStream?: MediaStream | null
): void {
  stopMediaStream(localStream);
  if (!pc) return;
  try {
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.onconnectionstatechange = null;
    pc.close();
  } catch {
    // ignore
  }
}
