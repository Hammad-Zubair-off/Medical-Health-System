import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useMemo } from "react";
import { all_routes, doctorsDetailsPath } from "../../../../routes/all_routes";
import DoctorForm from "../doctor-form/DoctorForm";
import { useDoctor, useDoctorForm } from "../doctor-details/hooks/useDoctor";
import type { DoctorFormSchema } from "../../../../../core/schemas/doctor.schema";

const EditDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctor, loading, notFound, error: loadError } = useDoctor(id);
  const { submitting, error, updateDoctor } = useDoctorForm();

  const defaultValues = useMemo<Partial<DoctorFormSchema> | undefined>(() => {
    if (!doctor) return undefined;
    return {
      displayName: doctor.displayName ?? "",
      email: doctor.email ?? "",
      phoneNumber: doctor.phoneNumber ?? "",
      specializationId: doctor.specializationId ?? "",
      qualifications: (doctor.qualifications ?? []).join(", "),
      experienceYears: doctor.experienceYears ?? 0,
      consultationFee: doctor.consultationFee ?? 0,
      bio: doctor.bio ?? "",
      status: doctor.status ?? "active",
    };
  }, [doctor]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading doctor...</p>
        </div>
      </div>
    );
  }

  if (notFound || !doctor?._id) {
    return <Navigate to={all_routes.error404} replace />;
  }

  if (loadError) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <Link to={all_routes.doctors} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Doctors
                </Link>
              </h6>
            </div>
            <DoctorForm
              defaultValues={defaultValues}
              submitting={submitting}
              error={error}
              submitLabel="Save Changes"
              onSubmit={async (values) => {
                await updateDoctor(doctor._id as string, values);
                navigate(doctorsDetailsPath(doctor._id as string));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDoctor;
