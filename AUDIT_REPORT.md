# Medical Health System — Complete Technical Audit

**Auditor role:** Senior Software Engineer
**Audit date:** 2026-09-07
**Repository:** github.com/Hammad-Zubair-off/Medical-Health-System
**Branch:** `main` @ `cecb877`
**Commit history:** 4 commits total ("Initial commit" + 3 follow-ups)

---

## 1. Executive Summary

This is a **purchased Bootstrap 5 admin template** ("Doctoury" by Dreams Technologies) that is
being partially retrofitted into a real application backed by Firebase/Firestore. The migration
is **roughly 15–20% complete**. Three feature areas (Admin Dashboard, Doctor Dashboard, Doctor
Appointments/Reviews/Schedule) have real data wiring; the other ~90 page components still render
hard-coded arrays from `src/core/json/`.

The single most serious finding is that **there is no authentication and no authorization
anywhere in the product**. Every route is public, the "logged-in doctor" is a string constant
hard-coded in a React context, and the Firebase project has no security rules committed. Anyone
who opens the site is the admin.

### Verdict

| Dimension | Rating | Note |
|---|---|---|
| Architecture | ⚠️ Weak | Template structure fighting a real app; no layering discipline |
| Security | 🔴 Critical | No auth, no Firestore rules, credentials in git, wrong Firebase project |
| Type safety | 🔴 Poor | 780 lint errors, 517 `any`, `strict` defeated in practice |
| Performance | 🔴 Poor | 7 MB JS bundle, 2.6 MB CSS, zero code-splitting, N+1 Firestore reads |
| Testing | 🔴 None | 0 tests, no test runner, no CI |
| Maintainability | ⚠️ Weak | 1,868-line files, 47 static-data files, duplicated patterns |
| Build health | 🟢 OK | `tsc -b && vite build` passes; `dist/` erroneously committed |

**Production readiness: NOT READY.** Estimated 8–12 weeks of focused work for one senior
engineer to reach a defensible MVP, dominated by auth, the data-migration backlog, and a
security-rules layer.

---

## 2. Project Facts

| Metric | Value |
|---|---|
| Tracked files | 1,721 |
| `src/` files | 846 (448 `.tsx`, 63 `.scss`, 16 `.ts`) |
| Lines of TS/TSX/JS in `src/` | ~164,700 |
| Routes defined | ~276 (`router.link.tsx` is 1,506 lines) |
| Static-data files | 47 (`src/core/json/*.tsx`) |
| Components importing static JSON | 44 |
| Components/hooks importing Firestore services | 14 |
| Firestore service modules | 4 (`admin`, `appointments`, `doctor`, `reviews`) |
| ESLint problems | **783 (780 errors, 3 warnings)** |
| `any` occurrences in `src/` | 517 |
| `console.*` calls in `src/` | 134 |
| `@ts-expect-error` / `eslint-disable` | 10 |
| `TODO`/`FIXME`/`HACK` | 11 |
| `npm audit` | **39 vulns — 3 critical, 24 high, 9 moderate, 3 low** |
| Tests | 0 |
| CI pipelines | 0 |
| Production JS bundle | **6.98 MB** (1.38 MB gzip), single chunk |
| Production CSS bundle | **2.61 MB** (400 KB gzip) |
| `dist/` committed to git | Yes — 454 build artifacts, 52 MB |
| `.git` size | 33 MB |

### Stack

React 19.1 · TypeScript 5.9 · Vite 6.3 · Redux Toolkit · React Router 7 ·
Firebase 12.6 (Firestore + Auth SDK imported, Auth unused) · Bootstrap 5 + Ant Design +
PrimeReact + React-Bootstrap (four UI kits) · SCSS.

---

## 3. Critical Findings (fix before any deployment)

### 3.1 ✅ RESOLVED — see AUTH_RBAC_PLAN.md

Authentication is implemented via Firebase Auth + `AuthContext`. Hard-coded doctor IDs removed.
Login/register/forgot/reset/logout are wired. Roles live on `Users/{uid}.role`.

### 3.2 ✅ RESOLVED — see AUTH_RBAC_PLAN.md

Route guards (`ProtectedRoute`, `PublicOnlyRoute`, `RoleLanding`) and role-split route files
are in place. Sidebars switch by role.

### 3.3 ✅ RESOLVED — see AUTH_RBAC_PLAN.md

Firebase config moved to `VITE_FIREBASE_*` env vars (`src/core/config/env.ts`, `src/firebase.ts`).
App points at `medical-health-system-dev`.

### 3.4 ✅ RESOLVED — see AUTH_RBAC_PLAN.md

`firestore.rules`, `firebase.json`, `.firebaserc`, and rules unit tests added. Deploy with
`firebase deploy --only firestore:rules` after bootstrap admin (see README).

---

<details><summary>Original §3.1–3.4 text (pre–Phase A, archived)</summary>

### 3.1 🔴 No authentication — the entire app is unauthenticated (ARCHIVED)

`src/core/context/UserContext.tsx` hard-codes the "current doctor":

```ts
const HARDCODED_DOCTOR_USER_ID = "kEmEnYxoHLQifCyS6IOF0FDXQYl2";
const [currentUser] = useState<FirebaseUser | null>(null);
const [doctorUserId] = useState<string | null>(HARDCODED_DOCTOR_USER_ID);
const [loading] = useState<boolean>(false);
```

`onAuthStateChanged` is commented out. `login.tsx` and `registerBasic.tsx` are pure markup —
the "Login" button is a `<Link to={all_routes.dashboard}>`; there is **no form state, no
`signInWithEmailAndPassword`, no validation, no submit handler**. The doctor ID
`rg7yL0esOEBVsv1Lh9mt` is also hard-coded in `useAppointments.ts` when creating appointments.

**Impact:** No user identity, no sessions, no per-user data isolation, roles cannot be enforced.
Every visitor sees admin dashboards and can read/write Firestore.

**Fix:** Implement Firebase Auth (email/password + the social buttons that are already drawn),
wire `onAuthStateChanged` into `UserContext`, store the resolved `uid` + role there, remove all
hard-coded IDs.

---

### 3.2 🔴 No route protection / no RBAC (ARCHIVED)

`router.tsx` maps every entry in `publicRoutes` and `authRoutes` with no guard component.
`grep` for `ProtectedRoute|RequireAuth|PrivateRoute|AuthGuard` → **0 matches**. Admin, doctor,
and patient areas are separated only by URL prefix (`/doctor/*`, `/patient/*`) which the
`Feature` layout uses purely to pick a sidebar.

**Fix:** Add a `<ProtectedRoute requiredRole="...">` wrapper that reads auth state from context,
redirects unauthenticated users to `/login`, and 403s on role mismatch. Split
`router.link.tsx` into `auth.routes.tsx` / `admin.routes.tsx` / `doctor.routes.tsx` /
`patient.routes.tsx`.

---

### 3.3 🔴 Firebase credentials committed to git — and pointing at the wrong project (ARCHIVED)

`src/firebase.js` (present since the initial commit):

```js
const firebaseConfig = {
  apiKey: "AIzaSyAYjwxLmKAdDz2HDeLN6VaNgTD2bjt9pgs",
  authDomain: "nike-shoes-store-d8afd.firebaseapp.com",
  projectId: "nike-shoes-store-d8afd",
  storageBucket: "nike-shoes-store-d8afd.firebasestorage.app",
  ...
};
```

Two problems:

1. **The project is `nike-shoes-store-d8afd`** — an unrelated e-commerce project. This medical
   app is reading/writing collections (`Doctor`, `Appointment`, `Users`) inside someone's Nike
   shoe-store database.
2. `import.meta.env` is used **0 times** — nothing is externalised. `.env` is gitignored but
   unused; there is no `.env.example`.

> Firebase web API keys are not secrets in the traditional sense (they identify the project, not
> authorize access), so the real exposure here is #1 plus the total absence of security rules
> (§3.4). Still, config belongs in environment variables, not source.

**Fix:** Create a dedicated Firebase project for this app. Move all config to
`import.meta.env.VITE_FIREBASE_*`, add `.env.example`, convert `firebase.js` → `firebase.ts`
and delete the `// @ts-expect-error` shims in the four service files.

---

### 3.4 🔴 No Firestore security rules in the repository (ARCHIVED)

No `firestore.rules`, `firebase.json`, or `.firebaserc`. Combined with §3.1–3.3, if the project
is in "test mode" (open rules) the database is world-readable and world-writable. Patient
names, emails, phone numbers, diagnoses, and complaints are stored in `Appointment` docs
(`patientsEmail`, `patientsNumber`, `diagnosis`, `Complain`) — this is health data.

**Fix:** Author `firestore.rules` with per-collection, per-role, per-owner constraints; commit
`firebase.json` + `.firebaserc`; deploy via CI. Treat this as a compliance prerequisite (PHI).

</details>

---

### 3.5 🔴 Dependency vulnerabilities: 3 critical / 24 high

`npm audit` → 39 vulnerabilities. Highlights:

- **`websocket-driver` (critical)** — resource-limit bypass, message corruption.
- **`vite` (multiple high)** — dev-server arbitrary file read via WebSocket, path traversal in
  optimized-deps `.map` handling, `server.fs.deny` bypass.
- **`yaml` (moderate)** — stack overflow via nested collections.

`npm audit fix` is offered for all of them.

**Fix:** Run `npm audit fix`, re-run the build, pin transitive fixes with `overrides` where
needed, and add `npm audit --audit-level=high` to CI.

---

## 4. High-Priority Findings

### 4.1 TypeScript strictness is nominal only

`tsconfig.app.json` sets `"strict": true`, `noUnusedLocals`, `noUnusedParameters` — but ESLint
reports **780 errors**, almost all `@typescript-eslint/no-explicit-any` (517 `any` in source).
Redux selectors use `useSelector((state: any) => ...)` in `feature.tsx` and both sidebars.
Firestore documents are cast with `as FirestoreAppointment` straight off `docSnapshot.data()`
with no runtime validation, and the reviews service invents ~15 "alternative field name"
fallbacks (`reviewedBy` / `reviewed_by` / `Reviewed_By`, `rating` / `Rating`) because the schema
is undefined.

**Fix:** Type the Redux `RootState`/`AppDispatch` and export typed hooks. Introduce a schema
validator (Zod) at the Firestore boundary. Turn on `typescript-eslint` type-checked config
(the README even documents how) and burn the `any` count down module by module. Fix the 3
`react-hooks/exhaustive-deps` warnings.

---

### 4.2 Bundle size: 7 MB JS in one chunk, no code-splitting

`vite build` output:

```
dist/assets/index-*.js    6,975.26 kB │ gzip: 1,375.47 kB
dist/assets/index-*.css   2,609.04 kB │ gzip:   400.37 kB
(!) Some chunks are larger than 500 kB after minification.
```

Causes:
- **Zero `React.lazy` / `Suspense`** — every one of ~276 routes is eagerly imported in
  `router.link.tsx`.
- **Four overlapping UI libraries**: `antd` + `primereact` + `react-bootstrap` + `bootstrap`,
  plus `jquery`, `dragula`, `@hello-pangea/dnd`.
- **Duplicate single-purpose libs**: `moment` **and** `dayjs`; `react-phone-number-input` +
  `react-phone-input-2`; `react-input-mask` + `react-imask` + `imask`; `react-slick` +
  `slick-carousel`; five star-rating libraries (`react-star-ratings`, `react-rating`,
  `react-awesome-stars-rating`, `react-simple-star-rating`, ...); three scrollbar libs.
- **Every icon font is bundled**: iconsax (1.3 MB woff), tabler (1.2 MB), remixicon,
  fontawesome, ionicons, themify, typicons, weather — most unused.

**Fix:** Route-level `React.lazy` + `manualChunks`. Pick **one** UI kit and one lib per job;
delete the rest. Drop `moment` for `dayjs`. Remove `jquery`. Subset or lazy-load icon fonts.
Realistic target: < 400 KB gzip initial JS.

---

### 4.3 N+1 Firestore read patterns in the service layer

`admin.service.ts` fetches **all** appointments and **all** doctors on every dashboard load,
then loops:

```ts
for (const doctor of doctors) {
  ...
  const userDoc = await getDoc(userDocRef);   // one round-trip per doctor, awaited serially
}
```

`getTopPatients` does `getDocs(query(usersRef, where("uid","==",patientId)))` **inside a
`for` loop** over every distinct patient. `useAdminDashboard` fires 10 aggregate functions in
`Promise.all`, several of which independently re-fetch the entire `Appointment` and `Doctor`
collections (`getAdminStatistics`, `getAppointmentStatistics`, `getPopularDoctors`,
`getTopDepartments`, `getRecentTransactions` all call `getAllAppointments()` separately).
`getAppointmentsWithPatients` maps every appointment to an awaited `getPatientData` call.

**Impact:** Dashboard load = hundreds of document reads that grow linearly with the practice;
slow first paint; Firestore billing scales with page views, not users.

**Fix:** Fetch each collection once per dashboard render and pass it down. Batch user lookups
with `where(documentId(), "in", chunk)` (10-ID chunks) or denormalise doctor/patient
display-name + photo onto the appointment doc at write time. Consider Firestore aggregation
queries (`getCountFromServer`) for the pure counts. Move heavy roll-ups to a Cloud Function or
a scheduled `stats/` document.

---

### 4.4 90% of the product is still fake data

**Update (Appointments):** Admin/clinic/patient appointment views now use Firestore.
Remaining static JSON: **39 files** in `src/core/json/`, imported by **~37** page components
(was 42 / 39 after Phase B). Finance, HRM, Content/CMS, Support, Reports, Prescriptions,
Locations, and Services are still mockups.

**Update (Phase B):** Patients, Doctors, and Specializations read/write Firestore.

The pattern to copy is documented in `docs/DATA_LAYER.md`.

**Original note:** 47 files / 44 components were hard-coded arrays. Forms across remaining
modules still have no submit handlers. Prioritise remaining domains (Prescriptions → Invoices →
the rest).

---

### 4.5 `ErrorBoundary` exists but is never mounted

`src/core/common/ErrorBoundary.tsx` is a competent class component — and `grep` shows **0
imports** of it. Any render error in any route white-screens the whole SPA. There are also no
route-level 404 fallbacks in the `<Routes>` tree (an `Error404` component exists but is just
another mapped route).

**Fix:** Wrap `<ALLRoutes />` (or each layout `<Outlet />`) in `<ErrorBoundary>` in
`main.tsx`. Add a `path="*"` catch-all route. Have the boundary log to a real sink (Sentry),
not `console.error`.

---

### 4.6 `dist/` and stray packages committed; `.gitignore` misconfigured

- `.gitignore` line 11 is `# dist` (commented out), so **454 build artifacts / 52 MB** are
  tracked and were modified in commits `7ed3dcc`/`cecb877`. `.git` is 33 MB.
- `package.json` `dependencies` includes **`"i": "^0.3.7"`** and **`"npm": "^11.6.0"`** —
  almost certainly from an accidental `npm i i` / `npm i npm`.
- `firebase` is a runtime dependency but the whole app's data layer is in `dependencies`
  correctly; however `sass-loader` (webpack-only) is present under a Vite project and does
  nothing.
- No `engines` field — Node version is unpinned.

**Fix:** Uncomment `dist` in `.gitignore`, `git rm -r --cached dist`, commit. Remove `i`,
`npm`, `sass-loader`. Add `"engines": { "node": ">=20" }`. Consider `git filter-repo` to purge
`dist` history if repo size matters.

---

### 4.7 No tests, no CI, no quality gate

0 test files, no `vitest`/`jest`/`@testing-library` in `package.json`, no `.github/workflows`.
Nothing prevents the 780 lint errors from growing or the build from breaking.

**Fix:** Add Vitest + React Testing Library. Start with the pure logic that already has bugs
waiting to happen: `useDoctorDashboard`'s trend math, `admin.service` revenue/– filters,
`isHoliday` date normalisation, `convertFirestoreToAppointment`. Add a GitHub Actions workflow
running `lint` + `tsc -b` + `build` + `test` + `npm audit --audit-level=high` on PRs.

---

## 5. Medium-Priority Findings

| # | Finding | Detail / Fix |
|---|---|---|
| 5.1 | **1,506-line `router.link.tsx`; 1,868-line `sidebarData.tsx`; 3,707-line `uiDropdowns.tsx`** | Template demo pages (`ui-modules/`, `application-modules/` email/chat/kanban/notes) inflate the codebase. Delete unused template routes/pages; split route files by role. |
| 5.2 | **134 `console.*` calls shipped to production** | No logging abstraction, no log levels. Vite doesn't strip them. Add a `logger` util or `vite-plugin-remove-console` for prod builds. |
| 5.3 | **67 direct DOM manipulations** (`document.getElementById`, `new window.bootstrap.Offcanvas(...)`) | Bootstrap JS imperatively driven from React (see `doctorAppointments.tsx`). Fragile, breaks with StrictMode double-invoke. Migrate modals/offcanvas to `react-bootstrap` components or a headless lib. |
| 5.4 | **No path aliases** | Imports like `../../../../../../core/services/...` (6 levels). Add `"paths"` in tsconfig + `vite-tsconfig-paths` (`@/core/...`). |
| 5.5 | **Redux is UI-only** (`sidebarSlice`, `themeSlice`) | Server data lives in per-component `useState` + bespoke hooks; no cache, no dedupe, no invalidation. Adopt **RTK Query** or **TanStack Query** for the Firestore layer — would also fix §4.3's redundant fetches. |
| 5.6 | **Naming inconsistency & typos** | `DoctorDahboard` (file + component), `AddInoivce`, `doctorDahboard.tsx`, `paymetsListData.tsx`, `patientDeatilsData.tsx`. camelCase vs PascalCase filenames mixed. Data files use `.tsx` for plain arrays (should be `.ts`). |
| 5.7 | **`react-router` and `react-router-dom` both imported** | v7 merged them; mixed imports (`from "react-router"` in `router.tsx`, `from "react-router-dom"` in `authFeature.tsx`). Standardise on `react-router-dom`. |
| 5.8 | **`Timestamp instanceof` checks everywhere** | Every service re-implements `x instanceof Timestamp ? x.toDate() : x instanceof Date ? x : ...`. Extract one `toDate()` / `toMillis()` util (it's copy-pasted ~12 times across `admin`, `appointments`, `doctor`, `useDoctorDashboard`). |
| 5.9 | **Placeholder business logic in shipped dashboards** | `admin.service.ts`: `const doctorsTrend = 95; // Placeholder`, `patientsTrend = 25;`. `useDoctorDashboard`: `walkinBookings: 0, followUps: 0, rescheduled: 0` hard-coded. Users see fabricated numbers. Gate behind "coming soon" or compute for real. |
| 5.10 | **Accessibility** | Auth forms use `<span onClick>` for password toggles (not focusable/keyboard-accessible), no `aria-label`s, `type="text"` on the email field, no `<label htmlFor>` association in several places, no form landmark semantics. |
| 5.11 | **`index.html` `<title>` still says** "Login Form \| Doctoury - ... Bootstrap 5 Admin Template" and `<meta name="author" content="Dreams Technologies">` | Rebrand; add proper meta/OG tags; set favicon. |
| 5.12 | **`skipLibCheck: true`** | Hides type errors from `@types/*`. The many `@types/react-bootstrap@0.32` (v0!) vs `react-bootstrap@2.10` mismatch is a symptom — wrong types package version. |
| 5.13 | **No `serverTimestamp()` on updates** | `createAppointment` uses `serverTimestamp()` for `created` (good) but `updateAppointment` never sets an `updated` field; no audit trail on medical records. |
| 5.14 | **Duplicate folder** `pages-module/` and `pages-modules/` both exist; `feathure-components` (sic). | Consolidate, rename. |

---

## 6. What Is Actually Good

Credit where due — this is not all bad:

- **The Firestore service + hook pattern is sound.** `appointments.service.ts` /
  `useAppointments.ts` / `useDoctorDashboard.ts` show a clean separation: typed service
  functions, a hook that owns loading/error/refresh state, `useMemo`/`useCallback` used
  correctly, `Promise.all` for parallelism. This is the template to replicate for §4.4.
- **The doctor-modules `shared/` directory** demonstrates real componentisation — `StatusBadge`,
  `ActionMenu`, `AppointmentTable`, `SettingsLayout`, `FormField` are extracted and reused.
- **Loading and error states are handled** in the wired dashboards (spinners, `alert-danger`
  blocks) rather than crashing.
- **`holiday` validation** in `createAppointment`/`updateAppointment` is a genuine
  domain-rule implementation, with a fail-safe `catch → return false`.
- **Build is green.** `tsc -b && vite build` succeeds; TS config is modern (bundler resolution,
  `verbatimModuleSyntax`, `noFallthroughCasesInSwitch`).
- **`.env*` is gitignored** (even if unused yet).
- **No `dangerouslySetInnerHTML` anywhere** — no obvious XSS sink in the React tree.

---

## 7. Pain Points (developer-experience friction)

These are the things that will slow down whoever works here next:

1. **You can't tell what's real.** 44 components import static JSON, 14 import Firestore, and
   they look identical. No naming convention, no `// TODO: migrate`, no feature flags. Every
   task starts with "is this page even connected?"
2. **Import paths are `../../../../../../`.** Refactoring moves anything and breaks 40 imports.
   No aliases.
3. **780 lint errors means lint is ignored.** New `any` slips in invisibly; the signal is
   gone.
4. **1,500–3,700-line files.** `router.link.tsx`, `sidebarData.tsx`, the `ui-modules` demo
   pages — editors lag, diffs are unreviewable, merge conflicts are guaranteed.
5. **Four UI libraries with overlapping components.** Which button? Which modal? Which date
   picker? Every PR re-litigates this.
6. **Bootstrap-via-`document.getElementById`.** Modal/offcanvas logic reaches out of React into
   the DOM and `window.bootstrap`. Breaks under StrictMode, hard to test, `null`-guarded
   everywhere defensively.
7. **`moment` + `dayjs` both present.** Date code is written two ways depending on which file
   you're in; plus the ad-hoc `Timestamp instanceof` ladder copy-pasted a dozen times.
8. **No tests.** Any change to the trend math or revenue filters is a guess. No safety net for
   the data migration.
9. **`dist/` in git.** Every `npm run build` produces a 52 MB diff; real changes drown in
   generated noise; `git status` is useless.
10. **Placeholder numbers in shipped UI** (`doctorsTrend = 95`). A developer can't tell a bug
    from an intentional stub.
11. **Hardcoded IDs in two places** (`UserContext`, `useAppointments`). Local dev only works for
    one specific doctor document that must exist in whatever Firebase project you point at.
12. **Wrong Firebase project** (`nike-shoes-store`). New contributors need out-of-band knowledge
    to even get data on screen; there's no `.env.example` or README setup section.
13. **README is the Vite template boilerplate.** Zero project-specific onboarding.
14. **Four pre-existing analysis docs** (`CODEBASE_ANALYSIS.md`, `COMPREHENSIVE_CODE_REVIEW.md`,
    `HIGH_PRIORITY_ISSUES_DETAILED.md`, `ISSUES_SUMMARY.md`, `ROUTES_ANALYSIS.md`,
    `DOCTOR_ROUTES_COMPLETE_LIST.md`) that overlap, disagree on counts, and none of which are
    actionable checklists tied to code.

---

## 8. Recommended Remediation Plan

### Phase 0 — Stop the bleeding (week 1)
- [ ] `git rm -r --cached dist`, uncomment `dist` in `.gitignore`.
- [ ] Remove `i`, `npm`, `sass-loader` from `package.json`.
- [ ] `npm audit fix`; re-verify build; add `overrides` for stragglers.
- [ ] Create a **dedicated Firebase project**; move config to `VITE_FIREBASE_*` env vars; add
      `.env.example`; convert `firebase.js` → `.ts`.
- [ ] Add `firestore.rules` (deny-all baseline), `firebase.json`, `.firebaserc`.
- [ ] Mount `<ErrorBoundary>` around the router; add `path="*"` 404.

### Phase 1 — Auth & access control (weeks 2–3)
- [ ] Implement Firebase Auth: functional `login` / `register` / `forgot-password`
      (react-hook-form + validation), social providers.
- [ ] `UserContext`: `onAuthStateChanged` → `{ user, role, loading }`; delete hardcoded IDs.
- [ ] `<ProtectedRoute requiredRole>`; split `router.link.tsx` into role files.
- [ ] Flesh out `firestore.rules` for real per-role/per-owner access; test with the emulator.

### Phase 2 — Tooling & guardrails (week 3, parallel)
- [ ] tsconfig path aliases + `vite-tsconfig-paths`.
- [ ] Vitest + RTL; tests for `admin.service` roll-ups, `useDoctorDashboard` trends,
      `isHoliday`, `convertFirestoreToAppointment`.
- [ ] GitHub Actions: `lint` + `tsc -b` + `build` + `test` + `audit` on PR.
- [ ] Adopt TanStack Query (or RTK Query) for the Firestore layer.
- [ ] Burn down `any` / lint errors per-module; enable type-checked ESLint config.

### Phase 3 — Data migration (weeks 4–9)
Per domain, in priority order **Patients → Appointments (finish) → Invoices → Doctors/Staff →
Finance/HRM → Content/Support**:
- [ ] Firestore schema + Zod type + `*.service.ts` + `use*.ts` hook.
- [ ] Replace JSON import; wire the form (react-hook-form + resolver + real persistence).
- [ ] Fix N+1s: fetch-once-per-render, `in`-query batching or write-time denormalisation.
- [ ] Delete the migrated `src/core/json/*.tsx`.
- [ ] Replace placeholder trend/stat numbers with real computation or hide them.

### Phase 4 — Performance & cleanup (weeks 9–12)
- [ ] Route-level `React.lazy` + `manualChunks`; target < 400 KB gzip initial JS.
- [ ] Pick one UI kit; remove the other three + jQuery + dragula.
- [ ] Dedupe libs (`moment`→`dayjs`, one phone input, one mask, one rating, one scrollbar).
- [ ] Subset/lazy-load icon fonts.
- [ ] Delete unused template demo pages (`ui-modules/`, unused `application-modules/`).
- [ ] Replace `document.getElementById` Bootstrap calls with React components.
- [ ] Strip `console.*` in prod builds; add real logging (Sentry).
- [ ] Rewrite README with setup instructions; fix `index.html` title/meta/branding.
- [ ] Consolidate the six overlapping analysis docs into one living `docs/`.

---

## 9. Severity Index

| Severity | Findings |
|---|---|
| 🔴 **Critical** | 3.1 No auth · 3.2 No route protection/RBAC · 3.3 Committed creds / wrong Firebase project · 3.4 No Firestore rules (PHI) · 3.5 3 critical + 24 high dep vulns |
| 🟠 **High** | 4.1 `any`/strictness · 4.2 7 MB bundle, no splitting · 4.3 N+1 Firestore reads · 4.4 90% static data, dead forms · 4.5 ErrorBoundary unused / no 404 · 4.6 `dist/` + junk deps committed · 4.7 No tests / CI |
| 🟡 **Medium** | 5.1–5.14 (giant files, shipped `console.*`, imperative DOM, no aliases, UI-only Redux, typos, router import split, Timestamp util duplication, placeholder metrics, a11y, template branding, `skipLibCheck`, no `updated` audit field, duplicate folders) |

---

*End of report.*
