import { Link } from "react-router";
import { useAuth } from "../../../../../../core/context/AuthContext";
import { useCallHistory } from "../../../../../../core/hooks/useCallHistory";
import { formatDate } from "../../../../../../core/utils/display.utils";
import { toDate } from "../../../../../../core/utils/firestore.utils";
import { all_routes, videoCallPath } from "../../../../../routes/all_routes";
import type { CallDoc } from "../../../../../../core/schemas/call.schema";

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function peerName(call: CallDoc, uid: string): string {
  if (uid === call.doctorUserId) return call.patientName || "Patient";
  return call.doctorName || "Doctor";
}

function direction(call: CallDoc, uid: string): string {
  return call.callerUid === uid ? "Outgoing" : "Incoming";
}

const CallHistory = () => {
  const { user } = useAuth();
  const { calls, loading, error, hasMore, loadMore } = useCallHistory(user?.uid);

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="fw-bold mb-0" data-testid="call-history-title">
            Call History
          </h4>
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
                <th>When</th>
                <th>With</th>
                <th>Direction</th>
                <th>Type</th>
                <th>Status</th>
                <th>Duration</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Loading…
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No calls yet.
                  </td>
                </tr>
              ) : (
                calls.map((call) => {
                  const created = toDate(call.created as never);
                  return (
                    <tr key={call._id} data-testid={`call-history-row-${call._id}`}>
                      <td>
                        {created
                          ? `${formatDate(call.created as never)} ${created.toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "—"}
                      </td>
                      <td className="fw-semibold">
                        {user?.uid ? peerName(call, user.uid) : "—"}
                      </td>
                      <td>{user?.uid ? direction(call, user.uid) : "—"}</td>
                      <td className="text-capitalize">{call.callType}</td>
                      <td>
                        <span className="badge bg-secondary text-capitalize">
                          {call.status}
                        </span>
                      </td>
                      <td>{formatDuration(call.durationSeconds)}</td>
                      <td className="text-end">
                        {call.status === "ringing" || call.status === "accepted" || call.status === "connected" ? (
                          <Link
                            to={videoCallPath(call._id)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Open
                          </Link>
                        ) : (
                          <Link
                            to={all_routes.callHistory}
                            className="btn btn-sm btn-light disabled"
                            onClick={(e) => e.preventDefault()}
                          >
                            —
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
};

export default CallHistory;
