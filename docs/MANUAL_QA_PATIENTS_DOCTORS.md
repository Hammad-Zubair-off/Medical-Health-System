# Manual Check Tutorial — Patients & Doctors Migration

Step-by-step guide to verify Phase B by hand in the browser.  
Demo logins: [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md).

**Time:** about 20–30 minutes.  
**What you need:** Chrome/Firefox DevTools open (Console + Network).

---

## 0. Start the app

1. Open a terminal in the project root.
2. Confirm `.env.local` has Firebase keys (see `.env.example`).
3. Run:

```bash
npm run seed
npm run dev
```

4. Open the URL Vite prints (usually `http://localhost:5173`).
5. Open DevTools → **Console** and **Network**. Keep them open for every role below.
6. You should see **no red errors** on the login page before signing in.

---

## 1. Admin checks

### 1.1 Login

1. Go to `/login`.
2. Sign in:
   - Email: `admin@example.com`
   - Password: `Admin123!`
3. You should land on `/dashboard`.
4. Console: no `permission-denied`.

### 1.2 Patients list

1. Open **Patients** → Patients list (`/patients`).
2. Confirm:
   - [ ] Table loads from Firestore (not empty mock names only).
   - [ ] You see seeded names like **Demo Patient**, **Walk-in Avery Cole**, etc.
   - [ ] Total count badge is > 0.
3. Type part of a name in search (e.g. `demo`).
   - [ ] List filters to matching patients.
4. Switch status filter to **Active** / **Inactive**.
   - [ ] List updates (some walk-ins may be inactive).
5. Click **Load more** if shown.
   - [ ] More rows append without a full page refresh.
6. Network tab:
   - [ ] Loading the list does **not** fire one Firestore read per row for patient docs (one list query; doctor names may batch separately).

### 1.3 Patient grid

1. Open `/patients-grid` (grid icon on the patients page).
2. Confirm:
   - [ ] Cards show real seeded patients.
   - [ ] Search / status filter work.
   - [ ] **Edit** / **View** links include a real id in the URL.

### 1.4 Create patient

1. Click **New Patient** (`/create-patient`).
2. Fill required fields:
   - First / last name
   - Phone, email
   - Primary doctor (pick a seeded doctor from the dropdown)
   - DOB, gender, blood group, status
   - Address 1, country, state, city, postal code
3. Click **Add New Patient**.
4. Confirm:
   - [ ] Button shows spinner and disables while saving.
   - [ ] You redirect to `/patient-details/<id>` (URL has a real Firestore id).
   - [ ] Header shows the name / phone / address you entered.
5. Go back to `/patients`.
   - [ ] New patient appears in the list.

### 1.5 Edit patient

1. From the list, open **Edit** on the patient you created (`/edit-patient/<id>`).
2. Change the last name or phone.
3. Save.
4. Confirm:
   - [ ] Redirect back to detail page.
   - [ ] Changes persist after refresh.

### 1.6 Patient detail / 404

1. Open a valid `/patient-details/<id>`.
   - [ ] Name and phone are not the old hard-coded “Alberto Ripley” unless that is real data.
2. Open a fake id, e.g. `/patient-details/does-not-exist`.
   - [ ] You get the **404** page (not a blank screen).

### 1.7 Soft deactivate

1. On `/patients`, use the row menu → **Deactivate**.
2. Filter status to **Inactive**.
   - [ ] Patient appears as Unavailable / inactive.
3. (Optional) Activate again from your own re-test flow if you added that control.

### 1.8 Specializations

1. Open **Specializations** (`/specializations`).
2. Confirm seeded rows (General Practice, Cardiology, Pediatrics, …).
3. Add a new specialization (name + optional description) → **Add**.
   - [ ] It appears in the table after save.
4. Click **Deactivate** / **Activate**.
   - [ ] Status badge flips.

### 1.9 Doctors list & grid

1. Open `/doctors-list`.
2. Confirm:
   - [ ] Seeded doctors: Demo Doctor, Demo Doctor Two, … Five.
   - [ ] Search by name works.
   - [ ] Status filter works.
3. Open `/doctors` (grid).
   - [ ] Cards show the same Firestore doctors.
4. Click a doctor name.
   - [ ] URL is `/doctor-details/<id>`.
   - [ ] Name, specialization, fee, phone, email, bio match Firestore (not fixed “Dr. John Smith” only).

### 1.10 Add doctor (Console UID flow)

This is **option (c)** — the app cannot create Auth users from the browser.

1. In [Firebase Console](https://console.firebase.google.com/) → project `medical-health-system-dev` → **Authentication** → **Add user**.
2. Create e.g. `manual.doctor@example.com` / `Doctor123!`.
3. Copy the user’s **UID**.
4. In Firestore → `Users` → create `Users/<thatUid>` with at least:
   - `uid`: same as Auth uid  
   - `role`: `"doctor"` (or leave patient; Add Doctor will set `role` to doctor)  
   - `email`, `display_name`
5. In the app: **Add Doctor** (`/add-doctor`).
6. Paste the UID, fill name/email/phone/specialization/fee, submit.
7. Confirm:
   - [ ] Redirect to `/doctor-details/<newId>`.
   - [ ] Doctor appears on `/doctors-list`.

### 1.11 Edit doctor

1. From list → **Edit** (`/edit-doctors/<id>`).
2. Change bio or fee → save.
3. Confirm detail page shows the update after refresh.

### 1.12 Logout admin

Use the profile/logout control, or clear session and go to `/login` again.

---

## 2. Doctor checks (blocking bug + dashboard)

### 2.1 Login

1. Sign in:
   - Email: `doctor@example.com`
   - Password: `Doctor123!`
2. You should land on `/doctor/doctor-dashboard`.

### 2.2 Dashboard patient names (Phase 2 verify)

1. Wait for the dashboard spinner to finish.
2. Confirm:
   - [ ] Page loads without a red error alert.
   - [ ] Upcoming / recent appointments show a **patient name** (e.g. Demo Patient), not blank.
3. Console:
   - [ ] **No** `FirebaseError: Missing or insufficient permissions` / `permission-denied`.
4. Network:
   - [ ] Patient clinical reads go to `Patient` (or succeed); doctor is **not** reading other users’ private `Users/{uid}` docs for names.

### 2.3 Patients list as doctor

1. If the sidebar exposes Patients for doctors, open `/patients`.
2. Confirm:
   - [ ] List loads (rules allow signed-in doctors to read `Patient`).
   - [ ] Console clean of permission errors.

### 2.4 Schedule regression

1. Open `/doctor/doctor-schedule`.
2. Confirm:
   - [ ] Page still loads (schedule code was not replaced).
   - [ ] No new permission-denied errors.

### 2.5 Logout doctor

Sign out before the patient role test.

---

## 3. Patient checks

### 3.1 Login

1. Sign in:
   - Email: `patient@example.com`
   - Password: `Patient123!`
2. Land on `/patient/patient-dashboard`.

### 3.2 Browse doctors

1. Open **Doctors** / `/patient/patient-doctors`.
2. Confirm:
   - [ ] Only **active** doctors appear.
   - [ ] Names/specializations come from Firestore.
   - [ ] Search works.

### 3.3 Cannot open someone else’s patient chart

1. From admin earlier, copy another patient’s detail URL (`/patient-details/<otherId>`).
2. While logged in as this patient, paste that URL.
3. Confirm:
   - [ ] You do **not** see the other patient’s full clinical record.
   - [ ] Prefer: error / access message / 404 — **not** a silent blank success page with their data.
4. Console may show permission-denied for that read; that is expected for another patient’s doc when you are not admin/doctor.

### 3.4 Logout patient

Sign out when finished.

---

## 4. Cross-checks (all roles)

Do these once after the role walks above.

| Check | Pass? |
|---|---|
| Login with wrong password fails cleanly | ☐ |
| Refreshing while logged in keeps session | ☐ |
| Detail URLs always contain a real `:id` (not bare `/patient-details`) | ☐ |
| Sidebar “Patient Details” / “Doctor Details” no longer open a broken param-less route | ☐ |
| `npm run build` already passed in CI/local after migration | ☐ |

Optional repo check (terminal):

```bash
grep -rn "patientListData\|patientDeatilsData\|doctorsListData\|specializationListData\|patientDoctorsData" src/
```

Expected: **no matches**.

---

## 5. Quick pass / fail summary

Copy this when reporting results:

```
Date:
Tester:

[ ] Admin patients list/search/create/edit/detail/404
[ ] Admin specializations add + toggle status
[ ] Admin doctors list/grid/detail/edit
[ ] Admin add doctor via Console UID (optional)
[ ] Doctor dashboard shows patient names, no permission-denied
[ ] Doctor schedule still loads
[ ] Patient browse-doctors works
[ ] Patient cannot read another Patient doc
[ ] Grep for deleted JSON filenames = 0

Notes / bugs found:
-
```

---

## Troubleshooting

| Symptom | Likely cause | What to try |
|---|---|---|
| Empty patients/doctors lists | Seed not run or wrong Firebase project | `npm run seed`; check `.env.local` `VITE_FIREBASE_PROJECT_ID` |
| `permission-denied` on doctor dashboard | Rules not deployed or Patient docs missing | Redeploy rules; re-run seed; confirm `Patient` docs with `userId` set |
| Create patient fails validation | Required field empty / invalid email | Fill all `*` fields; pick a doctor from dropdown |
| Add doctor fails on UID | Auth user or `Users/{uid}` missing | Create Auth user + Users doc in Console first |
| Indexes building / query errors | New composite indexes still building | Wait a few minutes after deploy; check Firebase Console → Indexes |
| Old “Alberto Ripley” everywhere | Still on a page not migrated | Only list/grid/forms/header detail were wired; some detail tabs remain template |

---

## Related docs

- [`DEMO_ACCOUNTS.md`](./DEMO_ACCOUNTS.md) — credentials  
- [`DATA_LAYER.md`](./DATA_LAYER.md) — how domains are wired  
- [`DATA_MIGRATION_ACTIVE.md`](./DATA_MIGRATION_ACTIVE.md) — checklist status  
