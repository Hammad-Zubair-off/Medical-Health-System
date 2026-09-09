import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { PreferencesSettings } from "../../../../../../core/types/clinic-settings.types";

const PreferencesSettingsPage = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [form, setForm] = useState<PreferencesSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings.preferences });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSuccess(null);
    await save({ preferences: form });
    setSuccess("Preferences saved. Reload to apply menu visibility changes.");
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
                  <h5 className="fw-bold">Preferences</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading || !form ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      <div className="d-flex align-items-center justify-content-between border-bottom py-3">
                        <div>
                          <p className="mb-0 fw-medium">Hide Applications menu</p>
                          <p className="text-muted fs-13 mb-0">
                            Template chat/calls/email apps are removed from the
                            sidebar when enabled (default).
                          </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={form.hideApplicationsMenu}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                hideApplicationsMenu: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
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

export default PreferencesSettingsPage;
