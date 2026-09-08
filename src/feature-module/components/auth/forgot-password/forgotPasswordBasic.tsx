import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { all_routes } from "../../../routes/all_routes";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { sendPasswordReset } from "../../../../core/services/auth/auth.service";

const SUCCESS_MESSAGE =
  "If an account exists for that email, you will receive reset instructions shortly.";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const ForgotPasswordBasic = () => {
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await sendPasswordReset(values.email);
      setDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Request failed");
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
                        <h5 className="mb-1 fs-20 fw-bold">Forgot Password</h5>
                        <p className="mb-0">
                          No worries, we&apos;ll send you reset instructions
                        </p>
                      </div>

                      {done ? (
                        <div className="alert alert-success" role="alert">
                          {SUCCESS_MESSAGE}
                        </div>
                      ) : (
                        <>
                          {formError && (
                            <div className="alert alert-danger" role="alert">
                              {formError}
                            </div>
                          )}
                          <div className="mb-3">
                            <label className="form-label" htmlFor="forgot-email">
                              Email Address
                            </label>
                            <div className="input-group">
                              <span className="input-group-text border-end-0 bg-white">
                                <i className="ti ti-mail fs-14 text-dark" />
                              </span>
                              <input
                                id="forgot-email"
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
                              Send Reset Link
                            </button>
                          </div>
                        </>
                      )}

                      <div className="text-center">
                        <h6 className="fw-normal fs-14 text-dark mb-0">
                          Return to{" "}
                          <Link to={all_routes.login} className="hover-a">
                            login
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

export default ForgotPasswordBasic;
