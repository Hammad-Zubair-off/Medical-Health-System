import { type FormEvent, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { changePassword } from "../../../../../../core/services/auth/auth.service";

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content" id="profilePage">
        <div className="mb-3 border-bottom pb-3">
          <h4 className="fw-bold mb-0">Settings</h4>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <div className="settings-wrapper d-flex">
              <SettingsSidebar />
              <div className="card flex-fill mb-0 border-0 bg-light-500 shadow-none">
                <div className="card-header border-bottom px-0 mx-3">
                  <h5 className="fw-bold">Security</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-1">Change password</h6>
                    <p className="text-muted fs-13">
                      Set a unique password to secure the account.
                    </p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form
                      className="row"
                      onSubmit={(e) => void onSubmit(e)}
                      data-testid="change-password-form"
                    >
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Current password</label>
                        <input
                          type="password"
                          className="form-control"
                          autoComplete="current-password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">New password</label>
                        <input
                          type="password"
                          className="form-control"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Confirm new password</label>
                        <input
                          type="password"
                          className="form-control"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? "Updating…" : "Update password"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="alert alert-info mb-0">
                    Two-factor authentication, Google Authenticator, and SMS
                    phone verification are not available in this deployment
                    (requires paid SMS / MFA setup). Password change above is
                    fully functional.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
