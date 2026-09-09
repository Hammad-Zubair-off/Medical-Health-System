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

Current composites (Patients / Doctors / Specializations / Appointments / Prescriptions /
Finance / Misc):

- `Patient`: `status + displayNameLower`, `primaryDoctorId + status`
- `Doctor`: `status + displayNameLower`, `specializationId + status`
- `Specialization`: `status + nameLower`
- `Appointment`: `status + appointmentDate`, `doctorUserId + appointmentDate`, `patientId + appointmentDate`, `doctorId + appointmentDate`
- `Prescription`: `doctorUserId + prescribedOn`, `patientUserId + prescribedOn`, `patientId + prescribedOn`, `status + prescribedOn`
- `Invoice` / `Payment` / `Expense` / `ExpenseCategory`: see `firestore.indexes.json`
- `Asset`: `status + nameLower`, `locationId + status`, `locationId + nameLower`
- `Location` / `Service`: `status + nameLower`

### Reports (no new collections)

Client-side from existing collections via `report.service.ts` + `report.utils.ts`:
default last 30 days, max 366-day span, hard cap 5,000 docs per query (paginated batches of 500).

### Clinic misc collections

| Collection | Money fields | Rules |
|---|---|---|
| `Asset` | `purchaseCost` (minor units) | signed-in read; admin write |
| `Location` | — | signed-in read; admin write |
| `Service` | `price` (minor units) | signed-in read; admin write |

Address dropdowns for patient forms use static `src/core/constants/geo.ts` (CMS countries/states/cities deleted).

### Clinic settings (free-tier admin Settings)

| Collection / doc | Purpose | Rules |
|---|---|---|
| `ClinicSettings/main` | Organization, working hours, appointment prefs (store-only), invoice prefix/terms, payment method flags, GDPR, maintenance, preferences | signed-in read; admin write |
| `CancellationReason` | Soft-delete lookup | signed-in read; admin create/update; no delete |
| `TaxRate` / `Currency` / `BankAccount` | Finance lookups | same |

- Invoice numbers: `Counter/invoice` + prefix from `ClinicSettings.invoice.prefix` (via `allocateInvoiceNumberInTx`).
- Hook: `src/core/hooks/useClinicSettings.ts`.
- Out of scope: SMS/email delivery, call UIs, Stripe, cron/backups.

### File Manager (Cloudinary)

| Collection | Purpose | Rules |
|---|---|---|
| `FileObject` | Metadata for Cloudinary assets (`publicId` + `secureUrl`, `sharedWith[]`, optional `appointmentId`) | owner / shared / admin read; owner create; soft-delete only |
| `FileFolder` | One-level folders | owner / admin |

Assets are **not** in Firebase Storage. See `docs/FILE_MANAGER.md`.

### Appointment conventions

- Canonical patient join: **`patientId`** → `Patient/{id}` (required on new writes).
- `UserPatientID` → `Users/{uid}` **only** when the patient has a login; walk-ins keep it `null`.
- Soft-delete appointments by **`status: "cancelled"`** (+ optional `cancel_reason`) — do not `deleteDoc` in normal UX.
- Denormalise `patientsName` / `patientsNumber` / `patientsEmail` / `DoctorsName` at write time.
- `lastVisit` on Patient is updated from `updateAppointment` when status becomes `completed` or `checked-out` (prefer `patientId`).

---

## Doctor account provisioning (Step 3.4)

**Decision: admin password provisioning via secondary Auth app** (`provisionLoginAccount` in `auth.service.ts`), with optional legacy Console UID paste on Add Doctor.

Cloud Functions invite-link still optional for production hardening.

---

## Shared helpers

| File | What |
|---|---|
| `src/core/utils/firestore.utils.ts` | `toDate`, `toMillis`, `toTimestamp`, `toLowerSearchField` |
| `src/core/schemas/_shared.ts` | `timestampSchema`, `auditFieldsSchema`, `parseDoc` (log + skip) |
| `src/core/services/firestore/_helpers.ts` | `getDocsByIds` (chunk 10), `withAudit`, `chunk` |
| `src/core/utils/display.utils.ts` | `formatDate`, `ageFromDob`, `formatAddress` |
| `src/core/utils/money.utils.ts` | `toMinor`, `fromMinor`, `formatMoney` (integer minor units) |
| `src/core/utils/report.utils.ts` | date-range validation, grouping, `%` change |
| `src/core/constants/geo.ts` | static country/state/city options |

`useFirestoreCollection` was skipped — TanStack Query is still in `REMAINING.md` Group 2.
