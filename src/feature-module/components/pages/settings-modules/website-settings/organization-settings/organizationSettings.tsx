import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { OrganizationSettings } from "../../../../../../core/types/clinic-settings.types";

const OrganizationSettingsPage = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [form, setForm] = useState<OrganizationSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings.organization });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSuccess(null);
    setLocalError(null);
    try {
      await save({ organization: form });
      setSuccess("Organization settings saved.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const set =
    (key: keyof OrganizationSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev));
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
                  <h5 className="fw-bold">Organization</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {(error || localError) && (
                    <div className="alert alert-danger">{localError || error}</div>
                  )}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading || !form ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      <div className="row">
                        {(
                          [
                            ["name", "Clinic name"],
                            ["email", "Email"],
                            ["phone", "Phone"],
                            ["website", "Website"],
                            ["addressLine1", "Address line 1"],
                            ["addressLine2", "Address line 2"],
                            ["city", "City"],
                            ["state", "State"],
                            ["country", "Country"],
                            ["postalCode", "Postal code"],
                          ] as const
                        ).map(([key, label]) => (
                          <div className="col-md-6 mb-3" key={key}>
                            <label className="form-label">{label}</label>
                            <input
                              className="form-control"
                              value={form[key] ?? ""}
                              onChange={set(key)}
                            />
                          </div>
                        ))}
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

export default OrganizationSettingsPage;
