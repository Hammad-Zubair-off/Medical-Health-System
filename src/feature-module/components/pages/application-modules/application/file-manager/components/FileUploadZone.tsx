import { useCallback, useRef, useState } from "react";
import type { UploadTask } from "../../../../../../../core/types/file.types";
import { formatBytes } from "../../../../../../../core/utils/file.utils";

type Props = {
  tasks: UploadTask[];
  onEnqueue: (files: File[]) => void;
  onCancel: (id: string) => void;
  onClearFinished?: () => void;
  disabled?: boolean;
};

const FileUploadZone = ({
  tasks,
  onEnqueue,
  onCancel,
  onClearFinished,
  disabled,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const takeFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || disabled) return;
      const files = Array.from(list);
      if (files.length) onEnqueue(files);
    },
    [disabled, onEnqueue]
  );

  const active = tasks.filter(
    (t) =>
      t.status === "queued" ||
      t.status === "uploading" ||
      t.status === "saving"
  );
  const finished = tasks.filter(
    (t) =>
      t.status === "done" || t.status === "error" || t.status === "cancelled"
  );

  return (
    <div className="mb-3">
      <div
        className={`border rounded p-4 text-center ${
          dragging ? "border-primary bg-primary bg-opacity-10" : "bg-light"
        } ${disabled ? "opacity-50" : ""}`}
        style={{ borderStyle: "dashed", cursor: disabled ? "not-allowed" : "pointer" }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          takeFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <i className="ti ti-cloud-upload fs-24 text-primary d-block mb-2" />
        <p className="mb-1 fw-medium">Drag & drop files here, or click to browse</p>
        <p className="fs-12 text-muted mb-0">
          PDF, JPG, PNG, WEBP, DOCX — max 10 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          className="d-none"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={disabled}
          onChange={(e) => {
            takeFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {tasks.length > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fs-13 fw-medium">
              Uploads ({active.length} active)
            </span>
            {finished.length > 0 && onClearFinished && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClearFinished}
              >
                Clear finished
              </button>
            )}
          </div>
          <ul className="list-group list-group-flush">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="list-group-item px-0 d-flex align-items-center gap-2"
              >
                <i
                  className={`ti ${
                    task.status === "done"
                      ? "ti-circle-check text-success"
                      : task.status === "error" || task.status === "cancelled"
                        ? "ti-alert-circle text-danger"
                        : "ti-loader"
                  }`}
                />
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-truncate fs-13">{task.file.name}</span>
                    <span className="fs-12 text-muted text-nowrap">
                      {formatBytes(task.file.size)}
                    </span>
                  </div>
                  {(task.status === "uploading" || task.status === "saving") && (
                    <div className="progress mt-1" style={{ height: 4 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  {task.error && (
                    <div className="fs-12 text-danger mt-1">{task.error}</div>
                  )}
                  {task.status === "saving" && (
                    <div className="fs-12 text-muted mt-1">Saving…</div>
                  )}
                </div>
                {(task.status === "uploading" || task.status === "queued") && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => onCancel(task.id)}
                    title="Cancel"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
