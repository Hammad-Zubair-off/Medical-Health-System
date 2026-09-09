import { formatBytes } from "../../../../../../../core/utils/file.utils";

type Props = {
  usedBytes: number;
  quotaBytes: number;
  loading?: boolean;
};

const StorageQuotaBar = ({ usedBytes, quotaBytes, loading }: Props) => {
  const pct = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0;
  const barClass =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-primary";

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fs-13 text-muted">Storage</span>
        <span className="fs-13 fw-medium">
          {loading
            ? "…"
            : `${formatBytes(usedBytes)} of ${formatBytes(quotaBytes)} used`}
        </span>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div
          className={`progress-bar ${barClass}`}
          role="progressbar"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default StorageQuotaBar;
