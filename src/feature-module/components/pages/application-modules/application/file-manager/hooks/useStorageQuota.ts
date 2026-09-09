import { useCallback, useEffect, useState } from "react";
import { getUserStorageUsage } from "../../../../../../../core/services/firestore/file.service";
import { USER_STORAGE_SOFT_QUOTA_BYTES } from "../../../../../../../core/types/file.types";

export function useStorageQuota(uid: string | null | undefined) {
  const [usedBytes, setUsedBytes] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!uid) {
      setUsedBytes(0);
      return;
    }
    setLoading(true);
    try {
      setUsedBytes(await getUserStorageUsage(uid));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    usedBytes,
    quotaBytes: USER_STORAGE_SOFT_QUOTA_BYTES,
    loading,
    refresh,
  };
}
