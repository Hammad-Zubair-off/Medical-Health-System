import { useState } from "react";
import StarRating from "./StarRating";
import type { Review } from "../review-types";

interface ReviewDetailsModalProps {
  review: Review | null;
  onClose: () => void;
}

// Helper to get patient initials for avatar placeholder
const getPatientInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to get a color based on patient name
const getAvatarColor = (name: string): string => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Patient Avatar Component
const PatientAvatar = ({
  patientImage,
  patientName,
}: {
  patientImage?: string;
  patientName: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const hasPatientImage = !!patientImage && !imageError;
  const avatarColor = getAvatarColor(patientName);
  const initials = getPatientInitials(patientName);

  if (hasPatientImage) {
    return (
      <img
        src={patientImage}
        alt={patientName}
        className="rounded-circle"
        onError={() => setImageError(true)}
        style={{ width: "80px", height: "80px", objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      className={`avatar bg-${avatarColor} text-white rounded-circle d-inline-flex align-items-center justify-content-center`}
      style={{
        width: "80px",
        height: "80px",
        fontSize: "24px",
        fontWeight: 600,
      }}
    >
      {initials}
    </span>
  );
};

const ReviewDetailsModal = ({ review, onClose }: ReviewDetailsModalProps) => {
  if (!review) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Review Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body p-4">
            {/* Patient Information */}
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <div className="me-3">
                <PatientAvatar
                  patientImage={review.patientImage}
                  patientName={review.patientName}
                />
              </div>
              <div>
                <h5 className="fw-bold mb-1">{review.patientName}</h5>
                {review.appointmentId && (
                  <p className="text-muted mb-0 fs-13">
                    Appointment ID: {review.appointmentId}
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="form-label text-muted fs-13 fw-medium mb-2">
                Rating
              </label>
              <div>
                <StarRating rating={review.rating} showNumber={true} />
                <span className="ms-2 text-muted">
                  ({review.rating.toFixed(1)} out of 5)
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="form-label text-muted fs-13 fw-medium mb-2">
                Comment
              </label>
              <div className="card bg-light border-0 p-3">
                <p className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap" }}>
                  {review.comment || "No comment provided"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label text-muted fs-13 fw-medium mb-2">
                Review Date
              </label>
              <p className="text-dark fw-semibold mb-0">{review.date}</p>
            </div>
          </div>
          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsModal;

