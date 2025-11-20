import { useState } from "react";
import SettingsLayout from "../shared/settings-components/SettingsLayout";
import ProfileImageUpload from "../shared/settings-components/ProfileImageUpload";
import FormField from "../shared/settings-components/FormField";
import SettingsActionButtons from "../shared/settings-components/SettingsActionButtons";
import { City, Country, State } from "../../../../../core/common/selectOption";
import CommonSelect from "../../../../../core/common/common-select/commonSelect";

const DoctorsProfileSettings = () => {
  const [profileImage] = useState<string>("assets/img/users/user-08.jpg");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    country: Country[0]?.value || "",
    state: State[0]?.value || "",
    city: City[0]?.value || "",
    pincode: "",
  });

  const handleImageChange = (file: File) => {
    // TODO: Upload image and update profileImage
    console.log("Image changed:", file);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Save profile data
    console.log("Saving profile:", formData);
  };

  const handleCancel = () => {
    // TODO: Reset form or navigate away
    console.log("Cancelled");
  };

  return (
    <SettingsLayout activePage="profile" title="Basic Information">
      {/* Profile Image */}
                    <div className="row border-bottom mb-3">
                      <div className="col-lg-12">
          <FormField label="Profile Image" required labelCol={2} inputCol={10}>
            <ProfileImageUpload
              imageSrc={profileImage}
              onImageChange={handleImageChange}
            />
          </FormField>
                            </div>
                          </div>
      {/* Basic Information */}
      <div className="row border-bottom mb-3">
        <FormField label="First Name" required labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
        </FormField>
        <FormField label="Last Name" required labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
        </FormField>
        <FormField label="Email" required labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </FormField>
        <FormField label="Phone Number" required labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </FormField>
                        </div>
      {/* Address Information */}
                    <div className="row border-bottom mb-3">
                      <div className="mb-3">
                        <h5 className="fw-bold mb-0">Address Information</h5>
                      </div>
        <FormField label="Address Line 1" labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange("addressLine1", e.target.value)}
          />
        </FormField>
        <FormField label="Address Line 2" labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange("addressLine2", e.target.value)}
          />
        </FormField>
        <FormField label="Country" labelCol={4} inputCol={8}>
                            <CommonSelect
                              options={Country}
                              className="select"
                              defaultValue={Country[0]}
                            />
        </FormField>
        <FormField label="State" labelCol={4} inputCol={8}>
                            <CommonSelect
                              options={State}
                              className="select"
                              defaultValue={State[0]}
                            />
        </FormField>
        <FormField label="City" labelCol={4} inputCol={8}>
                            <CommonSelect
                              options={City}
                              className="select"
                              defaultValue={City[0]}
                            />
        </FormField>
        <FormField label="Pincode" labelCol={4} inputCol={8}>
          <input
            type="text"
            className="form-control"
            value={formData.pincode}
            onChange={(e) => handleInputChange("pincode", e.target.value)}
          />
        </FormField>
      </div>
      <SettingsActionButtons onCancel={handleCancel} onSave={handleSave} />
    </SettingsLayout>
  );
};

export default DoctorsProfileSettings;
