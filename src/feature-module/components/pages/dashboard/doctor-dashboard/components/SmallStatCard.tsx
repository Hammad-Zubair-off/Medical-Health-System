interface SmallStatCardProps {
  icon: string;
  iconBgColor: "primary" | "secondary" | "success" | "danger" | "info" | "warning" | "soft-success";
  iconTextColor?: "success";
  title: string;
  value: string | number;
  trendText: string;
  trendColor: "success" | "danger";
}

const SmallStatCard = ({
  icon,
  iconBgColor,
  iconTextColor,
  title,
  value,
  trendText,
  trendColor,
}: SmallStatCardProps) => {
  return (
    <div className="col mb-3 mb-xl-0">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column p-3">
          <span
            className={`avatar bg-${iconBgColor} ${iconTextColor ? `text-${iconTextColor}` : ""} rounded-2 fs-20 d-inline-flex mb-3 flex-shrink-0`}
            style={{ width: "48px", height: "48px" }}
          >
            <i className={`ti ${icon}`} />
          </span>
          <p className="mb-2 fs-13 fw-medium text-dark" style={{ minHeight: "20px", lineHeight: "1.4" }} title={title}>
            {title}
          </p>
          <h3 className="fw-bold mb-2 flex-shrink-0" style={{ fontSize: "1.75rem" }}>{value}</h3>
          <p className={`mb-0 text-${trendColor} fs-12`} style={{ lineHeight: "1.4", wordBreak: "break-word" }} title={trendText}>
            {trendText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmallStatCard;

