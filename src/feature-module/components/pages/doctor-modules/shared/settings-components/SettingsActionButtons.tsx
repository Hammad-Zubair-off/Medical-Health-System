interface SettingsActionButtonsProps {
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  loading?: boolean;
}

const SettingsActionButtons = ({
  onSave,
  onCancel,
  saveText = "Save Changes",
  cancelText = "Cancel",
  loading = false,
}: SettingsActionButtonsProps) => {
  return (
    <div className="d-flex justify-content-end gap-2 mt-4 mb-3">
      <button
        type="button"
        className="btn btn-light"
        onClick={onCancel}
      >
        {cancelText}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSave}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Saving...
          </>
        ) : (
          saveText
        )}
      </button>
    </div>
  );
};

export default SettingsActionButtons;

