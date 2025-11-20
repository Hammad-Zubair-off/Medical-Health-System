import { Link } from "react-router";

interface ConsultationActionsProps {
  onCancel?: () => void;
  onComplete?: () => void;
  completeModalId?: string;
}

const ConsultationActions = ({
  onCancel,
  onComplete,
  completeModalId = "cancel-reason",
}: ConsultationActionsProps) => {
  return (
    <div className="d-flex justify-content-end gap-2 mb-3">
      <button
        type="button"
        className="btn btn-light"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target={`#${completeModalId}`}
        onClick={onComplete}
      >
        Complete Appointment
      </button>
    </div>
  );
};

export default ConsultationActions;

