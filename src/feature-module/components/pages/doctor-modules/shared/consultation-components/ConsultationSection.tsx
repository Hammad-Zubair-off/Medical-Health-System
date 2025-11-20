import type { ReactNode } from "react";

interface ConsultationSectionProps {
  title: string;
  children: ReactNode;
  bodyClassName?: string;
}

const ConsultationSection = ({
  title,
  children,
  bodyClassName = "",
}: ConsultationSectionProps) => {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="fw-bold mb-0">{title}</h5>
      </div>
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default ConsultationSection;

