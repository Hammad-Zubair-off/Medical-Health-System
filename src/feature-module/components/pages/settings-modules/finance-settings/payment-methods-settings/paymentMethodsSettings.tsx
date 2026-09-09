import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useClinicSettings } from "../../../../../../core/hooks/useClinicSettings";
import type { PaymentMethodsSettings } from "../../../../../../core/types/clinic-settings.types";

const LABELS: { key: keyof PaymentMethodsSettings; label: string }[] = [
  { key: "cash", label: "Cash" },
  { key: "card", label: "Card (in-clinic)" },
  { key: "bankTransfer", label: "Bank transfer" },
  { key: "insurance", label: "Insurance" },
  { key: "other", label: "Other" },
];

const PaymentMethodsSettingsPage = () => {
  const { settings, loading, saving, error, save } = useClinicSettings();
  const [methods, setMethods] = useState<PaymentMethodsSettings | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setMethods({ ...settings.paymentMethods });
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!methods) return;
    setSuccess(null);
    await save({ paymentMethods: methods });
    setSuccess("Payment method flags saved.");
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
                  <h5 className="fw-bold">Payment Methods</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="alert alert-info">
                    These flags control which methods staff can select when
                    recording payments. Online gateways (Stripe/PayPal) are not
                    available.
                  </div>
                  {loading || !methods ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      {LABELS.map((row) => (
                        <div
                          className="d-flex align-items-center justify-content-between border-bottom py-3"
                          key={row.key}
                        >
                          <span>{row.label}</span>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={methods[row.key]}
                              onChange={(e) =>
                                setMethods({ ...methods, [row.key]: e.target.checked })
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

export default PaymentMethodsSettingsPage;
