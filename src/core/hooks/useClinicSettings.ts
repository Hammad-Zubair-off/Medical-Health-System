import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ClinicSettingsDoc } from "../schemas/clinic-settings.schema";
import type { ClinicSettingsUpdate } from "../types/clinic-settings.types";
import {
  getClinicSettings,
  updateClinicSettings,
} from "../services/firestore/clinic-settings.service";

export function useClinicSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClinicSettingsDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSettings(await getClinicSettings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clinic settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (patch: ClinicSettingsUpdate) => {
      setSaving(true);
      setError(null);
      try {
        const next = await updateClinicSettings(patch, user?.uid);
        setSettings(next);
        return next;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save clinic settings";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid]
  );

  return { settings, loading, saving, error, refresh, save };
}
