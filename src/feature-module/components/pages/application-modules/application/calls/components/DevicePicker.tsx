import { useMediaDevices } from "../../../../../../../core/hooks/useMediaDevices";

type DevicePickerProps = {
  onSelectAudio: (deviceId: string) => void;
  onSelectVideo: (deviceId: string) => void;
  onClose: () => void;
};

const DevicePicker = ({
  onSelectAudio,
  onSelectVideo,
  onClose,
}: DevicePickerProps) => {
  const { audioInputs, videoInputs, supported } = useMediaDevices();

  return (
    <div className="card shadow-sm mt-3" data-testid="device-picker">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Devices</h6>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        {!supported ? (
          <p className="text-muted mb-0">Media devices are not available.</p>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fs-13">Microphone</label>
              <select
                className="form-select form-select-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) onSelectAudio(e.target.value);
                }}
              >
                <option value="" disabled>
                  Select…
                </option>
                {audioInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fs-13">Camera</label>
              <select
                className="form-select form-select-sm"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) onSelectVideo(e.target.value);
                }}
              >
                <option value="" disabled>
                  Select…
                </option>
                {videoInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicePicker;
