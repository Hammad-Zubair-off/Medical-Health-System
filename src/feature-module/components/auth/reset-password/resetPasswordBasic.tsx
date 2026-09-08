import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { confirmPasswordResetWithCode } from "../../../../core/services/auth/auth.service";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

const schema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const ResetPasswordBasic = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    if (!oobCode) {
      setFormError("This reset link is missing or invalid. Request a new one.");
      return;
    }
    try {
      await confirmPasswordResetWithCode(oobCode, values.password);
      setDone(true);
      setTimeout(() => navigate(all_routes.login, { replace: true }), 1500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Reset failed");
    }
  };

  return (
    <>
      <div className="container-fuild position-relative z-1">
        <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
          <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
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
                        <h5 className="mb-1 fs-20 fw-bold">Reset Password</h5>
                        <p className="mb-0">
                          Your new password must be different from previous used
                          passwords.
                        </p>
                      </div>

                      {!oobCode && (
                        <div className="alert alert-warning" role="alert">
                          This link is invalid or incomplete.{" "}
                          <Link to={all_routes.forgotpasswordbasic}>
                            Request a new link
                          </Link>
                          .
                        </div>
                      )}

                      {done ? (
                        <div className="alert alert-success" role="alert">
                          Password updated. Redirecting to login…
                        </div>
                      ) : (
                        <>
                          {formError && (
                            <div className="alert alert-danger" role="alert">
                              {formError}{" "}
                              {(formError.includes("expired") ||
                                formError.includes("invalid")) && (
                                <Link to={all_routes.forgotpasswordbasic}>
                                  Request a new link
                                </Link>
                              )}
                            </div>
                          )}

                          <div className="mb-3">
                            <label className="form-label" htmlFor="reset-password">
                              Password
                            </label>
                            <div className="pass-group input-group position-relative border rounded">
                              <span className="input-group-text bg-white border-0">
                                <i className="ti ti-lock text-dark fs-14" />
                              </span>
                              <input
                                id="reset-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="pass-input form-control border-start-0 ps-0"
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
                            {errors.password && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.password.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label" htmlFor="reset-confirm">
                              Confirm Password
                            </label>
                            <div className="pass-group input-group position-relative border rounded">
                              <span className="input-group-text bg-white border-0">
                                <i className="ti ti-lock text-dark fs-14" />
                              </span>
                              <input
                                id="reset-confirm"
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                className="pass-input form-control border-start-0 ps-0"
                                placeholder="****************"
                                {...register("confirmPassword")}
                              />
                              <button
                                type="button"
                                className="input-group-text bg-white border-0"
                                aria-label={
                                  showConfirm ? "Hide password" : "Show password"
                                }
                                onClick={() => setShowConfirm((v) => !v)}
                              >
                                <i
                                  className={`ti ${
                                    showConfirm ? "ti-eye" : "ti-eye-off"
                                  } text-dark fs-14`}
                                />
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.confirmPassword.message}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <button
                              type="submit"
                              className="btn bg-primary text-white w-100"
                              disabled={isSubmitting || !oobCode}
                            >
                              {isSubmitting ? (
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : null}
                              Submit
                            </button>
                          </div>
                        </>
                      )}

                      <div className="text-center">
                        <h6 className="fw-normal fs-14 text-dark mb-0">
                          Return to{" "}
                          <Link to={all_routes.login} className="hover-a">
                            Login
                          </Link>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <p className="text-dark text-center">
                Copyright © 2025 - Doctoury.
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

export default ResetPasswordBasic;
