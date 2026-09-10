import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listCallsForAppointment } from "../../../../../../../core/services/firestore/call.service";
import type { CallDoc } from "../../../../../../../core/schemas/call.schema";
import { formatDate } from "../../../../../../../core/utils/display.utils";
import { videoCallPath } from "../../../../../../routes/all_routes";

type AppointmentRecentCallsProps = {
  appointmentId: string;
};

const AppointmentRecentCalls = ({
  appointmentId,
}: AppointmentRecentCallsProps) => {
  const [calls, setCalls] = useState<CallDoc[]>([]);

  useEffect(() => {
    if (!appointmentId) return;
    void listCallsForAppointment(appointmentId, 5)
      .then(setCalls)
      .catch(() => setCalls([]));
  }, [appointmentId]);

  if (calls.length === 0) return null;

  return (
    <div className="card mt-3" data-testid="appointment-recent-calls">
      <div className="card-header">
        <h6 className="mb-0 fw-bold">Recent calls</h6>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {calls.map((c) => (
            <li
              key={c._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span className="fs-13">
                {formatDate(c.created as never)} ·{" "}
                <span className="text-capitalize">{c.status}</span>
                {c.durationSeconds != null ? ` · ${c.durationSeconds}s` : ""}
              </span>
              {(c.status === "ringing" ||
                c.status === "accepted" ||
                c.status === "connected") && (
                <Link
                  to={videoCallPath(c._id)}
                  className="btn btn-sm btn-outline-primary"
                >
                  Open
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AppointmentRecentCalls;
