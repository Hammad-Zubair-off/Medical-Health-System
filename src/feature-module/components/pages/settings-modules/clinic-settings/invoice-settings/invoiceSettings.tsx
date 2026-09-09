import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { InvoiceSettingsBlock } from "../../../../../../core/types/clinic-settings.types";

const InvoiceSettingsPage = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [form, setForm] = useState<InvoiceSettingsBlock | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings.invoice });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSuccess(null);
    const prefix =
      form.prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "INV";
    await save({
      invoice: {
        ...form,
        prefix,
        dueDaysDefault: Math.max(0, Math.floor(Number(form.dueDaysDefault) || 0)),
      },
    });
    setSuccess("Invoice settings saved.");
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
                  <h5 className="fw-bold">Invoice Settings</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  {loading || !form ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Prefix</label>
                          <input
                            className="form-control"
                            value={form.prefix}
                            onChange={(e) =>
                              setForm({ ...form, prefix: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Default due days</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.dueDaysDefault}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                dueDaysDefault: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">Terms</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={form.terms}
                            onChange={(e) =>
                              setForm({ ...form, terms: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label">Footer note</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={form.footerNote}
                            onChange={(e) =>
                              setForm({ ...form, footerNote: e.target.value })
                            }
                          />
                        </div>
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

export default InvoiceSettingsPage;
