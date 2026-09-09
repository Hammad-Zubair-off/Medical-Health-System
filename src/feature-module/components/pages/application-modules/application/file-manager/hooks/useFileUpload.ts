import { useCallback, useRef, useState } from "react";
import { useAuth } from "../../../../../../../core/context/AuthContext";
import { uploadToCloudinary } from "../../../../../../../core/services/storage/cloudinary.service";
import {
  createFileObject,
  getUserStorageUsage,
} from "../../../../../../../core/services/firestore/file.service";
import {
  validateUploadClientSide,
} from "../../../../../../../core/utils/file.utils";
import {
  USER_STORAGE_SOFT_QUOTA_BYTES,
  type FileOwnerRole,
  type UploadTask,
} from "../../../../../../../core/types/file.types";

export type UploadMeta = {
  folderId?: string | null;
  appointmentId?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
  sharedWith?: string[];
  description?: string | null;
};

function newId() {
  return `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useFileUpload() {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const updateTask = (id: string, patch: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const enqueue = useCallback(
    async (files: File[], meta: UploadMeta = {}) => {
      if (!user?.uid) throw new Error("Sign in to upload");
      const ownerRole = (role || "patient") as FileOwnerRole;

      const usage = await getUserStorageUsage(user.uid);
      let projected = usage;

      for (const file of files) {
        // UX-only — Cloudinary preset enforces type/size for real.
        const clientErr = validateUploadClientSide(file);
        const id = newId();
        if (clientErr) {
          setTasks((prev) => [
            ...prev,
            {
              id,
              file,
              progress: 0,
              status: "error",
              error: clientErr,
            },
          ]);
          continue;
        }
        if (projected + file.size > USER_STORAGE_SOFT_QUOTA_BYTES) {
          setTasks((prev) => [
            ...prev,
            {
              id,
              file,
              progress: 0,
              status: "error",
              error: "Storage soft quota (200 MB) would be exceeded.",
            },
          ]);
          continue;
        }
        projected += file.size;
        setTasks((prev) => [
          ...prev,
          { id, file, progress: 0, status: "queued" },
        ]);

        const ac = new AbortController();
        controllers.current.set(id, ac);
        updateTask(id, { status: "uploading", progress: 0 });

        try {
          const uploaded = await uploadToCloudinary(file, {
            signal: ac.signal,
            onProgress: (p) => updateTask(id, { progress: p }),
          });
          updateTask(id, { status: "saving", progress: 100 });
          try {
            const fileObjectId = await createFileObject(
              {
                fileName: file.name,
                publicId: uploaded.publicId,
                secureUrl: uploaded.secureUrl,
                resourceType: uploaded.resourceType,
                format: uploaded.format || file.name.split(".").pop() || "",
                contentType: file.type || "application/octet-stream",
                sizeBytes: Math.floor(Number(uploaded.bytes)) || file.size,
                width: uploaded.width,
                height: uploaded.height,
                ownerUid: user.uid,
                ownerRole,
                sharedWith: meta.sharedWith ?? [],
                folderId: meta.folderId ?? null,
                appointmentId: meta.appointmentId ?? null,
                patientId: meta.patientId ?? null,
                doctorId: meta.doctorId ?? null,
                description: meta.description ?? null,
              },
              user.uid
            );
            updateTask(id, { status: "done", fileObjectId });
          } catch (err) {
            // Upload succeeded but metadata failed — orphaned publicId.
            console.error(
              "[file-upload] orphaned Cloudinary asset",
              uploaded.publicId,
              err
            );
            updateTask(id, {
              status: "error",
              error:
                err instanceof Error
                  ? `Uploaded but failed to save metadata: ${err.message}`
                  : "Uploaded but failed to save metadata",
            });
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            updateTask(id, { status: "cancelled", error: "Cancelled" });
          } else {
            updateTask(id, {
              status: "error",
              error: err instanceof Error ? err.message : "Upload failed",
            });
          }
        } finally {
          controllers.current.delete(id);
        }
      }
    },
    [user?.uid, role]
  );

  const cancel = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
  }, []);

  const clearFinished = useCallback(() => {
    setTasks((prev) =>
      prev.filter((t) => t.status === "uploading" || t.status === "saving" || t.status === "queued")
    );
  }, []);

  return { tasks, enqueue, cancel, clearFinished };
}
