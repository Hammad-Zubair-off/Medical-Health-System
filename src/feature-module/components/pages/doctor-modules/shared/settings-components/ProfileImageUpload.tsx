import { useRef } from "react";
import ImageWithBasePath from "../../../../../../core/imageWithBasePath";

interface ProfileImageUploadProps {
  imageSrc: string;
  onImageChange: (file: File) => void;
}

const ProfileImageUpload = ({ imageSrc, onImageChange }: ProfileImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="profile-container position-relative d-inline-block">
      <ImageWithBasePath src={imageSrc} alt="Profile" className="rounded" />
      <div className="overlay-btn position-absolute top-50 start-50 translate-middle">
        <button
          type="button"
          className="btn btn-sm btn-primary rounded-circle"
          onClick={handleImageClick}
        >
          <i className="ti ti-photo" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfileImageUpload;

