import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import {
  all_routes,
  doctorsPrescriptionDetailsPath,
} from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import {
  getPrescription,
  updatePrescription,
} from "../../../../../core/services/firestore/prescription.service";
import type { PrescriptionFormSchema } from "../../../../../core/schemas/prescription.schema";
import type { PrescriptionFormValues } from "../../../../../core/types/prescription.types";
import { formatDate } from "../../../../../core/utils/display.utils";
import { toDate } from "../../../../../core/utils/firestore.utils";
import PrescriptionForm, {
  type SelectOption,
} from "../shared/prescription-form/PrescriptionForm";

const EditPrescription = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Partial<PrescriptionFormSchema>>();
  const [patientOptions, setPatientOptions] = useState<SelectOption[]>([]);
  const [appointmentOptions, setAppointmentOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getPrescription(id)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) {
          setNotFound(true);
          return;
        }
        const followUp = toDate(doc.followUpDate);
        setDefaultValues({
          appointmentId: doc.appointmentId ?? "",
          patientId: doc.patientId ?? "",
          diagnosis: doc.diagnosis ?? "",
          notes: doc.notes ?? "",
          followUpDate: followUp ? followUp.toISOString().slice(0, 10) : "",
          status: doc.status ?? "active",
          medicines:
            doc.medicines.length > 0
              ? doc.medicines.map((m) => ({
                  name: m.name,
                  dosage: m.dosage,
                  frequency: m.frequency,
                  duration: m.duration,
                  instructions: m.instructions ?? "",
                }))
              : undefined,
        });
        setPatientOptions([
          {
            value: doc.patientId,
            label: doc.patientName || doc.patientId,
          },
        ]);
        setAppointmentOptions(
          doc.appointmentId
            ? [
                {
                  value: doc.appointmentId,
                  label: `Appointment — ${formatDate(doc.prescribedOn as never)}`,
                },
              ]
            : []
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load prescription");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const cancelTo = useMemo(
    () => (id ? doctorsPrescriptionDetailsPath(id) : all_routes.doctorsprescriptions),
    [id]
  );

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
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
                <Link to={cancelTo} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Prescription
                </Link>
              </h6>
            </div>
            <PrescriptionForm
              mode="edit"
              defaultValues={defaultValues}
              submitting={submitting}
              error={error}
              patientOptions={patientOptions}
              appointmentOptions={appointmentOptions}
              cancelTo={cancelTo}
              onSubmit={async (values: PrescriptionFormValues) => {
                if (!id) return;
                setSubmitting(true);
                setError(null);
                try {
                  await updatePrescription(id, values, user?.uid);
                  navigate(doctorsPrescriptionDetailsPath(id));
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Failed to update prescription"
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPrescription;
