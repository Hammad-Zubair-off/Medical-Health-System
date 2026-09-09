import type { FileObjectDoc } from "../../../../../../../core/schemas/file.schema";
import { downloadUrl } from "../../../../../../../core/services/storage/cloudinary.service";
import { isPreviewable } from "../../../../../../../core/utils/file.utils";

type Props = {
  file: FileObjectDoc | null;
  onClose: () => void;
};

const FilePreviewModal = ({ file, onClose }: Props) => {
  if (!file) return null;

  const format = (file.format || "").toLowerCase();
  const previewable = isPreviewable(format, file.resourceType);
  const isImage =
    file.resourceType === "image" ||
    ["jpg", "jpeg", "png", "webp", "gif"].includes(format);
  const isPdf = format === "pdf";

  const handleDownload = () => {
    const url = downloadUrl(file.publicId, file.fileName);
    window.open(url, "_blank", "noopener,noreferrer");
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
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-truncate">{file.fileName}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              {isImage && file.secureUrl ? (
                <img
                  src={file.secureUrl}
                  alt={file.fileName}
                  className="img-fluid rounded w-100"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
              ) : isPdf && file.secureUrl ? (
                <iframe
                  title={file.fileName}
                  src={file.secureUrl}
                  className="w-100 border-0 rounded"
                  style={{ height: "70vh" }}
                />
              ) : (
                <div className="text-center py-5">
                  <i className="ti ti-file-download fs-48 text-muted d-block mb-3" />
                  <p className="mb-3">
                    {previewable
                      ? "Preview unavailable."
                      : "This file type cannot be previewed in the browser."}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownload}
                  >
                    <i className="ti ti-download me-1" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleDownload}
              >
                <i className="ti ti-download me-1" />
                Download
              </button>
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
};

export default FilePreviewModal;
