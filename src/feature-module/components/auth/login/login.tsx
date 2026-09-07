import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { auth } from "../../../../firebase";
import { signIn } from "../../../../core/services/auth/auth.service";
import { useAuth } from "../../../../core/context/AuthContext";
import { resolvePostLoginPath } from "../../../routes/guards/RoleLanding";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const profileMissing =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("auth_profile_missing") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    if (profileMissing) {
      window.sessionStorage.removeItem("auth_profile_missing");
    }
    try {
      await setPersistence(
        auth,
        values.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const cred = await signIn(values.email, values.password);
      const appUser = await refreshProfile();
      if (!appUser || appUser.uid !== cred.uid) {
        throw new Error(
          "Signed in, but your profile could not be loaded. Try again."
        );
      }

      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname;
      navigate(resolvePostLoginPath(from, appUser.role), { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Sign in failed");
    }
  };

  return (
    <>
      <div className="container-fuild position-relative z-1">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
          <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap py-3">
            <div className="col-lg-4 mx-auto">
              <form
                className="d-flex justify-content-center align-items-center"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
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
                      <div className="text-center mb-3">
                        <h5 className="mb-1 fs-20 fw-bold">Sign In</h5>
                        <p className="mb-0">
                          Please enter below details to access the dashboard
                        </p>
                      </div>

                      {(formError || profileMissing) && (
                        <div className="alert alert-danger" role="alert">
                          {formError ||
                            "Your account is not fully set up. Contact an administrator."}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label" htmlFor="login-email">
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white">
                            <i className="ti ti-mail fs-14 text-dark" />
                          </span>
                          <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            className="form-control border-start-0 ps-0"
                            placeholder="Enter Email Address"
                            {...register("email")}
                          />
                        </div>
                        {errors.email && (
                          <div className="text-danger fs-13 mt-1">
                            {errors.email.message}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="login-password">
                          Password
                        </label>
                        <div className="position-relative">
                          <div className="pass-group input-group position-relative border rounded">
                            <span className="input-group-text bg-white border-0">
                              <i className="ti ti-lock text-dark fs-14" />
                            </span>
                            <input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className="pass-input form-control ps-0 border-0"
                              placeholder="****************"
                              {...register("password")}
                            />
                            <button
                              type="button"
                              className="input-group-text bg-white border-0"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              onClick={() => setShowPassword((v) => !v)}
                            >
                              <i
                                className={`ti ${
                                  showPassword ? "ti-eye" : "ti-eye-off"
                                } text-dark fs-14`}
                              />
                            </button>
                          </div>
                        </div>
                        {errors.password && (
                          <div className="text-danger fs-13 mt-1">
                            {errors.password.message}
                          </div>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="form-check form-check-md mb-0">
                          <input
                            className="form-check-input"
                            id="remember_me"
                            type="checkbox"
                            {...register("rememberMe")}
                          />
                          <label
                            htmlFor="remember_me"
                            className="form-check-label mt-0 text-dark"
                          >
                            Remember Me
                          </label>
                        </div>
                        <Link
                          to={all_routes.forgotpasswordbasic}
                          className="text-danger"
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <div className="mb-2">
                        <button
                          type="submit"
                          className="btn bg-primary text-white w-100"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : null}
                          Login
                        </button>
                      </div>

                      <div className="text-center">
                        <h6 className="fw-normal fs-14 text-dark mb-0">
                          Don&apos;t have an account yet?
                          <Link
                            to={all_routes.registerbasic}
                            className="hover-a"
                          >
                            {" "}
                            Register
                          </Link>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
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

export default Login;
