import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  all_routes,
  patientAppointmentDetailsPath,
} from "../../../../routes/all_routes";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import Datatable from "../../../../../core/common/dataTable";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { useAuth } from "../../../../../core/context/AuthContext";
import { getPatientByUserId } from "../../../../../core/services/firestore/patient.service";
import {
  cancelAppointment,
  getAppointmentsByPatientId,
} from "../../../../../core/services/firestore/appointments.service";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { Timestamp } from "firebase/firestore";

function formatDateTime(value: Timestamp | Date | undefined): string {
  const date = toDate(value as Timestamp | Date | null | undefined);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);

  const load = async () => {
    if (!user?.uid) {
      setLoading(false);
      setError("Not signed in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const patient = await getPatientByUserId(user.uid);
      if (!patient) {
        setPatientId(null);
        setAppointments([]);
        setError("No patient profile is linked to this account.");
        return;
      }
      setPatientId(patient._id);
      const rows = await getAppointmentsByPatientId(patient._id, 50);
      setAppointments(rows);
    } catch (err) {
      console.error("Failed to load patient appointments", err);
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const dataSource = useMemo(
    () =>
      appointments.map((a) => ({
        key: a._id ?? "",
        _id: a._id ?? "",
        Date_Time: formatDateTime(a.appointmentDate as Timestamp | Date),
        Doctor_Name: a.DoctorsName || "—",
        Mode:
          a.appointmentType === "video" || a.isVideoCall ? "Online" : "In-Person",
        Status: a.status,
      })),
    [appointments]
  );

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "Date_Time",
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Date_Time.localeCompare(b.Date_Time),
    },
    {
      title: "Doctor Name",
      dataIndex: "Doctor_Name",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <Link
            to={patientAppointmentDetailsPath(render._id)}
            className="avatar avatar-md me-2"
          >
            <ImageWithBasePath
              src="assets/img/doctors/doctor-01.jpg"
              alt="doctor"
              className="rounded-circle"
            />
          </Link>
          <Link
            to={patientAppointmentDetailsPath(render._id)}
            className="text-dark fw-semibold"
          >
            {text}
          </Link>
        </div>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Doctor_Name.localeCompare(b.Doctor_Name),
    },
    {
      title: "Mode",
      dataIndex: "Mode",
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Mode.localeCompare(b.Mode),
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge rounded fw-medium fs-13 ${
            text === "cancelled"
              ? "badge-soft-danger text-danger"
              : text === "confirmed"
                ? "badge-soft-success text-success"
                : text === "checked-in"
                  ? "badge-soft-warning text-warning"
                  : "badge-soft-info text-info"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Status.localeCompare(b.Status),
    },
    {
      title: "",
      render: (_: unknown, render: (typeof dataSource)[number]) => (
        <div className="action-item">
          <Link to="#" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                to={patientAppointmentDetailsPath(render._id)}
                className="dropdown-item d-flex align-items-center"
              >
                View
              </Link>
            </li>
            {render.Status !== "cancelled" &&
              render.Status !== "completed" && (
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={() => {
                      void cancelAppointment(render._id).then(() => load());
                    }}
                  >
                    Cancel
                  </button>
                </li>
              )}
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0"> Appointment </h4>
            </div>
            <div className="text-end d-flex">
              <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                <Link
                  to={all_routes.patientappointments}
                  className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-list fs-14 text-dark" />
                </Link>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <div className="search-set mb-3">
              <div className="table-search d-flex align-items-center mb-0">
                <div className="search-input">
                  <SearchInput value={searchText} onChange={setSearchText} />
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="table-responsive">
              <Datatable
                columns={columns}
                dataSource={dataSource}
                Selection={false}
                searchText={searchText}
              />
              {patientId && dataSource.length === 0 && (
                <p className="text-muted mt-3 mb-0">No appointments yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default PatientAppointments;
