import { useState } from "react";
import type { DoctorEnabledDays } from "../../../../../core/services/firestore/doctor.service";
import type { ScheduleRow, DayKey } from "../types";
import { getDayLabel } from "../utils";
import { DAYS } from "../types";
import { DayToggleCard } from "./DayToggleCard";
import { ScheduleRow as ScheduleRowComponent } from "./ScheduleRow";
import type { Dayjs } from "dayjs";

interface ScheduleTabsProps {
  enabledDays: DoctorEnabledDays;
  getDaySchedule: (day: DayKey) => ScheduleRow[];
  onToggleDay: (day: DayKey) => void;
  onTimeChange: (day: DayKey, rowId: number, field: 'from' | 'to', time: Dayjs | null) => void;
  onAddSchedule: (day: DayKey) => void;
  onDeleteSchedule: (day: DayKey, id: number) => void;
}

export const ScheduleTabs = ({
  enabledDays,
  getDaySchedule,
  onToggleDay,
  onTimeChange,
  onAddSchedule,
  onDeleteSchedule,
}: ScheduleTabsProps) => {
  const [activeDayTab, setActiveDayTab] = useState<DayKey>("monday");

  return (
    <div>
      <h6 className="fw-bold mb-3">Schedules</h6>
      <ul
        className="nav nav-pills schedule-tab mb-3"
        id="pills-tab2"
        role="tablist"
      >
        {DAYS.map((day, index) => {
          const isEnabled = enabledDays[day] || false;
          const isActive = activeDayTab === day;
          const tabId = `schedules-${8 + index}`;
          
          return (
            <li key={day} className="nav-item me-1" role="presentation">
              <button
  className={`nav-link btn btn-sm btn-icon p-2 d-flex align-items-center justify-content-center w-auto ${
    isActive ? 'active bg-primary text-white' : 'text-muted'
  } ${isEnabled && !isActive ? 'text-primary' : ''}`}
  data-bs-toggle="pill"
  data-bs-target={`#${tabId}`}
  type="button"
  role="tab"
  aria-selected={isActive}
  tabIndex={isActive ? 0 : -1}
  onClick={() => setActiveDayTab(day)}
>
  {getDayLabel(day)}
  {isEnabled && <i className={`ti ti-check ms-1 fs-12 ${isActive ? 'text-white' : 'text-primary'}`} />}
</button>
            </li>
          );
        })}
      </ul>
      <div className="tab-content" id="pills-tabContent2">
        {DAYS.map((day, index) => {
          const isEnabled = enabledDays[day] || false;
          const isActive = activeDayTab === day;
          const tabId = `schedules-${8 + index}`;
          const daySchedules = getDaySchedule(day);
          
          return (
            <div
              key={day}
              className={`tab-pane fade ${isActive ? 'active show' : ''}`}
              id={tabId}
              role="tabpanel"
            >
              <DayToggleCard
                day={day}
                isEnabled={isEnabled}
                onToggle={onToggleDay}
              />

              {/* Schedule Content */}
              {isEnabled ? (
                <div className="add-schedule-list">
                  {daySchedules.map((row, idx) => (
                    <ScheduleRowComponent
                      key={row.id}
                      row={row}
                      day={day}
                      index={idx}
                      onTimeChange={onTimeChange}
                      onAdd={onAddSchedule}
                      onDelete={onDeleteSchedule}
                    />
                  ))}
                </div>
              ) : (
                <div className="card border bg-light">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <i className="ti ti-alert-circle fs-20 text-muted" />
                      <p className="mb-0 text-muted">
                        Not working on {getDayLabel(day)}. Enable working hours using the toggle above.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

