import { z } from "zod";
import { auditFieldsSchema } from "./_shared";

const dayHoursSchema = z.object({
  enabled: z.boolean().nullable().optional().transform((v) => v ?? true),
  start: z.string().nullable().optional().transform((v) => v ?? "09:00"),
  end: z.string().nullable().optional().transform((v) => v ?? "17:00"),
});

const defaultDay = (enabled: boolean) => ({
  enabled,
  start: "09:00",
  end: "17:00",
});

export const DEFAULT_WORKING_HOURS = {
  monday: defaultDay(true),
  tuesday: defaultDay(true),
  wednesday: defaultDay(true),
  thursday: defaultDay(true),
  friday: defaultDay(true),
  saturday: defaultDay(false),
  sunday: defaultDay(false),
};

export const DEFAULT_CLINIC_SETTINGS = {
  organization: {
    name: "Preclinic",
    email: "admin@example.com",
    phone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "USA",
    postalCode: "",
    logoUrl: null as string | null,
  },
  workingHours: DEFAULT_WORKING_HOURS,
  appointmentPrefs: {
    autoNotifyUpcoming: true,
    weekendRemindersOnFriday: false,
    autoCancelOnNoReply: false,
    sendReminderOnBooking: true,
  },
  invoice: {
    prefix: "INV",
    dueDaysDefault: 14,
    terms: "",
    footerNote: "",
  },
  paymentMethods: {
    cash: true,
    card: true,
    bankTransfer: true,
    insurance: true,
    other: true,
  },
  gdpr: {
    enabled: false,
    bannerText:
      "We use cookies to improve your experience. By continuing you agree to our use of cookies.",
    position: "bottom" as const,
  },
  maintenance: {
    enabled: false,
    message: "The clinic portal is temporarily under maintenance. Please try again later.",
  },
  preferences: {
    hideApplicationsMenu: true,
    showLayoutsMenu: true,
  },
  localization: {
    timezone: "UTC",
    dateFormat: "DD-MM-YYYY",
    timeFormat: "12h",
  },
};

export const clinicSettingsDocSchema = z
  .object({
    _id: z.string(),
    organization: z
      .object({
        name: z.string().nullable().optional().transform((v) => v ?? "Preclinic"),
        email: z.string().nullable().optional().transform((v) => v ?? ""),
        phone: z.string().nullable().optional().transform((v) => v ?? ""),
        website: z.string().nullable().optional().transform((v) => v ?? ""),
        addressLine1: z.string().nullable().optional().transform((v) => v ?? ""),
        addressLine2: z.string().nullable().optional().transform((v) => v ?? ""),
        city: z.string().nullable().optional().transform((v) => v ?? ""),
        state: z.string().nullable().optional().transform((v) => v ?? ""),
        country: z.string().nullable().optional().transform((v) => v ?? "USA"),
        postalCode: z.string().nullable().optional().transform((v) => v ?? ""),
        logoUrl: z.string().nullable().optional().transform((v) => v ?? null),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.organization),
    workingHours: z
      .object({
        monday: dayHoursSchema,
        tuesday: dayHoursSchema,
        wednesday: dayHoursSchema,
        thursday: dayHoursSchema,
        friday: dayHoursSchema,
        saturday: dayHoursSchema,
        sunday: dayHoursSchema,
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_WORKING_HOURS),
    appointmentPrefs: z
      .object({
        autoNotifyUpcoming: z.boolean().nullable().optional().transform((v) => v ?? true),
        weekendRemindersOnFriday: z
          .boolean()
          .nullable()
          .optional()
          .transform((v) => v ?? false),
        autoCancelOnNoReply: z.boolean().nullable().optional().transform((v) => v ?? false),
        sendReminderOnBooking: z.boolean().nullable().optional().transform((v) => v ?? true),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.appointmentPrefs),
    invoice: z
      .object({
        prefix: z.string().nullable().optional().transform((v) => v ?? "INV"),
        dueDaysDefault: z.number().nullable().optional().transform((v) => v ?? 14),
        terms: z.string().nullable().optional().transform((v) => v ?? ""),
        footerNote: z.string().nullable().optional().transform((v) => v ?? ""),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.invoice),
    paymentMethods: z
      .object({
        cash: z.boolean().nullable().optional().transform((v) => v ?? true),
        card: z.boolean().nullable().optional().transform((v) => v ?? true),
        bankTransfer: z.boolean().nullable().optional().transform((v) => v ?? true),
        insurance: z.boolean().nullable().optional().transform((v) => v ?? true),
        other: z.boolean().nullable().optional().transform((v) => v ?? true),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.paymentMethods),
    gdpr: z
      .object({
        enabled: z.boolean().nullable().optional().transform((v) => v ?? false),
        bannerText: z
          .string()
          .nullable()
          .optional()
          .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.gdpr.bannerText),
        position: z
          .enum(["bottom", "top", "left", "right"])
          .nullable()
          .optional()
          .transform((v) => v ?? "bottom"),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.gdpr),
    maintenance: z
      .object({
        enabled: z.boolean().nullable().optional().transform((v) => v ?? false),
        message: z
          .string()
          .nullable()
          .optional()
          .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.maintenance.message),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.maintenance),
    preferences: z
      .object({
        hideApplicationsMenu: z.boolean().nullable().optional().transform((v) => v ?? true),
        showLayoutsMenu: z.boolean().nullable().optional().transform((v) => v ?? true),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.preferences),
    localization: z
      .object({
        timezone: z.string().nullable().optional().transform((v) => v ?? "UTC"),
        dateFormat: z.string().nullable().optional().transform((v) => v ?? "DD-MM-YYYY"),
        timeFormat: z.string().nullable().optional().transform((v) => v ?? "12h"),
      })
      .nullable()
      .optional()
      .transform((v) => v ?? DEFAULT_CLINIC_SETTINGS.localization),
  })
  .merge(auditFieldsSchema);

export type ClinicSettingsDoc = z.infer<typeof clinicSettingsDocSchema>;

const lookupStatus = z
  .enum(["active", "inactive"])
  .nullable()
  .optional()
  .transform((v) => v ?? "active");

export const cancellationReasonDocSchema = z
  .object({
    _id: z.string(),
    label: z.string().nullable().optional().transform((v) => v ?? ""),
    labelLower: z.string().nullable().optional().transform((v) => v ?? ""),
    status: lookupStatus,
    sortOrder: z.number().nullable().optional().transform((v) => v ?? 0),
  })
  .merge(auditFieldsSchema);

export type CancellationReasonDoc = z.infer<typeof cancellationReasonDocSchema>;

export const taxRateDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    ratePercent: z.number().nullable().optional().transform((v) => v ?? 0),
    status: lookupStatus,
  })
  .merge(auditFieldsSchema);

export type TaxRateDoc = z.infer<typeof taxRateDocSchema>;

export const currencyDocSchema = z
  .object({
    _id: z.string(),
    code: z.string().nullable().optional().transform((v) => v ?? "USD"),
    symbol: z.string().nullable().optional().transform((v) => v ?? "$"),
    name: z.string().nullable().optional().transform((v) => v ?? "US Dollar"),
    isDefault: z.boolean().nullable().optional().transform((v) => v ?? false),
    status: lookupStatus,
  })
  .merge(auditFieldsSchema);

export type CurrencyDoc = z.infer<typeof currencyDocSchema>;

export const bankAccountDocSchema = z
  .object({
    _id: z.string(),
    accountName: z.string().nullable().optional().transform((v) => v ?? ""),
    bankName: z.string().nullable().optional().transform((v) => v ?? ""),
    accountNumber: z.string().nullable().optional().transform((v) => v ?? ""),
    status: lookupStatus,
  })
  .merge(auditFieldsSchema);

export type BankAccountDoc = z.infer<typeof bankAccountDocSchema>;
