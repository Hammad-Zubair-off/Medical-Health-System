import { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  className = "",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="position-relative">
      <input
        type={showPassword ? "text" : "password"}
        className={`form-control ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-2"
        onClick={() => setShowPassword(!showPassword)}
        style={{ border: "none", background: "none" }}
      >
        <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
      </button>
    </div>
  );
};

export default PasswordInput;

