import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  badgeText: string;
  badgeColor: "success" | "danger" | "warning" | "info";
  icon: string;
  iconColor: "primary" | "danger" | "success" | "warning" | "info";
  chart: React.ReactNode;
  trendText: string;
  trendIcon: "arrow-up" | "arrow-down";
  trendColor: "success" | "danger";
}

const StatCard = ({
  title,
  value,
  badgeText,
  badgeColor,
  icon,
  iconColor,
  chart,
  trendText,
  trendIcon,
  trendColor,
}: StatCardProps) => {
  return (
    <div className="col-xl-4 d-flex">
      <div className="card shadow-sm flex-fill w-100">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <p className="mb-1">{title}</p>
              <div className="d-flex align-items-center gap-1">
                <h3 className="fw-bold mb-0">{value}</h3>
                <span className={`badge fw-medium bg-${badgeColor} flex-shrink-0`}>
                  {badgeText}
                </span>
              </div>
            </div>
            <span className={`avatar border border-${iconColor} text-${iconColor} rounded-2 flex-shrink-0`}>
              <i className={`ti ${icon} fs-20`} />
            </span>
          </div>
          <div className="d-flex align-items-end">
            {chart}
            <span className={`badge fw-medium badge-soft-${trendColor} flex-shrink-0 ms-2`}>
              {trendText} <i className={`ti ti-${trendIcon} ms-1`} />
            </span>
            <p className="ms-1 fs-13 text-truncate">in last 7 Days </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

