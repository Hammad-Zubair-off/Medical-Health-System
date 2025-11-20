import { Link } from "react-router";

interface DashboardHeaderProps {
  onNewAppointmentClick?: () => void;
  onScheduleAvailabilityClick?: () => void;
}

const DashboardHeader = ({
  onNewAppointmentClick,
  onScheduleAvailabilityClick,
}: DashboardHeaderProps) => {
  return (
    <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-2 mb-4">
      <div>
        <h4 className="fw-bold mb-0">Doctor Dashboard</h4>
      </div>
      <div className="d-flex align-items-center flex-wrap gap-2">
        {/* <Link
          to="#"
          className="btn btn-primary d-inline-flex align-items-center"
          data-bs-toggle="offcanvas"
          data-bs-target="#new_appointment"
          onClick={onNewAppointmentClick}
        >
          <i className="ti ti-plus me-1" />
          New Appointment
        </Link> */}
        <button
          type="button"
          className="btn btn-outline-white bg-white d-inline-flex align-items-center"
          onClick={onScheduleAvailabilityClick}
        >
          <i className="ti ti-calendar-time me-1" />
          Schedule Availability
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;

