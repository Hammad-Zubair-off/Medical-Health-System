import { all_routes } from "../../../feature-module/routes/all_routes";

/**
 * Settings nav. Paid/provider stubs (Integrations, Email/SMS gateways, cron,
 * backups, system update) are hidden — they require Blaze + third-party APIs.
 */
export const sidebarMenus = [
  {
    label: "Account Settings",
    icon: "ti ti-user-cog me-2",
    submenus: [
      { to: all_routes.profilesettings, label: "Profile" },
      { to: all_routes.securitysettings, label: "Security" },
      { to: all_routes.notificationssettings, label: "Notifications" },
      // Integrations — requires OAuth providers (hidden)
    ],
  },
  {
    label: "Website Settings",
    icon: "ti ti-world-cog me-2",
    submenus: [
      { to: all_routes.organizationsettings, label: "Organization" },
      { to: all_routes.prefixessettings, label: "Prefixes" },
      { to: all_routes.maintenancemodesettings, label: "Maintenance Mode" },
      { to: all_routes.preferencessettings, label: "Preferences" },
      // Localization / SEO / Language / Login&Register — still template UI
    ],
  },
  {
    label: "Clinic Settings",
    icon: "ti ti-building-hospital me-2",
    submenus: [
      { to: all_routes.appointmentsettings, label: "Appointment" },
      { to: all_routes.workinghourssettings, label: "Working Hours" },
      { to: all_routes.cancellationreasonsettings, label: "Cancellation Reason" },
    ],
  },
  {
    label: "App Settings",
    icon: "ti ti-device-mobile-cog me-2",
    submenus: [
      { to: all_routes.invoicesettings, label: "Invoice Settings" },
      // Invoice Templates / Signatures / Custom Fields — not wired
    ],
  },
  {
    label: "System Settings",
    icon: "ti ti-device-desktop-cog me-2",
    submenus: [
      // Email/SMS settings require Blaze + provider (hidden)
      { to: all_routes.gdprcookiessettings, label: "GDPR Cookies" },
    ],
  },
  {
    label: "Finance & Accounts",
    icon: "ti ti-settings-dollar me-2",
    submenus: [
      { to: all_routes.paymentmethodssettings, label: "Payment Methods" },
      { to: all_routes.bankaccountssettings, label: "Bank Accounts" },
      { to: all_routes.taxratessettings, label: "Tax Rates" },
      { to: all_routes.currenciessettings, label: "Currencies" },
    ],
  },
  // Other Settings (cron/backup/system update) — hidden; not applicable or needs infra
];
