# Demo Accounts

Test accounts created by `npm run seed` (`scripts/seed.ts`).

Change these passwords after first login in any shared or production-like environment.

## Admin

Password for all admins: `Admin123!`  
Home after login: `/dashboard`

| Email | Display name | Phone |
|-------|--------------|-------|
| `admin@example.com` | Bootstrap Admin | +1 212 555 0100 |
| `admin2@example.com` | Admin Two | +1 212 555 0101 |
| `admin3@example.com` | Admin Three | +1 212 555 0102 |
| `sarah.mitchell@trustcare.example.com` | Sarah Mitchell | +1 310 555 2841 |
| `james.rivera@trustcare.example.com` | James Rivera | +1 718 555 3402 |
| `priya.sharma@trustcare.example.com` | Priya Sharma | +1 408 555 1967 |
| `marcus.chen@trustcare.example.com` | Marcus Chen | +1 617 555 4813 |

## Doctor

Password for all doctors: `Doctor123!`  
Home after login: `/doctor/doctor-dashboard`

| Email | Display name | Phone | Specialization | Fee |
|-------|--------------|-------|----------------|-----|
| `doctor@example.com` | Demo Doctor | +1 000 000 0001 | General Practice | $150 |
| `doctor2@example.com` | Demo Doctor Two | +1 000 000 0011 | Cardiology | $150 |
| `doctor3@example.com` | Demo Doctor Three | +1 000 000 0012 | Pediatrics | $150 |
| `doctor4@example.com` | Demo Doctor Four | +1 000 000 0013 | Dermatology | $150 |
| `doctor5@example.com` | Demo Doctor Five | +1 000 000 0014 | Orthopedics | $150 |
| `elena.vargas@trustcare.example.com` | Dr. Elena Vargas | +1 310 555 8217 | Neurology | $220 |
| `omar.hassan@trustcare.example.com` | Dr. Omar Hassan | +1 702 555 6394 | Ophthalmology | $185 |
| `naomi.brooks@trustcare.example.com` | Dr. Naomi Brooks | +1 415 555 7720 | ENT | $175 |
| `liam.oconnor@trustcare.example.com` | Dr. Liam O'Connor | +1 617 555 0148 | General Practice | $140 |

### New doctors — profile notes

| Doctor | Details |
|--------|---------|
| **Dr. Elena Vargas** | MD, PhD · 14 yrs · headache & stroke · English/Spanish |
| **Dr. Omar Hassan** | MD, FACS · 11 yrs · cataract & diabetic eye care |
| **Dr. Naomi Brooks** | ENT · 9 yrs · sinus, hearing, pediatric ENT |
| **Dr. Liam O'Connor** | Family Medicine · 16 yrs · preventive primary care |

## Patient

Password for all patients: `Patient123!`  
Home after login: `/patient/patient-dashboard`

| Email | Display name | Phone | DOB | Blood | City |
|-------|--------------|-------|-----|-------|------|
| `patient@example.com` | Demo Patient | +1 000 000 0002 | — | O+ | Los Angeles, CA |
| `patient2@example.com` | Demo Patient Two | +1 000 000 0022 | — | A+ | Los Angeles, CA |
| `patient3@example.com` | Demo Patient Three | +1 000 000 0023 | — | B+ | Los Angeles, CA |
| `maya.patel@email.example.com` | Maya Patel | +1 408 555 2931 | 1988-03-22 | B+ | San Jose, CA |
| `daniel.wright@email.example.com` | Daniel Wright | +1 303 555 4186 | 1975-11-08 | A- | Denver, CO |
| `sofia.alvarez@email.example.com` | Sofia Alvarez | +1 214 555 6802 | 1999-07-14 | O- | Dallas, TX |
| `henry.nguyen@email.example.com` | Henry Nguyen | +1 503 555 7764 | 1968-01-30 | AB+ | Portland, OR |

### New patients — addresses & allergies

| Patient | Address | Allergies |
|---------|---------|-----------|
| **Maya Patel** | 1847 Willow Creek Drive, Apt 4B, San Jose, CA 95112 | Penicillin |
| **Daniel Wright** | 902 Larimer Street, Denver, CO 80204 | Peanuts, Shellfish |
| **Sofia Alvarez** | 3310 Oak Lawn Avenue, Suite 12, Dallas, TX 75219 | — |
| **Henry Nguyen** | 215 NW Davis Street, Portland, OR 97209 | Latex |

## Quick login (new realistic set)

```
Admin:  sarah.mitchell@trustcare.example.com  / Admin123!
Doctor: elena.vargas@trustcare.example.com    / Doctor123!
Patient: maya.patel@email.example.com         / Patient123!
```

## How to recreate

1. Ensure `scripts/serviceAccountKey.json` exists (Firebase service account key).
2. Ensure `.env.local` has Firebase web app config.
3. Run:

```bash
npm run seed
```

The seed script upserts Auth users and Firestore `Users` / `Doctor` / `Patient` / `Specialization` docs (plus sample appointments, finance, HRM). Re-running is safe for existing emails. Extra walk-in patients (`PT-WALK-*`) have no login.
