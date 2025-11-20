import { TimePicker } from "antd";
import { Link } from "react-router";
import type { Dayjs } from "dayjs";
import type { ScheduleRow as ScheduleRowType, DayKey } from "../types";

interface ScheduleRowProps {
  row: ScheduleRowType;
  day: DayKey;
  index: number;
  onTimeChange: (day: DayKey, rowId: number, field: 'from' | 'to', time: Dayjs | null) => void;
  onAdd: (day: DayKey) => void;
  onDelete: (day: DayKey, id: number) => void;
}

export const ScheduleRow = ({ row, day, index, onTimeChange, onAdd, onDelete }: ScheduleRowProps) => {
  return (
    <div className="row gx-3" key={row.id}>
      <div className="col-lg-9">
        <div className="row gx-3">
          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">From</label>
              <div className="input-icon-end position-relative">
                <TimePicker
                  className="form-control"
                  value={row.from}
                  onChange={(time) => onTimeChange(day, row.id, 'from', time)}
                  format="HH:mm"
                />
                <span className="input-icon-addon">
                  <i className="ti ti-clock-hour-10" />
                </span>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="mb-3">
              <label className="form-label">To</label>
              <div className="input-icon-end position-relative">
                <TimePicker
                  className="form-control"
                  value={row.to}
                  onChange={(time) => onTimeChange(day, row.id, 'to', time)}
                  format="HH:mm"
                />
                <span className="input-icon-addon">
                  <i className="ti ti-clock-hour-10" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3">
        <div className="mb-3 d-flex gap-2">
          {index === 0 ? (
            <Link
              to="#"
              className="add-schedule-btn p-2 bg-light btn-icon text-dark rounded d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.preventDefault();
                onAdd(day);
              }}
              title="Add"
            >
              <i className="ti ti-plus fs-16" />
            </Link>
          ) : (
            <Link
              to="#"
              className="delete-schedule-btn p-2 bg-danger btn-icon text-white rounded d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.preventDefault();
                onDelete(day, row.id);
              }}
              title="Delete"
            >
              <i className="ti ti-trash fs-16" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

