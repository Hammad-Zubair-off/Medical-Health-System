# Data Migration Plan — 6 Phases

**Status:** Phase B (these six phases) is done. Next working file: [`DATA_MIGRATION_APPOINTMENTS.md`](./DATA_MIGRATION_APPOINTMENTS.md).

Split of [`DATA_MIGRATION_PLAN.md`](../DATA_MIGRATION_PLAN.md) (Phase B / Group 1) into six executable phases.

**Scope:** Replace static JSON with Firestore for **Patients** and **Doctors**, plus the Phase A security-rules bug.  
**Out of scope:** ESLint/`any`, bundle size, TanStack Query, the other eight domains (see `REMAINING.md`).  
**Effort:** 12–18 working days · **Depends on:** Phase A (`5c8c68c`).

---

## Phase map

| Phase | Name | Original step | PR / cadence |
|------:|------|---------------|--------------|
| **1** | Orient & lock decisions | Preamble + architecture | No PR — read-only |
| **2** | Fix doctor↔patient read bug | STEP 0 | Standalone fix PR |
| **3** | Shared foundations | STEP 1 | Core PR |
| **4** | Patients domain | STEP 2 | PR #1 — stop for review |
| **5** | Doctors domain | STEP 3 | PR #2 — stop for review |
| **6** | Consolidate, document & close | STEP 4 + DoD | Docs PR + handoff |

---

## Phase 1 — Orient & lock decisions

**Goal:** Confirm hand-off state, locked product decisions, and target architecture before writing code.

### Verified state (do not re-derive)

| Check | Result |
|---|---|
| Phase A commit | `5c8c68c feat(auth): add Firebase Auth, RBAC guards, and Firestore rules` |
| Hard-coded IDs / `nike-shoes-store` in `src/` | ✅ gone |
| Firebase env, rules, indexes files, route split, guards, auth layer | ✅ present |
| Seed script | ✅ `scripts/seed.ts` |
| Static JSON still in use | ❌ **47** files · **43** components import `core/json/` |
| `firestore.indexes.json` | ⚠️ empty |
| `createPatient.tsx` submit | ❌ dead form |
| Detail routes | ❌ no `:id` |

### Decisions locked in

| Decision | Choice |
|---|---|
| Patient model | Separate `Patient` collection + optional `userId` → `Users/{uid}` |
| Detail routes | Add `:id` during each domain migration |
| Review cadence | **One domain per PR** (Patients before Doctors) |
| Doctor collection | Keep & extend existing `Doctor` |
| Specializations | Promote to `Specialization` collection |

### Why Patients before Doctors

`Patient` is pure mockup and `Appointment` already references patients. `Doctor` already has a partial service layer — extend it second.

### Target layout

```
src/core/types/          patient | doctor | specialization
src/core/schemas/        Zod doc + form schemas
src/core/services/firestore/  patient (new) · doctor (extend) · specialization (new)
src/core/utils/firestore.utils.ts
hooks under clinic-modules/...
```

### `Patient/{id}` shape (summary)

`patientId`, nullable `userId`, identity fields, `dateOfBirth` (not age), address, allergies, soft `status`, `primaryDoctorId`, denormalised `lastVisit`, audit fields.

**Exit:** Team agrees on decisions above; no code changes required.

---

## Phase 2 — Fix doctor↔patient read bug 🔴 BLOCKING

**Goal:** Doctors can load patient names on dashboards/appointments without `permission-denied`.  
**Do not start Phase 3 until this phase’s verify + tests pass.**

### Work

1. Keep `Users` read as `isSelf \|\| isAdmin`.
2. Add `match /Patient/{id}` — read for admin, linked patient, any signed-in doctor; clinical joins use `Patient`, not `Users`.
3. Fix `getPatientData()` to use `getDoc` by id (not a `uid` query).
4. Add rules unit tests (doctor/patient/signed-out matrix).
5. `firebase deploy --only firestore:rules`.

### Verify

Log in as `doctor@example.com` / `Doctor123!` → doctor dashboard shows patient names, no `permission-denied`.

### Commit

`fix(rules): allow doctors to read patient records; fix Users doc lookup`

---

## Phase 3 — Shared foundations

**Goal:** One-time utilities every domain will reuse. Touch call sites only as you migrate them.

### Work

| ID | Task |
|----|------|
| 1.1 | `firestore.utils.ts` — `toDate` / `toMillis` / `toTimestamp` |
| 1.2 | `schemas/_shared.ts` — `timestampSchema`, audit fields, `parseDoc` (log+skip) |
| 1.3 | `_helpers.ts` — `getDocsByIds` (chunk 10), `withAudit` |
| 1.4 | Optional `useFirestoreCollection` — skip if TanStack Query is imminent |
| 1.5 | Unit tests for utils + `getDocsByIds` |

### Verify

`npm run build` · `npx vitest run`

### Commit

`feat(core): add firestore utils, zod helpers, and batched id reader`

---

## Phase 4 — Patients domain (PR #1)

**Goal:** List / grid / detail / create / edit backed by Firestore; delete mock JSON.

### Schema & service

- Types + Zod (`patientDocSchema` lenient, `patientFormSchema` strict)
- `patient.service.ts` — list (cursor pagination + `displayNameLower` prefix search), get, CRUD, soft status only
- Rules + indexes (`status + displayNameLower`, `primaryDoctorId + status`) — **commit** `firestore.indexes.json`
- `lastVisit` write from appointment completion

### Hooks & UI

- `usePatients` / `usePatient`
- Migrate `patients.tsx`, `patientsGrid.tsx`, `patientDetails.tsx` (swap data only)
- `:id` routes + update all links
- Wire `createPatient` / `editPatient` with RHF + shared `PatientForm`
- Delete `patientListData.tsx`, `patientDeatilsData.tsx`
- Seed ~8 patients (linked + walk-in)

### Verify

Admin/doctor/patient role checks · no mock imports · one list query per page · 404 on bad id.

### Commit

`feat(patients): migrate patients domain to Firestore`  
**→ STOP. Review before Phase 5.**

---

## Phase 5 — Doctors domain (PR #2)

**Goal:** Specializations + Doctors on Firestore; keep live schedule/dashboard working.

### Work

1. **Specializations first** — collection, service, UI, seed, delete JSON
2. Extend `DoctorData` / schema / `doctor.service.ts` (list, create, update, status)
3. **Decide 3.4** before building: Cloud Function vs invite vs console uid paste
4. Rules + indexes for Doctor & Specialization
5. Hooks + migrate list/grid/details/forms + patient “browse doctors”
6. Delete doctor/specialization/patientDoctors JSON
7. Seed 6–8 specializations, 5–6 doctors

### Verify

Same as patients, plus regression on `/doctor/doctor-dashboard` and `/doctor/doctor-schedule`.

### Commit

`feat(doctors): migrate doctors and specializations to Firestore`  
**→ STOP. Review before Phase 6.**

---

## Phase 6 — Consolidate, document & close

**Goal:** Freeze the recipe for the remaining eight domains; close Phase B DoD.

### Work

| ID | Task |
|----|------|
| 4.1 | Write `docs/DATA_LAYER.md` (checklist, conventions, pagination, indexes) |
| 4.2 | Extract only real duplication from patient/doctor services into `_helpers` |
| 4.3 | Update `REMAINING.md` (strike done rows, record 3.4 decision, JSON count) |
| 4.4 | Update `AUDIT_REPORT.md` §4.4 remaining counts |

### Definition of done (all must pass)

1. Grep for migrated JSON filenames → **0** hits in `src/`
2. Patients & Doctors list/detail/create/edit use Firestore
3. Detail routes use `:id`; bad id → 404
4. `firestore.indexes.json` non-empty and committed
5. Rules tests green for Patient/Doctor × roles + signed-out
6. Doctor dashboard shows patient names (Phase 2)
7. Seed exercises pagination, search, filters
8. List pages: one query per page (no N+1)
9. Doctor dashboard + schedule still work
10. `npm run build` + `npx vitest run` green

### Commit

`docs: document the data-layer pattern for remaining domains`

### Handoff

Fill `REMAINING.md` State block; remaining domains follow `docs/DATA_LAYER.md`.

---

## Cross-cutting rules (every phase)

- Phase **2** before anything else that needs doctor→patient reads.
- One domain per PR; do not start Phase 5 until Phase 4 is approved.
- Copy `appointments.service.ts` + `useAppointments.ts` — no new state library / CRUD factory.
- Never full-collection `getDocs`; never `await` in a document loop — use `getDocsByIds`.
- Soft-delete only; every write uses `withAudit`.
- Add + commit indexes with the query that needs them.
- Ask before Phase 5 account-provisioning (3.4).
- If verify fails: stop and report.

## Key risks

| Risk | Mitigation |
|---|---|
| Rules lock out doctors | Phase 2 first, with tests |
| Missing composite indexes | Commit indexes with queries |
| Doctor schema breaks live schedule | Extend, don’t replace; regress dashboard/schedule |
| Provisioning needs Blaze/CF | Decide 3.4 before building |
| Missed detail-route links | Grep all `patientDetails` / `doctorsDetails` usages |
