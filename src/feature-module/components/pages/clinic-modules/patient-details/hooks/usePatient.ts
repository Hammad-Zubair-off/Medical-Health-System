import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  createPatient as createPatientService,
  getPatient,
  updatePatient as updatePatientService,
} from "../../../../../../core/services/firestore/patient.service";
import type { PatientFormValues } from "../../../../../../core/types/patient.types";
import type { PatientDoc } from "../../../../../../core/schemas/patient.schema";

export interface UsePatientReturn {
  patient: PatientDoc | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refresh: () => Promise<void>;
}

/** Load a single patient by `Patient/{id}`. `id` may be null while a route is resolving. */
export function usePatient(id: string | undefined): UsePatientReturn {
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchPatient = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await getPatient(id);
      if (!result) {
        setNotFound(true);
        setPatient(null);
      } else {
        setPatient(result as unknown as PatientDoc);
      }
    } catch (err) {
      console.error("Error loading patient:", err);
      setError(err instanceof Error ? err.message : "Failed to load patient");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchPatient();
  }, [fetchPatient]);

  return { patient, loading, error, notFound, refresh: fetchPatient };
}

export interface UsePatientFormReturn {
  submitting: boolean;
  error: string | null;
  createPatient: (values: PatientFormValues) => Promise<string>;
  updatePatient: (id: string, values: PatientFormValues) => Promise<void>;
}

/** Create/update actions for the patient form screens. */
export function usePatientForm(): UsePatientFormReturn {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = useCallback(
    async (values: PatientFormValues) => {
      setSubmitting(true);
      setError(null);
      try {
        return await createPatientService(values, user?.uid);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create patient");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.uid]
  );

  const updatePatient = useCallback(
    async (id: string, values: PatientFormValues) => {
      setSubmitting(true);
      setError(null);
      try {
        await updatePatientService(id, values, user?.uid);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update patient");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.uid]
  );

  return { submitting, error, createPatient, updatePatient };
}
