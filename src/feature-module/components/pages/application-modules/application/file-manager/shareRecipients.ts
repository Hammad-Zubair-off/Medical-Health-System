import { listAppointments } from "../../../../../../core/services/firestore/appointments.service";
import { getPatientByUserId } from "../../../../../../core/services/firestore/patient.service";

export type ShareRecipient = {
  uid: string;
  label: string;
};

function refToUid(ref: unknown): string | null {
  if (!ref) return null;
  if (typeof ref === "string") {
    const parts = ref.split("/");
    return parts[parts.length - 1] || ref;
  }
  if (typeof ref === "object" && ref !== null && "id" in ref) {
    return String((ref as { id: string }).id);
  }
  return null;
}

/**
 * Role-scoped share picker: doctors see patients they've had appointments with;
 * patients see doctors they've booked. Never a global directory.
 */
export async function listShareRecipients(opts: {
  role: string | null | undefined;
  uid: string;
}): Promise<ShareRecipient[]> {
  const { role, uid } = opts;
  const map = new Map<string, string>();

  if (role === "doctor") {
    const result = await listAppointments({
      doctorUserId: uid,
      pageSize: 50,
    });
    for (const a of result.appointments) {
      const patientUid = refToUid(a.UserPatientID);
      if (patientUid && patientUid !== uid) {
        map.set(patientUid, a.patientsName || patientUid);
      }
    }
  } else if (role === "patient") {
    const patient = await getPatientByUserId(uid);
    if (patient?._id) {
      const result = await listAppointments({
        patientId: patient._id,
        pageSize: 50,
      });
      for (const a of result.appointments) {
        const doctorUid = refToUid(a.doctorUserId);
        if (doctorUid && doctorUid !== uid) {
          map.set(doctorUid, a.DoctorsName || doctorUid);
        }
      }
    }
  } else if (role === "admin") {
    const result = await listAppointments({ pageSize: 50 });
    for (const a of result.appointments) {
      const patientUid = refToUid(a.UserPatientID);
      const doctorUid = refToUid(a.doctorUserId);
      if (patientUid) map.set(patientUid, a.patientsName || patientUid);
      if (doctorUid) map.set(doctorUid, a.DoctorsName || doctorUid);
    }
  }

  return Array.from(map.entries()).map(([id, label]) => ({ uid: id, label }));
}
