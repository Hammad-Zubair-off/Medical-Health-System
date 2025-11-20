import { Link } from "react-router";
import { useMemo } from "react";
import type { FirestoreAppointment } from "../../../../../../core/services/firestore/appointments.service";
import { Timestamp } from "firebase/firestore";

interface RecentAppointmentsTableProps {
  appointments?: (FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } })[];
}

const RecentAppointmentsTable = ({ appointments = [] }: RecentAppointmentsTableProps) => {
  // Helper to convert date to comparable value
  const toDate = (date: Timestamp | Date | undefined): Date => {
    if (!date) return new Date(0);
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(0);
  };

  // Get the 7 latest appointments sorted by date (most recent first)
  const latestAppointments = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => {
      const dateA = toDate(a.appointmentDate);
      const dateB = toDate(b.appointmentDate);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });
    return sorted.slice(0, 5); // Take only the 7 latest
  }, [appointments]);

  // Helper to format date and time
  const formatDateTime = (date: Timestamp | Date | undefined): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to get status color
  const getStatusColor = (status: string): "success" | "warning" | "danger" | "info" => {
    switch (status.toLowerCase()) {
      case "completed":
      case "checked-out":
        return "success";
      case "pending":
      case "confirmed":
      case "checked-in":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "info";
    }
  };

  // Helper to format price
  const formatPrice = (price?: number): string => {
    if (!price && price !== 0) return "$0.00";
    return `$${price.toFixed(2)}`;
  };

  // Helper to get appointment mode
  const getAppointmentMode = (appointment: FirestoreAppointment): string => {
    if (appointment.appointmentType === "video" || appointment.isVideoCall) {
      return "Online";
    }
    return "Offline";
  };

  return (
    <div className="row">
      <div className="col-12 d-flex">
        <div className="card shadow-sm flex-fill w-100">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="fw-bold mb-0">Recent Appointments</h5>
            {/* <div className="dropdown">
              <Link
                to="#"
                className="btn btn-sm px-2 border shadow-sm btn-outline-white d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                Weekly <i className="ti ti-chevron-down ms-1" />
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="#">
                    Monthly
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="#">
                    Weekly
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="#">
                    Yearly
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
          <div className="card-body">
            <div className="table-responsive table-nowrap">
              <table className="table border">
                <thead className="thead-light">
                  <tr>
                    <th>Patient</th>
                    <th>Date &amp; Time</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Consultation Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <p className="text-muted mb-0">No recent appointments</p>
                      </td>
                    </tr>
                  ) : (
                    latestAppointments.map((appointment) => {
                      const patientName =
                        appointment.patientsName ||
                        appointment.patient?.display_name ||
                        "Unknown Patient";
                      const patientPhone =
                        appointment.patientsNumber ||
                        appointment.patient?.phone_number ||
                        "N/A";

                      return (
                        <tr key={appointment._id || appointment.AppointmentId}>
                          <td>
                            <div>
                              <h6 className="fs-14 mb-1">
                                <Link to="#" className="fw-medium text-dark">
                                  {patientName}
                                </Link>
                              </h6>
                              <p className="mb-0 fs-13 text-muted">{patientPhone}</p>
                            </div>
                          </td>
                          <td>{formatDateTime(appointment.appointmentDate)}</td>
                          <td>{getAppointmentMode(appointment)}</td>
                          <td>
                            <span
                              className={`badge bg-${getStatusColor(appointment.status)} fw-medium text-capitalize`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="fw-semibold text-dark">
                            {formatPrice(appointment.price)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentAppointmentsTable;

