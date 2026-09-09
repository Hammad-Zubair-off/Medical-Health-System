import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../core/context/AuthContext";
import {
  listFilesForAppointment,
  softDeleteFile,
} from "../../../../../core/services/firestore/file.service";
import { getPatient } from "../../../../../core/services/firestore/patient.service";
import type { FileObjectDoc } from "../../../../../core/schemas/file.schema";
import {
  downloadUrl,
  thumbnailUrl,
} from "../../../../../core/services/storage/cloudinary.service";
import {
  formatBytes,
  iconForFormat,
  isPreviewable,
} from "../../../../../core/utils/file.utils";
import {
  fileUploaderBadgeClass,
  fileUploaderLabel,
} from "../../../../../core/utils/file-uploader.utils";
import { useFileUpload } from "../../application-modules/application/file-manager/hooks/useFileUpload";
import FileUploadZone from "../../application-modules/application/file-manager/components/FileUploadZone";

function refToUid(ref: unknown): string | null {
  if (!ref) return null;
  if (typeof ref === "string") {
    const parts = ref.split("/");
    return parts[parts.length - 1] || ref;
  }
  if (typeof ref === "object" && ref !== null && "id" in ref) {
    return String((ref as { id: string }).id);
  }
  return null;
}

export type AppointmentAttachmentsPanelProps = {
  appointmentId: string;
  /** Auto-share with the counterpart on upload */
  shareWithUid?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
  /** When false, hide upload (read-only list) */
  canUpload?: boolean;
};

/**
 * Attachments for an appointment via FileObject.appointmentId.
 * Uploads auto-populate sharedWith with the counterpart uid.
 */
const AppointmentAttachmentsPanel = ({
  appointmentId,
  shareWithUid: shareWithUidProp,
  patientId,
  doctorId,
  canUpload = true,
}: AppointmentAttachmentsPanelProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileObjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedShareUid, setResolvedShareUid] = useState<string | null>(
    shareWithUidProp ?? null
  );
  const { tasks, enqueue, cancel, clearFinished } = useFileUpload();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (shareWithUidProp) {
        setResolvedShareUid(shareWithUidProp);
        return;
      }
      if (!patientId) {
        setResolvedShareUid(null);
        return;
      }
      try {
        const patient = await getPatient(patientId);
        if (!cancelled) setResolvedShareUid(patient?.userId ?? null);
      } catch {
        if (!cancelled) setResolvedShareUid(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareWithUidProp, patientId]);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setFiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listFilesForAppointment(appointmentId, user.uid, {
        pageSize: 50,
      });
      setFiles(result.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, user?.uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const done = tasks.filter((t) => t.status === "done");
    const failed = tasks.filter((t) => t.status === "error");
    if (done.length === 0 && failed.length === 0) return;

    if (done.length > 0) {
      setSuccess(
        done.length === 1
          ? `"${done[0].file.name}" uploaded.`
          : `${done.length} files uploaded.`
      );
      void refresh();
    }
    if (failed.length > 0) {
      setError(failed.map((t) => t.error || "Upload failed").join(" · "));
    }
    const t = window.setTimeout(() => clearFinished(), 6000);
    return () => window.clearTimeout(t);
  }, [tasks, refresh, clearFinished]);

  const onFiles = async (selected: File[]) => {
    setSuccess(null);
    setError(null);
    if (!resolvedShareUid) {
      setError(
        "Cannot notify the other party: no linked login on this appointment. The file will still save to your My Files."
      );
    }
    await enqueue(selected, {
      appointmentId,
      patientId: patientId ?? null,
      doctorId: doctorId ?? null,
      sharedWith: resolvedShareUid ? [resolvedShareUid] : [],
    });
  };

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h5 className="fw-bold mb-0">Attachments</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {canUpload && user?.uid && (
          <div className="mb-3">
            <FileUploadZone
              tasks={tasks}
              onEnqueue={(f) => void onFiles(f)}
              onCancel={cancel}
              onClearFinished={clearFinished}
            />
            <p className="text-muted fs-13 mb-0 mt-2">
              Files are shared with the other party on this appointment.
            </p>
          </div>
        )}
        {loading ? (
          <p className="text-muted mb-0">Loading attachments…</p>
        ) : files.length === 0 ? (
          <p className="text-muted mb-0">No attachments yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>From</th>
                  <th>Size</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f._id}>
                    <td style={{ width: 48 }}>
                      {isPreviewable(f.format, f.resourceType) &&
                      f.resourceType === "image" ? (
                        <img
                          src={thumbnailUrl(f.publicId, 40, 40)}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      ) : (
                        <i className={`${iconForFormat(f.format)} fs-20`} />
                      )}
                    </td>
                    <td>{f.fileName}</td>
                    <td>
                      <span
                        className={`badge ${fileUploaderBadgeClass(f, user?.uid)}`}
                      >
                        {fileUploaderLabel(f, user?.uid)}
                      </span>
                    </td>
                    <td>{formatBytes(f.sizeBytes)}</td>
                    <td className="text-end">
                      <a
                        className="btn btn-sm btn-outline-primary me-1"
                        href={downloadUrl(f.publicId, f.fileName)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                      {f.ownerUid === user?.uid && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            void softDeleteFile(f._id, user?.uid).then(refresh)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export { refToUid };
export default AppointmentAttachmentsPanel;
