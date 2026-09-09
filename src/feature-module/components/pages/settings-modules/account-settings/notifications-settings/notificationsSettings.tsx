import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import {
  getUserNotificationPrefs,
  updateUserProfile,
} from "../../../../../../core/services/firestore/users.service";

const PREF_KEYS: { key: string; label: string }[] = [
  { key: "emailAppointments", label: "Email me about appointments" },
  { key: "emailInvoices", label: "Email me about invoices & payments" },
  { key: "emailLeaves", label: "Email me about leave requests" },
  { key: "inAppGeneral", label: "In-app general notifications" },
];

const NotificationsSettings = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    void (async () => {
      setLoading(true);
      try {
        const loaded = await getUserNotificationPrefs(user.uid);
        const next: Record<string, boolean> = {};
        for (const row of PREF_KEYS) {
          next[row.key] = loaded[row.key] ?? true;
        }
        setPrefs(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserProfile(user.uid, { notificationPrefs: prefs });
      setSuccess("Notification preferences saved (delivery not configured).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
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
                  <h5 className="fw-bold">Notifications</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="alert alert-info">
                    Preferences are stored on your user profile. Outbound email/SMS
                    delivery is not enabled in this deployment.
                  </div>
                  {loading ? (
                    <p>Loading…</p>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)}>
                      {PREF_KEYS.map((row) => (
                        <div
                          className="d-flex align-items-center justify-content-between border-bottom py-3"
                          key={row.key}
                        >
                          <span>{row.label}</span>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={Boolean(prefs[row.key])}
                              onChange={(e) =>
                                setPrefs({ ...prefs, [row.key]: e.target.checked })
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

export default NotificationsSettings;
