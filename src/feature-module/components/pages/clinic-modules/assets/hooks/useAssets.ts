import { useCallback, useEffect, useState } from "react";
import {
  createAsset,
  listAssets,
  setAssetStatus,
  updateAsset,
} from "../../../../../../core/services/firestore/asset.service";
import type { AssetFormValues } from "../../../../../../core/types/asset.types";
import type { AssetDoc } from "../../../../../../core/schemas/asset.schema";
import { useAuth } from "../../../../../../core/context/AuthContext";

export function useAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<AssetDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAssets({ pageSize: 100 });
      setAssets(result.assets as unknown as AssetDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addAsset = useCallback(
    async (values: AssetFormValues) => {
      setSubmitting(true);
      try {
        await createAsset(values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const saveAsset = useCallback(
    async (id: string, values: AssetFormValues) => {
      setSubmitting(true);
      try {
        await updateAsset(id, values, user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  const deactivateAsset = useCallback(
    async (id: string) => {
      setSubmitting(true);
      try {
        await setAssetStatus(id, "inactive", user?.uid);
        await refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, user?.uid]
  );

  return {
    assets,
    loading,
    error,
    submitting,
    refresh,
    addAsset,
    saveAsset,
    deactivateAsset,
  };
}
