# Authentication & RBAC

## Role model

| Role | How created | Home route |
|---|---|---|
| `patient` | Self-register at `/register-basic` | `/patient/patient-dashboard` |
| `doctor` | Admin provisions Auth user + `Users/{uid}` with `role: "doctor"` + matching `Doctor` doc | `/doctor/doctor-dashboard` |
| `admin` | Bootstrap via Console (once), then other admins by an existing admin | `/dashboard` |

Canonical role strings are lowercase. Legacy values (`Doctor`, `isDoctor`, etc.) are normalized in `normalizeRole()`.

## Identity storage

- **Firebase Auth** = identity (email/password)
- **`Users/{uid}`** = profile + `role` (document ID **must** be the Auth uid; keep a `uid` field too)
- **`Doctor/{id}.userid`** = `DocumentReference` to `Users/{uid}` for doctors

## Guards

```
PublicOnlyRoute  → /login, /register-basic, /forgot-password-basic
ProtectedRoute   → role-gated trees (admin / doctor / patient / shared)
RoleLanding      → "/" redirects to role home
```

- While `status === "loading"`, guards show a splash and **do not redirect** (prevents flash-of-login on refresh).
- Wrong role → `/error-403`
- Unauthenticated → `/login` with `state.from` for deep-link return

Email verification policy: unverified users may enter the app; sensitive writes can be blocked later. Do not lock the whole app on unverified email.

## Promote a user to doctor

1. Create Auth user (Console or admin UI later)
2. Create `Users/{uid}` with `role: "doctor"`
3. Create `Doctor/{autoId}` with `userid` = reference to `Users/{uid}`
4. User signs in → `resolveDoctorId` links their `doctorId`

## Promote a user to admin

1. As an existing admin (or via Console bypass once), set `Users/{uid}.role` to `"admin"`
2. Patients cannot self-promote — rules reject `role` changes on self-update and reject create with non-`patient` role

## Security rules shape

Helpers: `isSignedIn`, `myRole`, `hasRole`, `isSelf`.

- **Users** — read self/admin; create self as patient only; update self without changing role; admin full
- **Doctor** — read any signed-in; write admin or owning doctor
- **Appointment** — read admin / owning doctor / owning patient; create patient-for-self or staff; delete admin
- Default deny for everything else

## Relevant source

- `src/core/context/AuthContext.tsx`
- `src/core/services/auth/auth.service.ts`
- `src/core/services/firestore/users.service.ts`
- `src/feature-module/routes/guards/`
- `firestore.rules`
