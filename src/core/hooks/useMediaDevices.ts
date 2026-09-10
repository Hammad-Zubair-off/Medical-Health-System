import { useCallback, useEffect, useState } from "react";
import {
  enumerateMediaDevices,
  hasMediaSupport,
} from "../utils/media.utils";

export type UseMediaDevicesResult = {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  supported: boolean;
  refresh: () => Promise<void>;
};

export function useMediaDevices(): UseMediaDevicesResult {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const supported = hasMediaSupport();

  const refresh = useCallback(async () => {
    if (!supported) {
      setAudioInputs([]);
      setVideoInputs([]);
      return;
    }
    const devices = await enumerateMediaDevices();
    setAudioInputs(devices.filter((d) => d.kind === "audioinput"));
    setVideoInputs(devices.filter((d) => d.kind === "videoinput"));
  }, [supported]);

  useEffect(() => {
    void refresh();
    if (!supported || !navigator.mediaDevices?.addEventListener) return;
    const onChange = () => void refresh();
    navigator.mediaDevices.addEventListener("devicechange", onChange);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", onChange);
    };
  }, [refresh, supported]);

  return { audioInputs, videoInputs, supported, refresh };
}
