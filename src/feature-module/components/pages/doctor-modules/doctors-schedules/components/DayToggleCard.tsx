import { getDayLabel } from "../utils";
import type { DayKey } from "../types";

interface DayToggleCardProps {
  day: DayKey;
  isEnabled: boolean;
  onToggle: (day: DayKey) => void;
}

export const DayToggleCard = ({ day, isEnabled, onToggle }: DayToggleCardProps) => {
  return (
    <div className="card bg-light mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="mb-1 fw-bold">Working on {getDayLabel(day)}</h6>
            <p className="mb-0 text-muted small">
              {isEnabled 
                ? "Working hours are enabled. Set your availability below." 
                : "Enable working hours using the toggle to set your schedule"}
            </p>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={`toggle-${day}`}
              checked={isEnabled}
              onChange={() => onToggle(day)}
              style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

