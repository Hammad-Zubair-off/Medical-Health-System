import { Link } from "react-router";

interface AppointmentHeaderProps {
  onNewAppointmentClick?: () => void;
  onExportClick?: (format: "pdf" | "excel") => void;
  viewMode?: "list" | "calendar";
  onViewModeChange?: (mode: "list" | "calendar") => void;
}

const AppointmentHeader = ({
  onNewAppointmentClick,
  onExportClick,
  viewMode = "list",
  onViewModeChange,
}: AppointmentHeaderProps) => {
  return (
    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
      <div className="flex-grow-1">
        <h4 className="fw-semibold mb-0">Appointment</h4>
      </div>
      <div className="text-end d-flex">
        {/* Export Dropdown */}
        <div className="dropdown me-1">
          <Link
            to="#"
            className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            Export
            <i className="ti ti-chevron-down ms-2" />
          </Link>
          <ul className="dropdown-menu p-2">
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  onExportClick?.("pdf");
                }}
              >
                Download as PDF
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  onExportClick?.("excel");
                }}
              >
                Download as Excel
              </Link>
            </li>
          </ul>
        </div>
        {/* View Mode Toggle */}
        <div className="bg-white border shadow-sm rounded px-1 pb-0 text-center d-flex align-items-center justify-content-center me-1">
          <Link
            to="#"
            className={`px-2 py-1 ${viewMode === "list" ? "text-primary" : "text-body"}`}
            onClick={(e) => {
              e.preventDefault();
              onViewModeChange?.("list");
            }}
          >
            <i className="ti ti-list fs-16" />
          </Link>
          <Link
            to="#"
            className={`px-2 py-1 ${viewMode === "calendar" ? "text-primary" : "text-body"}`}
            onClick={(e) => {
              e.preventDefault();
              onViewModeChange?.("calendar");
            }}
          >
            <i className="ti ti-calendar fs-16" />
          </Link>
        </div>
        {/* New Appointment Button */}
        {/* <Link
          to="#"
          className="btn btn-primary btn-md d-inline-flex align-items-center"
          data-bs-toggle="offcanvas"
          data-bs-target="#new_appointment"
          onClick={(e) => {
            e.preventDefault();
            onNewAppointmentClick?.();
          }}
        >
          <i className="ti ti-plus me-1" />
          New Appointment
        </Link> */}
      </div>
    </div>
  );
};

export default AppointmentHeader;

