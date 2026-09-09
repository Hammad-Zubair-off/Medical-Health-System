import { useCallback, useEffect, useState } from "react";
import {
  createLocation,
  listLocations,
  setLocationStatus,
  updateLocation,
} from "../../../../../../core/services/firestore/location.service";
import type { LocationFormValues } from "../../../../../../core/types/location.types";
import type { LocationDoc } from "../../../../../../core/schemas/location.schema";
import { useAuth } from "../../../../../../core/context/AuthContext";

export function useLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listLocations({ pageSize: 100 });
      setLocations(result.locations as unknown as LocationDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addLocation = useCallback(
    async (values: LocationFormValues) => {
      setSubmitting(true);
      try {
        await createLocation(values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const saveLocation = useCallback(
    async (id: string, values: LocationFormValues) => {
      setSubmitting(true);
      try {
        await updateLocation(id, values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const deactivateLocation = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await setLocationStatus(id, "inactive", user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  return {
    locations,
    loading,
    error,
    submitting,
    refresh,
    addLocation,
    saveLocation,
    deactivateLocation,
  };
}
