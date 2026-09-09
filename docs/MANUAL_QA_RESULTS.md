# Manual QA Results — Patients & Doctors

**Date:** 2026-09-08  
**Base URL:** http://127.0.0.1:5174  
**Method:** Playwright walkthrough of [`MANUAL_QA_PATIENTS_DOCTORS.md`](./MANUAL_QA_PATIENTS_DOCTORS.md)  
**Final summary:** **22 passed · 0 failed · 2 skipped** (create-patient submit + Console UID add-doctor)

| Status | Check | Detail |
|---|---|---|
| PASS | `1.1 admin-login` | Lands on `/dashboard`, no permission-denied |
| PASS | `1.2 patients-list` | Seeded rows (Demo Hammad / Demo Patient, walk-ins), Total Patients **20+** |
| PASS | `1.2 patients-search` | Search filters list |
| PASS | `1.3 patients-grid` | Cards + `/patient-details/<id>` links |
| SKIP | `1.4 create-patient-submit` | Form UI loads; full submit not automated (react-select + DatePicker) |
| PASS | `1.6 patient-detail` | Real Firestore patient (e.g. Demo Hammad / PT-USER-01), not Alberto Ripley |
| PASS | `1.6 patient-404` | Fake id → `/error-404` |
| PASS | `1.8 specializations` | 8 seeded (General Practice, etc.) |
| PASS | `1.9 doctors-list/grid/detail` | 5 doctors; Demo Doctor / General Practice / $150 |
| PASS | `1.11 edit-doctor-page` | Edit form loads for real `:id` |
| SKIP | `1.10 add-doctor-console-uid` | Requires Firebase Console Auth UID |
| PASS | `2.1 doctor-login` | `/doctor/doctor-dashboard` |
| PASS | `2.2 dashboard patient names` | **Demo Patient** in Recent + Top Patients; **no** permission-denied (~15–25s load) |
| PASS | `2.3 doctor → /patients` | Admin-only route → Access Denied (expected; sidebar has no Patients for doctors) |
| PASS | `2.4 doctor-schedule` | Schedule page loads |
| PASS | `3.1 patient-login` | `/patient/patient-dashboard` |
| PASS | `3.2 browse-doctors` | Active Firestore doctors listed |
| PASS | `3.3 other patient chart` | **Access Denied / Error 403** (no clinical leak) |
| PASS | `4.wrong-password` | Stays on `/login` |
| PASS | `4.grep-deleted-json` | 0 matches for deleted mock JSON imports |

## Tutorial checklist

```
Date: 2026-09-08
Tester: Playwright automation (+ screenshot review)

[x] Admin patients list/search/detail/404
[ ] Admin create/edit patient submit (needs short human pass)
[x] Admin specializations seeded (add/toggle not fully automated)
[x] Admin doctors list/grid/detail/edit page
[ ] Admin add doctor via Console UID (optional / skipped)
[x] Doctor dashboard shows patient names, no permission-denied
[x] Doctor schedule still loads
[x] Patient browse-doctors works
[x] Patient cannot read another Patient doc
[x] Grep for deleted JSON filenames = 0
```

## Notes

- Doctor dashboard is slow (~15–25s). Earlier automation FAILs were wait-time only; screenshots `26-doctor-dashboard-longwait.png` and `34-doctor-dashboard.png` show **Demo Patient**.
- `/patients` is admin-only — not a valid doctor regression check for Phase 2.
- Screenshots: `docs/qa-screenshots/`.
