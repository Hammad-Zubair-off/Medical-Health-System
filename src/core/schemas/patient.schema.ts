import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
});

/**
 * Lenient read schema — tolerates legacy/missing fields on documents that
 * predate a field being added, rather than throwing (see `parseDoc`).
 */
export const patientDocSchema = z
  .object({
    _id: z.string(),
    patientId: z.string().nullable().optional().transform((v) => v ?? ""),
    userId: z.string().nullable().optional().transform((v) => v ?? null),
    displayName: z.string().nullable().optional().transform((v) => v ?? "Unknown Patient"),
    displayNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    email: z.string().nullable().optional().transform((v) => v ?? null),
    phoneNumber: z.string().nullable().optional().transform((v) => v ?? null),
    photoUrl: z.string().nullable().optional().transform((v) => v ?? null),
    dateOfBirth: timestampSchema,
    gender: z
      .enum(["male", "female", "other"])
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    bloodGroup: z.string().nullable().optional().transform((v) => v ?? null),
    address: addressSchema.nullable().optional().transform((v) => v ?? null),
    allergies: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
    status: z
      .enum(["active", "inactive"])
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
    primaryDoctorId: z.string().nullable().optional().transform((v) => v ?? null),
    lastVisit: timestampSchema,
  })
  .merge(auditFieldsSchema);

export type PatientDoc = z.infer<typeof patientDocSchema>;

/** Strict write schema — validates user input from the create/edit forms. */
export const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Enter a valid email address"),
  primaryDoctorId: z.string().min(1, "Select a primary doctor"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    message: "Select a gender",
  }),
  bloodGroup: z.string().min(1, "Select a blood group"),
  status: z.enum(["active", "inactive"]),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string(),
  country: z.string().min(1, "Select a country"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(1, "Select a city"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type PatientFormSchema = z.infer<typeof patientFormSchema>;
