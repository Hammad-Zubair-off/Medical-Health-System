# Data Migration — Active Work (Phases 1–2) + Master Todo

Working file for Phase B. Overview: [`DATA_MIGRATION_PHASES.md`](./DATA_MIGRATION_PHASES.md). Pattern: [`DATA_LAYER.md`](./DATA_LAYER.md).

**Status:** implementation complete in the working tree. Commits/PRs were not created (ask if you want them).

**Next:** [`DATA_MIGRATION_APPOINTMENTS.md`](./DATA_MIGRATION_APPOINTMENTS.md) — finish Appointments (admin/clinic + patient views).

---

## Phase 1 — Orient & lock decisions

**Status:** ☑ Done

- [x] Read verified hand-off table
- [x] Confirm locked decisions:
  - [x] Separate `Patient` collection + optional `userId`
  - [x] Add `:id` on detail routes during migration
  - [x] One domain per PR (Patients → then Doctors) — *implemented together at your request*
  - [x] Keep/extend existing `Doctor` collection
  - [x] Promote specializations to `Specialization` collection
- [x] Patients before Doctors (Appointment already joins patients)
- [x] Target file layout
- [x] `Patient/{id}` fields
- [x] Blocking bug noted and fixed in Phase 2

---

## Phase 2 — Fix doctor↔patient read bug 🔴 BLOCKING

**Status:** ☑ Done (rules deployed; emulator tests not run — no Java on this machine)

- [x] **0.1** `firestore.rules` — `Users` stays `isSelf || isAdmin`; `Patient` readable by admin/doctor/linked patient
- [x] **0.2** `getPatientData()` uses `getDoc`; appointment join uses `Patient` via `getPatientsByUserIds`
- [x] **0.3** Rules unit tests added in `tests/firestore/rules.test.ts`
- [x] **0.4** `firebase deploy --only firestore:rules` (and indexes) to `medical-health-system-dev`

**Verify:** log in as `doctor@example.com` / `Doctor123!` and confirm the doctor dashboard shows **Demo Patient** with no `permission-denied`. Seed created a linked `Patient` doc for that user.

---

## Master todo list (all phases)

### Phase 1 — Orient

- [x] **1-A** Confirm hand-off + locked decisions + architecture

### Phase 2 — Blocking rules (STEP 0)

- [x] **0.1** Patient rules + join via `Patient`
- [x] **0.2** Fix `getPatientData()` document lookup
- [x] **0.3** Rules tests written (need Firestore emulator + Java to execute)
- [x] **0.4** Deploy Firestore rules
- [ ] **0-V** Browser verify doctor dashboard patient names *(please confirm after login)*

### Phase 3 — Shared foundations (STEP 1)

- [x] **1.1** `firestore.utils.ts`
- [x] **1.2** `schemas/_shared.ts`
- [x] **1.3** `_helpers.ts` — `getDocsByIds`, `withAudit`, `chunk`
- [x] **1.4** Skipped `useFirestoreCollection` (TanStack Query still in Group 2)
- [x] **1.5** Unit tests — 17 passed
- [x] **1-V** `npm run build` passed; `npx vitest run tests/unit` passed
- [ ] **1-C** Commit *(not created — say if you want one)*

### Phase 4 — Patients (STEP 2)

- [x] **2.1** types + schema
- [x] **2.2** `patient.service.ts`
- [x] **2.3** Cursor pagination + `displayNameLower`
- [x] **2.4** Patient rules
- [x] **2.5** `firestore.indexes.json` populated and deployed
- [x] **2.6** `lastVisit` on appointment complete/checked-out
- [x] **2.7** `usePatients` + `usePatient`
- [x] **2.8** `patients.tsx`
- [x] **2.9** `patientsGrid.tsx`
- [x] **2.10** `:id` routes + helpers
- [x] **2.11** `patientDetails.tsx` header from Firestore
- [x] **2.12** `createPatient.tsx`
- [x] **2.13** `editPatient.tsx` + `PatientForm`
- [x] **2.14** Deleted patient JSON mocks
- [x] **2.15** Seed: 3 linked + 18 walk-ins
- [ ] **2-V** Role matrix in a browser *(please confirm)*
- [ ] **2-C** / **2-R** Commit / PR *(not created)*

### Phase 5 — Doctors (STEP 3)

- [x] **3.1** Specializations
- [x] **3.2** Extended `DoctorData` + `doctor.schema.ts`
- [x] **3.3** Extended `doctor.service.ts` (schedule fns untouched)
- [x] **3.4** **Decision: option (c)** — Console UID paste (no Cloud Functions)
- [x] **3.5** Doctor + Specialization rules & indexes
- [x] **3.6** `useDoctors` / `useDoctor`
- [x] **3.7** List/grid/details/add/edit + `DoctorForm`
- [x] **3.8** `patientDoctors.tsx` (active only)
- [x] **3.9** Deleted doctor/specialization/patientDoctors JSON
- [x] **3.10** Seed: 8 specializations, 5 doctors
- [ ] **3-V** Browser regress dashboard & schedule *(please confirm)*
- [ ] **3-C** / **3-R** Commit / PR *(not created)*

### Phase 6 — Consolidate & close (STEP 4)

- [x] **4.1** `docs/DATA_LAYER.md`
- [x] **4.2** Shared helpers in `_helpers.ts` / `firestore.utils.ts` (no CRUD factory)
- [x] **4.3** `REMAINING.md` updated
- [x] **4.4** `AUDIT_REPORT.md` §4.4 — 42 JSON files / 39 components
- [ ] **4-C** Commit *(not created)*
- [x] **DoD** Code/build/seed/indexes/rules deploy met; emulator tests + browser verify outstanding
- [x] **Handoff** `REMAINING.md` State block filled

---

## Progress snapshot

| Phase | Focus | Status |
|------:|-------|--------|
| 1 | Orient & lock decisions | ☑ |
| 2 | Blocking rules fix | ☑ |
| 3 | Shared foundations | ☑ |
| 4 | Patients domain | ☑ |
| 5 | Doctors domain | ☑ |
| 6 | Document & close | ☑ |

**Demo logins:** [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md).
