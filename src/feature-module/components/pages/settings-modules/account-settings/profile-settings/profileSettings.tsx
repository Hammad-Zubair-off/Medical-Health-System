import { type FormEvent, useEffect, useState } from "react";
import SettingsSidebar from "../../../../../../core/common/settings-sidebar/settingsSidebar";
import { useAuth } from "../../../../../../core/context/AuthContext";
import { updateUserProfile } from "../../../../../../core/services/firestore/users.service";

const ProfileSettings = () => {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPhoneNumber(user?.phoneNumber ?? "");
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
      });
      await refreshProfile();
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
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
                  <h5 className="fw-bold">Basic Information</h5>
                </div>
                <div className="card-body px-0 mx-3">
                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <form onSubmit={(e) => void onSubmit(e)}>
                    <div className="row mb-3">
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">Display name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            data-testid="profile-display-name"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={user?.email ?? ""}
                            readOnly
                            disabled
                          />
                          <p className="text-muted fs-13 mb-0 mt-1">
                            Email is tied to your login and cannot be changed here.
                          </p>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">Phone number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            data-testid="profile-phone"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="mb-3">
                          <label className="form-label">Role</label>
                          <input
                            type="text"
                            className="form-control"
                            value={user?.role ?? ""}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving || !user}
                        data-testid="profile-save"
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
