import { Link } from "react-router";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { useAuth } from "../../../../core/context/AuthContext";
import { all_routes } from "../../../routes/all_routes";
import { roleHome } from "../../../routes/guards/RoleLanding";

const Error404 = () => {
  const { isAuthenticated, role, status } = useAuth();

  const homePath =
    status !== "loading" && isAuthenticated && role
      ? roleHome(role)
      : all_routes.login;

  const homeLabel =
    status !== "loading" && isAuthenticated && role
      ? "Back to Dashboard"
      : "Back to Login";

  return (
    <>
      <div className="container-fuild">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100 z-1">
          <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
            <div className="col-lg-6">
              <div className="d-flex flex-column align-items-center justify-content-center">
                <div className="mx-auto mb-5 text-center">
                  <ImageWithBasePath
                    src="assets/img/logo.svg"
                    className="img-fluid"
                    alt="Logo"
                  />
                </div>
                <div className="error-images mb-4">
                  <ImageWithBasePath
                    src="assets/img/error-404.svg"
                    alt="Page not found"
                    className="img-fluid"
                  />
                </div>
                <div className="text-center">
                  <p className="text-primary fw-semibold mb-1">404</p>
                  <h4 className="mb-2 fw-bold">Page not found</h4>
                  <p className="fs-14 text-center text-muted mb-4">
                    Sorry, the page you are looking for doesn’t exist or has
                    been moved.
                  </p>
                  <div className="d-flex justify-content-center pb-3">
                    <Link
                      to={homePath}
                      className="btn btn-primary d-inline-flex align-items-center"
                    >
                      <i className="ti ti-chevron-left me-2" />
                      {homeLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ImageWithBasePath
        src="assets/img/auth/auth-bg-top.png"
        alt=""
        className="img-fluid element-01"
      />
      <ImageWithBasePath
        src="assets/img/auth/auth-bg-bot.png"
        alt=""
        className="img-fluid element-02"
      />
    </>
  );
};

export default Error404;
