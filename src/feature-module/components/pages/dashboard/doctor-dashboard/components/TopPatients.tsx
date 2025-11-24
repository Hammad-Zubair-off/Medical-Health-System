import { Link } from "react-router";
import { useMemo, useState } from "react";
import type { FirestoreAppointment } from "../../../../../../core/services/firestore/appointments.service";

interface TopPatientsProps {
  appointmentsWithPatients?: (FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } })[];
}

const TopPatients = ({ appointmentsWithPatients = [] }: TopPatientsProps) => {
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
    patientImage: string | null;
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
  // Calculate top patients by appointment count
  const topPatients = useMemo(() => {
    const patientMap = new Map<
      string,
      {
        id: string;
        name: string;
        phone: string;
        image: string | null;
        appointmentCount: number;
      }
    >();

    appointmentsWithPatients.forEach((appointment) => {
      const patientId =
        typeof appointment.UserPatientID === "string"
          ? appointment.UserPatientID
          : appointment.UserPatientID?.id || "unknown";

      const patientName =
        appointment.patientsName ||
        appointment.patient?.display_name ||
        "Unknown Patient";
      const patientPhone =
        appointment.patientsNumber ||
        appointment.patient?.phone_number ||
        "N/A";
      const patientImage =
        appointment.patient?.photo_url || null; // Don't use appointmentfile as patient image

      if (patientMap.has(patientId)) {
        const existing = patientMap.get(patientId)!;
        existing.appointmentCount += 1;
      } else {
        patientMap.set(patientId, {
          id: patientId,
          name: patientName,
          phone: patientPhone,
          image: patientImage,
          appointmentCount: 1,
        });
      }
    });

    // Sort by appointment count and return top 5
    return Array.from(patientMap.values())
      .sort((a, b) => b.appointmentCount - a.appointmentCount)
      .slice(0, 5);
  }, [appointmentsWithPatients]);
  return (
    <div className="col-xl-4 col-lg-6 d-flex">
      <div className="card shadow-sm flex-fill w-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">Top Patients</h5>
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
          {topPatients.length === 0 ? (
            <p className="text-muted mb-0">No patients yet</p>
          ) : (
            topPatients.map((patient, index) => (
            <div
              key={patient.id}
              className={`d-flex align-items-center justify-content-between ${
                index < topPatients.length - 1 ? "mb-4" : "mb-0"
              }`}
            >
              <div className="d-flex align-items-center">
                <Link to="#" className="avatar me-2 flex-shrink-0">
                  <PatientAvatar patientImage={patient.image} patientName={patient.name} />
                </Link>
                <div>
                  <h6 className="fs-14 mb-1 text-truncate">
                    <Link to="#" className="fw-medium">
                      {patient.name}
                    </Link>
                  </h6>
                  <p className="mb-0 fs-13 text-truncate">{patient.phone}</p>
                </div>
              </div>
              <span className="badge fw-medium badge-soft-primary border border-primary flex-shrink-0">
                {patient.appointmentCount} Appointments
              </span>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPatients;

