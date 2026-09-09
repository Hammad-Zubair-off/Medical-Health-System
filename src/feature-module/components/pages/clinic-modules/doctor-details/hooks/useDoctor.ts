import { useCallback, useEffect, useState } from "react";
import {
  createDoctor as createDoctorService,
  getDoctorData,
  updateDoctor as updateDoctorService,
  type CreateDoctorFormValues,
  type DoctorData,
  type DoctorProfileFormValues,
} from "../../../../../../core/services/firestore/doctor.service";
import { provisionLoginAccount } from "../../../../../../core/services/auth/auth.service";
import { useAuth } from "../../../../../../core/context/AuthContext";

export interface UseDoctorReturn {
  doctor: DoctorData | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refresh: () => Promise<void>;
}

/** Load a single doctor by `Doctor/{id}` (the route `:id`, not the userid ref). */
export function useDoctor(id: string | undefined): UseDoctorReturn {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchDoctor = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await getDoctorData(id);
      if (!result) {
        setNotFound(true);
        setDoctor(null);
      } else {
        setDoctor(result);
      }
    } catch (err) {
      console.error("Error loading doctor:", err);
      setError(err instanceof Error ? err.message : "Failed to load doctor");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDoctor();
  }, [fetchDoctor]);

  return { doctor, loading, error, notFound, refresh: fetchDoctor };
}

export interface CreateDoctorWithLoginValues extends DoctorProfileFormValues {
  uid: string;
  password: string;
  confirmPassword: string;
}

export function useDoctorForm() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDoctor = useCallback(
    async (values: CreateDoctorWithLoginValues) => {
      setSubmitting(true);
      setError(null);
      try {
        let uid = values.uid.trim();
        if (!uid) {
          uid = await provisionLoginAccount({
            email: values.email,
            password: values.password,
            displayName: values.displayName,
            phoneNumber: values.phoneNumber || null,
            role: "doctor",
          });
        }

        const payload: CreateDoctorFormValues = {
          displayName: values.displayName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          specializationId: values.specializationId,
          qualifications: values.qualifications,
          experienceYears: values.experienceYears,
          consultationFee: values.consultationFee,
          bio: values.bio,
          status: values.status,
          uid,
        };
        return await createDoctorService(payload, user?.uid);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create doctor");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.uid]
  );

  const updateDoctor = useCallback(
    async (id: string, values: DoctorProfileFormValues) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateDoctorService(id, values, user?.uid);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update doctor");
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.uid]
  );

  return { submitting, error, createDoctor, updateDoctor };
}
