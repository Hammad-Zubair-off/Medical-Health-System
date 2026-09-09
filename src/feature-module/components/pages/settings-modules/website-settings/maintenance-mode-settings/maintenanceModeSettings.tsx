import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { MaintenanceSettings } from "../../../../../../core/types/clinic-settings.types";

const MaintenanceModeSettings = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [form, setForm] = useState<MaintenanceSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings.maintenance });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSuccess(null);
    await save({ maintenance: form });
    setSuccess(
      form.enabled
        ? "Maintenance mode ON — non-admin users will see the message."
        : "Maintenance mode OFF."
    );
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
                  <h5 className="fw-bold">Maintenance Mode</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading || !form ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.enabled}
                          onChange={(e) =>
                            setForm({ ...form, enabled: e.target.checked })
                          }
                          id="maint-enabled"
                        />
                        <label className="form-check-label" htmlFor="maint-enabled">
                          Enable maintenance mode
                        </label>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Message for users</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
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

export default MaintenanceModeSettings;
