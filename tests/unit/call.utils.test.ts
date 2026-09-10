import { describe, expect, it } from "vitest";
import { canTransition } from "../../src/core/services/firestore/call.service";
import { createIceCandidateBuffer } from "../../src/core/services/webrtc/peer.service";
import { mapMediaError } from "../../src/core/utils/media.utils";
import type { CallStatus } from "../../src/core/types/call.types";

describe("canTransition", () => {
  const valid: Array<[CallStatus, CallStatus]> = [
    ["ringing", "accepted"],
    ["ringing", "declined"],
    ["ringing", "missed"],
    ["ringing", "failed"],
    ["ringing", "ended"],
    ["accepted", "connected"],
    ["accepted", "ended"],
    ["accepted", "failed"],
    ["connected", "ended"],
    ["connected", "failed"],
  ];

  for (const [from, to] of valid) {
    it(`allows ${from} → ${to}`, () => {
      expect(canTransition(from, to)).toBe(true);
    });
  }

  const invalid: Array<[CallStatus, CallStatus]> = [
    ["ringing", "connected"],
    ["ringing", "ringing"],
    ["ended", "ringing"],
    ["declined", "accepted"],
    ["missed", "ended"],
    ["failed", "connected"],
    ["connected", "accepted"],
    ["accepted", "ringing"],
  ];

  for (const [from, to] of invalid) {
    it(`rejects ${from} → ${to}`, () => {
      expect(canTransition(from, to)).toBe(false);
    });
  }
});

describe("mapMediaError", () => {
  it("maps NotAllowedError", () => {
    expect(mapMediaError({ name: "NotAllowedError" })).toMatch(/blocked/i);
  });
  it("maps NotFoundError", () => {
    expect(mapMediaError({ name: "NotFoundError" })).toMatch(/No camera/i);
  });
  it("maps NotReadableError", () => {
    expect(mapMediaError({ name: "NotReadableError" })).toMatch(/in use/i);
  });
});

describe("ICE candidate buffer", () => {
  it("buffers candidates until remote description is marked set", async () => {
    const added: RTCIceCandidateInit[] = [];
    const fakePc = {
      addIceCandidate: async (c: RTCIceCandidateInit) => {
        added.push(c);
      },
    } as unknown as RTCPeerConnection;

    const buffer = createIceCandidateBuffer(fakePc);
    await buffer.add({ candidate: "a" });
    await buffer.add({ candidate: "b" });
    expect(added).toHaveLength(0);
    buffer.markRemoteDescriptionSet();
    expect(added.map((c) => c.candidate)).toEqual(["a", "b"]);
    await buffer.add({ candidate: "c" });
    expect(added.map((c) => c.candidate)).toEqual(["a", "b", "c"]);
  });
});

describe("duration computation", () => {
  it("computes non-negative whole seconds", () => {
    const started = Date.now() - 65_400;
    const durationSeconds = Math.max(
      0,
      Math.round((Date.now() - started) / 1000)
    );
    expect(durationSeconds).toBeGreaterThanOrEqual(65);
    expect(durationSeconds).toBeLessThanOrEqual(66);
  });
});
