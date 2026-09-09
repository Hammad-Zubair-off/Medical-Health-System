import { useCallback, useEffect, useState } from "react";
import {
  createService,
  listServices,
  setServiceStatus,
  updateService,
} from "../../../../../../core/services/firestore/service.service";
import type { ServiceFormValues } from "../../../../../../core/types/service.types";
import type { ServiceDoc } from "../../../../../../core/schemas/service.schema";
import { useAuth } from "../../../../../../core/context/AuthContext";

export function useServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listServices({ pageSize: 100 });
      setServices(result.services as unknown as ServiceDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addService = useCallback(
    async (values: ServiceFormValues) => {
      setSubmitting(true);
      try {
        await createService(values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const saveService = useCallback(
    async (id: string, values: ServiceFormValues) => {
      setSubmitting(true);
      try {
        await updateService(id, values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const deactivateService = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await setServiceStatus(id, "inactive", user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  return {
    services,
    loading,
    error,
    submitting,
    refresh,
    addService,
    saveService,
    deactivateService,
  };
}
