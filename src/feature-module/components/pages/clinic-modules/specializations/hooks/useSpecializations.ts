import { useCallback, useEffect, useState } from "react";
import {
  createSpecialization,
  listSpecializations,
  updateSpecialization,
} from "../../../../../../core/services/firestore/specialization.service";
import type { SpecializationFormValues } from "../../../../../../core/types/specialization.types";
import type { SpecializationDoc } from "../../../../../../core/schemas/specialization.schema";
import { useAuth } from "../../../../../../core/context/AuthContext";

export function useSpecializations() {
  const { user } = useAuth();
  const [specializations, setSpecializations] = useState<SpecializationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listSpecializations(false);
      setSpecializations(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specializations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addSpecialization = useCallback(
    async (values: SpecializationFormValues) => {
      setSubmitting(true);
      try {
        await createSpecialization(values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const saveSpecialization = useCallback(
    async (id: string, values: SpecializationFormValues) => {
      setSubmitting(true);
      try {
        await updateSpecialization(id, values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  return {
    specializations,
    loading,
    error,
    submitting,
    refresh,
    addSpecialization,
    saveSpecialization,
  };
}
