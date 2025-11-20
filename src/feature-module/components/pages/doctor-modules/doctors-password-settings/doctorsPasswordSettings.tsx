import { useState } from "react";
import SettingsLayout from "../shared/settings-components/SettingsLayout";
import PasswordInput from "../shared/settings-components/PasswordInput";
import FormField from "../shared/settings-components/FormField";
import SettingsActionButtons from "../shared/settings-components/SettingsActionButtons";

const DoctorsPasswordSettings = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    // TODO: Validate and save password
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Saving password");
  };

  const handleCancel = () => {
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <SettingsLayout activePage="password" title="Change Password">
                    <div className="row border-bottom mb-3">
                      <div className="col-lg-6">
          <FormField label="New Password" required labelCol={5} inputCol={7}>
            <PasswordInput
                                  placeholder="****************"
              value={password}
              onChange={setPassword}
              required
            />
          </FormField>
                      </div>
                      <div className="col-lg-6">
          <FormField label="Confirm Password" required labelCol={5} inputCol={7}>
            <PasswordInput
                                  placeholder="****************"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
          </FormField>
        </div>
      </div>
      <SettingsActionButtons onCancel={handleCancel} onSave={handleSave} />
    </SettingsLayout>
  );
};

export default DoctorsPasswordSettings;
