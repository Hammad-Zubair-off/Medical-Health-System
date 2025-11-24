import { Link } from "react-router";
import { useState } from "react";
import Datatable from "../../../../../../core/common/dataTable/index";
import StarRating from "./StarRating";
import type { Review } from "../review-types";

interface ReviewsTableProps {
  data: Review[];
  searchText: string;
  onView?: (review: Review) => void;
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
        style={{ width: "40px", height: "40px", objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      className={`avatar bg-${avatarColor} text-white rounded-circle d-inline-flex align-items-center justify-content-center`}
      style={{
        width: "40px",
        height: "40px",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      {initials}
    </span>
  );
};

const ReviewsTable = ({ data, searchText, onView }: ReviewsTableProps) => {
  const columns = [
    {
      title: "Patient",
      dataIndex: "patientName",
      render: (text: string, record: Review) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-md me-2">
            <PatientAvatar
              patientImage={record.patientImage}
              patientName={text}
            />
          </div>
          <div>
            <div className="fw-semibold">{text}</div>
            {record.appointmentId && (
              <div className="text-muted fs-13">{record.appointmentId}</div>
            )}
          </div>
        </div>
      ),
      sorter: (a: Review, b: Review) =>
        a.patientName.localeCompare(b.patientName),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      render: (rating: number) => <StarRating rating={rating} />,
      sorter: (a: Review, b: Review) => a.rating - b.rating,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (text: string) => (
        <div style={{ maxWidth: "300px" }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a: Review, b: Review) => a.date.localeCompare(b.date),
    },
    {
      title: "Action",
      render: (_: unknown, record: Review) => (
        <Link
          to="#"
          className="btn btn-sm btn-primary"
          onClick={(e) => {
            e.preventDefault();
            onView?.(record);
          }}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="table-responsive">
      <Datatable
        columns={columns}
        dataSource={data}
        Selection={false}
        searchText={searchText}
      />
    </div>
  );
};

export default ReviewsTable;

