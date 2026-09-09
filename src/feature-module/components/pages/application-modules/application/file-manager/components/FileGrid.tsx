import type { FileObjectDoc } from "../../../../../../../core/schemas/file.schema";
import { thumbnailUrl } from "../../../../../../../core/services/storage/cloudinary.service";
import {
  formatBytes,
  iconForFormat,
} from "../../../../../../../core/utils/file.utils";
import {
  fileUploaderBadgeClass,
  fileUploaderLabel,
} from "../../../../../../../core/utils/file-uploader.utils";
import FileActionsMenu from "./FileActionsMenu";

type Props = {
  files: FileObjectDoc[];
  viewerUid?: string | null;
  canManage?: boolean;
  onPreview: (file: FileObjectDoc) => void;
  onDownload: (file: FileObjectDoc) => void;
  onShare: (file: FileObjectDoc) => void;
  onRename: (file: FileObjectDoc) => void;
  onMove: (file: FileObjectDoc) => void;
  onDelete: (file: FileObjectDoc) => void;
};

const FileGrid = ({
  files,
  viewerUid,
  canManage = true,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDelete,
}: Props) => {
  if (!files.length) {
    return (
      <div className="text-center text-muted py-5">
        <i className="ti ti-folder-off fs-32 d-block mb-2" />
        No files here yet
      </div>
    );
  }

  return (
    <div className="row g-3">
      {files.map((file) => {
        const isImage =
          file.resourceType === "image" ||
          ["jpg", "jpeg", "png", "webp", "gif"].includes(
            (file.format || "").toLowerCase()
          );
        return (
          <div key={file._id} className="col-6 col-md-4 col-xl-3">
            <div className="card h-100 shadow-none border">
              <div
                className="card-body p-3"
                role="button"
                tabIndex={0}
                onClick={() => onPreview(file)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPreview(file);
                  }
                }}
              >
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center mb-2 overflow-hidden"
                  style={{ height: 120 }}
                >
                  {isImage && file.publicId ? (
                    <img
                      src={thumbnailUrl(file.publicId)}
                      alt={file.fileName}
                      className="img-fluid"
                      style={{ maxHeight: 120, objectFit: "cover", width: "100%" }}
                    />
                  ) : (
                    <i
                      className={`${iconForFormat(file.format)} fs-36 text-primary`}
                    />
                  )}
                </div>
                <div className="d-flex align-items-start justify-content-between gap-1">
                  <div className="min-w-0">
                    <h6
                      className="fs-13 fw-medium mb-0 text-truncate"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </h6>
                    <span
                      className={`badge ${fileUploaderBadgeClass(file, viewerUid)} mt-1`}
                    >
                      {fileUploaderLabel(file, viewerUid)}
                    </span>
                    <div className="fs-12 text-muted mt-1">
                      {formatBytes(file.sizeBytes)}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FileActionsMenu
                      canManage={canManage}
                      onDownload={() => onDownload(file)}
                      onShare={() => onShare(file)}
                      onRename={() => onRename(file)}
                      onMove={() => onMove(file)}
                      onDelete={() => onDelete(file)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileGrid;
