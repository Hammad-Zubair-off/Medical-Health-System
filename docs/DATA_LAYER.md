# Data layer pattern

Recipe for migrating a domain off `src/core/json/` onto Firestore. Frozen after Patients and Doctors (Phase B). Copy this — do not invent a CRUD factory or a new state library.

**Reference implementation:** `appointments.service.ts` + `useAppointments.ts`, plus `patient.service.ts` / `doctor.service.ts`.

---

## Per-domain checklist

1. Types in `src/core/types/<domain>.types.ts`
2. Zod in `src/core/schemas/<domain>.schema.ts`
   - `*DocSchema` — lenient read (missing fields get defaults)
   - `*FormSchema` — strict write
3. Service in `src/core/services/firestore/<domain>.service.ts`
   - `list*` always has `limit` + optional `startAfter` cursor
   - `create*` / `update*` go through `withAudit`
   - medical records: **soft-delete only** (`status: "inactive"`)
4. Hook `use<Domain>s` / `use<Domain>` with `loading` / `error` / `refresh`
5. Swap the JSON import on list / grid / detail / create / edit
6. Detail route uses `:id`; helper `*Path(id)` for links
7. Rules + composite indexes **committed** in `firestore.indexes.json`
8. Seed enough rows to exercise pagination, search, and filters
9. Delete the JSON file; grep must be 0

---

## Schema conventions

| Convention | Rule |
|---|---|
| Audit | Every write stamps `created/createdBy` or `updated/updatedBy` via `withAudit` |
| Search | Store `displayNameLower` / `nameLower`; prefix range `>= q` / `<= q + '\uf8ff'` |
| Soft delete | `status: "active" \| "inactive"` — never `deleteDoc` for Patient/Doctor/Appointment |
| Dates | Store `dateOfBirth`, never age. Derive age at render (`ageFromDob`) |
| Denormalise | Only when a list would otherwise N+1 (e.g. `Patient.lastVisit` from appointment complete) |
| IDs | Auth uid = `Users/{uid}` document id. Clinical `Patient/{id}` is a separate doc with optional `userId` |

---

## Pagination

```ts
constraints.push(orderBy("displayNameLower"));
if (cursor) constraints.push(startAfter(cursorSnap));
constraints.push(limit(pageSize));
```

Never `getDocs(collection(db, X))` with no `limit`. Never `await` inside a `for` loop over documents — use `getDocsByIds` (`_helpers.ts`).

---

## Adding an index

1. Write the query (`where` + `orderBy` that Firestore will reject).
2. Copy the index URL from the error (or emulator).
3. Add it to `firestore.indexes.json`.
4. `firebase deploy --only firestore:indexes`
5. **Commit the file.** An index that exists only in the console is invisible to the next developer.

Current composites (Patients / Doctors / Specializations / Appointments):

- `Patient`: `status + displayNameLower`, `primaryDoctorId + status`
- `Doctor`: `status + displayNameLower`, `specializationId + status`
- `Specialization`: `status + nameLower`
- `Appointment`: `status + appointmentDate`, `doctorUserId + appointmentDate`, `patientId + appointmentDate`, `doctorId + appointmentDate`

### Appointment conventions

- Canonical patient join: **`patientId`** → `Patient/{id}` (required on new writes).
- `UserPatientID` → `Users/{uid}` **only** when the patient has a login; walk-ins keep it `null`.
- Soft-delete appointments by **`status: "cancelled"`** (+ optional `cancel_reason`) — do not `deleteDoc` in normal UX.
- Denormalise `patientsName` / `patientsNumber` / `patientsEmail` / `DoctorsName` at write time.
- `lastVisit` on Patient is updated from `updateAppointment` when status becomes `completed` or `checked-out` (prefer `patientId`).

---

## Doctor account provisioning (Step 3.4)

**Decision: option (c) — interim Console UID paste.**

The browser cannot create another user's Firebase Auth account. Admin:

1. Creates the Auth user in Firebase Console (email/password)
2. Pastes the UID into Add Doctor
3. `createDoctor()` writes `Doctor/{id}` with `userid` → `Users/{uid}` and sets `role: "doctor"`

Cloud Functions / invite-link (options a/b) need Blaze and are deferred.

---

## Shared helpers

| File | What |
|---|---|
| `src/core/utils/firestore.utils.ts` | `toDate`, `toMillis`, `toTimestamp`, `toLowerSearchField` |
| `src/core/schemas/_shared.ts` | `timestampSchema`, `auditFieldsSchema`, `parseDoc` (log + skip) |
| `src/core/services/firestore/_helpers.ts` | `getDocsByIds` (chunk 10), `withAudit`, `chunk` |
| `src/core/utils/display.utils.ts` | `formatDate`, `ageFromDob`, `formatAddress` |

`useFirestoreCollection` was skipped — TanStack Query is still in `REMAINING.md` Group 2.
