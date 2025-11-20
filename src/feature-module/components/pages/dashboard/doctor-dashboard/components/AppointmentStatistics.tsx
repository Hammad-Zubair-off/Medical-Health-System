import { Link } from "react-router";
import CircleChart2 from "../charts/circleChart2";

interface StatItem {
  label: string;
  value: string | number;
  color: "success" | "warning" | "danger";
}

interface AppointmentStatisticsProps {
  completed?: number;
  pending?: number;
  cancelled?: number;
}

const AppointmentStatistics = ({
  completed = 0,
  pending = 0,
  cancelled = 0,
}: AppointmentStatisticsProps) => {
  const statItems: StatItem[] = [
    { label: "Completed", value: completed, color: "success" },
    { label: "Pending", value: pending, color: "warning" },
    { label: "Cancelled", value: cancelled, color: "danger" },
  ];
  return (
    <div className="col-xl-4 col-lg-6 d-flex">
      <div className="card shadow-sm flex-fill w-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0 text-truncate">Appointment Statistics</h5>
          <div className="dropdown">
            <Link
              to="#"
              className="btn btn-sm px-2 border shadow-sm btn-outline-white d-inline-flex align-items-center"
              data-bs-toggle="dropdown"
            >
              Monthly <i className="ti ti-chevron-down ms-1" />
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
          </div>
        </div>
        <div className="card-body">
          <CircleChart2 completed={completed} pending={pending} cancelled={cancelled} />
          <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <p className="d-flex align-items-center mb-1 fs-13">
                  <i className={`ti ti-circle-filled text-${item.color} fs-10 me-1`} />
                  {item.label}
                </p>
                <h5 className="fw-bold mb-0">{item.value}</h5>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatistics;

