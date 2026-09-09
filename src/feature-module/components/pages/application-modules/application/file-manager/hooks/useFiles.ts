import { useCallback, useEffect, useState } from "react";
import {
  listFiles,
  listSharedWithMe,
} from "../../../../../../../core/services/firestore/file.service";
import type { FileObjectDoc } from "../../../../../../../core/schemas/file.schema";

export type FilesTab = "mine" | "shared" | "appointments";

export function useFiles(opts: {
  uid: string | null | undefined;
  tab: FilesTab;
  folderId?: string | null;
}) {
  const { uid, tab, folderId = null } = opts;
  const [files, setFiles] = useState<FileObjectDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (append: boolean) => {
      if (!uid) {
        setFiles([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result =
          tab === "shared"
            ? await listSharedWithMe(uid, {
                pageSize: 24,
                cursor: append ? cursor : null,
              })
            : await listFiles({
                ownerUid: uid,
                folderId: tab === "mine" ? folderId : null,
                pageSize: 24,
                cursor: append ? cursor : null,
              });

        let nextFiles = result.files;
        if (tab === "appointments") {
          nextFiles = nextFiles.filter((f) => Boolean(f.appointmentId));
        }

        setFiles((prev) => (append ? [...prev, ...nextFiles] : nextFiles));
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, tab, folderId, cursor]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, tab, folderId]);

  return {
    files,
    loading,
    error,
    hasMore,
    loadMore: async () => {
      if (!hasMore || loading) return;
      await fetchPage(true);
    },
    refresh: async () => {
      setCursor(null);
      await fetchPage(false);
    },
  };
}
