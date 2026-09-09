import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { AppointmentPrefsSettings } from "../../../../../../core/types/clinic-settings.types";

const AppointmentSettings = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [prefs, setPrefs] = useState<AppointmentPrefsSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setPrefs({ ...settings.appointmentPrefs });
  }, [settings]);

  const toggle =
    (key: keyof AppointmentPrefsSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrefs((prev) => (prev ? { ...prev, [key]: e.target.checked } : prev));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    setSuccess(null);
    await save({ appointmentPrefs: prefs });
    setSuccess("Appointment preferences saved.");
  };

  const rows: { key: keyof AppointmentPrefsSettings; label: string }[] = [
    {
      key: "autoNotifyUpcoming",
      label: "Automatically notify clients about upcoming appointments",
    },
    {
      key: "weekendRemindersOnFriday",
      label: "Reminders for weekend appointments go out on Friday",
    },
    {
      key: "autoCancelOnNoReply",
      label: "Appointments auto-cancel if clients reply No or Cancel to reminders",
    },
    {
      key: "sendReminderOnBooking",
      label: "Send reminder automatically upon new appointment booking",
    },
  ];

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
                  <h5 className="fw-bold">Appointment</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="alert alert-info">
                    These preferences are stored for the clinic. Actually sending
                    email/SMS reminders requires Cloud Functions and an email/SMS
                    provider (not configured).
                  </div>
                  {loading || !prefs ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      {rows.map((row) => (
                        <div
                          className="d-flex align-items-center justify-content-between border-bottom py-3"
                          key={row.key}
                        >
                          <p className="mb-0">{row.label}</p>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={prefs[row.key]}
                              onChange={toggle(row.key)}
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

export default AppointmentSettings;
