# Data Migration — Active Work (Appointments Phases 1–2) + Master Todo

Working file for **Group 1 priority 3**: finish Appointments.  
Phase B (Patients + Doctors) is closed — see [`DATA_MIGRATION_ACTIVE.md`](./DATA_MIGRATION_ACTIVE.md).

**Pattern:** [`DATA_LAYER.md`](./DATA_LAYER.md) — copy `appointments.service.ts` + `patient.service.ts`. Do **not** invent a CRUD factory or a new state library.

**Demo logins:** [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md).

**Status:** ☑ Implementation complete in the working tree (rules + indexes deployed). Commits/PRs not created unless asked.

---

## Agent brief (read before any code)

You are finishing a **partial** Appointments domain. Doctor list / dashboard / schedule already hit Firestore `Appointment`. Admin/clinic list, calendar, new-appointment, consultations, and **patient** appointments still render `src/core/json/`. Detail URLs have **no `:id`**.

Do **only** Appointments. Do not start Prescriptions, Finance, HRM, Reports, CMS, or bundle work.

If a verify step fails: **stop and report**. Do not silently paper over `permission-denied`.

---

## Scope

**In:** `Appointment` collection, admin/clinic views, calendar, new appointment, consultations, patient list/detail, doctor detail `:id`, seed, rules, indexes, delete appointment JSON that this domain owns.

**Out:** `appointmentReportData` (Reports), `appointmentSettings` (settings UI), prescriptions, invoices, admin-dashboard N+1 rewrite (`admin.service.ts`), TanStack Query, ESLint/`any`, `dist/`.

---

## Phase map (Appointments only)

| Phase | Name | Status |
|------:|------|--------|
| **1** | Orient & lock | ☑ |
| **2** | Data layer | ☑ |
| **3** | Admin list + create | ☑ |
| **4** | Calendar + consult + doctor `:id` | ☑ |
| **5** | Patient views | ☑ |
| **6** | Close | ☑ |

---

## Master todo (end-to-end)

### Phase 1 — Orient

- [x] **1-A** Read this file + DATA_LAYER + AUDIT §4.4
- [x] **1-B** Confirm mock vs live pages
- [x] **1-C** Lock `patientId` / walk-in / soft-cancel
- [x] **1-D** Do not regress doctor dashboard / schedule / doctor appointments

### Phase 2 — Data layer

- [x] **2.1** types — `src/core/types/appointment.types.ts`
- [x] **2.2** Zod — `src/core/schemas/appointment.schema.ts`
- [x] **2.3** `listAppointments` + walk-in-safe `createAppointment` + cancel instead of `deleteDoc`
- [x] **2.4** lastVisit via `patientId`
- [x] **2.5** rules + tests
- [x] **2.6** indexes committed + deployed
- [x] **2.7** seed ≥ 20 appointments (`SEED-001`…`SEED-024`)
- [x] **2.8** rules tests extended
- [x] **2-V** `npm run build` + unit vitest green; rules/indexes deployed

### Phase 3 — Admin list + create

- [x] **3.1** `useAppointmentsList`
- [x] **3.2** `/appointments` on Firestore
- [x] **3.3** `:id` helpers + consultation/detail routes
- [x] **3.4** `/new-appointment` RHF + Firestore patient/doctor dropdowns
- [x] **3.5** Status / cancel actions

### Phase 4 — Calendar, consultations, doctor detail

- [x] **4.1** `/appointment-calendar` from Firestore
- [x] **4.2** `/appointment-consultations/:id`
- [x] **4.3** `/doctor/doctors-appointment-details/:id`
- [x] **4.4** Doctor list links include `:id`

### Phase 5 — Patient views

- [x] **5.1** `/patient/patient-appointments`
- [x] **5.2** `/patient/patient-appointment-details/:id` with ownership check
- [x] **5.3** Patient cancel = status update

### Phase 6 — Close

- [x] **6.1** Deleted `appointmentsData`, `patientAppointmentsData`, `doctorAppointmentsData` (kept `appointmentReportData`)
- [x] **6.2** Grep → 0
- [x] **6.3** `DATA_LAYER.md` updated
- [x] **6.4** `REMAINING.md` updated — next = Prescriptions
- [x] **6.5** `AUDIT_REPORT.md` §4.4 — **39** JSON / **~37** components
- [ ] **6-C** Commit / PR *(only if asked)*

---

## Known follow-ups (not blockers for DoD)

- Doctor appointments **calendar toggle** is a no-op (details need `:id`).
- Emulator rules tests need Java locally to execute.
- Browser smoke: admin list / create / patient list / doctor dashboard.

## Related

- Pattern: [`DATA_LAYER.md`](./DATA_LAYER.md)
- Demo accounts: [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md)
