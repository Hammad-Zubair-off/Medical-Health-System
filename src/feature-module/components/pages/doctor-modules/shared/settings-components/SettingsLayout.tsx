import { Link } from "react-router";
import { all_routes } from "../../../../../routes/all_routes";
import type { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
  activePage: "profile" | "password" | "notifications";
  title: string;
}

const SettingsLayout = ({ children, activePage, title }: SettingsLayoutProps) => {
  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">{title}</h3>
            </div>
          </div>
        </div>
        {/* End Page Header */}

        <div className="card">
          <div className="card-body p-0">
            <div className="settings-wrapper d-flex">
              {/* Settings Sidebar */}
              <div className="settings-sidebar">
                <ul className="nav nav-tabs border-0 flex-column">
                  <li className="nav-item">
                    <Link
                      to={all_routes.doctorsprofilesettings}
                      className={`nav-link ${activePage === "profile" ? "active" : ""}`}
                    >
                      <i className="ti ti-user me-2" />
                      Profile Settings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to={all_routes.doctorspasswordsettings}
                      className={`nav-link ${activePage === "password" ? "active" : ""}`}
                    >
                      <i className="ti ti-lock me-2" />
                      Change Password
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to={all_routes.doctorsnotificationsettings}
                      className={`nav-link ${activePage === "notifications" ? "active" : ""}`}
                    >
                      <i className="ti ti-bell me-2" />
                      Notifications
                    </Link>
                  </li>
                </ul>
              </div>
              {/* End Settings Sidebar */}

              {/* Settings Content */}
              <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                <div className="card-header border-bottom px-0 mx-3">
                  <h5 className="fw-bold">{title}</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {children}
                </div>
              </div>
              {/* End Settings Content */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;

