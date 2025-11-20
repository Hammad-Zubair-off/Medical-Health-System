import { Link } from "react-router";
import { useState } from "react";
import type { FirestoreAppointment } from "../../../../../../core/services/firestore/appointments.service";
import { Timestamp } from "firebase/firestore";

interface UpcomingAppointmentsProps {
  appointments?: (FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } })[];
}

const UpcomingAppointments = ({ appointments = [] }: UpcomingAppointmentsProps) => {
  // Helper to format date
  const formatDate = (date: Timestamp | Date | undefined): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to format time
  const formatTime = (date: Timestamp | Date | undefined): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to format day (just the day name)
  const formatDay = (date: Timestamp | Date | undefined): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  // Helper to get patient initials for avatar placeholder
  const getPatientInitials = (name: string): string => {
    if (!name || name === "Patient") return "?";
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
    appointment 
  }: { 
    appointment: FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } } 
  }) => {
    const [imageError, setImageError] = useState(false);
    const patientName =
      appointment.patientsName ||
      appointment.patient?.display_name ||
      "Patient";
    const patientImage =
      appointment.patient?.photo_url || null;
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

  // Filter to only show upcoming appointments (future dates)
  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = apt.appointmentDate instanceof Timestamp 
      ? apt.appointmentDate.toDate() 
      : apt.appointmentDate instanceof Date 
      ? apt.appointmentDate 
      : new Date(apt.appointmentDate || 0);
    return aptDate > new Date();
  }).slice(0, 10); // Limit to 10 appointments

  if (upcomingAppointments.length === 0) {
    return (
      <div className="col-xl-4 d-flex">
        <div className="card shadow-sm flex-fill w-100">
          <div className="card-header">
            <h5 className="fw-bold mb-0 text-truncate">Upcoming Appointments</h5>
          </div>
          <div className="card-body">
            <p className="text-muted">No upcoming appointments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-xl-4 d-flex">
      <div className="card shadow-sm flex-fill w-100 d-flex flex-column">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0 text-truncate">Upcoming Appointments</h5>
          {/* <div className="dropdown">
            <Link
              to="#"
              className="btn btn-sm px-2 border shadow-sm btn-outline-white d-inline-flex align-items-center"
              data-bs-toggle="dropdown"
            >
              Today <i className="ti ti-chevron-down ms-1" />
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link className="dropdown-item" to="#">
                  Today
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="#">
                  This Week
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="#">
                  This Month
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
        <div className="card-body p-0 flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
          {/* Scrollable container - Height set to show one appointment + a little more */}
          <div style={{ maxHeight: "320px", overflowY: "auto", overflowX: "hidden", flex: "1 1 auto" }}>
            {upcomingAppointments.map((appointment, index) => {
              const patientName = appointment.patientsName || appointment.patient?.display_name || "Patient";
              const diagnosis = appointment.diagnosis || appointment.Complain || appointment.description || "General Visit";
              const appointmentDate = appointment.appointmentDate instanceof Timestamp 
                ? appointment.appointmentDate.toDate() 
                : appointment.appointmentDate instanceof Date 
                ? appointment.appointmentDate 
                : new Date();
              const appointmentTime = appointment.appointmentTime instanceof Timestamp 
                ? appointment.appointmentTime.toDate() 
                : appointment.appointmentTime instanceof Date 
                ? appointment.appointmentTime 
                : appointmentDate;
              const status = appointment.status || "Pending";
              const type = appointment.appointmentType === "video" || appointment.isVideoCall ? "Online" : "Offline";
              const isLast = index === upcomingAppointments.length - 1;

              return (
                <div 
                  key={appointment._id || appointment.AppointmentId || index} 
                  className={`p-3 ${!isLast ? "border-bottom" : ""}`}
                >
                  {/* Patient Image and Name */}
                  <div className="d-flex align-items-center mb-2">
                    <Link to="#" className="avatar me-2 flex-shrink-0">
                      <PatientAvatar appointment={appointment} />
                    </Link>
                    <div className="flex-grow-1 min-w-0">
                      <h6 className="fs-14 mb-0 text-truncate">
                        <Link to="#" className="fw-semibold text-dark">
                          {patientName}
                        </Link>
                      </h6>
                      <p className="mb-0 fs-12 text-muted text-truncate">#{appointment.AppointmentId}</p>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <h6 className="fs-13 fw-semibold mb-2 text-truncate" title={diagnosis}>
                    {diagnosis}
                  </h6>

                  {/* Date and Time */}
                  <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                    <p className="mb-0 fs-12 d-inline-flex align-items-center text-muted">
                      <i className="ti ti-calendar text-dark me-1 fs-13" />
                      {formatDay(appointmentDate)}, {formatDate(appointmentDate)}
                    </p>
                    <p className="mb-0 fs-12 d-inline-flex align-items-center text-muted">
                      <i className="ti ti-clock text-dark me-1 fs-13" />
                      {formatTime(appointmentTime)}
                    </p>
                  </div>

                  {/* Status and Type */}
                  <div className="row g-2">
                    <div className="col-6">
                      <h6 className="fs-12 fw-semibold mb-1">Status</h6>
                      <span className="badge badge-soft-primary text-capitalize fs-11">
                        {status}
                      </span>
                    </div>
                    <div className="col-6">
                      <h6 className="fs-12 fw-semibold mb-1">Type</h6>
                      <span className="badge badge-soft-info fs-11">
                        {type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointments;

