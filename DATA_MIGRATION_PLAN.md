# Phase B — Data Migration (Group 1)

**Scope:** Replace static JSON with real Firestore data, starting with the foundations and the
two highest-value domains — **Patients** and **Doctors** — plus one blocking security-rules bug
inherited from Phase A.

**Explicitly out of scope:** ESLint/`any` cleanup, bundle size, `dist/` in git, npm audit,
TanStack Query adoption, the other eight domains (Prescriptions, Finance, HRM, Reports,
Content, Support, Misc). Those stay in `REMAINING.md`.

**Estimated effort:** 12–18 working days.

**Depends on:** Phase A complete (verified — commit `5c8c68c`).

---

## Verified state at hand-off

`REMAINING.md`'s "State at hand-off" block was left blank, so this was verified directly
against the repo. Do not re-derive.

| Check | Result |
|---|---|
| Phase A commit | `5c8c68c feat(auth): add Firebase Auth, RBAC guards, and Firestore rules` |
| Hard-coded IDs (`kEmEnY…`, `rg7yL0…`) in `src/` | ✅ 0 results |
| `nike-shoes-store` in `src/` | ✅ 0 results |
| `src/firebase.ts` + 6 × `import.meta.env.VITE_FIREBASE` | ✅ present |
| `firestore.rules`, `firebase.json`, `.firebaserc`, `firestore.indexes.json` | ✅ present |
| Route files split | ✅ `admin` / `doctor` / `patient` / `shared` / `auth` / `ui`.routes.tsx |
| Guards | ✅ `ProtectedRoute`, `PublicOnlyRoute`, `RoleLanding` |
| Auth layer | ✅ `AuthContext`, `auth.service.ts`, `auth-errors.ts`, `users.service.ts`, `auth.types.ts` |
| Seed script | ✅ `scripts/seed.ts` — admin / doctor / patient + 1 `Doctor` doc + 1 `Appointment` |
| `react-hook-form` + `zod` + `@hookform/resolvers` | ✅ installed |
| `vitest` + `@firebase/rules-unit-testing` | ✅ installed |
| Cover/Illustration auth variants, `ui-modules` | ✅ deleted |
| **Static JSON files remaining** | ❌ **47** |
| **Components still importing `core/json/`** | ❌ **43** |
| `firestore.indexes.json` | ⚠️ **empty** (`{"indexes":[],"fieldOverrides":[]}`) |
| `createPatient.tsx` submit handler | ❌ none — still a dead form |
| Detail routes (`patientDetails`, `doctorsDetails`) | ❌ no `:id` param |

---

## 🔴 Blocking bug found during planning — fix this first

**Phase A's `Users` read rule locks doctors out of their own patients.**

`firestore.rules`:
```
match /Users/{uid} {
  allow read: if isSelf(uid) || isAdmin();
```

But `getAppointmentsWithPatients()` (`appointments.service.ts`) calls `getPatientData()` for
every appointment, which reads `Users/{patientId}`. A **doctor is neither `isSelf` nor
`isAdmin`** for their patient's document → **permission denied**.

Everything a doctor sees is affected: the doctor dashboard, appointments list, reviews,
consultations. This was not caught in Phase A because the rules unit tests covered
"patient cannot read another patient" but not "doctor reading their patient".

There is a second, quieter problem in the same call path: `getPatientData()` still does
`query(usersRef, where("uid","==",patientRef))` when handed a string — a **collection query**,
not a document read. Firestore rules cannot evaluate `isSelf(uid)` on a query, so this fails
even for cases that should pass. Phase A standardised on uid-as-document-ID; this call site was
never updated.

Both are fixed in **Step 0**. Do not start Step 1 until Step 0's tests pass.

---

## Decisions locked in

| Decision | Choice |
|---|---|
| **Patient model** | **Separate `Patient` collection + optional `userId` link to `Users/{uid}`.** Clinical data (DOB, gender, blood group, allergies, address) lives in `Patient`. Walk-ins created by staff have `userId: null`. Self-registered patients get linked. |
| **Detail routes** | **Add `:id` params now**, as part of each domain's migration. |
| **Review cadence** | **One domain per PR.** Patients ships and is reviewed before Doctors starts. |
| Doctor collection | Keep the **existing `Doctor` collection** — it already has `userid`, `specialization`, `time_slots`, `enabled_days`, `holidays` and is wired into working code. Extend it; do not replace it. |
| Specializations | Promote to a real `Specialization` collection (currently `specializationListData`). Doctors reference it by id. |

### Why Patients before Doctors

`Doctor` already has a partially-working service layer (`doctor.service.ts`) and live consumers.
`Patient` has nothing — it is pure mockup, it is the larger surface, and **`Appointment`
already references patients** (`UserPatientID`), so getting the patient model right first
prevents rework in the appointment views. Doctors second because its migration mostly
*extends* code that already works.

---

## Target architecture

Follow the Phase A / `appointments.service.ts` pattern exactly. Do not invent a new one.

```
src/core/
├── types/
│   ├── patient.types.ts          Patient, PatientFormValues
│   ├── doctor.types.ts           extends existing DoctorData
│   └── specialization.types.ts
├── schemas/                      NEW — Zod, one file per domain
│   ├── patient.schema.ts         patientDocSchema (read) + patientFormSchema (write)
│   ├── doctor.schema.ts
│   └── specialization.schema.ts
├── services/firestore/
│   ├── patient.service.ts        NEW  — CRUD + list + search
│   ├── doctor.service.ts         EXTEND — add CRUD/list to existing read fns
│   ├── specialization.service.ts NEW
│   └── users.service.ts          (Phase A — extend with a batched reader)
└── utils/
    └── firestore.utils.ts        NEW — toDate/toMillis (kills the ~12× copy-paste)

src/feature-module/components/pages/
├── clinic-modules/patients/hooks/usePatients.ts
├── clinic-modules/patient-details/hooks/usePatient.ts
└── clinic-modules/doctors-list/hooks/useDoctors.ts
```

### Firestore schema — `Patient/{id}`

```ts
{
  patientId:    string;              // human-readable, e.g. "PT-0001"
  userId:       string | null;       // Users/{uid} if they can log in; null for walk-ins
  displayName:  string;
  email:        string | null;
  phoneNumber:  string | null;
  photoUrl:     string | null;
  dateOfBirth:  Timestamp | null;    // store DOB, derive age — never store age
  gender:       "male" | "female" | "other" | null;
  bloodGroup:   string | null;
  address:      { line1, line2, city, state, country, postalCode } | null;
  allergies:    string[];
  status:       "active" | "inactive";
  primaryDoctorId: string | null;    // Doctor/{id}
  lastVisit:    Timestamp | null;    // denormalised from Appointment — see 2.6
  created:      Timestamp;
  createdBy:    string;              // uid
  updated:      Timestamp | null;
  updatedBy:    string | null;
}
```

Three deliberate choices:

- **`dateOfBirth`, not `age`.** The mock data has `"26, Male"` as a single string. Age is
  derived at render time. Storing it means every record silently rots.
- **`lastVisit` denormalised.** Computing it per row means one query per patient on the list
  page — the N+1 pattern the audit already flagged in `admin.service.ts`. Write it when an
  appointment completes.
- **`userId` nullable.** This is what makes staff-created walk-ins possible.

---

## THE TODO LIST

---

### STEP 0 — Fix the doctor↔patient read bug 🔴 BLOCKING

- [ ] **0.1** Add to `firestore.rules`: a doctor may read `Users/{uid}` when that user is the
      patient on at least one of the doctor's appointments. Firestore rules cannot query, so the
      practical form is a **`patientOf` allow-list** — but the cleanest fix given the new
      `Patient` collection is: **doctors read patient *clinical* data from `Patient`, not
      `Users`.** So:
      - Keep `Users` read as `isSelf || isAdmin` (correct — auth data is private).
      - Add `match /Patient/{id}` with read allowed for `admin`, the linked patient
        (`resource.data.userId == request.auth.uid`), and **any signed-in doctor**
        (clinic staff legitimately need the patient roster).
      - Change the appointment→patient join to read `Patient`, not `Users`.
- [ ] **0.2** Fix `getPatientData()` in `appointments.service.ts`: when given a string, use
      `getDoc(doc(db,"Users",id))` — **not** `query(where("uid","==",…))`. A collection query
      cannot satisfy a per-document rule. Keep the `DocumentReference` branch as-is.
- [ ] **0.3** Add rules tests for the gap that shipped:
      - doctor CAN read a `Patient` doc
      - doctor CANNOT read an unrelated `Users` doc
      - patient CAN read their own `Patient` doc
      - patient CANNOT read another patient's `Patient` doc
      - signed-out CANNOT read any `Patient` doc
- [ ] **0.4** `firebase deploy --only firestore:rules`.

**Verify:** log in as the seeded doctor (`doctor@example.com` / `Doctor123!` from
`scripts/seed.ts`), open the doctor dashboard, confirm patient names render and the console is
free of `permission-denied`.

**Commit:** `fix(rules): allow doctors to read patient records; fix Users doc lookup`

---

### STEP 1 — Shared foundations (do once, used by every domain)

- [ ] **1.1** `src/core/utils/firestore.utils.ts` — `toDate()`, `toMillis()`, `toTimestamp()`.
      The `x instanceof Timestamp ? x.toDate() : x instanceof Date ? x : …` ladder is
      copy-pasted ~12× across `admin`, `appointments`, `doctor`, `useDoctorDashboard`.
      Write it once. **Replace those call sites as you touch them** — do not do a big-bang
      refactor of files this phase doesn't otherwise change.
- [ ] **1.2** `src/core/schemas/_shared.ts` — a `timestampSchema` (accepts `Timestamp | Date |
      null`), `audit` fields (`created/createdBy/updated/updatedBy`), and a
      `parseDoc(schema, snapshot)` helper that **logs and skips** an invalid document rather
      than throwing. One malformed record must not blank an entire list page.
- [ ] **1.3** `src/core/services/firestore/_helpers.ts`:
      - `getDocsByIds(collection, ids)` — chunks into 10s and uses
        `where(documentId(),"in",chunk)`. This is the fix for the N+1 pattern and every domain
        needs it.
      - `withAudit(data, uid, mode)` — stamps `created/createdBy` or `updated/updatedBy`.
- [ ] **1.4** `src/core/hooks/useFirestoreCollection.ts` — optional but recommended: the
      loading/error/refresh boilerplate is identical in `useAppointments` and
      `useDoctorDashboard` and will be repeated 10 more times.
      *(If you plan to adopt TanStack Query soon — it's in `REMAINING.md` Group 2 — skip this
      and use a plain hook per domain; don't build an abstraction you'll replace.)*
- [ ] **1.5** Unit tests for `firestore.utils.ts` and `getDocsByIds` chunking (>10 ids,
      exactly 10, 0 ids). `vitest` is already installed.

**Verify:** `npm run build` passes; `npx vitest run` green.

**Commit:** `feat(core): add firestore utils, zod helpers, and batched id reader`

---

### STEP 2 — Patients domain (PR #1)

#### Schema & service
- [ ] **2.1** `src/core/types/patient.types.ts` + `src/core/schemas/patient.schema.ts`
      per the schema above. Two schemas: `patientDocSchema` (lenient — tolerates legacy/missing
      fields) and `patientFormSchema` (strict — validates user input).
- [ ] **2.2** `src/core/services/firestore/patient.service.ts`:
      `listPatients({ search, status, doctorId, limit, cursor })`, `getPatient(id)`,
      `getPatientByUserId(uid)`, `createPatient(data, actorUid)`, `updatePatient(id, data,
      actorUid)`, `setPatientStatus(id, status, actorUid)`.
      **Do not hard-delete patients** — medical records. `status: "inactive"` only.
- [ ] **2.3** Pagination: use `startAfter` cursors, not `.slice()`. `listPatients` must never
      fetch the whole collection — that's the `getAllAppointments()` mistake from the audit.
      Firestore has no native text search: implement `search` as a `displayNameLower`
      prefix range query (`>= q`, `<= q + ''`) and store `displayNameLower` on write.
      Anything richer needs Algolia/Typesense — note it, don't build it.

#### Rules & indexes
- [ ] **2.4** Extend `firestore.rules` for `Patient` (per 0.1): create → admin/doctor;
      update → admin/doctor, or the linked patient for a **narrow self-service field set**
      (phone, address, photo — never `status`, never `primaryDoctorId`); delete → admin only.
- [ ] **2.5** **Populate `firestore.indexes.json`** — it is currently empty. `listPatients`
      needs composites for `status + displayNameLower`, `primaryDoctorId + status`.
      Run the query, take the index URL Firestore prints in the error, add it to the file,
      `firebase deploy --only firestore:indexes`. **Commit the file** — an index that exists
      only in the console is invisible to the next developer.
- [ ] **2.6** `lastVisit` denormalisation: when an appointment transitions to
      `completed`/`checked-out`, write `lastVisit` onto the patient. Add it to
      `updateAppointment` in `appointments.service.ts`.

#### Hooks & UI
- [ ] **2.7** `usePatients.ts` (list + filters + pagination) and `usePatient.ts` (single).
      Mirror `useAppointments.ts`: own `loading` / `error` / `refresh`.
- [ ] **2.8** **`patients.tsx`** — replace `PatientListData` with `usePatients()`.
      Keep the existing `Datatable` and column defs; change only the data source and the
      `render` functions' field names. Add loading skeleton + empty state + error alert
      (copy the pattern from `doctorDahboard.tsx`, which already does this correctly).
- [ ] **2.9** **`patientsGrid.tsx`** — same data source, card layout.
- [ ] **2.10** **Route params.** Add `patientDetails: "/patient-details/:id"` to
      `all_routes.tsx`; add a `patientDetailsPath(id)` helper. Update every
      `to={all_routes.patientDetails}` link to pass the real id.
      ⚠️ Grep for **all** call sites — patients list, grid, appointments table, dashboards.
      Do the same for `doctorsDetails` in Step 3.
- [ ] **2.11** **`patientDetails.tsx`** (2,171 lines) — read `:id` via `useParams`, load with
      `usePatient(id)`. **Do not attempt to refactor this file's size** in this phase; swap the
      data source only. Handle not-found → 404.
- [ ] **2.12** **`createPatient.tsx`** — currently has **no submit handler at all**.
      Wire `react-hook-form` + `zodResolver(patientFormSchema)`. On submit → `createPatient()`
      → redirect to the new patient's detail page. Inline field errors, disabled+spinner
      submit, form-level error alert.
- [ ] **2.13** **`editPatient.tsx`** — same form component, prefilled via `usePatient(id)`,
      calls `updatePatient`. Extract the shared field markup into
      `patient-form/PatientForm.tsx` — do not duplicate a 200-line form.
- [ ] **2.14** Delete `src/core/json/patientListData.tsx` and `patientDeatilsData.tsx`
      (note the typo — it's real). Confirm no imports remain.
- [ ] **2.15** Extend `scripts/seed.ts` with ~8 patients — a mix of linked (`userId` set) and
      walk-in (`userId: null`), varied status and `lastVisit`, so pagination and filters are
      actually exercised.

**Verify:**
- Admin: list loads from Firestore, search/filter/paginate work, create → appears in list,
  edit → persists, detail page loads by URL id, unknown id → 404.
- Doctor: can see the patient list (rules from Step 0).
- Patient: can see **their own** record; hitting another patient's id → denied, not a blank page.
- `grep -rn "patientListData\|patientDeatilsData" src/` → 0 results.
- Network tab: list page issues **one** query, not one-per-row.

**Commit:** `feat(patients): migrate patients domain to Firestore`
**→ STOP. Review this PR before starting Step 3.**

---

### STEP 3 — Doctors domain (PR #2)

Same recipe. Differences called out below.

- [ ] **3.1** **Specializations first** — Doctors reference them.
      `Specialization/{id}` = `{ name, nameLower, description, status, icon }`.
      Service + `useSpecializations` + migrate `specializations.tsx`.
      Seed from the existing `specializationListData.tsx`, then delete that file.
      Rules: read → any signed-in; write → admin only.
- [ ] **3.2** `doctor.types.ts` / `doctor.schema.ts`. **Extend the existing `DoctorData`** —
      `doctor.service.ts` already defines `DoctorTimeSlots`, `DoctorEnabledDays`,
      `DoctorHoliday` and they are consumed by working schedule code. Add:
      `userid` (existing ref), `displayName`, `displayNameLower`, `email`, `phoneNumber`,
      `photoUrl`, `specializationId`, `qualifications[]`, `experienceYears`,
      `consultationFee`, `bio`, `languages[]`, `status`, audit fields.
      ⚠️ `DoctorData` currently has an `[key: string]: unknown` index signature. Keep it during
      migration so existing consumers don't break; tighten it in a later phase.
- [ ] **3.3** **Extend** `doctor.service.ts` (don't create a parallel file):
      add `listDoctors({search, specializationId, status, limit, cursor})`, `createDoctor`,
      `updateDoctor`, `setDoctorStatus`. Keep `getDoctorData`, `getDoctorDataByUserId`,
      `isHoliday`, `updateDoctorSchedule` untouched — they're live.
- [ ] **3.4** ⚠️ **`createDoctor` is a two-part write.** A doctor needs an Auth user +
      `Users/{uid}` with `role:"doctor"` + a `Doctor/{id}` doc. The client **cannot** create
      another user's Auth account. Options:
      **(a)** A Cloud Function `createDoctorAccount` (admin-only) — correct, needs Blaze.
      **(b)** Admin invite flow: create `Doctor` with `userid: null` + `invitedEmail`; the
      doctor self-registers and a Cloud Function links them.
      **(c)** Interim: admin creates the Auth user manually in console, pastes the uid into the
      form.
      **Pick one and confirm with the user before building** — this is a product decision, and
      (a)/(b) both add a Cloud Functions dependency this project doesn't yet have.
- [ ] **3.5** Rules: `Doctor` create/delete → admin; update → admin or `doctorOwnsDoc()`
      (already correct in Phase A). Add rules + indexes for `Specialization`.
      Index: `status + displayNameLower`, `specializationId + status`.
- [ ] **3.6** `useDoctors.ts` / `useDoctor.ts`.
- [ ] **3.7** Migrate `doctorsList.tsx`, `doctors.tsx` (grid), `doctorDetails.tsx` (+ `:id`
      per 2.10), `addDoctor.tsx`, `editDoctor.tsx` (shared `DoctorForm`).
- [ ] **3.8** `patientDoctors.tsx` (patient-facing "browse doctors") — same `listDoctors`,
      filtered to `status: "active"`.
- [ ] **3.9** Delete `doctorsListData.tsx`, `specializationListData.tsx`, `patientDoctorsData.tsx`.
- [ ] **3.10** Extend `scripts/seed.ts`: 6–8 specializations, 5–6 doctors across them.

**Verify:** as 2.x, plus — the **existing** doctor dashboard and schedule pages still work
(they read `Doctor` via `getDoctorDataByUserId`; a schema change here breaks them silently).
Regression-test `/doctor/doctor-dashboard` and `/doctor/doctor-schedule` explicitly.

**Commit:** `feat(doctors): migrate doctors and specializations to Firestore`
**→ STOP. Review before continuing.**

---

### STEP 4 — Consolidate & document the pattern

Once two domains are done, freeze the recipe so the remaining eight are mechanical.

- [ ] **4.1** `docs/DATA_LAYER.md` — the per-domain checklist, the schema conventions
      (audit fields, `*Lower` search fields, soft delete, denormalisation rules), the pagination
      pattern, and how to add an index.
- [ ] **4.2** Extract anything duplicated between `patient.service.ts` and `doctor.service.ts`
      into `_helpers.ts` — **only what's genuinely duplicated twice.** Do not build a generic
      CRUD factory off two samples.
- [ ] **4.3** Update `REMAINING.md`: strike Patients/Doctors/Specializations from the Group 1
      table; record the Step 3.4 decision; note remaining `core/json` count.
- [ ] **4.4** Update `AUDIT_REPORT.md` §4.4 with the real remaining count (was "47 files /
      44 components"; should be ~42 / ~36 after this phase).

**Commit:** `docs: document the data-layer pattern for remaining domains`

---

## Definition of done

1. `grep -rn "patientListData\|patientDeatilsData\|doctorsListData\|specializationListData\|patientDoctorsData" src/` → **0 results**.
2. Patients and Doctors list/detail/create/edit all read and write Firestore.
3. Detail routes carry `:id`; a wrong id yields 404, not a blank page or a hard-coded record.
4. `firestore.indexes.json` is **non-empty** and committed.
5. Rules tests cover Patient and Doctor for all three roles + signed-out; all green.
6. A doctor can load their dashboard with patient names — no `permission-denied` (Step 0).
7. Seeded data exercises pagination (>1 page), search, and filters.
8. List pages issue one query per page, not one per row (check the Network tab).
9. `/doctor/doctor-dashboard` and `/doctor/doctor-schedule` still work (regression).
10. `npm run build` passes; `npx vitest run` green.

---

## Guidance for the AI agent executing this

- **Step 0 before anything else.** It's a live security-rules bug that blocks doctor views.
  Do not bundle it into the Patients PR.
- **One domain per PR.** Patients ships and is reviewed before Doctors begins. Do not start
  Step 3 until Step 2 is approved.
- **Copy the existing pattern.** `appointments.service.ts` + `useAppointments.ts` is the
  reference. Same file layout, same error handling, same naming. Do not introduce a new state
  library, a CRUD factory, or a repository abstraction.
- **Never fetch a whole collection.** Every list query needs `limit` + a cursor. If you find
  yourself writing `getDocs(collection(db, X))` with no constraint, stop.
- **Never `await` inside a `for` loop over documents.** Use `getDocsByIds` (1.3). This is the
  single most repeated defect in the existing codebase.
- **Soft-delete only** for Patient, Doctor, Appointment. Medical records are not deletable.
- **Every write gets audit fields** (`created/createdBy` or `updated/updatedBy`) via
  `withAudit`. Phase A started this on appointments; keep it universal.
- **Add the index when you add the query**, and commit `firestore.indexes.json`. A query that
  only works because someone clicked a console link is a production outage waiting to happen.
- **Don't refactor big files you're only re-pointing.** `patientDetails.tsx` is 2,171 lines;
  swap its data source and move on. Size cleanup is Group 3.
- **Don't touch the 517 `any`s** outside files you're already rewriting. Still deprioritised.
- **Don't migrate domains 4–10.** Out of scope. If Patients/Doctors reveal a pattern problem,
  raise it — better to fix the recipe than to replicate it eight times.
- **Ask before building Step 3.4** (doctor account provisioning) — it may require Cloud
  Functions and Blaze, which is a project-level decision.
- **When verification fails, stop and report.** Do not proceed with a partially-working
  migration; half-migrated data is worse than none.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Rules lock out doctors** (already happening) | Step 0, with tests, before any UI work. |
| Legacy `Users` docs lack the new fields | `patientDocSchema` is lenient; `parseDoc` logs and skips rather than throwing (1.2). |
| Missing composite index → runtime error in prod | 2.5 / 3.5: add + commit the index with the query. Test against the emulator with real data volume. |
| Schema drift between `Doctor` (existing, live) and the new typed version | 3.2 extends rather than replaces; keep the index signature; explicit regression test in Step 3's verify. |
| Doctor account provisioning needs Cloud Functions | 3.4 — decide before building; interim option (c) needs no new infra. |
| Full-collection reads sneak back in | Code-review rule: every `getDocs` must have `limit` or a `where`. |
| Two-part writes leave orphans (Auth user without `Doctor` doc, or vice versa) | Same rollback discipline as Phase A's `signUpPatient`; prefer a Cloud Function transaction if you choose 3.4(a). |
| Detail-route change misses a link | 2.10: grep every `all_routes.patientDetails` / `doctorsDetails` usage; a missed one navigates to a route that no longer matches. |
| `lastVisit` denormalisation drifts | Write it in exactly one place (`updateAppointment`); add a backfill note to `REMAINING.md`. |

---

**Next:** the remaining eight domains in `REMAINING.md` Group 1 follow `docs/DATA_LAYER.md`
from Step 4.1. Hand `REMAINING.md` back — with the State block filled in this time — when this
phase's Definition of Done is met.
