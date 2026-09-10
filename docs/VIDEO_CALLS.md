# Video calls (WebRTC + Firestore signalling)

Doctor and patient hold a 1:1 browser video consultation on a `video` appointment.
Media is peer-to-peer WebRTC; Firestore only carries the signalling handshake.
**No third-party video SDK, no backend, no API key.**

## Signalling flow

```
Doctor's browser                Firestore                 Patient's browser
      |  createOffer()             |                             |
      |  write offer SDP ------->  |                             |
      |                            |  onSnapshot fires ------->  |
      |                            |                createAnswer()
      |                            |  <------- write answer SDP  |
      |  onSnapshot fires <------  |                             |
      |  ---- ICE candidates written/read both ways ----------   |
      |                                                          |
      |  <========== direct peer-to-peer video ================> |
```

Authorization reuses the chat appointment participant model
(`chatAppointmentAllowsCreate` in `firestore.rules`).

## No TURN (honest limitation)

STUN (Google public servers) is enough for most home networks. Roughly **10–15%** of
connections sit behind symmetric NAT / restrictive firewalls and need a **TURN** relay,
which costs money (bandwidth).

This app:

- Detects ICE `failed` and shows:
  *"Couldn't establish a direct connection. Try a different network, or switch to a phone call."*
- Leaves TURN slots empty in `src/core/config/webrtc.config.ts` — add entries there when ready.

Free-tier starting point: [Metered.ca](https://www.metered.ca/) (50 GB/month TURN, no card for free tier).

## Browser support

- Chrome / Edge / Firefox / Safari 14.1+
- **`getUserMedia` requires HTTPS or `localhost`**
- LAN testing on `http://192.168.x.x` will **not** get camera access — use a tunnel
  (`npx localtunnel --port 5173` or `npx ngrok http 5173`)

## How to start a call

1. Book or open an appointment with `appointmentType: "video"`.
2. Doctor or patient clicks **Join video call** on the appointment (or chat header).
3. The other party sees an **incoming call** modal anywhere in the app.
4. Accept → two-way video. Mute / camera / hang up are in the call room.
5. History: `/application/call-history`.

Walk-in patients (no login) see a **disabled** button with a tooltip — same idea as chat.

## Testing (two browsers)

Use **two profiles** (Chrome + Incognito, or Chrome + Firefox). Same-profile tabs share Auth
and often fight over the camera.

1. Doctor starts → patient modal rings  
2. Accept → both see/hear each other  
3. Mute / camera off indicators  
4. Hang up → **camera lights off on both machines**  
5. Decline / 45s miss → correct statuses in history  

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Black remote video, no error | Callee answered without media (fixed in peer service — media before `createAnswer`) |
| Ear-splitting echo | Local `<video>` not `muted` |
| Permission denied | Blocked in address bar, or non-HTTPS context |
| Connection failed message | No TURN / restrictive NAT — try another network |
| Camera light stays on | Teardown missed `track.stop()` — report as a bug |

## Related files

- `src/core/services/firestore/call.service.ts` — signalling
- `src/core/services/webrtc/peer.service.ts` — `RTCPeerConnection`
- `src/core/hooks/useCall.ts` / `useIncomingCall.ts`
- `VIDEO_CALL_PLAN.md` — full design
