import { Link } from "react-router";
import { useState } from "react";
import Datatable from "../../../../../../core/common/dataTable/index";
import StatusBadge from "./StatusBadge";
import { all_routes } from "../../../../../routes/all_routes";
import type { Appointment } from "../appointment-types";

// Re-export for backward compatibility
export type { Appointment };

interface AppointmentTableProps {
  data: Appointment[];
  searchText: string;
  onView?: (appointment: Appointment) => void;
}

// Helper to get patient initials for avatar placeholder
const getPatientInitials = (name: string): string => {
  if (!name || name === "Unknown Patient") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper to get a color based on patient name (for consistent avatar colors)
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
  patientName
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

const AppointmentTable = ({
  data,
  searchText,
  onView,
}: AppointmentTableProps) => {
  const columns = [
    {
      title: "Patient",
      dataIndex: "Patient",
      render: (text: string, record: Appointment) => (
        <div className="d-flex align-items-center">
          <Link
            to={all_routes.doctorspatientdetails}
            className="avatar avatar-md me-2"
          >
            <PatientAvatar patientImage={record.img} patientName={text} />
          </Link>
          <Link to={all_routes.doctorspatientdetails} className="fw-semibold">
            {text}
            <span className="text-body fs-13 fw-normal d-block">
              {record.phone_number}
            </span>
          </Link>
        </div>
      ),
      sorter: (a: Appointment, b: Appointment) =>
        a.Patient.localeCompare(b.Patient),
    },
    {
      title: "Date & Time",
      dataIndex: "Date_Time",
      sorter: (a: Appointment, b: Appointment) =>
        a.Date_Time.localeCompare(b.Date_Time),
    },
    {
      title: "Mode",
      dataIndex: "Mode",
      sorter: (a: Appointment, b: Appointment) => a.Mode.localeCompare(b.Mode),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => <StatusBadge status={text} />,
      sorter: (a: Appointment, b: Appointment) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: (_: unknown, record: Appointment) => (
        <Link
          to="#"
          className="btn btn-sm btn-outline-primary"
          onClick={(e) => {
            e.preventDefault();
            if (onView) {
              onView(record);
            }
          }}
        >
          <i className="ti ti-eye me-1" />
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

export default AppointmentTable;

