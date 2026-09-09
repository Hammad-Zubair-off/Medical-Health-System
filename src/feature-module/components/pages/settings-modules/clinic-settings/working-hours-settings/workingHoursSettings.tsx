import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type {
  Weekday,
  WorkingHoursSettings,
} from "../../../../../../core/types/clinic-settings.types";

const DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const WorkingHoursSettingsPage = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [hours, setHours] = useState<WorkingHoursSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setHours({ ...settings.workingHours });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hours) return;
    setSuccess(null);
    await save({ workingHours: hours });
    setSuccess("Working hours saved.");
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="mb-3 border-bottom pb-3">
          <h4 className="fw-bold mb-0">Settings</h4>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="settings-wrapper d-flex">
              <SettingsSidebar />
              <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                <div className="card-header border-bottom px-0 mx-3">
                  <h5 className="fw-bold">Working Hours</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading || !hours ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      {DAYS.map((day) => (
                        <div
                          className="row align-items-center border-bottom py-2 mb-2"
                          key={day}
                        >
                          <div className="col-md-3 text-capitalize fw-medium">{day}</div>
                          <div className="col-md-2">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={hours[day].enabled}
                                onChange={(e) =>
                                  setHours({
                                    ...hours,
                                    [day]: { ...hours[day], enabled: e.target.checked },
                                  })
                                }
                              />
                              <label className="form-check-label">Open</label>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <input
                              type="time"
                              className="form-control"
                              value={hours[day].start}
                              disabled={!hours[day].enabled}
                              onChange={(e) =>
                                setHours({
                                  ...hours,
                                  [day]: { ...hours[day], start: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="time"
                              className="form-control"
                              value={hours[day].end}
                              disabled={!hours[day].enabled}
                              onChange={(e) =>
                                setHours({
                                  ...hours,
                                  [day]: { ...hours[day], end: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      ))}
                      <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursSettingsPage;
