# Demo Accounts

Test accounts created by `npm run seed` (`scripts/seed.ts`).

Change these passwords after first login in any shared or production-like environment.

## Admin

| Email | Password | Display name |
|-------|----------|--------------|
| `admin@example.com` | `Admin123!` | Bootstrap Admin |
| `admin2@example.com` | `Admin123!` | Admin Two |
| `admin3@example.com` | `Admin123!` | Admin Three |

Home after login: `/dashboard`

## Doctor

| Email | Password | Display name | Specialization |
|-------|----------|--------------|----------------|
| `doctor@example.com` | `Doctor123!` | Demo Doctor | General Practice |
| `doctor2@example.com` | `Doctor123!` | Demo Doctor Two | Cardiology |
| `doctor3@example.com` | `Doctor123!` | Demo Doctor Three | Pediatrics |
| `doctor4@example.com` | `Doctor123!` | Demo Doctor Four | Dermatology |
| `doctor5@example.com` | `Doctor123!` | Demo Doctor Five | Orthopedics |

Home after login: `/doctor/doctor-dashboard`

## Patient

| Email | Password | Display name |
|-------|----------|--------------|
| `patient@example.com` | `Patient123!` | Demo Patient |
| `patient2@example.com` | `Patient123!` | Demo Patient Two |
| `patient3@example.com` | `Patient123!` | Demo Patient Three |

Home after login: `/patient/patient-dashboard`

## How to recreate

1. Ensure `scripts/serviceAccountKey.json` exists (Firebase service account key).
2. Ensure `.env.local` has Firebase web app config.
3. Run:

```bash
npm run seed
```

The seed script upserts Auth users, Firestore `Users` / `Doctor` / `Patient` / `Specialization` docs, and sample appointments. Re-running is safe for existing emails. Extra walk-in patients (`PT-WALK-*`) have no login.
