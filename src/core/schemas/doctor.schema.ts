import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

/**
 * Lenient read schema for `Doctor/{id}`. The live schedule code still reads
 * extra fields (`time_slots`, `enabled_days`, `holidays`) via `DoctorData`'s
 * index signature — those stay untyped here on purpose.
 */
export const doctorDocSchema = z
  .object({
    _id: z.string(),
    displayName: z.string().nullable().optional().transform((v) => v ?? "Unknown Doctor"),
    displayNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    email: z.string().nullable().optional().transform((v) => v ?? null),
    phoneNumber: z.string().nullable().optional().transform((v) => v ?? null),
    photoUrl: z.string().nullable().optional().transform((v) => v ?? null),
    specialization: z.string().nullable().optional().transform((v) => v ?? null),
    specializationId: z.string().nullable().optional().transform((v) => v ?? null),
    qualifications: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
    experienceYears: z.number().nullable().optional().transform((v) => v ?? null),
    consultationFee: z.number().nullable().optional().transform((v) => v ?? null),
    bio: z.string().nullable().optional().transform((v) => v ?? null),
    languages: z.array(z.string()).nullable().optional().transform((v) => v ?? []),
    status: z
      .enum(["active", "inactive"])
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
    created: timestampSchema,
  })
  .merge(auditFieldsSchema);

export type DoctorDoc = z.infer<typeof doctorDocSchema>;

export const doctorFormSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  specializationId: z.string().min(1, "Select a specialization"),
  qualifications: z.string(),
  experienceYears: z.number().min(0, "Experience cannot be negative"),
  consultationFee: z.number().min(0, "Fee cannot be negative"),
  bio: z.string(),
  status: z.enum(["active", "inactive"]),
  /** Legacy Console UID paste — optional when password provisioning is used. */
  uid: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type DoctorFormSchema = z.infer<typeof doctorFormSchema>;

/** Create-doctor validation: password required (or a pre-existing Auth UID). */
export const doctorCreateFormSchema = doctorFormSchema.superRefine((data, ctx) => {
  const hasUid = data.uid.trim().length > 0;
  const hasPassword = data.password.length > 0;

  if (!hasUid && !hasPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Set a login password (or paste an existing Auth UID)",
      path: ["password"],
    });
  }

  if (hasPassword) {
    if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  }
});

/** Edit-doctor: password fields ignored. */
export const doctorEditFormSchema = doctorFormSchema;
