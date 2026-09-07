# Remaining Work — Backlog After Phase A (Auth & RBAC)

> Note: During Phase A, Cover/Illustration auth variants and `ui-modules` were deleted.
> Sidebar nested-item cleanup by role is still deferred (top-level groups are filtered).

**Purpose:** This file is the deferred backlog. Everything here was deliberately excluded from
`AUTH_RBAC_PLAN.md` to keep that phase focused.

**How to use it:** When Phase A's Definition of Done is met, hand this file back to Claude and
ask for the next phase's plan. The "State at hand-off" section below is what makes that
possible — fill it in before you do.

> ⚠️ **Do not treat this as a work plan.** It is an inventory. The items are unordered within
> each group and deliberately not broken into steps — sequencing depends on what Phase A
> actually changed and on your product priorities at that time.

---

## State at hand-off — FILL THIS IN BEFORE ASKING FOR THE NEXT PLAN

```
Phase A completed on:            ____________________
Firebase project ID now in use:  ____________________
Definition-of-Done items passed: ___ / 11

Deviations from AUTH_RBAC_PLAN.md (what you did differently, and why):
  -
  -

Deleted during Phase A?
  [ ] *Cover / *Illustration auth variants (Step 4.9)
  [ ] ui-modules template demo pages (Step 5.6)
  [ ] Social login buttons (Step 4.6)

Still broken / known-bad after Phase A:
  -
  -

What do you want to ship next, in business terms? (e.g. "patients can book an appointment
online", "admin can add a doctor", "invoicing"):
  -
```

---

## Group 1 — Data migration (the biggest remaining chunk)

**The core problem:** 47 files in `src/core/json/` are hard-coded arrays, imported directly by
44 page components. Forms across these modules have no submit handlers and no persistence.
Roughly 90% of the product is a mockup.

**The pattern to copy:** `appointments.service.ts` + `useAppointments.ts` is a genuinely good
service/hook split. Replicate it per domain — don't invent a new approach.

Per domain, the unit of work is: Firestore schema → Zod type → `*.service.ts` → `use*.ts` hook
→ replace the JSON import → wire the form (`react-hook-form`, already installed in Phase A) →
add security rules for the new collection → delete the JSON file.

Suggested priority (confirm against your answer in "State at hand-off"):

| Priority | Domain | Static files involved |
|---|---|---|
| 1 | **Patients** — list, grid, details, create, edit | `patientListData`, `patientDeatilsData`, `patientsGrid` |
| 2 | **Doctors** — list, details, add, edit, specializations, schedules | `doctorsListData`, `specializationListData` |
| 3 | **Appointments (finish)** — the admin/clinic-side views, calendar, consultations | `appointmentsData`, `doctorAppointmentsData`, `patientAppointmentsData` |
| 4 | **Prescriptions** | `doctorPrescriptionsData`, `patientPrescriptionsData` |
| 5 | **Finance** — invoices, payments, expenses, income, transactions | `invoicesData`, `paymetsListData`, `expensesListData`, `incomeListData`, `transactionsListData`, `expenseCategoryData` |
| 6 | **HRM** — staff, payroll, leaves, departments, designations, holidays, attendance | `staffsListData`, `payrollListData`, `leavesListData`, `leaveTypeData`, `hrmDepartmentsData`, `designationData`, `holidaysListData`, `doctorLeavesData` |
| 7 | **Reports** — appointment, expense, income, patient, P&L | `appointmentReportData`, `expenseReportData`, `incomeReportData`, `patientReportData` |
| 8 | **Content/CMS** — blogs, pages, FAQ, testimonials, countries/states/cities | `blogsData`, `blogCategoriesData`, `blogCommentsData`, `pagesData`, `testimonialsData`, `countriesData`, `stateData`, `citiesData` |
| 9 | **Support** — tickets, contact messages, announcements, newsletters | `ticketsListData`, `contactMessagesData`, `announcementsData`, `NewslettersData` |
| 10 | **Misc** — assets, locations, services, roles & permissions | `AssetsListData`, `locationData`, `servicesData`, `roleandPermissionData` |

**Cross-cutting notes for this group:**
- Every new collection needs matching **Firestore security rules** (extending Phase A's file)
  and probably composite **indexes** (`firestore.indexes.json`).
- `roleandPermissionData` is interesting — if you want granular permissions beyond the three
  roles, that's a design decision to make *before* migrating it.
- Several "detail" pages currently read a hard-coded object rather than a route param. They'll
  need real `:id` params, which means touching `all_routes.tsx` — coordinate with anything left
  over from Phase A's route split.

---

## Group 2 — Performance

- **Bundle: 6.98 MB JS (1.38 MB gzip), single chunk; 2.61 MB CSS.** Target < 400 KB gzip initial.
- **Zero code-splitting.** Route-level `React.lazy` + `Suspense` + `manualChunks`. This is much
  easier after Phase A's route-file split — that's part of why the split was done there.
- **Four overlapping UI kits**: `antd` + `primereact` + `react-bootstrap` + `bootstrap`, plus
  `jquery`, `dragula`, `@hello-pangea/dnd`. Pick one; removing the others is a large but
  mechanical change.
- **Duplicate single-purpose libs:** `moment` **and** `dayjs` (drop moment) · three phone-input
  libs · three mask libs (`react-input-mask`, `react-imask`, `imask`) · four star-rating libs ·
  three scrollbar libs (`react-perfect-scrollbar`, `overlayscrollbars-react`,
  `react-scrollbars-custom`, `smooth-scrollbar`).
- **Every icon font bundled**: iconsax (1.3 MB), tabler (1.2 MB), remixicon, fontawesome,
  ionicons, themify, typicons, weather — mostly unused. Subset or lazy-load.
- **N+1 Firestore reads** in `admin.service.ts`: `getAdminStatistics`, `getAppointmentStatistics`,
  `getPopularDoctors`, `getTopDepartments`, `getRecentTransactions` each independently call
  `getAllAppointments()`; `getPopularDoctors` and `getAvailableDoctors` `await getDoc()` inside
  a loop; `getTopPatients` queries inside a `for` loop; `getAppointmentsWithPatients` awaits a
  patient fetch per appointment. Fix with fetch-once-and-pass-down, `where(documentId(),"in",…)`
  batching (10-id chunks), write-time denormalisation of doctor/patient name+photo, and
  `getCountFromServer` for pure counts.
- **Server-state caching:** adopt TanStack Query or RTK Query. Would fix most of the above N+1
  redundancy structurally rather than by hand.
- Consider moving heavy dashboard roll-ups to a Cloud Function or a scheduled `stats/` document.

---

## Group 3 — Code quality & type safety

*(Explicitly deprioritised by you for Phase A. Revisit when the app does something.)*

- **783 ESLint problems (780 errors)**, almost all `@typescript-eslint/no-explicit-any`.
  **517 `any`** in `src/`. Burn down per-module; enable the type-checked ESLint config
  (`recommendedTypeChecked`) — the README literally documents how.
- **Typed Redux**: `useSelector((state: any) => …)` in `feature.tsx` and both sidebars.
  Export typed `RootState`/`AppDispatch` and typed hooks.
- **Runtime validation at the Firestore boundary.** Documents are cast with
  `as FirestoreAppointment` straight off `docSnapshot.data()`. Zod schemas would also kill the
  ~15 "alternative field name" fallbacks in `reviews.service.ts` (`reviewedBy`/`reviewed_by`/
  `Reviewed_By`, `rating`/`Rating`, …) — those exist because the schema was never pinned down.
- **`Timestamp instanceof` ladder copy-pasted ~12 times** across `admin`, `appointments`,
  `doctor`, `useDoctorDashboard`. Extract one `toDate()`/`toMillis()` util.
- **134 `console.*` calls** shipped to production. Add a logger util or
  `vite-plugin-remove-console`; send real errors to Sentry (and have `ErrorBoundary`, mounted in
  Phase A, report there instead of `console.error`).
- **Path aliases** — imports go six levels deep (`../../../../../../core/services/…`).
  Add tsconfig `paths` + `vite-tsconfig-paths`.
- **`skipLibCheck: true`** hides `@types/*` problems — e.g. `@types/react-bootstrap@0.32` (v0!)
  against `react-bootstrap@2.10`. Wrong types package entirely.
- **Naming/typos**: `DoctorDahboard` (file + component), `AddInoivce`, `paymetsListData`,
  `patientDeatilsData`, `feathure-components`, and both `pages-module/` *and* `pages-modules/`.
  Data files use `.tsx` for plain arrays (should be `.ts`).
- **`react-router` vs `react-router-dom`** both imported across the codebase; v7 merged them.
  Standardise.
- **Giant files**: `sidebarData.tsx` (1,868), `uiDropdowns.tsx` (3,707), `uiModals.tsx` (2,760),
  `notes.tsx` (2,751), `fileManager.tsx` (2,705), `patientDetails.tsx` (2,171).
- **67 direct DOM manipulations** (`document.getElementById`, `new window.bootstrap.Offcanvas`).
  Fragile under StrictMode. Migrate to `react-bootstrap` components or a headless lib.
- **Placeholder business logic in shipped UI**: `admin.service.ts` has
  `const doctorsTrend = 95; // Placeholder` and `patientsTrend = 25;`; `useDoctorDashboard`
  hard-codes `walkinBookings: 0, followUps: 0, rescheduled: 0`. Users are shown fabricated
  numbers. Compute for real or hide.

---

## Group 4 — Repo hygiene & tooling

- **`dist/` is committed** — 454 artifacts, 52 MB. `.gitignore` line 11 is `# dist` (commented
  out). Fix: uncomment, `git rm -r --cached dist`. Consider `git filter-repo` to purge history
  (`.git` is 33 MB) — coordinate with anyone else who has a clone.
- **Junk dependencies**: `"i": "^0.3.7"` and `"npm": "^11.6.0"` in `dependencies` (accidental
  `npm i i` / `npm i npm`). Also `sass-loader` — webpack-only, does nothing in a Vite project.
- **39 npm vulnerabilities** (3 critical, 24 high): `websocket-driver` critical,
  multiple `vite` dev-server highs (arbitrary file read via WebSocket, path traversal),
  `yaml` moderate. `npm audit fix` handles all. *(Note: mostly dev-server issues, which is why
  this wasn't a Phase A blocker — but fix it before any public deployment.)*
- **No `engines` field** — Node version unpinned.
- **No CI.** GitHub Actions running `lint` + `tsc -b` + `build` + `test` +
  `npm audit --audit-level=high` on PRs. Meaningless until the lint count comes down, so
  sequence it with Group 3.
- **No tests** beyond the security-rules tests added in Phase A Step 6.4. Add Vitest + RTL.
  Highest-value first targets: `useDoctorDashboard` trend math, `admin.service` revenue
  filters, `isHoliday` date normalisation, `convertFirestoreToAppointment`.
- **Six overlapping analysis docs** (`CODEBASE_ANALYSIS.md`, `COMPREHENSIVE_CODE_REVIEW.md`,
  `HIGH_PRIORITY_ISSUES_DETAILED.md`, `ISSUES_SUMMARY.md`, `ROUTES_ANALYSIS.md`,
  `DOCTOR_ROUTES_COMPLETE_LIST.md`, plus `DOCTOR_SCHEDULE_FLUTTERFLOW_ATTRIBUTES.md`) that
  disagree with each other. Consolidate into one `docs/` tree.

---

## Group 5 — Product completeness

- **Template demo pages still routed**: `/application/*` (email, chat, kanban, notes, file
  manager, social feed, todo, calls) and `ui-modules/*`. Decide per module: build it for real,
  or delete it. Every one you keep is code you maintain.
- **`/super-admin/*` routes exist but are unimplemented** (companies, subscriptions, packages,
  domain, purchase-transaction) — this is multi-tenant SaaS scaffolding from the template.
  Delete unless you actually want multi-tenancy.
- **Branding**: `index.html` `<title>` is still
  "Login Form | Doctoury - Medical & Hospital - Bootstrap 5 Admin Template" and
  `<meta name="author" content="Dreams Technologies">`. Favicon, OG tags, real app name.
- **Accessibility** beyond the auth screens fixed in Phase A: `aria-label`s, keyboard nav,
  focus management in modals, table semantics, colour contrast.
- **i18n**: `i18next` + `react-i18next` + language detector + http backend are all installed
  and, as far as the audit found, unused. Either wire it up or remove ~4 dependencies.
- **No audit trail beyond what Phase A Step 7.5 adds.** Medical records need
  who-changed-what-when across every collection, not just appointments and schedules.
- **No `updated`/`updatedBy` on most write paths.**
- **Notifications** — settings pages exist for doctor and patient notification preferences, but
  there's no notification system behind them.
- **File uploads** — `appointmentfile` and `photo_url` fields exist; Firebase Storage is
  configured in the SDK but there's no upload UI or Storage security rules.

---

## Group 6 — Deferred from Phase A specifically

These came up while planning Phase A and were consciously pushed out:

- **Custom claims for roles.** Phase A reads `role` from `Users/{uid}`, which means a `get()`
  in nearly every security rule — costs a read and counts against the 10-`get`-per-request
  limit. If cost or limits bite, mirror `role` into Firebase custom claims via a Cloud Function
  (needs Blaze plan). Phase A's `normalizeRole` and `AppUser` shape are designed so this is a
  swap inside `AuthContext`, not a rewrite.
- **Deep sidebar menu filtering.** Phase A Step 5.9 filters top-level groups by role. The
  nested items in `sidebarData.tsx` (1,868 lines) still advertise routes a given role can't
  reach — they'll 403 rather than 404, so it's cosmetic, but it's confusing.
- **Email-verification enforcement policy.** Phase A recommends allow-in-with-a-banner.
  Revisit whether specific actions (booking, prescribing) should require a verified email.
- **Multi-factor auth.** The template has `two-step-verification` screens. Firebase supports
  SMS/TOTP MFA. Worth it for admin and doctor accounts handling PHI.
- **Session timeout / idle logout.** There's a `lock-screen` component in the template with
  nothing behind it. Clinical workstations are shared — this matters more here than in most apps.
- **Account lifecycle**: admin-side flows to invite/provision doctors and admins, deactivate
  users, and handle the `deleteAccountRequestData` module. Phase A only covers patient
  self-registration.
- **Rate limiting / abuse protection** on auth endpoints beyond Firebase's built-in
  `auth/too-many-requests`. Consider App Check.

---

## Compliance note

If this system will hold real patient data in a jurisdiction with health-privacy law
(HIPAA in the US, GDPR + national health rules in the EU, PIPEDA in Canada, etc.), the
engineering backlog above is necessary but **not sufficient**. You will additionally need:
a signed BAA with Google Cloud (Firebase is capable of HIPAA compliance, but only for
covered services and only under a BAA), a complete audit log, encryption-at-rest key
management decisions, data-retention and deletion policies, breach-notification procedures,
and access reviews.

**This is a legal/compliance workstream, not a coding task.** Start it in parallel — it has
long lead times and it can invalidate architectural choices made months earlier.

---

*Generated alongside `AUTH_RBAC_PLAN.md`. Hand this file back once Phase A's Definition of Done
is met and the "State at hand-off" section above is filled in.*
