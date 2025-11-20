interface NotificationItemProps {
  icon: string;
  title: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  onEmailChange: (enabled: boolean) => void;
  onSmsChange: (enabled: boolean) => void;
  onInAppChange: (enabled: boolean) => void;
}

const NotificationItem = ({
  icon,
  title,
  description,
  emailEnabled,
  smsEnabled,
  inAppEnabled,
  onEmailChange,
  onSmsChange,
  onInAppChange,
}: NotificationItemProps) => {
  return (
    <div className="row border-bottom mb-3 pb-3">
      <div className="col-lg-12">
        <div className="d-flex align-items-start mb-3">
          <div className="me-3">
            <i className={`${icon} fs-20 text-primary`} />
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-semibold">{title}</h6>
            <p className="text-muted mb-0 small">{description}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`email-${title}`}
                checked={emailEnabled}
                onChange={(e) => onEmailChange(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`email-${title}`}>
                Email
              </label>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`sms-${title}`}
                checked={smsEnabled}
                onChange={(e) => onSmsChange(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`sms-${title}`}>
                SMS
              </label>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id={`inApp-${title}`}
                checked={inAppEnabled}
                onChange={(e) => onInAppChange(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={`inApp-${title}`}>
                In-App
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

