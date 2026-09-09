import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useMemo } from "react";
import { all_routes, patientDetailsPath } from "../../../../routes/all_routes";
import PatientForm from "../patient-form/PatientForm";
import { usePatient, usePatientForm } from "../patient-details/hooks/usePatient";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { PatientFormSchema } from "../../../../../core/schemas/patient.schema";

const EditPatient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient, loading, error: loadError, notFound } = usePatient(id);
  const { submitting, error, updatePatient } = usePatientForm();

  const defaultValues = useMemo<Partial<PatientFormSchema> | undefined>(() => {
    if (!patient) return undefined;
    const parts = patient.displayName.split(" ");
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    const dob = toDate(patient.dateOfBirth);
    return {
      firstName,
      lastName,
      phoneNumber: patient.phoneNumber ?? "",
      email: patient.email ?? "",
      primaryDoctorId: patient.primaryDoctorId ?? "",
      dateOfBirth: dob ? dob.toISOString().slice(0, 10) : "",
      gender: patient.gender ?? "male",
      bloodGroup: patient.bloodGroup ?? "O+",
      status: patient.status,
      addressLine1: patient.address?.line1 ?? "",
      addressLine2: patient.address?.line2 ?? "",
      country: patient.address?.country ?? "USA",
      state: patient.address?.state ?? "California",
      city: patient.address?.city ?? "Los Angeles",
      postalCode: patient.address?.postalCode ?? "",
      bloodPressure: patient.vitals?.bloodPressure ?? "",
      heartRate: patient.vitals?.heartRate ?? "",
      spo2: patient.vitals?.spo2 ?? "",
      temperature: patient.vitals?.temperature ?? "",
      temperatureUnit: patient.vitals?.temperatureUnit ?? "F",
      respiratoryRate: patient.vitals?.respiratoryRate ?? "",
      weight: patient.vitals?.weight ?? "",
      weightUnit: patient.vitals?.weightUnit ?? "kg",
      createLogin: false,
      password: "",
      confirmPassword: "",
    };
  }, [patient]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (notFound || !patient) {
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
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center">
                <Link to={all_routes.patients} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Patients
                </Link>
              </h6>
            </div>
            <PatientForm
              defaultValues={defaultValues}
              submitting={submitting}
              error={error}
              submitLabel="Save Changes"
              onSubmit={async (values) => {
                await updatePatient(patient._id, values);
                navigate(patientDetailsPath(patient._id));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatient;
