# Phase A — Authentication & Role-Based Access Control

**Scope:** Firebase project setup, Firebase Auth, user/role model, protected routing, RBAC,
Firestore security rules, and removal of all hard-coded identity.
**Explicitly out of scope:** ESLint cleanup, bundle size, `dist/` in git, data migration of the
47 static JSON files, tests for unrelated modules. Those live in `REMAINING.md`.

**Estimated effort:** 10–14 working days for one developer (or an AI agent working in
supervised increments).

---

## Decisions locked in

| Decision | Choice |
|---|---|
| Firebase project | **Create a new one.** The app currently points at `nike-shoes-store-d8afd`, an unrelated project. |
| Role storage | **`role` field on `Users/{uid}` Firestore document.** Matches what `admin.service.ts` already reads. |
| Self-registration | **Patients only.** Doctors and admins are provisioned by an admin from inside the app. |
| Roles | `admin`, `doctor`, `patient` (lowercase, canonical). `super-admin` routes exist but are unimplemented — treat as `admin`-gated for now. |
| Bootstrap admin | Created manually once, via Firebase Console + a one-off script. |

### Why this ordering

Auth cannot be built before the Firebase project exists, because:
- You need Auth **enabled in a console you control** to create sign-in providers.
- Security rules can't be written or deployed against someone else's project.
- The bootstrap admin user has to be created in a real Auth instance.

So Step 0 is not "general cleanup" — it is the minimum unblocking work for auth specifically.
Everything else from the audit's Phase 0 (dist, npm audit, ErrorBoundary mounting) is deferred
to `REMAINING.md`, **except** ErrorBoundary + the catch-all route fix, which are pulled in here
because the routing rewrite touches exactly that code and leaving it half-done creates a
redirect loop (see Step 5.4).

---

## Current-state facts the agent must know

These were verified against the codebase at `cecb877`. Do not re-derive them.

| Fact | Location |
|---|---|
| Firebase config is hard-coded, project = `nike-shoes-store-d8afd` | `src/firebase.js` |
| `import.meta.env` used **0 times** in `src/` | — |
| `HARDCODED_DOCTOR_USER_ID = "kEmEnYxoHLQifCyS6IOF0FDXQYl2"` | `src/core/context/UserContext.tsx:19` |
| `onAuthStateChanged` is commented out | `src/core/context/UserContext.tsx:47-53` |
| `const doctorId = "rg7yL0esOEBVsv1Lh9mt"` hard-coded on create | `src/feature-module/components/pages/doctor-modules/shared/appointment-hooks/useAppointments.ts` (in `createAppointment`) |
| Login button is `<Link to={all_routes.dashboard}>`, no form state at all | `src/feature-module/components/auth/login/login.tsx` |
| Register button is `<Link to={all_routes.loginbasic}>`, no form state | `.../auth/register/registerBasic.tsx` |
| `publicRoutes` = 227 entries, `authRoutes` = 24 entries | `src/feature-module/routes/router.link.tsx:246` and `:1384` |
| **A catch-all already exists**: `{ path: "*", element: <Navigate to={routes.dashboard} /> }` — first entry of `publicRoutes` | `router.link.tsx:247-251` |
| Routes are already namespaced: `/doctor/*`, `/patient/*`, `/super-admin/*`, `/application/*` | `src/feature-module/routes/all_routes.tsx` |
| `Feature` layout picks sidebar by URL prefix only | `src/feature-module/feathure-components/feature.tsx` |
| Header "logout" is a plain `<Link to={all_routes.login}>` — no sign-out call | `src/core/common/header/header.tsx:492` |
| `ErrorBoundary` exists but has **0 imports** | `src/core/common/ErrorBoundary.tsx` |
| Existing code reads `userData.role` with `Role` / `isDoctor` / `is_doctor` fallbacks | `src/core/services/firestore/admin.service.ts:105-108` |
| Users docs have: `uid`, `display_name`, `email`, `phone_number`, `photo_url`, `role` | inferred from services |
| `react-hook-form` is **not** installed | `package.json` |
| No `firestore.rules`, `firebase.json`, `.firebaserc` | repo root |

---

## Target architecture

```
src/
├── firebase.ts                          (was firebase.js — env-driven, typed)
├── core/
│   ├── config/
│   │   └── env.ts                       validates VITE_FIREBASE_* at boot
│   ├── context/
│   │   └── AuthContext.tsx              (replaces UserContext.tsx)
│   ├── services/
│   │   ├── auth/
│   │   │   └── auth.service.ts          signIn/signUp/signOut/reset/verify
│   │   └── firestore/
│   │       └── users.service.ts         NEW — profile CRUD + role lookup
│   └── types/
│       └── auth.types.ts                UserRole, AppUser, AuthState
└── feature-module/routes/
    ├── guards/
    │   ├── ProtectedRoute.tsx           requires auth (+ optional role)
    │   ├── PublicOnlyRoute.tsx          bounces logged-in users off /login
    │   └── RoleLanding.tsx              "/" → role's home dashboard
    ├── auth.routes.tsx
    ├── admin.routes.tsx
    ├── doctor.routes.tsx
    ├── patient.routes.tsx
    ├── shared.routes.tsx                /application/* — any authed role
    └── router.tsx                       composes the above
```

**Auth flow:**
```
Firebase Auth (identity)  →  Users/{uid}.role (authorization)  →  AuthContext
                                                                       ↓
                                        ProtectedRoute reads { user, role, status }
                                                                       ↓
                            unauthenticated → /login   |   wrong role → /error-403
```

`status` is a discriminated state — `"loading" | "authenticated" | "unauthenticated"` — **not**
a boolean. A boolean `loading` plus a nullable user is the classic source of the "flash of login
page on refresh" bug. Guards must render nothing (or a splash) while `status === "loading"`.

---

## THE TODO LIST

Each step is independently verifiable. Do them in order. Do not batch steps 0–2 into one commit.

---

### STEP 0 — Firebase project (human, ~45 min) 🔴 BLOCKING

The agent cannot do this. Complete it before assigning anything else.

- [ ] **0.1** Firebase Console → **Add project** → name it (e.g. `medical-health-system-prod`).
      Optionally create a second `-dev` project; use `-dev` for all development.
- [ ] **0.2** Build → **Authentication** → Get started → enable **Email/Password**.
      Enable Google/Facebook/Apple only if you actually want the social buttons live; if not,
      tell the agent to remove those buttons (Step 4.6).
- [ ] **0.3** Build → **Firestore Database** → Create database → **Start in production mode**
      (locked). Pick a region close to your users; **this is permanent**.
- [ ] **0.4** Project settings → General → **Add app → Web** → copy the config object.
- [ ] **0.5** Authentication → Settings → **Authorized domains** → add `localhost` and your
      future production domain.
- [ ] **0.6** Install the CLI and log in:
      ```bash
      npm i -g firebase-tools && firebase login
      ```
- [ ] **0.7** Decide what happens to existing data in `nike-shoes-store-d8afd`. Either:
      export it (`gcloud firestore export`) and import into the new project, or accept that
      you start with an empty DB and seed it in Step 6. **Write down which you chose** — the
      agent needs to know whether `Doctor`/`Appointment`/`Users` will have data.

**Deliverable to hand the agent:** the config object from 0.4, and the answer to 0.7.

**Verify:** you can see an empty Firestore and an empty Auth user list in the new project.

---

### STEP 1 — Environment-driven Firebase config

- [ ] **1.1** Create `.env.example` at repo root (committed, no real values):
      ```
      VITE_FIREBASE_API_KEY=
      VITE_FIREBASE_AUTH_DOMAIN=
      VITE_FIREBASE_PROJECT_ID=
      VITE_FIREBASE_STORAGE_BUCKET=
      VITE_FIREBASE_MESSAGING_SENDER_ID=
      VITE_FIREBASE_APP_ID=
      ```
- [ ] **1.2** Create `.env.local` with the **real** values from Step 0.4.
      Confirm `.gitignore` already covers `.env.local` — it does (line ~38). Do not commit it.
- [ ] **1.3** Create `src/core/config/env.ts` that reads each `import.meta.env.VITE_FIREBASE_*`,
      throws a single clear error listing every missing key, and exports a typed frozen object.
      Fail at module load, not at first Firestore call — a missing key must be obvious in 2
      seconds, not as a cryptic Firebase error 20 minutes later.
- [ ] **1.4** Add `src/vite-env.d.ts` typings for `ImportMetaEnv` so the vars are typed, not
      `any`.
- [ ] **1.5** **Delete `src/firebase.js`. Create `src/firebase.ts`** exporting `app`, `db`,
      `auth`, built from `env.ts`. Keep the same export names (`db`, `auth`) so imports don't
      break.
- [ ] **1.6** Remove the `// @ts-expect-error - Firebase config file (JS file, no types)` line
      above the `import { db }` in **all four** service files:
      `admin.service.ts`, `appointments.service.ts`, `doctor.service.ts`, `reviews.service.ts`.
      They become type-checked for free.
- [ ] **1.7** Run `npm run build`. It must pass. If `@ts-expect-error` removal surfaces real
      type errors in the services, fix them — they were being hidden.

**Verify:** `npm run dev`, open the app, check the Network tab shows requests to your **new**
`projectId`. Temporarily rename a var in `.env.local` and confirm you get the clear boot error.

**Commit:** `chore(firebase): move config to env vars and migrate to new project`

---

### STEP 2 — Types and the users service

- [ ] **2.1** Create `src/core/types/auth.types.ts`:
      ```ts
      export type UserRole = "admin" | "doctor" | "patient";

      export interface AppUser {
        uid: string;
        email: string | null;
        emailVerified: boolean;
        displayName: string | null;
        photoURL: string | null;
        role: UserRole;
        // Set only when role === "doctor": the Doctor/{id} doc id.
        doctorId: string | null;
        phoneNumber: string | null;
      }

      export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
      ```
      Note `doctorId` — this is what replaces the hard-coded `"rg7yL0esOEBVsv1Lh9mt"`.

- [ ] **2.2** Create `src/core/services/firestore/users.service.ts` with:
      - `getUserProfile(uid): Promise<AppUser | null>` — reads `Users/{uid}`.
      - `createUserProfile(uid, data): Promise<void>` — writes `Users/{uid}` with
        `role`, `display_name`, `email`, `phone_number`, `created: serverTimestamp()`.
      - `normalizeRole(raw: unknown): UserRole` — handles the legacy mess the codebase already
        contends with: `"Doctor"`, `"Patient"`, `"Admin"`, `isDoctor`, `is_doctor`. Lowercase
        and map; **default to `"patient"`** (least privilege) when absent or unrecognised.
      - `resolveDoctorId(uid): Promise<string | null>` — queries `Doctor` where
        `userid == doc(db,"Users",uid)`, returns the doc id. Reuse the exact query shape from
        `doctor.service.ts:getDoctorDataByUserId` so behaviour matches.

      ⚠️ **Critical:** `Users` documents must be keyed by **`uid` as the document ID**.
      The existing code is inconsistent — `admin.service.ts` does `doc(db,"Users",doctorUserId)`
      (uid as doc ID) but `appointments.service.ts:getPatientData` does
      `query(usersRef, where("uid","==",patientRef))` (uid as a *field*). Standardise on
      **uid as document ID**, keep a `uid` field too for backward compatibility with the
      existing `where` queries. Note this in the commit message.

- [ ] **2.3** Create `src/core/services/auth/auth.service.ts` — thin, typed wrappers, each
      translating Firebase error codes into human messages (see 2.4):
      - `signIn(email, password)`
      - `signUpPatient(email, password, displayName, phoneNumber)` — creates the Auth user,
        then `createUserProfile(uid, { role: "patient", ... })`, then sends verification email.
        **Both writes must succeed**; if the Firestore write fails, delete the just-created Auth
        user so you never leave an orphaned account with no role.
      - `signOutUser()`
      - `sendPasswordReset(email)`
      - `confirmPasswordResetWithCode(oobCode, newPassword)`
      - `resendVerificationEmail()`
      - `changePassword(currentPassword, newPassword)` — requires
        `reauthenticateWithCredential` first.

- [ ] **2.4** Create `src/core/services/auth/auth-errors.ts`: map Firebase codes to copy.
      At minimum: `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password`,
      `auth/email-already-in-use`, `auth/weak-password`, `auth/too-many-requests`,
      `auth/network-request-failed`, `auth/requires-recent-login`.
      **Never surface raw Firebase codes to users**, and never say "no account with that email"
      on the login screen (account enumeration) — use one generic "Invalid email or password".

**Verify:** `npm run build` passes. No UI change yet.

**Commit:** `feat(auth): add auth types, users service, and auth service layer`

---

### STEP 3 — AuthContext (replaces UserContext)

- [ ] **3.1** Create `src/core/context/AuthContext.tsx` exposing:
      ```ts
      {
        user: AppUser | null;
        status: AuthStatus;
        role: UserRole | null;
        // convenience, derived:
        isAuthenticated: boolean;
        // back-compat shims — see 3.4:
        doctorUserId: string | null;
        doctorId: string | null;
        refreshProfile: () => Promise<void>;
      }
      ```
- [ ] **3.2** Subscribe with `onAuthStateChanged`. On a firebase user:
      fetch `Users/{uid}` → `normalizeRole` → if role is `doctor`, also `resolveDoctorId(uid)`
      → build `AppUser` → `status = "authenticated"`.
      On `null` → `user = null`, `status = "unauthenticated"`.
      **Return the unsubscribe function from the effect.**
- [ ] **3.3** Handle the **profile-missing** case explicitly: an Auth user with no `Users/{uid}`
      doc (possible after a partial signup, or for the bootstrap admin before Step 6). Do not
      silently default to `patient` and leave them in a broken app — sign them out and show
      "Your account is not fully set up. Contact an administrator." Log it.
- [ ] **3.4** **Back-compat shim.** `useUser()` is consumed by `useAppointments.ts`,
      `useDoctorDashboard`, `doctorDahboard.tsx` and others. Keep a `useUser()` export from
      `AuthContext.tsx` returning `{ currentUser, doctorUserId, loading }` so nothing breaks
      in this step. Mark it `@deprecated`. Migrate call sites in Step 7 and delete the shim.
      This keeps Step 3 a pure addition and lets you verify auth independently of the rewiring.
- [ ] **3.5** In `src/main.tsx`, replace `<UserProvider>` with `<AuthProvider>`.
      **Also wrap `<ALLRoutes />` in `<ErrorBoundary>`** — it exists at
      `src/core/common/ErrorBoundary.tsx` with zero imports, and once guards can throw you need
      it. Order: `Provider > AuthProvider > BrowserRouter > ErrorBoundary > ALLRoutes`.
- [ ] **3.6** **Delete `src/core/context/UserContext.tsx`** and its hard-coded IDs.

**Verify:** app still loads and the doctor dashboard still works (via the shim), but now the
doctor ID comes from a real signed-in session — so it will be *empty* until you can log in.
Temporarily create a user in the Firebase Console + a matching `Users/{uid}` doc with
`role: "doctor"` to sanity-check, or accept a broken dashboard until Step 4.

**Commit:** `feat(auth): add AuthContext with real onAuthStateChanged, remove hardcoded IDs`

---

### STEP 4 — Working auth screens

Install form tooling first: `npm i react-hook-form zod @hookform/resolvers`.

The template has 3 visual variants of each auth screen (`login`, `loginBasic`, `loginCover`,
`loginIllustration`). **Do not wire up all of them.** Pick **one** per flow — recommend the
`*Basic` variants since `all_routes.login` already points at `/login` and register links to
`registerbasic`. Delete the other two variants and their routes at the end of this step.

- [ ] **4.1** **Login** (`login.tsx`): `useForm` + zod schema (email format, password min 1).
      Replace `<Link to={dashboard}>` with a real `<button type="submit">`. On submit: call
      `signIn`, show inline field errors + a form-level alert, disable the button and show a
      spinner while pending. On success: navigate to `location.state?.from ?? roleHome(role)`
      so a deep link survives the login bounce. Wire "Remember me" to
      `setPersistence(browserLocalPersistence | browserSessionPersistence)` **before** calling
      `signIn` — right now it's a checkbox that does nothing.
- [ ] **4.2** **Register** (`registerBasic.tsx`): fields name / email / phone / password /
      confirm. Zod schema with `.refine()` for password match and a real strength rule
      (min 8, at least one letter and one number — match whatever you put in the rules).
      Calls `signUpPatient`. **Hard-code `role: "patient"`** — there must be no role selector.
      Enforce that the Terms checkbox is actually required (currently decorative).
      On success → `/email-verification-basic`.
- [ ] **4.3** **Forgot password** (`forgotPasswordBasic.tsx`): email field → `sendPasswordReset`.
      **Always show the same success message** regardless of whether the account exists
      (enumeration prevention).
- [ ] **4.4** **Reset password** (`resetPasswordBasic.tsx`): read `oobCode` from the query
      string (`useSearchParams`), new + confirm password → `confirmPasswordResetWithCode`.
      Handle expired/invalid code with a "request a new link" path.
- [ ] **4.5** **Email verification** (`emailVerificationBasic.tsx`): show the pending state,
      a "Resend email" button (rate-limit it client-side, e.g. 60s cooldown), and a
      "I've verified" button that calls `auth.currentUser.reload()` then `refreshProfile()`.
- [ ] **4.6** **Social buttons:** if you did not enable providers in Step 0.2, **delete** the
      Facebook/Google/Apple markup from login and register. A button that does nothing is worse
      than no button. If you did enable them, wire `signInWithPopup` and — importantly — create
      the `Users/{uid}` doc with `role: "patient"` on first social sign-in, same as 4.2.
- [ ] **4.7** **Logout.** `header.tsx:492` is `<Link to={all_routes.login}>`. Replace with a
      button calling `signOutUser()` then `navigate("/login", { replace: true })`.
      Check the two other sidebars (`sidebar-two`, `sidebarthree`) and the settings pages for
      the same dead logout link and fix each.
- [ ] **4.8** **Accessibility while you're in here** (cheap, and you're rewriting the markup
      anyway): password-visibility toggles are `<span onClick>` — make them
      `<button type="button" aria-label="Show password">`. The email input is `type="text"` —
      make it `type="email"`. Associate every `<label>` with `htmlFor`. Put form-level errors in
      a `role="alert"` container.
- [ ] **4.9** Delete the unused `*Cover` and `*Illustration` auth variants + their entries in
      `authRoutes` and `all_routes.tsx`. That's ~14 components and routes gone.

**Verify:** end-to-end by hand — register a patient, receive the verification email, log out,
log in, get the reset email, reset, log in with the new password. Check Firestore for a
correctly-shaped `Users/{uid}` doc with `role: "patient"`.

**Commit:** `feat(auth): implement working login, register, password reset, and logout`

---

### STEP 5 — Route guards and RBAC

- [ ] **5.1** `src/feature-module/routes/guards/ProtectedRoute.tsx`:
      ```tsx
      <ProtectedRoute allow={["admin"]}>   // omit `allow` = any authenticated role
      ```
      Behaviour:
      - `status === "loading"` → render a full-page splash. **Never redirect while loading.**
      - `status === "unauthenticated"` → `<Navigate to="/login" replace state={{ from: location }} />`
      - authenticated but `role` not in `allow` → `<Navigate to="/error-403" replace />`
      - **Decide and document the email-verification policy.** Recommended: allow unverified
        users in, but show a persistent banner; block only sensitive writes. Blocking all
        access on unverified email is a common way to lock out real users when mail is slow.
- [ ] **5.2** `guards/PublicOnlyRoute.tsx` — wraps `/login`, `/register`, `/forgot-password`.
      If already authenticated, redirect to `roleHome(role)`. Without this, a logged-in user can
      sit on `/login` and get confused.
- [ ] **5.3** `guards/RoleLanding.tsx` + a `roleHome(role)` helper:
      `admin → /dashboard`, `doctor → /doctor/doctor-dashboard`, `patient → /patient/patient-dashboard`.
      Mount at `path="/"`.
- [ ] **5.4** ⚠️ **Fix the existing catch-all.** `router.link.tsx:247` currently has
      `{ path: "*", element: <Navigate to={routes.dashboard} /> }` as the **first** entry of
      `publicRoutes`. Once `/dashboard` is admin-guarded, an unauthenticated user hitting any
      unknown URL bounces to `/dashboard` → guard bounces to `/login` → **and if anything sends
      them back you get a loop**. Replace it with a real `<Error404 />` element, and make sure
      the catch-all is registered **last**, outside the protected tree.
- [ ] **5.5** Create `/error-403` — a new "Access Denied" page (copy `error404.tsx`'s markup)
      plus a route entry. Must be reachable without a role check, or the 403 itself 403s.
- [ ] **5.6** **Split `router.link.tsx` (1,506 lines, 227 + 24 entries) by role.** Mechanical
      but large; do it in one focused pass:
      - `auth.routes.tsx` — the 24 `authRoutes` (minus the variants deleted in 4.9)
      - `admin.routes.tsx` — `/dashboard`, clinic, HRM, finance, reports, settings,
        content, support, `/super-admin/*`
      - `doctor.routes.tsx` — every `/doctor/*`
      - `patient.routes.tsx` — every `/patient/*`
      - `shared.routes.tsx` — `/application/*` (chat, calendar, email, …): any authenticated role
      - `ui.routes.tsx` — the `ui-modules` template demo pages. **Recommend deleting these
        outright** (~40 routes, includes the 3,707-line `uiDropdowns.tsx`). They are template
        showcase pages with no product value. If you're not ready, gate them behind `admin`.
      ⚠️ Route paths are the app's public surface. **Do not change any path string** during the
      split — pure reorganisation. Verify the total route count matches before/after.
- [ ] **5.7** Rewrite `router.tsx` to compose them:
      ```
      <Routes>
        <Route path="/" element={<RoleLanding />} />
        <Route element={<PublicOnlyRoute />}><Route element={<AuthFeature/>}>…auth…</Route></Route>
        <Route element={<ProtectedRoute allow={["admin"]}/>}><Route element={<Feature/>}>…admin…</Route></Route>
        <Route element={<ProtectedRoute allow={["doctor"]}/>}><Route element={<Feature/>}>…doctor…</Route></Route>
        <Route element={<ProtectedRoute allow={["patient"]}/>}><Route element={<Feature/>}>…patient…</Route></Route>
        <Route element={<ProtectedRoute />}><Route element={<Feature/>}>…shared…</Route></Route>
        <Route path="/error-403" element={<Error403/>} />
        <Route path="*" element={<Error404/>} />
      </Routes>
      ```
- [ ] **5.8** **`Feature` layout — switch sidebar on role, not URL.**
      `feature.tsx` currently does `path.startsWith("/doctor/") ? <SidebarTwo/> : …`. With real
      roles this is now redundant *and* wrong for shared `/application/*` routes (a doctor there
      gets the admin sidebar). Switch on `role` from `AuthContext`.
- [ ] **5.9** **Hide what a user can't reach.** Guards stop navigation; they don't stop the
      sidebar from advertising 200 dead links. Filter `sidebarData.tsx` entries by role — at
      minimum tag each top-level group with allowed roles and filter at render.
      *(Deeper menu cleanup can be deferred — note it in `REMAINING.md`.)*

**Verify — the test matrix. Do all nine cells manually:**

| As | `/dashboard` | `/doctor/doctor-dashboard` | `/patient/patient-dashboard` |
|---|---|---|---|
| logged out | → `/login` | → `/login` | → `/login` |
| patient | → `/error-403` | → `/error-403` | ✅ loads |
| doctor | → `/error-403` | ✅ loads | → `/error-403` |
| admin | ✅ loads | → `/error-403` | → `/error-403` |

Plus: **hard-refresh (F5) on a deep protected URL while logged in must NOT bounce to /login**
— that's the `status === "loading"` bug and it's the one people always ship.
Plus: deep-link to `/doctor/doctors-appointments` while logged out → login → must land back on
`/doctor/doctors-appointments`, not the dashboard.
Plus: unknown URL `/nonsense` → 404 page, no redirect loop.

**Commit:** `feat(routes): add auth guards, RBAC, and split routes by role`

---

### STEP 6 — Firestore security rules

Client-side guards are UX, not security. Anyone can call the Firestore REST API directly with
a stolen or self-issued token. **This step is what actually protects the data.** Do not skip it
or leave it for later — `Appointment` documents contain `patientsEmail`, `patientsNumber`,
`diagnosis`, and `Complain`. That is PHI.

- [ ] **6.1** `firebase init firestore` in the repo root → creates `firebase.json`,
      `.firebaserc`, `firestore.rules`, `firestore.indexes.json`. Commit all four.
- [ ] **6.2** Write `firestore.rules`. Helper functions first:
      ```
      function isSignedIn()      { return request.auth != null; }
      function myRole()          { return get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.role; }
      function hasRole(r)        { return isSignedIn() && myRole() == r; }
      function isSelf(uid)       { return isSignedIn() && request.auth.uid == uid; }
      ```
      Then per collection:
      - **`Users/{uid}`** — read: self, or admin, or a doctor who has an appointment with them
        (simplest defensible version: self or admin). create: self, **and
        `request.resource.data.role == "patient"`** — this is the rule that stops a user
        registering themselves as an admin. update: self, but **`role` must be unchanged**
        (`request.resource.data.role == resource.data.role`); admin may change role.
        delete: admin only.
      - **`Doctor/{id}`** — read: any signed-in user (patients browse doctors).
        write: admin, or the doctor whose `userid` matches `request.auth.uid`.
      - **`Appointment/{id}`** — read: admin, the appointment's doctor, or the patient it
        belongs to. create: patient (for themselves) or admin/doctor. update: admin, the
        doctor, or the patient for a narrow field set (e.g. cancel, review). delete: admin.
      - **Default deny** everything else: `match /{document=**} { allow read, write: if false; }`
- [ ] **6.3** ⚠️ **`get()` calls cost a read and count toward the 10-`get`-per-request limit.**
      `myRole()` fires on nearly every rule. If this bites (cost or limits), the fix is custom
      claims — noted in `REMAINING.md` as an upgrade path, not needed now.
- [ ] **6.4** **Write rules tests** with `@firebase/rules-unit-testing` + the emulator.
      This is the one place tests are non-negotiable — security rules are easy to get subtly
      wrong and impossible to verify by clicking. Cover at least: patient cannot read another
      patient's appointment; patient cannot self-promote to admin; doctor can only edit their
      own `Doctor` doc; signed-out reads are denied everywhere.
      ```bash
      npm i -D @firebase/rules-unit-testing vitest
      firebase emulators:start --only firestore
      ```
- [ ] **6.5** `firebase deploy --only firestore:rules`.
- [ ] **6.6** **Bootstrap the first admin.** Chicken-and-egg: rules only let an admin create an
      admin. Do it once by hand — create the user in the Auth console, then create
      `Users/{uid}` with `role: "admin"` **in the Firestore console** (console writes bypass
      rules). Document the uid somewhere safe.
- [ ] **6.7** **Seed data** per your Step 0.7 decision — at minimum one admin, one doctor
      (with a matching `Doctor` doc whose `userid` points at the user), one patient, and a few
      appointments. Without this you cannot test anything. A small `scripts/seed.ts` using
      `firebase-admin` is worth the 30 minutes.

**Verify:** with the emulator, run the rules tests — all green. Then in the real app, open
DevTools as a patient and try `getDoc(doc(db,"Users",<someone else's uid>))` in the console —
must be denied.

**Commit:** `feat(security): add Firestore security rules with role-based access and tests`

---

### STEP 7 — Remove the last hard-coded identity & retire the shim

- [ ] **7.1** `useAppointments.ts` — delete `const doctorId = "rg7yL0esOEBVsv1Lh9mt";` in
      `createAppointment`. Take `doctorId` from `useAuth().user.doctorId`. Throw a clear error
      if it's null (a non-doctor reached a doctor-only action — shouldn't happen post-guards,
      but fail loudly).
- [ ] **7.2** Migrate every `useUser()` call site to `useAuth()`:
      `useAppointments.ts`, `useDoctorDashboard` consumers, `doctorDahboard.tsx`, `useReviews.ts`,
      and the doctor-schedule components. (`grep -rn "useUser" src/`)
- [ ] **7.3** **Delete the `useUser` back-compat shim** from `AuthContext.tsx`.
- [ ] **7.4** `grep -rn "kEmEnYxoHLQifCyS6IOF0FDXQYl2\|rg7yL0esOEBVsv1Lh9mt" src/` → must
      return **zero** results. This is the acceptance test for the whole phase.
- [ ] **7.5** Add an `updated: serverTimestamp()` field to `updateAppointment` and
      `updateDoctorSchedule`, and record `updatedBy: request.auth.uid`. You now have a real user
      identity — start the audit trail immediately. Medical records need one, and retrofitting
      it later means backfilling.

**Verify:** log in as the seeded doctor, create an appointment, confirm the `doctorId` on the
new Firestore doc points at *that* doctor's document — not `rg7yL0esOEBVsv1Lh9mt`.

**Commit:** `refactor(auth): remove all hardcoded user IDs, retire useUser shim`

---

### STEP 8 — Documentation & hand-off

- [ ] **8.1** Rewrite `README.md` — it is still the Vite boilerplate. Include: prerequisites,
      `.env.local` setup pointing at `.env.example`, `npm i && npm run dev`, how to run the
      emulator, how to seed, and the three test accounts.
- [ ] **8.2** Add `docs/AUTH.md`: the role model, how to promote a user to doctor/admin, how
      the guards compose, and the rules' shape.
- [ ] **8.3** Delete the now-stale claims in the older analysis docs (or add a header noting
      they predate this phase) so the next person isn't misled.
- [ ] **8.4** Update `AUDIT_REPORT.md` §3.1–3.4 to "RESOLVED — see AUTH_RBAC_PLAN.md".

**Commit:** `docs: document auth setup, roles, and local development`

---

## Definition of done

Phase A is complete when **all** of these are true:

1. `grep -rn "kEmEnYxoHLQifCyS6IOF0FDXQYl2\|rg7yL0esOEBVsv1Lh9mt" src/` → 0 results.
2. `grep -rn "nike-shoes-store" .` (excluding `node_modules`, `dist`, `.git`) → 0 results.
3. `grep -rn "import.meta.env.VITE_FIREBASE" src/` → non-zero; `src/firebase.js` no longer exists.
4. A logged-out visitor hitting any protected URL lands on `/login`.
5. The 3×3 role matrix in Step 5 passes in full.
6. Hard-refresh on a deep protected URL does **not** bounce to `/login`.
7. Deep-link → login → returns to the originally requested URL.
8. Register / login / logout / forgot / reset all work end-to-end against the new project.
9. A newly registered user is `role: "patient"` in Firestore and **cannot** make themselves admin.
10. `firestore.rules` is committed, deployed, and its tests pass against the emulator.
11. `npm run build` passes.

---

## Guidance for the AI agent executing this

- **One step per commit.** Steps 4, 5, and 6 are each big enough to warrant review before
  moving on. Never combine Step 5 (route split) with Step 4 (auth screens) — if something
  breaks you won't know which caused it.
- **Step 0 is a human gate.** Do not attempt to proceed past it without the config values.
- **Never invent Firebase config values.** If `.env.local` is missing, stop and ask.
- **Don't change route path strings in Step 5.6.** It's a file reorganisation, not a redesign.
  Count route entries before and after; they must match (minus the ones deliberately deleted
  in 4.9 / 5.6).
- **Don't refactor unrelated code you pass through.** You will be tempted by the 517 `any`s.
  Leave them — the user explicitly deprioritised lint. Exception: a type error that *blocks*
  the build after removing `@ts-expect-error` in 1.6.
- **Don't touch the 47 static JSON files** or any page that imports them. That's a later phase.
- **When a step's verification fails, stop and report.** Do not paper over it and continue —
  a broken guard that "mostly works" is a security hole.
- **Ask before deleting.** Steps 4.9 and 5.6 propose deleting the auth variants and the
  `ui-modules` demo pages. Confirm with the user first; these are judgement calls, not defects.

---

## Risks

| Risk | Mitigation |
|---|---|
| Data lives in the old `nike-shoes-store` project | Decide in Step 0.7 — export/import, or seed fresh in 6.7. Do not defer this decision. |
| Route split (227 entries) introduces a typo'd path | Pure move; diff route counts before/after; smoke-test one route per module. |
| `Users` doc-ID inconsistency (`uid` as ID vs as field) | Standardise on doc ID **and** keep the `uid` field so existing `where("uid","==")` queries keep working (Step 2.2). |
| Flash-of-login-page on refresh | The `AuthStatus` three-state design (Step 3.1) + never redirecting while `"loading"` (5.1). |
| Redirect loop from the existing `path:"*"` → `/dashboard` | Step 5.4 replaces it with a real 404 outside the protected tree. |
| Rules `get()` read costs / 10-get limit | Acceptable at current scale; custom-claims upgrade path noted in `REMAINING.md`. |
| Orphaned Auth user with no `Users` doc | Rollback in `signUpPatient` (2.3) + explicit handling in `AuthContext` (3.3). |
| Locking yourself out | Create the bootstrap admin (6.6) **before** deploying restrictive rules (6.5). |

---

**Next phase:** see `REMAINING.md`. Hand that file back once this one's Definition of Done is met.
