import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const medicineDocSchema = z.object({
  name: z.string().nullable().optional().transform((v) => v ?? ""),
  dosage: z.string().nullable().optional().transform((v) => v ?? ""),
  frequency: z.string().nullable().optional().transform((v) => v ?? ""),
  duration: z.string().nullable().optional().transform((v) => v ?? ""),
  instructions: z.string().nullable().optional().transform((v) => v ?? null),
});

export const prescriptionDocSchema = z
  .object({
    _id: z.string(),
    prescriptionId: z.string().nullable().optional().transform((v) => v ?? ""),
    appointmentId: z.string().nullable().optional().transform((v) => v ?? null),
    doctorId: z.string().nullable().optional().transform((v) => v ?? ""),
    doctorUserId: z.string().nullable().optional().transform((v) => v ?? ""),
    patientId: z.string().nullable().optional().transform((v) => v ?? ""),
    patientUserId: z.string().nullable().optional().transform((v) => v ?? null),
    patientNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    patientName: z.string().nullable().optional().transform((v) => v ?? null),
    doctorName: z.string().nullable().optional().transform((v) => v ?? null),
    prescribedOn: timestampSchema,
    diagnosis: z.string().nullable().optional().transform((v) => v ?? null),
    notes: z.string().nullable().optional().transform((v) => v ?? null),
    followUpDate: timestampSchema,
    medicines: z
      .array(medicineDocSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    status: z
      .enum(["active", "completed", "cancelled"])
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type PrescriptionDoc = z.infer<typeof prescriptionDocSchema>;

const medicineFormSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string(),
});

export const prescriptionFormSchema = z.object({
  appointmentId: z.string(),
  patientId: z.string().min(1, "Select a patient"),
  diagnosis: z.string(),
  notes: z.string(),
  followUpDate: z.string(),
  medicines: z.array(medicineFormSchema).min(1, "Add at least one medicine"),
  status: z.enum(["active", "completed", "cancelled"]),
});

export type PrescriptionFormSchema = z.infer<typeof prescriptionFormSchema>;
