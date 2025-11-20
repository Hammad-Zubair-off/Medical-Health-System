import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import type { Holiday } from "../types";
import { getModalContainer } from "../utils";

interface HolidaysSectionProps {
  holidays: Holiday[];
  newHolidayDate: Dayjs | null;
  newHolidayReason: string;
  onDateChange: (date: Dayjs | null) => void;
  onReasonChange: (reason: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const HolidaysSection = ({
  holidays,
  newHolidayDate,
  newHolidayReason,
  onDateChange,
  onReasonChange,
  onAdd,
  onDelete,
}: HolidaysSectionProps) => {
  return (
    <div className="border-top pt-4 mt-4">
      <h6 className="fw-bold mb-3">Holidays</h6>
      <div className="row mb-3">
        <div className="col-lg-4 col-md-6">
          <div className="mb-3">
            <label className="form-label">Date</label>
            <DatePicker
              className="form-control w-100"
              format={{
                format: "DD-MM-YYYY",
                type: "mask",
              }}
              getPopupContainer={getModalContainer}
              placeholder="Select date"
              suffixIcon={null}
              value={newHolidayDate}
              onChange={(date) => onDateChange(date)}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6">
          <div className="mb-3">
            <label className="form-label">Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter holiday reason"
              value={newHolidayReason}
              onChange={(e) => onReasonChange(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-2 col-md-12">
          <div className="mb-3">
            <label className="form-label d-block">&nbsp;</label>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={onAdd}
            >
              <i className="ti ti-plus me-1" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Holidays List */}
      {holidays.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td>{holiday.date ? holiday.date.format('DD-MM-YYYY') : 'N/A'}</td>
                  <td>{holiday.reason}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(holiday.id)}
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          <i className="ti ti-info-circle me-2" />
          No holidays added yet. Add holidays using the form above.
        </div>
      )}
    </div>
  );
};

