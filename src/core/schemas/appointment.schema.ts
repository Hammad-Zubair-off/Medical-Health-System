import { z } from "zod";
import { DocumentReference } from "firebase/firestore";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "completed",
  "cancelled",
  "rescheduled",
]);

const appointmentTypeSchema = z.enum(["physical", "video"]);

/** Accept DocumentReference, string path/id, or null. */
const refOrStringSchema = z
  .custom<DocumentReference | string | null>((val) => {
    return (
      val === null ||
      val === undefined ||
      typeof val === "string" ||
      (typeof val === "object" && val !== null && "id" in val)
    );
  })
  .nullable()
  .optional()
  .transform((v) => v ?? null);

/**
 * Lenient read schema — legacy appointments may lack `patientId`.
 */
export const appointmentDocSchema = z
  .object({
    _id: z.string(),
    AppointmentId: z.string().nullable().optional().transform((v) => v ?? ""),
    patientId: z.string().nullable().optional().transform((v) => v ?? null),
    UserPatientID: refOrStringSchema,
    Complain: z.string().nullable().optional().transform((v) => v ?? null),
    DoctorsName: z.string().nullable().optional().transform((v) => v ?? null),
    appointmentDate: timestampSchema,
    appointmentTime: timestampSchema,
    appointmentType: appointmentTypeSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "physical"),
    /** @deprecated Prefer FileObject.appointmentId attachments. Do not write new values. */
    appointmentfile: z.string().nullable().optional().transform((v) => v ?? null),
    cancel_reason: z.string().nullable().optional().transform((v) => v ?? null),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    diagnosis: z.string().nullable().optional().transform((v) => v ?? null),
    doctorId: refOrStringSchema,
    doctorUserId: refOrStringSchema,
    isVideoCall: z.boolean().nullable().optional().transform((v) => v ?? false),
    patientsEmail: z.string().nullable().optional().transform((v) => v ?? null),
    patientsName: z.string().nullable().optional().transform((v) => v ?? null),
    patientsNumber: z.string().nullable().optional().transform((v) => v ?? null),
    payment_option: z.string().nullable().optional().transform((v) => v ?? null),
    payment_status: z.string().nullable().optional().transform((v) => v ?? null),
    price: z.number().nullable().optional().transform((v) => v ?? null),
    status: appointmentStatusSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "pending"),
    urgency: z.string().nullable().optional().transform((v) => v ?? null),
    video_link: z.string().nullable().optional().transform((v) => v ?? null),
  })
  .merge(auditFieldsSchema);

export type AppointmentDoc = z.infer<typeof appointmentDocSchema>;

/** Strict write schema for admin/clinic new-appointment form. */
export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string().min(1, "Select a doctor"),
  doctorUserId: z.string().min(1, "Doctor account is required"),
  appointmentDate: z.string().min(1, "Select a date"),
  appointmentTime: z.string().min(1, "Select a time"),
  appointmentType: appointmentTypeSchema,
  status: appointmentStatusSchema,
  complain: z.string().optional(),
  description: z.string().optional(),
});

export type AppointmentFormSchema = z.infer<typeof appointmentFormSchema>;
