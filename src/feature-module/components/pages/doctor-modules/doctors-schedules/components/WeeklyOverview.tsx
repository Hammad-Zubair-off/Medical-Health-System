import type { DoctorEnabledDays } from "../../../../../core/services/firestore/doctor.service";
import type { ScheduleRow, DayKey } from "../types";
import { getDayLabel, hasValidTimeRange } from "../utils";
import { DAYS } from "../types";

interface WeeklyOverviewProps {
  enabledDays: DoctorEnabledDays;
  getDaySchedule: (day: DayKey) => ScheduleRow[];
}

export const WeeklyOverview = ({ enabledDays, getDaySchedule }: WeeklyOverviewProps) => {
  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3">Weekly Overview</h6>
      <div className="row g-2">
        {DAYS.map((day) => {
          const isEnabled = enabledDays[day] || false;
          const daySchedule = getDaySchedule(day);
          const firstSchedule = daySchedule[0];
          const hasValidTime = firstSchedule?.from && firstSchedule?.to && hasValidTimeRange(firstSchedule.from, firstSchedule.to);
          const timeRange = hasValidTime && firstSchedule.from && firstSchedule.to
            ? `${firstSchedule.from.format('HH:mm')} - ${firstSchedule.to.format('HH:mm')}`
            : 'Not set';
          
          return (
            <div key={day} className="col-lg-3 col-md-4 col-sm-6">
              <div className={`card ${isEnabled ? 'border-primary' : 'border'}`}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0 fw-bold">{getDayLabel(day)}</h6>
                    <span className={`badge ${isEnabled ? 'badge-soft-primary' : 'badge-soft-secondary'}`}>
                      {isEnabled ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {isEnabled ? (
                    <div>
                      <p className="mb-0 text-muted small">Time: {timeRange}</p>
                    </div>
                  ) : (
                    <p className="mb-0 text-muted small">Not working</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

