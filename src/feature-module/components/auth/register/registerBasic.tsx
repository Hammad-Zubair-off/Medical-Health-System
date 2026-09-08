import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageWithBasePath from "../../../../core/imageWithBasePath";
import { all_routes } from "../../../routes/all_routes";
import { signUpPatient } from "../../../../core/services/auth/auth.service";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

const schema = z
  .object({
    displayName: z.string().min(1, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z.string().min(7, "Enter a valid phone number"),
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must accept the Terms of Service",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const RegisterBasic = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await signUpPatient(
        values.email,
        values.password,
        values.displayName,
        values.phoneNumber
      );
      navigate(all_routes.emailverificationbasic, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Registration failed");
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
                        <h5 className="mb-1 fs-20 fw-bold">Register</h5>
                        <p className="mb-0">
                          Please enter your details to create a patient account
                        </p>
                      </div>

                      {formError && (
                        <div className="alert alert-danger" role="alert">
                          {formError}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label" htmlFor="reg-name">
                          Full Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white">
                            <i className="ti ti-user fs-14 text-dark" />
                          </span>
                          <input
                            id="reg-name"
                            type="text"
                            autoComplete="name"
                            className="form-control border-start-0 ps-0"
                            placeholder="Enter Name"
                            {...register("displayName")}
                          />
                        </div>
                        {errors.displayName && (
                          <div className="text-danger fs-13 mt-1">
                            {errors.displayName.message}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="reg-email">
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white">
                            <i className="ti ti-mail fs-14 text-dark" />
                          </span>
                          <input
                            id="reg-email"
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
                        <label className="form-label" htmlFor="reg-phone">
                          Phone Number
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 bg-white">
                            <i className="ti ti-phone fs-14 text-dark" />
                          </span>
                          <input
                            id="reg-phone"
                            type="tel"
                            autoComplete="tel"
                            className="form-control border-start-0 ps-0"
                            placeholder="Enter Phone Number"
                            {...register("phoneNumber")}
                          />
                        </div>
                        {errors.phoneNumber && (
                          <div className="text-danger fs-13 mt-1">
                            {errors.phoneNumber.message}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="reg-password">
                          Password
                        </label>
                        <div className="pass-group input-group position-relative border rounded">
                          <span className="input-group-text bg-white border-0">
                            <i className="ti ti-lock text-dark fs-14" />
                          </span>
                          <input
                            id="reg-password"
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
                        <label className="form-label" htmlFor="reg-confirm">
                          Confirm Password
                        </label>
                        <div className="pass-group input-group position-relative border rounded">
                          <span className="input-group-text bg-white border-0">
                            <i className="ti ti-lock text-dark fs-14" />
                          </span>
                          <input
                            id="reg-confirm"
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

                      <div className="d-flex align-items-center mb-3">
                        <div className="form-check form-check-md mb-0">
                          <input
                            className="form-check-input"
                            id="accept_terms"
                            type="checkbox"
                            {...register("acceptTerms")}
                          />
                          <label
                            htmlFor="accept_terms"
                            className="form-check-label mt-0 text-dark"
                          >
                            I agree to the{" "}
                            <Link
                              to={all_routes.termsCondition}
                              className="text-decoration-underline text-primary"
                            >
                              Terms of Service
                            </Link>
                          </label>
                        </div>
                      </div>
                      {errors.acceptTerms && (
                        <div className="text-danger fs-13 mb-3">
                          {errors.acceptTerms.message}
                        </div>
                      )}

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
                          Sign Up
                        </button>
                      </div>

                      <div className="text-center">
                        <h6 className="fw-normal fs-14 text-dark mb-0">
                          Already have an account?
                          <Link to={all_routes.login} className="hover-a">
                            {" "}
                            Login
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

export default RegisterBasic;
