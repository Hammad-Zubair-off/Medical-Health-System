/** `ClinicSettings/main` document shape. */

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface OrganizationSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl: string | null;
}

export interface DayHours {
  enabled: boolean;
  start: string;
  end: string;
}

export type WorkingHoursSettings = Record<Weekday, DayHours>;

export interface AppointmentPrefsSettings {
  autoNotifyUpcoming: boolean;
  weekendRemindersOnFriday: boolean;
  autoCancelOnNoReply: boolean;
  sendReminderOnBooking: boolean;
}

export interface InvoiceSettingsBlock {
  prefix: string;
  dueDaysDefault: number;
  terms: string;
  footerNote: string;
}

export interface PaymentMethodsSettings {
  cash: boolean;
  card: boolean;
  bankTransfer: boolean;
  insurance: boolean;
  other: boolean;
}

export interface GdprSettings {
  enabled: boolean;
  bannerText: string;
  position: "bottom" | "top" | "left" | "right";
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface PreferencesSettings {
  hideApplicationsMenu: boolean;
  showLayoutsMenu: boolean;
}

export interface LocalizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface ClinicSettings {
  _id: string;
  organization: OrganizationSettings;
  workingHours: WorkingHoursSettings;
  appointmentPrefs: AppointmentPrefsSettings;
  invoice: InvoiceSettingsBlock;
  paymentMethods: PaymentMethodsSettings;
  gdpr: GdprSettings;
  maintenance: MaintenanceSettings;
  preferences: PreferencesSettings;
  localization: LocalizationSettings;
}

export type ClinicSettingsUpdate = Partial<{
  organization: Partial<OrganizationSettings>;
  workingHours: Partial<WorkingHoursSettings>;
  appointmentPrefs: Partial<AppointmentPrefsSettings>;
  invoice: Partial<InvoiceSettingsBlock>;
  paymentMethods: Partial<PaymentMethodsSettings>;
  gdpr: Partial<GdprSettings>;
  maintenance: Partial<MaintenanceSettings>;
  preferences: Partial<PreferencesSettings>;
  localization: Partial<LocalizationSettings>;
}>;

export type LookupStatus = "active" | "inactive";

export interface CancellationReason {
  _id: string;
  label: string;
  labelLower: string;
  status: LookupStatus;
  sortOrder: number;
}

export interface CancellationReasonFormValues {
  label: string;
  sortOrder: number;
  status: LookupStatus;
}

export interface TaxRate {
  _id: string;
  name: string;
  nameLower: string;
  ratePercent: number;
  status: LookupStatus;
}

export interface TaxRateFormValues {
  name: string;
  ratePercent: number;
  status: LookupStatus;
}

export interface Currency {
  _id: string;
  code: string;
  symbol: string;
  name: string;
  isDefault: boolean;
  status: LookupStatus;
}

export interface CurrencyFormValues {
  code: string;
  symbol: string;
  name: string;
  isDefault: boolean;
  status: LookupStatus;
}

export interface BankAccount {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  status: LookupStatus;
}

export interface BankAccountFormValues {
  accountName: string;
  bankName: string;
  accountNumber: string;
  status: LookupStatus;
}
