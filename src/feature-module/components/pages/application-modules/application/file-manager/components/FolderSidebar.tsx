import { useState } from "react";
import { Link } from "react-router";
import type { FileFolderDoc } from "../../../../../../../core/schemas/file.schema";
import type { FilesTab } from "../hooks/useFiles";
import {
  all_routes,
  fileManagerFolderPath,
} from "../../../../../../routes/all_routes";
import StorageQuotaBar from "./StorageQuotaBar";

type Props = {
  tab: FilesTab;
  onTabChange: (tab: FilesTab) => void;
  folders: FileFolderDoc[];
  activeFolderId: string | null;
  usedBytes: number;
  quotaBytes: number;
  quotaLoading?: boolean;
  onCreateFolder: (name: string) => Promise<void>;
};

const TABS: { id: FilesTab; label: string; icon: string }[] = [
  { id: "mine", label: "My Files", icon: "ti ti-folder" },
  { id: "shared", label: "Shared with me", icon: "ti ti-share" },
  { id: "appointments", label: "Appointment files", icon: "ti ti-calendar" },
];

const FolderSidebar = ({
  tab,
  onTabChange,
  folders,
  activeFolderId,
  usedBytes,
  quotaBytes,
  quotaLoading,
  onCreateFolder,
}: Props) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFolder = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a folder name");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreateFolder(trimmed);
      setName("");
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create folder");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card border shadow-none h-100">
      <div className="card-body">
        <StorageQuotaBar
          usedBytes={usedBytes}
          quotaBytes={quotaBytes}
          loading={quotaLoading}
        />

        <ul className="nav flex-column gap-1 mb-3">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`btn w-100 text-start ${
                  tab === t.id && !activeFolderId
                    ? "btn-primary"
                    : "btn-outline-light text-dark border"
                }`}
                onClick={() => onTabChange(t.id)}
              >
                <i className={`${t.icon} me-2`} />
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {tab === "mine" && (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fs-14 mb-0">Folders</h6>
              <button
                type="button"
                className="btn btn-sm btn-link p-0"
                onClick={() => setCreating((v) => !v)}
                title="New folder"
              >
                <i className="ti ti-folder-plus" />
              </button>
            </div>

            {creating && (
              <div className="mb-3">
                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="Folder name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submitFolder();
                  }}
                />
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={busy}
                    onClick={() => void submitFolder()}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() => {
                      setCreating(false);
                      setName("");
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {error && <div className="fs-12 text-danger mt-1">{error}</div>}
              </div>
            )}

            <ul className="list-unstyled mb-0">
              <li className="mb-1">
                <Link
                  to={all_routes.fileManager}
                  className={`d-flex align-items-center gap-2 px-2 py-1 rounded text-decoration-none ${
                    !activeFolderId ? "bg-light fw-medium text-primary" : "text-dark"
                  }`}
                >
                  <i className="ti ti-files" />
                  All files
                </Link>
              </li>
              {folders.map((folder) => (
                <li key={folder._id} className="mb-1">
                  <Link
                    to={fileManagerFolderPath(folder._id)}
                    className={`d-flex align-items-center gap-2 px-2 py-1 rounded text-decoration-none ${
                      activeFolderId === folder._id
                        ? "bg-light fw-medium text-primary"
                        : "text-dark"
                    }`}
                  >
                    <i className="ti ti-folder" />
                    <span className="text-truncate">{folder.name}</span>
                  </Link>
                </li>
              ))}
              {!folders.length && (
                <li className="fs-12 text-muted px-2">No folders yet</li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default FolderSidebar;
