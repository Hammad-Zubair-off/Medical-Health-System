import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { GdprSettings } from "../../../../../../core/types/clinic-settings.types";

const GdprCookiesSettings = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [form, setForm] = useState<GdprSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings.gdpr });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSuccess(null);
    await save({ gdpr: form });
    setSuccess("GDPR cookie settings saved.");
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
                  <h5 className="fw-bold">GDPR Cookies</h5>
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
                          id="gdpr-enabled"
                        />
                        <label className="form-check-label" htmlFor="gdpr-enabled">
                          Show cookie consent banner
                        </label>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Banner text</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={form.bannerText}
                          onChange={(e) =>
                            setForm({ ...form, bannerText: e.target.value })
                          }
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label className="form-label">Position</label>
                        <select
                          className="form-select"
                          value={form.position}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              position: e.target.value as GdprSettings["position"],
                            })
                          }
                        >
                          <option value="bottom">Bottom</option>
                          <option value="top">Top</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
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

export default GdprCookiesSettings;
