import { useCallback, useEffect, useState } from "react";
import {
  createFolder,
  listFolders,
  renameFolder,
  softDeleteFolder,
} from "../../../../../../../core/services/firestore/file.service";
import type { FileFolderDoc } from "../../../../../../../core/schemas/file.schema";

export function useFolders(ownerUid: string | null | undefined) {
  const [folders, setFolders] = useState<FileFolderDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ownerUid) {
      setFolders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setFolders(await listFolders(ownerUid));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [ownerUid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    folders,
    loading,
    error,
    refresh,
    create: async (name: string) => {
      if (!ownerUid) throw new Error("Sign in required");
      await createFolder({ name, ownerUid }, ownerUid);
      await refresh();
    },
    rename: async (id: string, name: string) => {
      await renameFolder(id, name, ownerUid);
      await refresh();
    },
    remove: async (id: string) => {
      await softDeleteFolder(id, ownerUid);
      await refresh();
    },
  };
}
