import type { FileObjectDoc } from "../../../../../../../core/schemas/file.schema";
import { formatDate } from "../../../../../../../core/utils/display.utils";
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

const FileTable = ({
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
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="thead-light">
          <tr>
            <th>Name</th>
            <th>From</th>
            <th>Size</th>
            <th>Date</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file._id}>
              <td>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-dark p-0 d-flex align-items-center gap-2 text-start"
                  onClick={() => onPreview(file)}
                >
                  <i className={`${iconForFormat(file.format)} text-primary`} />
                  <span className="text-truncate" style={{ maxWidth: 280 }}>
                    {file.fileName}
                  </span>
                </button>
              </td>
              <td>
                <span
                  className={`badge ${fileUploaderBadgeClass(file, viewerUid)}`}
                >
                  {fileUploaderLabel(file, viewerUid)}
                </span>
              </td>
              <td className="text-muted fs-13">{formatBytes(file.sizeBytes)}</td>
              <td className="text-muted fs-13">
                {formatDate(file.uploadedAt)}
              </td>
              <td className="text-end">
                <FileActionsMenu
                  canManage={canManage}
                  onDownload={() => onDownload(file)}
                  onShare={() => onShare(file)}
                  onRename={() => onRename(file)}
                  onMove={() => onMove(file)}
                  onDelete={() => onDelete(file)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;
