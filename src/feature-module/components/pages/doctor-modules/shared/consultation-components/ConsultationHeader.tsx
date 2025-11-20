import { Link } from "react-router";

interface ConsultationHeaderProps {
  onExportClick?: (format: "pdf" | "excel") => void;
}

const ConsultationHeader = ({ onExportClick }: ConsultationHeaderProps) => {
  return (
    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
      <div className="flex-grow-1">
        <h4 className="fw-semibold mb-0">Online Consultation</h4>
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
      </div>
    </div>
  );
};

export default ConsultationHeader;

