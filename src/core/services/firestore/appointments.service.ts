import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  limit,
  orderBy,
  startAfter,
  Timestamp,
  DocumentReference,
  doc,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { isHoliday } from "./doctor.service";
import {
  getPatient,
  getPatientByUserId,
  getPatientsByUserIds,
  touchLastVisit,
} from "./patient.service";
import { getDocsByIds, withAudit } from "./_helpers";
import { parseDoc } from "../../schemas/_shared";
import { appointmentDocSchema } from "../../schemas/appointment.schema";
import { toTimestamp } from "../../utils/firestore.utils";
import type {
  AppointmentPatientSummary,
  CreateAppointmentInput,
  FirestoreAppointment,
  ListAppointmentsParams,
  ListAppointmentsResult,
} from "../../types/appointment.types";

export type { FirestoreAppointment };
export type PatientData = AppointmentPatientSummary;

const COLLECTION = "Appointment";
const DEFAULT_PAGE_SIZE = 20;

function toMillis(value: Timestamp | Date | null | undefined): number {
  if (!value) return 0;
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
}

function toTs(value: Timestamp | Date | undefined | null): Timestamp {
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  return Timestamp.now();
}

function refId(value: DocumentReference | string | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function parseAppointment(
  snap: {
    id: string;
    exists: () => boolean;
    data: () => Record<string, unknown> | undefined;
    ref: { path: string };
  }
): FirestoreAppointment | null {
  const parsed = parseDoc(appointmentDocSchema, snap as never, "Appointment");
  if (!parsed) {
    if (!snap.exists()) return null;
    const raw = snap.data() ?? {};
    return { _id: snap.id, ...raw } as FirestoreAppointment;
  }
  return {
    ...parsed,
    AppointmentId: parsed.AppointmentId,
    appointmentDate: parsed.appointmentDate ?? Timestamp.now(),
    appointmentTime: parsed.appointmentTime ?? Timestamp.now(),
    appointmentType: parsed.appointmentType,
    doctorId: parsed.doctorId ?? "",
    doctorUserId: parsed.doctorUserId ?? "",
    status: parsed.status,
    UserPatientID: parsed.UserPatientID,
    patientId: parsed.patientId,
  } as FirestoreAppointment;
}

/**
 * Fetch appointments for a specific doctor.
 * Semantics preserved for doctor dashboard / schedule — do not change casually.
 */
export const getDoctorAppointments = async (
  doctorUserId: string,
  limitCount?: number
): Promise<FirestoreAppointment[]> => {
  try {
    const appointmentsRef = collection(db, COLLECTION);
    const doctorUserRef = doc(db, "Users", doctorUserId);

    let q = query(appointmentsRef, where("doctorUserId", "==", doctorUserRef));
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const appointments: FirestoreAppointment[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const parsed = parseAppointment(docSnapshot);
      if (parsed) appointments.push(parsed);
    });

    appointments.sort(
      (a, b) => toMillis(b.appointmentDate) - toMillis(a.appointmentDate)
    );
    return appointments;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
};

export const getUpcomingAppointments = async (
  doctorUserId: string,
  limitCount: number = 5
): Promise<FirestoreAppointment[]> => {
  try {
    const now = Timestamp.now();
    const appointments = await getDoctorAppointments(doctorUserId);
    return appointments
      .filter((apt) => {
        const aptDate = toMillis(apt.appointmentDate);
        const isFuture = aptDate >= now.toMillis();
        const isPendingOrConfirmed =
          apt.status === "pending" || apt.status === "confirmed";
        return isFuture && isPendingOrConfirmed;
      })
      .sort((a, b) => toMillis(a.appointmentDate) - toMillis(b.appointmentDate))
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    throw error;
  }
};

/** @deprecated Prefer Patient collection joins. Kept for legacy call sites. */
export const getPatientData = async (
  patientRef: DocumentReference | string
): Promise<PatientData | null> => {
  try {
    const userDoc =
      typeof patientRef === "string"
        ? await getDoc(doc(db, "Users", patientRef))
        : await getDoc(patientRef);

    if (!userDoc.exists()) return null;
    const data = userDoc.data() as Record<string, unknown>;
    return {
      uid: userDoc.id,
      display_name: String(data.display_name ?? data.displayName ?? ""),
      email: String(data.email ?? ""),
      phone_number: String(data.phone_number ?? data.phoneNumber ?? ""),
      photo_url: (data.photo_url ?? data.photoUrl) as string | undefined,
    };
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return null;
  }
};

export const getPatientDataForAppointment = async (
  patientRef: DocumentReference | string
): Promise<PatientData | null> => {
  const uid = typeof patientRef === "string" ? patientRef : patientRef.id;
  const patient = await getPatientByUserId(uid);
  if (patient) {
    return {
      uid,
      display_name: patient.displayName,
      email: patient.email ?? "",
      phone_number: patient.phoneNumber ?? "",
      photo_url: patient.photoUrl ?? undefined,
      patientDocId: patient._id,
    };
  }
  return getPatientData(patientRef);
};

export const getAppointmentsWithPatients = async (
  doctorUserId: string
): Promise<(FirestoreAppointment & { patient?: PatientData })[]> => {
  try {
    const appointments = await getDoctorAppointments(doctorUserId);

    const patientIds = appointments
      .map((a) => a.patientId)
      .filter((id): id is string => Boolean(id));
    const patientSnaps = await getDocsByIds(db, "Patient", patientIds);
    const byPatientId = new Map(
      patientSnaps.map((s) => {
        const data = s.data();
        return [
          s.id,
          {
            uid: String(data.userId ?? ""),
            display_name: String(data.displayName ?? ""),
            email: String(data.email ?? ""),
            phone_number: String(data.phoneNumber ?? ""),
            photo_url: (data.photoUrl as string | undefined) ?? undefined,
            patientDocId: s.id,
          } satisfies PatientData,
        ];
      })
    );

    const uids = appointments
      .filter((a) => !a.patientId || !byPatientId.has(a.patientId))
      .map((a) => refId(a.UserPatientID))
      .filter((id): id is string => Boolean(id));
    const byUid = new Map(
      (await getPatientsByUserIds(uids)).map((p) => [
        p.userId ?? "",
        {
          uid: p.userId ?? "",
          display_name: p.displayName,
          email: p.email ?? "",
          phone_number: p.phoneNumber ?? "",
          photo_url: p.photoUrl ?? undefined,
          patientDocId: p._id,
        } satisfies PatientData,
      ])
    );

    return appointments.map((appointment) => {
      const fromPatientId = appointment.patientId
        ? byPatientId.get(appointment.patientId)
        : undefined;
      const uid = refId(appointment.UserPatientID);
      const fromUid = uid ? byUid.get(uid) : undefined;
      const patient = fromPatientId ?? fromUid;
      return { ...appointment, patient };
    });
  } catch (error) {
    console.error("Error fetching appointments with patients:", error);
    throw error;
  }
};

/**
 * Cursor-paginated admin/clinic list. Always includes `limit` + optional `startAfter`.
 */
export async function listAppointments(
  params: ListAppointmentsParams = {}
): Promise<ListAppointmentsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.status) {
    constraints.push(where("status", "==", params.status));
  }
  if (params.patientId) {
    constraints.push(where("patientId", "==", params.patientId));
  }
  if (params.doctorUserId) {
    constraints.push(
      where("doctorUserId", "==", doc(db, "Users", params.doctorUserId))
    );
  } else if (params.doctorId) {
    // doctorId may be stored as string or DocumentReference — prefer string field match
    constraints.push(where("doctorId", "==", params.doctorId));
  }

  if (params.from) {
    constraints.push(where("appointmentDate", ">=", toTs(params.from)));
  }
  if (params.to) {
    constraints.push(where("appointmentDate", "<=", toTs(params.to)));
  }

  constraints.push(orderBy("appointmentDate", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) {
      constraints.push(startAfter(cursorSnap));
    }
  }

  constraints.push(limit(pageSize));

  const snap = await getDocs(query(ref, ...constraints));
  const appointments = snap.docs
    .map((d) => parseAppointment(d))
    .filter((a): a is FirestoreAppointment => a !== null);

  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null;

  return { appointments, nextCursor };
}

/** Appointments for a clinical Patient/{id} (admin/doctor/patient self). */
export async function getAppointmentsByPatientId(
  patientId: string,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<FirestoreAppointment[]> {
  if (!patientId) return [];
  const result = await listAppointments({ patientId, pageSize });
  return result.appointments;
}

/**
 * Create appointment with required `patientId`. Sets `UserPatientID` only when
 * the Patient has a linked Auth account (walk-ins stay null).
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<string>;
/** @deprecated Prefer CreateAppointmentInput with patientId. */
export async function createAppointment(
  doctorUserId: string,
  doctorId: string,
  appointmentData: Omit<
    FirestoreAppointment,
    "_id" | "doctorUserId" | "doctorId" | "created"
  > & { patientId?: string | null }
): Promise<string>;
export async function createAppointment(
  doctorUserIdOrInput: string | CreateAppointmentInput,
  doctorId?: string,
  appointmentData?: Omit<
    FirestoreAppointment,
    "_id" | "doctorUserId" | "doctorId" | "created"
  > & { patientId?: string | null }
): Promise<string> {
  const input: CreateAppointmentInput =
    typeof doctorUserIdOrInput === "string"
      ? {
          doctorUserId: doctorUserIdOrInput,
          doctorId: doctorId!,
          patientId: appointmentData?.patientId ?? "",
          appointmentDate: appointmentData!.appointmentDate,
          appointmentTime: appointmentData!.appointmentTime,
          appointmentType: appointmentData!.appointmentType,
          status: appointmentData!.status,
          AppointmentId: appointmentData!.AppointmentId,
          Complain: appointmentData!.Complain,
          description: appointmentData!.description,
          diagnosis: appointmentData!.diagnosis,
          DoctorsName: appointmentData!.DoctorsName,
          patientsName: appointmentData!.patientsName,
          patientsNumber: appointmentData!.patientsNumber,
          patientsEmail: appointmentData!.patientsEmail,
          price: appointmentData!.price,
          isVideoCall: appointmentData!.isVideoCall,
        }
      : doctorUserIdOrInput;

  if (!input.patientId) {
    throw new Error("patientId is required to create an appointment");
  }

  const patient = await getPatient(input.patientId);
  if (!patient) {
    throw new Error("Patient not found");
  }

  const appointmentDate = toTs(input.appointmentDate);
  const isDateHoliday = await isHoliday(input.doctorUserId, appointmentDate);
  if (isDateHoliday) {
    throw new Error(
      "Cannot create appointment on a holiday. Please select a different date."
    );
  }

  const appointmentTime = toTs(input.appointmentTime ?? input.appointmentDate);
  const appointmentId =
    input.AppointmentId ||
    `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const userPatientRef = patient.userId
    ? doc(db, "Users", patient.userId)
    : null;

  const payload = withAudit(
    {
      AppointmentId: appointmentId,
      patientId: input.patientId,
      UserPatientID: userPatientRef,
      doctorUserId: doc(db, "Users", input.doctorUserId),
      doctorId: input.doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType: input.appointmentType,
      isVideoCall:
        input.isVideoCall ?? input.appointmentType === "video",
      status: input.status ?? "pending",
      patientsName: input.patientsName ?? patient.displayName,
      patientsNumber: input.patientsNumber ?? patient.phoneNumber ?? "",
      patientsEmail: input.patientsEmail ?? patient.email ?? "",
      DoctorsName: input.DoctorsName ?? "",
      Complain: input.Complain ?? "",
      description: input.description ?? "",
      diagnosis: input.diagnosis ?? "",
      price: input.price ?? 0,
    },
    "create"
  );

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  return docRef.id;
}

export const updateAppointment = async (
  appointmentId: string,
  appointmentData: Partial<
    Omit<FirestoreAppointment, "_id" | "doctorUserId" | "doctorId">
  >,
  doctorUserId?: string
): Promise<void> => {
  try {
    const appointmentRef = doc(db, COLLECTION, appointmentId);
    const updateData: Record<string, unknown> = { ...appointmentData };

    if (updateData.appointmentDate && doctorUserId) {
      const newAppointmentDate = toTs(
        updateData.appointmentDate as Timestamp | Date
      );
      const isDateHoliday = await isHoliday(doctorUserId, newAppointmentDate);
      if (isDateHoliday) {
        throw new Error(
          "Cannot reschedule appointment to a holiday. Please select a different date."
        );
      }
      updateData.appointmentDate = newAppointmentDate;
    } else if (updateData.appointmentDate instanceof Date) {
      updateData.appointmentDate = Timestamp.fromDate(
        updateData.appointmentDate
      );
    }

    if (updateData.appointmentTime instanceof Date) {
      updateData.appointmentTime = Timestamp.fromDate(
        updateData.appointmentTime
      );
    }

    if (updateData.UserPatientID && typeof updateData.UserPatientID === "string") {
      updateData.UserPatientID = doc(db, "Users", updateData.UserPatientID);
    }

    await updateDoc(appointmentRef, withAudit(updateData, "update"));

    if (
      updateData.status === "completed" ||
      updateData.status === "checked-out"
    ) {
      try {
        const freshSnap = await getDoc(appointmentRef);
        if (!freshSnap.exists()) return;
        const data = freshSnap.data() as FirestoreAppointment;

        if (data.patientId) {
          await touchLastVisit(data.patientId, new Date());
        } else {
          const patientUid = refId(data.UserPatientID);
          if (patientUid) {
            const patient = await getPatientByUserId(patientUid);
            if (patient) {
              await touchLastVisit(patient._id, new Date());
            }
          }
        }
      } catch (lastVisitError) {
        console.error("Failed to denormalise lastVisit:", lastVisitError);
      }
    }
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

/** Soft-cancel — never hard-deletes for normal UX. */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<void> {
  await updateAppointment(appointmentId, {
    status: "cancelled",
    cancel_reason: reason ?? "",
  });
}

/**
 * Soft-cancels the appointment. Kept name for doctor hook compatibility;
 * does not call `deleteDoc`.
 */
export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  await cancelAppointment(appointmentId);
};

export const getAppointmentById = async (
  appointmentId: string
): Promise<FirestoreAppointment | null> => {
  try {
    if (!appointmentId) return null;
    const appointmentDoc = await getDoc(doc(db, COLLECTION, appointmentId));
    return parseAppointment(appointmentDoc);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

/** Resolve a doctorId string whether stored as string or DocumentReference. */
export function appointmentDoctorId(
  appointment: FirestoreAppointment
): string | null {
  return refId(appointment.doctorId as DocumentReference | string | null);
}

export { toTimestamp };
