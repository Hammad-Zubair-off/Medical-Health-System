import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { all_routes } from "../../../routes/all_routes";
import { resendVerificationEmail } from "../../../../core/services/auth/auth.service";
import { useAuth } from "../../../../core/context/AuthContext";
import { roleHome } from "../../../routes/guards/RoleLanding";

const COOLDOWN_SECONDS = 60;

const EmailVerificationBasic = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, isAuthenticated } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const onResend = async () => {
    setError(null);
    setMessage(null);
    if (cooldown > 0) return;
    setBusy(true);
    try {
      await resendVerificationEmail();
      setMessage("Verification email sent. Check your inbox.");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend email");
    } finally {
      setBusy(false);
    }
  };

  const onVerified = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const { auth } = await import("../../../../firebase");
      await auth.currentUser?.reload();
      const appUser = await refreshProfile();
      if (auth.currentUser?.emailVerified && appUser) {
        navigate(roleHome(appUser.role), { replace: true });
      } else {
        setError("Email not verified yet. Open the link in your inbox first.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="container-fuild position-relative z-1">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
          <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
            <div className="col-lg-4 mx-auto">
              <div className="d-flex justify-content-center align-items-center">
                <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                  <div className="mx-auto mb-4 text-center">
                    <ImageWithBasePath
                      src="assets/img/logo.svg"
                      className="img-fluid"
                      alt="Logo"
                    />
                  </div>
                  <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                    <div className="card-body">
                      <div className="mb-3 text-center">
                        <span>
                          <i className="ti ti-mail-check fs-48 text-primary" />
                        </span>
                      </div>
                      <div className="text-center mb-3">
                        <h5 className="mb-1 fs-20 fw-bold">Verify your email</h5>
                        <p className="mb-0">
                          We sent a verification link
                          {user?.email ? ` to ${user.email}` : ""}. Open it, then
                          click below.
                        </p>
                      </div>

                      {message && (
                        <div className="alert alert-success" role="alert">
                          {message}
                        </div>
                      )}
                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <div className="d-grid gap-2 mt-3">
                        <button
                          type="button"
                          className="btn bg-primary text-white w-100"
                          disabled={busy}
                          onClick={() => void onVerified()}
                        >
                          I&apos;ve verified
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary w-100"
                          disabled={busy || cooldown > 0 || !isAuthenticated}
                          onClick={() => void onResend()}
                        >
                          {cooldown > 0
                            ? `Resend email (${cooldown}s)`
                            : "Resend email"}
                        </button>
                      </div>

                      <div className="text-center mt-3">
                        <Link to={all_routes.login} className="hover-a">
                          Back to login
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-dark text-center">
                Copyright © 2025 - Doctoury
              </p>
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

export default EmailVerificationBasic;
