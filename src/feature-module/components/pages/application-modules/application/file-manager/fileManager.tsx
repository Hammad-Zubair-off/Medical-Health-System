import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  softDeleteFile,
  updateFile,
} from "../../../../../../core/services/firestore/file.service";
import { downloadUrl } from "../../../../../../core/services/storage/cloudinary.service";
import type { FileObjectDoc } from "../../../../../../core/schemas/file.schema";
import { all_routes } from "../../../../../routes/all_routes";
import FileGrid from "./components/FileGrid";
import FilePreviewModal from "./components/FilePreviewModal";
import FileTable from "./components/FileTable";
import FileUploadZone from "./components/FileUploadZone";
import FolderSidebar from "./components/FolderSidebar";
import ShareFileModal from "./components/ShareFileModal";
import { useFileUpload } from "./hooks/useFileUpload";
import { useFiles, type FilesTab } from "./hooks/useFiles";
import { useFolders } from "./hooks/useFolders";
import { useStorageQuota } from "./hooks/useStorageQuota";

type ViewMode = "grid" | "list";

const FileManager = () => {
  const { user, role } = useAuth();
  const uid = user?.uid ?? null;
  const { folderId: folderIdParam } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<FilesTab>("mine");
  const [view, setView] = useState<ViewMode>("grid");
  const activeFolderId = tab === "mine" ? folderIdParam ?? null : null;

  const { files, loading, error, hasMore, loadMore, refresh } = useFiles({
    uid,
    tab,
    folderId: activeFolderId,
  });
  const foldersApi = useFolders(uid);
  const quota = useStorageQuota(uid);
  const upload = useFileUpload();

  const [preview, setPreview] = useState<FileObjectDoc | null>(null);
  const [shareTarget, setShareTarget] = useState<FileObjectDoc | null>(null);

  useEffect(() => {
    if (folderIdParam) setTab("mine");
  }, [folderIdParam]);

  useEffect(() => {
    const done = upload.tasks.some((t) => t.status === "done");
    if (done) {
      void refresh();
      void quota.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload.tasks]);

  const canManage = tab === "mine";

  const handleTabChange = (next: FilesTab) => {
    setTab(next);
    if (folderIdParam) navigate(all_routes.fileManager);
  };

  const handleDownload = (file: FileObjectDoc) => {
    window.open(
      downloadUrl(file.publicId, file.fileName),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleRename = async (file: FileObjectDoc) => {
    const next = window.prompt("Rename file", file.fileName);
    if (!next || !next.trim() || next.trim() === file.fileName) return;
    await updateFile(file._id, { fileName: next.trim() }, uid);
    await refresh();
  };

  const handleMove = async (file: FileObjectDoc) => {
    if (!foldersApi.folders.length) {
      window.alert("Create a folder first.");
      return;
    }
    const options = foldersApi.folders
      .map((f, i) => `${i + 1}. ${f.name}`)
      .join("\n");
    const pick = window.prompt(
      `Move to folder (number), or 0 for root:\n${options}`,
      "0"
    );
    if (pick === null) return;
    const n = Number(pick);
    if (!Number.isFinite(n) || n < 0 || n > foldersApi.folders.length) return;
    const folderId = n === 0 ? null : foldersApi.folders[n - 1]._id;
    await updateFile(file._id, { folderId }, uid);
    await refresh();
  };

  const handleDelete = async (file: FileObjectDoc) => {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return;
    await softDeleteFile(file._id, uid);
    await refresh();
    void quota.refresh();
  };

  const fileActions = {
    onPreview: setPreview,
    onDownload: handleDownload,
    onShare: setShareTarget,
    onRename: (f: FileObjectDoc) => void handleRename(f),
    onMove: (f: FileObjectDoc) => void handleMove(f),
    onDelete: (f: FileObjectDoc) => void handleDelete(f),
  };

  const title =
    tab === "shared"
      ? "Shared with me"
      : tab === "appointments"
        ? "Appointment files"
        : activeFolderId
          ? foldersApi.folders.find((f) => f._id === activeFolderId)?.name ||
            "Folder"
          : "My Files";

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3">
          <div className="flex-grow-1">
            <h4 className="fs-18 fw-semibold mb-0">File Manager</h4>
          </div>
          {activeFolderId && (
            <button
              type="button"
              className="btn btn-outline-light border"
              onClick={() => navigate(all_routes.fileManager)}
            >
              <i className="ti ti-arrow-left me-1" />
              All files
            </button>
          )}
        </div>

        <div className="row">
          <div className="col-xl-3 col-lg-4 mb-3 mb-lg-0">
            <FolderSidebar
              tab={tab}
              onTabChange={handleTabChange}
              folders={foldersApi.folders}
              activeFolderId={activeFolderId}
              usedBytes={quota.usedBytes}
              quotaBytes={quota.quotaBytes}
              quotaLoading={quota.loading}
              onCreateFolder={async (name) => {
                await foldersApi.create(name);
              }}
            />
          </div>

          <div className="col-xl-9 col-lg-8">
            <div className="card border shadow-none">
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <h5 className="mb-0">{title}</h5>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-outline-light border"}`}
                      onClick={() => setView("grid")}
                      title="Grid view"
                    >
                      <i className="ti ti-layout-grid" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-outline-light border"}`}
                      onClick={() => setView("list")}
                      title="List view"
                    >
                      <i className="ti ti-list" />
                    </button>
                  </div>
                </div>

                {tab === "mine" && (
                  <FileUploadZone
                    tasks={upload.tasks}
                    disabled={!uid}
                    onEnqueue={(fileList) => {
                      void upload.enqueue(fileList, {
                        folderId: activeFolderId,
                      });
                    }}
                    onCancel={upload.cancel}
                    onClearFinished={upload.clearFinished}
                  />
                )}

                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}
                {loading && !files.length ? (
                  <div className="text-center text-muted py-5">Loading…</div>
                ) : view === "grid" ? (
                  <FileGrid
                    files={files}
                    viewerUid={uid}
                    canManage={canManage}
                    {...fileActions}
                  />
                ) : (
                  <FileTable
                    files={files}
                    viewerUid={uid}
                    canManage={canManage}
                    {...fileActions}
                  />
                )}

                {hasMore && (
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      disabled={loading}
                      onClick={() => void loadMore()}
                    >
                      {loading ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
      {uid && (
        <ShareFileModal
          file={shareTarget}
          role={role}
          uid={uid}
          onClose={() => setShareTarget(null)}
          onShared={() => void refresh()}
        />
      )}
    </div>
  );
};

export default FileManager;
