import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  all_routes,
  invoicesDetailsPath,
} from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import { listPatients } from "../../../../../core/services/firestore/patient.service";
import { listDoctors } from "../../../../../core/services/firestore/doctor.service";
import { createInvoice } from "../../../../../core/services/firestore/invoice.service";
import type { InvoiceFormValues } from "../../../../../core/types/invoice.types";
import InvoiceForm, { type SelectOption } from "../shared/InvoiceForm";

const AddInvoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientOptions, setPatientOptions] = useState<SelectOption[]>([]);
  const [doctorOptions, setDoctorOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [patientsResult, doctorsResult] = await Promise.all([
          listPatients({ pageSize: 50, status: "active" }),
          listDoctors({ pageSize: 50, status: "active" }),
        ]);
        if (cancelled) return;
        setPatientOptions(
          patientsResult.patients
            .map((p) => ({
              value: p._id ?? "",
              label: p.displayName || p.email || "Patient",
            }))
            .filter((o) => o.value)
        );
        setDoctorOptions(
          doctorsResult.doctors
            .map((d) => ({
              value: d._id ?? "",
              label: d.displayName || d.email || "Doctor",
            }))
            .filter((o) => o.value)
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load form options"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (values: InvoiceFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const id = await createInvoice({
        values,
        actorUid: user?.uid ?? null,
      });
      navigate(invoicesDetailsPath(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3">
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-0 d-flex align-items-center">
              <Link to={all_routes.invoices} className="">
                <i className="ti ti-chevron-left me-1 fs-14" />
                Invoices
              </Link>
            </h6>
          </div>
        </div>
        <InvoiceForm
          submitting={submitting}
          error={error}
          patientOptions={patientOptions}
          doctorOptions={doctorOptions}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="footer text-center bg-white p-2 border-top">
        <p className="text-dark mb-0">
          2025 ©{" "}
          <Link to="#" className="link-primary">
            Doctoury
          </Link>
          , All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default AddInvoices;
