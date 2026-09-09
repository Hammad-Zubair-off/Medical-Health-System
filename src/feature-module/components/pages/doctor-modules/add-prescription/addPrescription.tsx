import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { all_routes, doctorsPrescriptionDetailsPath } from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import { listPatients } from "../../../../../core/services/firestore/patient.service";
import { createPrescription } from "../../../../../core/services/firestore/prescription.service";
import { getDoctorAppointments } from "../../../../../core/services/firestore/appointments.service";
import type { PrescriptionFormValues } from "../../../../../core/types/prescription.types";
import PrescriptionForm, {
  type SelectOption,
} from "../shared/prescription-form/PrescriptionForm";
import { formatDate } from "../../../../../core/utils/display.utils";

const AddPrescription = () => {
  const navigate = useNavigate();
  const { user, doctorId, doctorUserId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientOptions, setPatientOptions] = useState<SelectOption[]>([]);
  const [appointmentOptions, setAppointmentOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingOptions(true);
    void (async () => {
      try {
        const patientsResult = await listPatients({ pageSize: 50, status: "active" });
        if (cancelled) return;
        setPatientOptions(
          patientsResult.patients
            .map((p) => ({
              value: p._id ?? "",
              label: p.displayName || p.email || "Patient",
            }))
            .filter((o) => o.value)
        );

        if (doctorUserId) {
          const appointments = await getDoctorAppointments(doctorUserId);
          if (cancelled) return;
          setAppointmentOptions(
            appointments
              .map((a) => ({
                value: a._id ?? "",
                label: `${a.patientsName || "Patient"} — ${formatDate(a.appointmentDate as never)}`,
              }))
              .filter((o) => o.value)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load form options");
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doctorUserId]);

  const handleSubmit = async (values: PrescriptionFormValues) => {
    if (!doctorId || !doctorUserId) {
      setError("Doctor profile is not linked to this account.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const id = await createPrescription({
        values,
        doctorId,
        doctorUserId,
        doctorName: user?.displayName ?? undefined,
        actorUid: user?.uid,
      });
      navigate(doctorsPrescriptionDetailsPath(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3">
              <div className="flex-grow-1">
                <h6 className="fw-bold mb-0 d-flex align-items-center">
                  <Link to={all_routes.doctorsprescriptions}>
                    <i className="ti ti-chevron-left me-1 fs-14" />
                    Prescriptions
                  </Link>
                </h6>
              </div>
            </div>
            {loadingOptions ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">Loading...</p>
              </div>
            ) : (
              <PrescriptionForm
                mode="create"
                submitting={submitting}
                error={error}
                patientOptions={patientOptions}
                appointmentOptions={appointmentOptions}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPrescription;
