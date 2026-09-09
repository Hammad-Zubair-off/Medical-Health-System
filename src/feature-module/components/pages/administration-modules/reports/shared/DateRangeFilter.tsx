import type { DateRange } from "../../../../../../core/utils/report.utils";
import {
  currentMonthRange,
  defaultDateRange,
  endOfDay,
  parseLocalDateInput,
  startOfDay,
} from "../../../../../../core/utils/report.utils";

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  disabled?: boolean;
}

function toInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DateRangeFilter = ({ value, onChange, disabled }: DateRangeFilterProps) => {
  return (
    <div className="row row-gap-2 align-items-end">
      <div className="col-md-3">
        <label className="form-label">From</label>
        <input
          type="date"
          className="form-control"
          disabled={disabled}
          value={toInputValue(value.from)}
          onChange={(e) => {
            if (!e.target.value) return;
            const from = startOfDay(parseLocalDateInput(e.target.value));
            onChange({ from, to: value.to });
          }}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">To</label>
        <input
          type="date"
          className="form-control"
          disabled={disabled}
          value={toInputValue(value.to)}
          onChange={(e) => {
            if (!e.target.value) return;
            const to = endOfDay(parseLocalDateInput(e.target.value));
            onChange({ from: value.from, to });
          }}
        />
      </div>
      <div className="col-md-6 d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={() => onChange(currentMonthRange())}
        >
          This month
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={() => onChange(defaultDateRange())}
        >
          Last 30 days
        </button>
      </div>
      <div className="col-12">
        <p className="text-muted fs-13 mb-0">
          Only records whose date falls in this range are included. Use{" "}
          <strong>This month</strong> or widen the dates if something is missing.
        </p>
      </div>
    </div>
  );
};

export default DateRangeFilter;
