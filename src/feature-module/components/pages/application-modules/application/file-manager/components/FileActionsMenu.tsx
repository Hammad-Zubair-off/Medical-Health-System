type Props = {
  canManage?: boolean;
  onDownload: () => void;
  onShare: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
};

const FileActionsMenu = ({
  canManage = true,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDelete,
}: Props) => {
  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-sm btn-icon btn-white border"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="File actions"
      >
        <i className="ti ti-dots-vertical" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        <li>
          <button type="button" className="dropdown-item" onClick={onDownload}>
            <i className="ti ti-download me-2" />
            Download
          </button>
        </li>
        {canManage && (
          <>
            <li>
              <button type="button" className="dropdown-item" onClick={onShare}>
                <i className="ti ti-share me-2" />
                Share
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={onRename}>
                <i className="ti ti-pencil me-2" />
                Rename
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={onMove}>
                <i className="ti ti-folder-symlink me-2" />
                Move
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={onDelete}
              >
                <i className="ti ti-trash me-2" />
                Delete
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default FileActionsMenu;
