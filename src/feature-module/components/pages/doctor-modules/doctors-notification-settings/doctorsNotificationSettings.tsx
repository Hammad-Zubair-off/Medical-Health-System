import { useState } from "react";
import SettingsLayout from "../shared/settings-components/SettingsLayout";
import NotificationItem from "../shared/settings-components/NotificationItem";

interface NotificationSettings {
  [key: string]: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const DoctorsNotificationSettings = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    appointmentBooking: { email: true, sms: true, inApp: true },
    appointmentCancellation: { email: true, sms: true, inApp: true },
    labReport: { email: true, sms: true, inApp: true },
    followUp: { email: true, sms: true, inApp: true },
    billing: { email: true, sms: true, inApp: true },
    systemAlerts: { email: true, sms: true, inApp: true },
  });

  const updateNotification = (
    key: string,
    type: "email" | "sms" | "inApp",
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: value,
      },
    }));
  };

  return (
    <SettingsLayout activePage="notifications" title="Notifications">
      <NotificationItem
        icon="ti ti-calendar-time"
        title="New Appointment Booking"
        description="Alert when an appointment is booked"
        emailEnabled={notifications.appointmentBooking.email}
        smsEnabled={notifications.appointmentBooking.sms}
        inAppEnabled={notifications.appointmentBooking.inApp}
        onEmailChange={(enabled) =>
          updateNotification("appointmentBooking", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("appointmentBooking", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("appointmentBooking", "inApp", enabled)
        }
      />
      <NotificationItem
        icon="ti ti-calendar-x"
        title="Appointment Cancellation"
        description="Alert if a appointment is cancel"
        emailEnabled={notifications.appointmentCancellation.email}
        smsEnabled={notifications.appointmentCancellation.sms}
        inAppEnabled={notifications.appointmentCancellation.inApp}
        onEmailChange={(enabled) =>
          updateNotification("appointmentCancellation", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("appointmentCancellation", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("appointmentCancellation", "inApp", enabled)
        }
      />
      <NotificationItem
        icon="ti ti-calendar-time"
        title="Lab Report Ready"
        description="Notify when test reports are available"
        emailEnabled={notifications.labReport.email}
        smsEnabled={notifications.labReport.sms}
        inAppEnabled={notifications.labReport.inApp}
        onEmailChange={(enabled) =>
          updateNotification("labReport", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("labReport", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("labReport", "inApp", enabled)
        }
      />
      <NotificationItem
        icon="ti ti-activity-heartbeat"
        title="Follow-up Reminders"
        description="Scheduled follow-ups from doctors"
        emailEnabled={notifications.followUp.email}
        smsEnabled={notifications.followUp.sms}
        inAppEnabled={notifications.followUp.inApp}
        onEmailChange={(enabled) =>
          updateNotification("followUp", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("followUp", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("followUp", "inApp", enabled)
        }
      />
      <NotificationItem
        icon="ti ti-file-dollar"
        title="Billing/Invoice Notification"
        description="Notify when a new bill or invoice is generated"
        emailEnabled={notifications.billing.email}
        smsEnabled={notifications.billing.sms}
        inAppEnabled={notifications.billing.inApp}
        onEmailChange={(enabled) =>
          updateNotification("billing", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("billing", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("billing", "inApp", enabled)
        }
      />
      <NotificationItem
        icon="ti ti-alert-octagon"
        title="System Alerts"
        description="Login attempts, data changes, or system updates."
        emailEnabled={notifications.systemAlerts.email}
        smsEnabled={notifications.systemAlerts.sms}
        inAppEnabled={notifications.systemAlerts.inApp}
        onEmailChange={(enabled) =>
          updateNotification("systemAlerts", "email", enabled)
        }
        onSmsChange={(enabled) =>
          updateNotification("systemAlerts", "sms", enabled)
        }
        onInAppChange={(enabled) =>
          updateNotification("systemAlerts", "inApp", enabled)
        }
      />
    </SettingsLayout>
  );
};

export default DoctorsNotificationSettings;
