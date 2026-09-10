import { useCallback, useEffect, useState } from "react";
import { RING_TIMEOUT_MS } from "../config/webrtc.config";
import {
  endCall,
  subscribeIncomingCalls,
  updateCallStatus,
} from "../services/firestore/call.service";
import type { CallDoc } from "../schemas/call.schema";
import { toDate } from "../utils/firestore.utils";

export type UseIncomingCallResult = {
  incoming: CallDoc | null;
  accept: () => Promise<CallDoc | null>;
  decline: () => Promise<void>;
  error: string | null;
};

function isStaleRing(call: CallDoc): boolean {
  const created = toDate(call.created as never);
  if (!created) return false;
  return Date.now() - created.getTime() > RING_TIMEOUT_MS;
}

/** App-wide listener for ringing calls addressed to the signed-in user. */
export function useIncomingCall(uid: string | undefined): UseIncomingCallResult {
  const [incoming, setIncoming] = useState<CallDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setIncoming(null);
      setError(null);
      return;
    }
    return subscribeIncomingCalls(
      uid,
      (call) => {
        if (!call || isStaleRing(call)) {
          setIncoming(null);
          return;
        }
        setIncoming(call);
        setError(null);
      },
      (err) => {
        console.error("[useIncomingCall]", err);
        setError(err.message);
      }
    );
  }, [uid]);

  const accept = useCallback(async () => {
    if (!incoming || !uid) return null;
    try {
      if (incoming.status === "ringing") {
        await updateCallStatus(incoming._id, "accepted", {}, uid);
      }
    } catch {
      // Already accepted / raced — still open the room.
    }
    const accepted = incoming;
    setIncoming(null);
    return accepted;
  }, [incoming, uid]);

  const decline = useCallback(async () => {
    if (!incoming || !uid) return;
    await endCall(incoming._id, uid, "declined");
    setIncoming(null);
  }, [incoming, uid]);

  return { incoming, accept, decline, error };
}
