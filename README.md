# Medical Health System

Hospital management web app (React + TypeScript + Vite + Firebase).

## Prerequisites

- Node.js 20+
- A Firebase project with **Email/Password** Auth and **Firestore** enabled
- Firebase CLI (`npm i -g firebase-tools`) for rules deploy / emulators

## Setup

1. Copy env template and fill values from Firebase Console → Project settings → Your apps:

```bash
cp .env.example .env.local
```

Required keys:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

2. Install and run:

```bash
npm i
npm run dev
```

3. (Optional) Seed demo users — download a service account key to
   `scripts/serviceAccountKey.json` (gitignored), then:

```bash
npm run seed
```

## Auth & roles

See [docs/AUTH.md](docs/AUTH.md).

Roles: `admin`, `doctor`, `patient`. Self-registration creates **patients only**.

### Test accounts (after seed)

| Role | Email | Password |
|---|---|---|
| admin | admin@example.com | Admin123! |
| doctor | doctor@example.com | Doctor123! |
| patient | patient@example.com | Patient123! |

Change these passwords after first login.

## Firestore rules

```bash
# Start emulator
npm run emulators

# In another terminal — run rules tests
npm run test:rules

# Deploy rules to the linked project (after bootstrap admin exists)
firebase deploy --only firestore:rules
```

## Bootstrap first admin (manual)

Rules only allow an existing admin to create other admins. Once:

1. Authentication → Add user (email/password)
2. Firestore → create `Users/{thatUid}` with fields:
   - `uid` (same as Auth uid)
   - `role`: `"admin"`
   - `display_name`, `email`
3. Then deploy restrictive rules if not already deployed

## Docs

- Auth model & promotion: `docs/AUTH.md`
- Deferred backlog: `REMAINING.md`
- Phase A plan: `AUTH_RBAC_PLAN.md`
