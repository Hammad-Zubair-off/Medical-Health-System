import { Link } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../../core/context/AuthContext";
import { formatDate } from "../../../../../core/utils/display.utils";
import { listAppointments } from "../../../../../core/services/firestore/appointments.service";
import {
  appointmentConsultationsPath,
  doctorsAppointmentDetailsPath,
} from "../../../../routes/all_routes";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";

type PatientAppointmentsHistoryProps = {
  patientId: string;
  /** When true, only this doctor's appointments with the patient are shown. */
  doctorScoped: boolean;
};

function modeLabel(appt: FirestoreAppointment): string {
  if (appt.appointmentType === "video" || appt.isVideoCall) return "Online";
  return "In-Person";
}

function statusClass(status: string | null | undefined): string {
  const s = (status || "pending").toLowerCase();
  if (s === "completed" || s === "checked_out") return "bg-success";
  if (s === "cancelled") return "bg-danger";
  if (s === "checked_in" || s === "confirmed") return "bg-info";
  return "bg-warning";
}

function formatDateTime(
  value: FirestoreAppointment["appointmentDate"]
): string {
  const datePart = formatDate(value as never);
  if (!datePart || datePart === "—") return "—";
  const raw = value as { toDate?: () => Date } | Date | null | undefined;
  const date =
    raw instanceof Date
      ? raw
      : raw && typeof raw.toDate === "function"
        ? raw.toDate()
        : null;
  if (!date) return datePart;
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${time}`;
}

/**
 * Real appointment history for a patient.
 * Doctors only see visits assigned to them; admins see the full clinic history.
 * Transactions / billing stay off this doctor view.
 */
const PatientAppointmentsHistory = ({
  patientId,
  doctorScoped,
}: PatientAppointmentsHistoryProps) => {
  const { doctorUserId } = useAuth();
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!patientId) return;
    if (doctorScoped && !doctorUserId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Doctors must query by doctorUserId (rules deny cross-doctor patient history).
      // Admins query by patientId for the full clinic timeline.
      const result = await listAppointments(
        doctorScoped && doctorUserId
          ? { doctorUserId, pageSize: 100 }
          : { patientId, pageSize: 40 }
      );
      const rows =
        doctorScoped
          ? result.appointments.filter((a) => a.patientId === patientId)
          : result.appointments;
      setAppointments(rows);
      setCursor(result.nextCursor);
      setHasMore(!doctorScoped && result.nextCursor !== null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [patientId, doctorScoped, doctorUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadMore = async () => {
    if (!hasMore || loading || !cursor || doctorScoped) return;
    setLoading(true);
    try {
      const result = await listAppointments({
        patientId,
        pageSize: 40,
        cursor,
      });
      setAppointments((prev) => [...prev, ...result.appointments]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter(
      (a) =>
        (a.DoctorsName ?? "").toLowerCase().includes(q) ||
        (a.AppointmentId ?? "").toLowerCase().includes(q) ||
        (a.status ?? "").toLowerCase().includes(q)
    );
  }, [appointments, search]);

  const detailPath = (apptId: string) =>
    doctorScoped
      ? doctorsAppointmentDetailsPath(apptId)
      : appointmentConsultationsPath(apptId);

  return (
    <div data-testid="patient-appointments-history">
      <ul className="nav nav-tabs nav-bordered mb-3">
        <li className="nav-item">
          <span className="nav-link active bg-transparent">
            <span>
              {doctorScoped
                ? "My appointments with this patient"
                : "Appointments"}
            </span>
          </span>
        </li>
      </ul>

      <div className="d-flex align-items-center justify-content-between flex-wrap mb-3 gap-2">
        <div className="table-search">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Search appointments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="patient-appointments-search"
          />
        </div>
        {doctorScoped ? (
          <p className="text-muted fs-13 mb-0">
            Only your appointments are shown. Full visit history is admin-only.
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="table-responsive border rounded bg-white">
        <table className="table table-nowrap mb-0">
          <thead className="table-light">
            <tr>
              <th>Date &amp; Time</th>
              {!doctorScoped ? <th>Doctor</th> : null}
              <th>Mode</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && visible.length === 0 ? (
              <tr>
                <td
                  colSpan={doctorScoped ? 4 : 5}
                  className="text-center text-muted py-4"
                >
                  Loading appointments…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={doctorScoped ? 4 : 5}
                  className="text-center text-muted py-4"
                >
                  {doctorScoped
                    ? "No appointments between you and this patient."
                    : "No appointments for this patient."}
                </td>
              </tr>
            ) : (
              visible.map((appt) => (
                <tr key={appt._id} data-testid={`patient-appt-row-${appt._id}`}>
                  <td>{formatDateTime(appt.appointmentDate)}</td>
                  {!doctorScoped ? (
                    <td className="fw-semibold">{appt.DoctorsName || "—"}</td>
                  ) : null}
                  <td>{modeLabel(appt)}</td>
                  <td>
                    <span className={`badge ${statusClass(appt.status)}`}>
                      {appt.status || "pending"}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      to={detailPath(appt._id)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-light btn-sm"
            disabled={loading}
            onClick={() => void loadMore()}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default PatientAppointmentsHistory;
