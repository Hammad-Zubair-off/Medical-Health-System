import { Link } from "react-router";
import SCol20Chart from "../charts/scol20";
import type { FirestoreAppointment } from "../../../../../../core/services/firestore/appointments.service";

interface AppointmentsChartProps {
  appointments?: FirestoreAppointment[];
}

const AppointmentsChart = ({ appointments = [] }: AppointmentsChartProps) => {
  return (
    <div className="col-xl-8 d-flex">
      <div className="card shadow-sm flex-fill w-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">Appointments</h5>
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
        <div className="card-body pb-0">
          <div className="d-flex align-items-center justify-content-end gap-2 mb-1 flex-wrap mb-3">
            <p className="mb-0 d-inline-flex align-items-center">
              <i className="ti ti-point-filled me-1 fs-18 text-primary" />
              Total Appointments
            </p>
            <p className="mb-0 d-inline-flex align-items-center">
              <i className="ti ti-point-filled me-1 fs-18 text-success" />
              Completed Appointments
            </p>
          </div>
          <SCol20Chart appointments={appointments} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentsChart;

