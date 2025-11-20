import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  labelCol?: number;
  inputCol?: number;
  children: ReactNode;
  className?: string;
}

const FormField = ({
  label,
  required = false,
  labelCol = 4,
  inputCol = 8,
  children,
  className = "",
}: FormFieldProps) => {
  return (
    <div className={`col-lg-${12} mb-3 ${className}`}>
      <div className="row align-items-center">
        <div className={`col-lg-${labelCol}`}>
          <label className="form-label mb-0">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        </div>
        <div className={`col-lg-${inputCol}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormField;

