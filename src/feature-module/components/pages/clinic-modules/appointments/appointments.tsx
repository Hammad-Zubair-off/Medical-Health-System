import { Link } from "react-router";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import {
  all_routes,
  appointmentConsultationsPath,
} from "../../../../routes/all_routes";
import { useMemo } from "react";
import SearchInput from "../../../../../core/common/dataTable/dataTableSearch";
import Datatable from "../../../../../core/common/dataTable";
import { useAppointmentsList } from "./hooks/useAppointmentsList";
import type { AppointmentStatus } from "../../../../../core/types/appointment.types";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { Timestamp } from "firebase/firestore";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Schedule",
  confirmed: "Confirmed",
  "checked-in": "Checked In",
  "checked-out": "Checked Out",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

const STATUS_FILTERS: Array<{ value: AppointmentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Schedule" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked-in", label: "Checked In" },
  { value: "checked-out", label: "Checked Out" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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

function statusBadgeClass(label: string): string {
  if (label === "Checked Out") return "badge-soft-info text-info";
  if (label === "Checked In") return "badge-soft-warning text-warning";
  if (label === "Cancelled") return "badge-soft-danger text-danger";
  if (label === "Schedule" || label === "Pending") return "badge-soft-primary text-primary";
  if (label === "Completed") return "badge-soft-secondary text-secondary";
  return "badge-soft-success text-success";
}

const Appointments = () => {
  const {
    appointments,
    loading,
    error,
    hasMore,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    loadMore,
    setStatus,
    cancel,
  } = useAppointmentsList();

  const dataSource = useMemo(
    () =>
      appointments.map((a) => ({
        key: a._id ?? "",
        _id: a._id ?? "",
        Date_Time: formatDateTime(a.appointmentDate as Timestamp | Date),
        Patient: a.patientsName || "Unknown Patient",
        Phone: a.patientsNumber || "—",
        Doctor: a.DoctorsName || "—",
        Mode:
          a.appointmentType === "video" || a.isVideoCall ? "Online" : "In-Person",
        Status: STATUS_LABELS[a.status] ?? a.status,
        rawStatus: a.status,
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
      title: "Patient",
      dataIndex: "Patient",
      render: (text: string, render: (typeof dataSource)[number]) => (
        <div className="d-flex align-items-center">
          <Link
            to={appointmentConsultationsPath(render._id)}
            className="avatar avatar-md me-2"
          >
            <ImageWithBasePath
              src="assets/img/users/user-08.jpg"
              alt="patient"
              className="rounded-circle"
            />
          </Link>
          <Link
            to={appointmentConsultationsPath(render._id)}
            className="text-dark fw-semibold"
          >
            {text}
            <span className="text-body fs-13 fw-normal d-block">
              {render.Phone}
            </span>
          </Link>
        </div>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Patient.localeCompare(b.Patient),
    },
    {
      title: "Doctor",
      dataIndex: "Doctor",
      render: (text: string) => (
        <div className="d-flex align-items-center">
          <span className="avatar me-2 flex-shrink-0">
            <ImageWithBasePath
              src="assets/img/doctors/doctor-01.jpg"
              alt="doctor"
              className="rounded-circle"
            />
          </span>
          <div>
            <h6 className="fs-14 mb-0 text-truncate fw-semibold">{text}</h6>
          </div>
        </div>
      ),
      sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) =>
        a.Doctor.localeCompare(b.Doctor),
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
          className={`fs-13 badge ${statusBadgeClass(text)} rounded fw-medium`}
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
                to={appointmentConsultationsPath(render._id)}
                className="dropdown-item d-flex align-items-center"
              >
                View
              </Link>
            </li>
            {render.rawStatus === "pending" && (
              <li>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => void setStatus(render._id, "confirmed")}
                >
                  Confirm
                </button>
              </li>
            )}
            {(render.rawStatus === "pending" ||
              render.rawStatus === "confirmed") && (
              <li>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => void setStatus(render._id, "checked-in")}
                >
                  Check In
                </button>
              </li>
            )}
            {render.rawStatus === "checked-in" && (
              <li>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => void setStatus(render._id, "completed")}
                >
                  Complete
                </button>
              </li>
            )}
            {render.rawStatus !== "cancelled" &&
              render.rawStatus !== "completed" && (
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={() => void cancel(render._id)}
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
              <h4 className="fw-semibold mb-0"> Appointment </h4>
            </div>
            <div className="text-end d-flex">
              <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center">
                <Link
                  to={all_routes.appointments}
                  className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-list fs-14 text-dark" />
                </Link>
                <Link
                  to={all_routes.appointmentCalendar}
                  className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-calendar-event fs-14 text-body" />
                </Link>
              </div>
              <Link
                to={all_routes.newAppointment}
                className="btn btn-primary ms-2 fs-13 btn-md"
              >
                <i className="ti ti-plus me-1" /> New Appointment
              </Link>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <div className="search-set mb-3">
                <div className="table-search d-flex align-items-center mb-0">
                  <div className="search-input">
                    <SearchInput value={search} onChange={setSearch} />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex table-dropdown mb-3 right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown me-2">
                <Link
                  to="#"
                  className="bg-white border rounded btn btn-md text-dark fs-14 py-1 align-items-center d-flex fw-normal"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-filter text-gray-5 me-1" />
                  Status:{" "}
                  {STATUS_FILTERS.find((s) => s.value === statusFilter)?.label ??
                    "All"}
                </Link>
                <ul className="dropdown-menu p-2">
                  {STATUS_FILTERS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className="dropdown-item rounded-1"
                        onClick={() => setStatusFilter(opt.value)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {loading && dataSource.length === 0 && (
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

          {!error && (
            <>
              <div className="table-responsive">
                <Datatable
                  columns={columns}
                  dataSource={dataSource}
                  Selection={false}
                  searchText=""
                />
              </div>
              {hasMore && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-md"
                    disabled={loading}
                    onClick={() => void loadMore()}
                  >
                    {loading ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
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

export default Appointments;
