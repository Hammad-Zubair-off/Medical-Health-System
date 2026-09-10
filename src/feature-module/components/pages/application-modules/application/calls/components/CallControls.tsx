type CallControlsProps = {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onHangUp: () => void;
  onOpenDevices?: () => void;
  disabled?: boolean;
};

const CallControls = ({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onHangUp,
  onOpenDevices,
  disabled,
}: CallControlsProps) => {
  return (
    <div
      className="d-flex align-items-center justify-content-center gap-2 mt-3"
      data-testid="call-controls"
    >
      <button
        type="button"
        className={`btn btn-md rounded-circle ${isMuted ? "btn-warning" : "btn-light"}`}
        onClick={onToggleMute}
        disabled={disabled}
        title={isMuted ? "Unmute" : "Mute"}
        data-testid="call-mute"
      >
        <i className={`ti ${isMuted ? "ti-microphone-off" : "ti-microphone"}`} />
      </button>
      <button
        type="button"
        className={`btn btn-md rounded-circle ${isCameraOff ? "btn-warning" : "btn-light"}`}
        onClick={onToggleCamera}
        disabled={disabled}
        title={isCameraOff ? "Camera on" : "Camera off"}
        data-testid="call-camera"
      >
        <i className={`ti ${isCameraOff ? "ti-video-off" : "ti-video"}`} />
      </button>
      {onOpenDevices ? (
        <button
          type="button"
          className="btn btn-md btn-light rounded-circle"
          onClick={onOpenDevices}
          disabled={disabled}
          title="Devices"
          data-testid="call-devices"
        >
          <i className="ti ti-settings" />
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-md btn-danger rounded-circle"
        onClick={onHangUp}
        title="Hang up"
        data-testid="call-hangup"
      >
        <i className="ti ti-phone-off" />
      </button>
    </div>
  );
};

export default CallControls;
