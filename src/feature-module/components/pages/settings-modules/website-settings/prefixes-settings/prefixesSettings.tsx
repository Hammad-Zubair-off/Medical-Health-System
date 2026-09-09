import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";

const PrefixesSettings = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [prefix, setPrefix] = useState("INV");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setPrefix(settings.invoice.prefix || "INV");
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const clean = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "INV";
    await save({ invoice: { prefix: clean } });
    setPrefix(clean);
    setSuccess("Invoice prefix saved. New invoices will use this prefix.");
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
                  <h5 className="fw-bold">Prefixes</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)} className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Invoice prefix</label>
                        <input
                          className="form-control"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          maxLength={12}
                        />
                        <p className="text-muted fs-13 mt-1 mb-0">
                          Example: {prefix || "INV"}-0001. Existing numbers are unchanged.
                        </p>
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

export default PrefixesSettings;
