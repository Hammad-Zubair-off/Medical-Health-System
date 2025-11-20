import { Link } from "react-router";
import { all_routes } from "../../../routes/all_routes";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon." 
}: ComingSoonProps) => {
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
            <div className="col-lg-6 col-md-8 text-center">
              <div className="card shadow-sm border-0">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="avatar avatar-xl bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                      <i className="ti ti-clock-hour-4 fs-48" />
                    </div>
                    <h2 className="fw-bold text-dark mb-3">{title}</h2>
                    <p className="text-muted fs-16 mb-4">{description}</p>
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <Link 
                      to={all_routes.doctordashboard} 
                      className="btn btn-primary"
                    >
                      <i className="ti ti-arrow-left me-1" />
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

