import { useEffect, useState } from "react";
import type { FileObjectDoc } from "../../../../../../../core/schemas/file.schema";
import { updateFile } from "../../../../../../../core/services/firestore/file.service";
import {
  listShareRecipients,
  type ShareRecipient,
} from "../shareRecipients";

type Props = {
  file: FileObjectDoc | null;
  role: string | null | undefined;
  uid: string;
  onClose: () => void;
  onShared: () => void;
};

const ShareFileModal = ({ file, role, uid, onClose, onShared }: Props) => {
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelected("");
    void listShareRecipients({ role, uid })
      .then((list) => {
        if (!cancelled) setRecipients(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load recipients");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, role, uid]);

  if (!file) return null;

  const handleShare = async () => {
    if (!selected) {
      setError("Select a recipient");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = Array.from(new Set([...(file.sharedWith || []), selected]));
      await updateFile(file._id, { sharedWith: next }, uid);
      onShared();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Share file</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <p className="fs-13 text-muted mb-3 text-truncate">
                Sharing <strong>{file.fileName}</strong>
              </p>
              {loading ? (
                <p className="text-muted mb-0">Loading recipients…</p>
              ) : recipients.length === 0 ? (
                <p className="text-muted mb-0">
                  No share recipients from your appointments yet.
                </p>
              ) : (
                <div className="mb-0">
                  <label className="form-label" htmlFor="share-recipient">
                    Recipient
                  </label>
                  <select
                    id="share-recipient"
                    className="form-select"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {recipients.map((r) => (
                      <option key={r.uid} value={r.uid}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {error && <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || loading || !selected}
                onClick={() => void handleShare()}
              >
                {saving ? "Sharing…" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
};

export default ShareFileModal;
