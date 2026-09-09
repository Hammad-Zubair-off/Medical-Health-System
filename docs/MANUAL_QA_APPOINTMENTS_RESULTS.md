# Manual QA Results — Appointments

**Date:** 2026-09-08T19:05:17.731Z
**Base URL:** http://127.0.0.1:5174
**Method:** Playwright smoke of appointments migration
**Summary:** 21 passed · 0 failed · 0 skipped

| Status | Check | Detail |
|---|---|---|
| PASS | `A.1 admin-login` | http://127.0.0.1:5174/dashboard |
| PASS | `A.2 admin-appointments-list` | Trustcare Clinic Lasvegas Main Menu Dashboard Applications Layouts Clinic Doctors Patients Appointments Appointments New Appointment Calendar Locations Servic |
| PASS | `A.2 admin-no-permission-denied` | ok |
| PASS | `A.3 consult-link-has-id` | /appointment-consultations/qK9zKYIHvTrBMIrLT45t |
| PASS | `A.4 new-appointment-form` | Trustcare Clinic Lasvegas Main Menu Dashboard Applications Layouts Clinic Doctors Patients Appointments Appointments New Appointment Calen |
| PASS | `A.5 appointment-calendar` | Trustcare Clinic Lasvegas Main Menu Dashboard Applications Layouts Clinic Doctors Patients Appointments Appointments New Appointment Calendar Locations Servic |
| PASS | `A.6 consultations-by-id` | Trustcare Clinic Lasvegas Main Menu Dashboard Applications Layouts Clinic Doctors Patients Appointments Locations Services specializations Assets Activities M |
| PASS | `A.7 consultations-404` | http://127.0.0.1:5174/error-404 / Oops, something went wrong Error 404 Page not found. Sorry the page you looking for doesn’t exist o |
| PASS | `D.1 doctor-login` | http://127.0.0.1:5174/doctor/doctor-dashboard |
| PASS | `D.2 dashboard-patient-name` | Demo Patient visible |
| PASS | `D.2 dashboard-no-permission-denied` | ok |
| PASS | `D.3 doctor-appointments-list` | Main Menu Dashboard Appointments Appointments Online Consultations My Schedule Prescriptions Leave Reviews Settings Upgrade To Pro Check 1  |
| PASS | `D.4 doctor-detail-link-has-id` | /doctor/doctors-appointment-details/SRKAEpxMetU2SGFxcFMx |
| PASS | `D.5 doctor-appointment-details` | Main Menu Dashboard Appointments My Schedule Prescriptions Leave Reviews Settings Upgrade To Pro Check 1 min video and begin use Doctoury l |
| PASS | `D.6 doctor-schedule` | Main Menu Dashboard Appointments My Schedule Prescriptions Leave Reviews Settings Upgrade To Pro Check 1 min video and  |
| PASS | `P.1 patient-login` | http://127.0.0.1:5174/patient/patient-dashboard |
| PASS | `P.2 patient-appointments-list` | Main Menu Dashboard Appointments Doctors Prescriptions Invoice Settings Upgrade To Pro Check 1 min video and begin use Doctoury like a pro Appointment Date &  |
| PASS | `P.3 patient-detail-link-has-id` | /patient/patient-appointment-details/HGhiHLSxkXKXFIzGyBgH |
| PASS | `P.4 patient-own-detail` | Main Menu Dashboard Appointments Doctors Prescriptions Invoice Settings Upgrade To Pro Check 1 min video and begin use Doctoury like a pro  |
| PASS | `P.5 patient-cannot-read-other` | blocked (secure) |
| PASS | `X.grep-deleted-json` | 0 matches |

## Checklist

- [x] Admin appointments list (not Alberto Ripley mock)
- [x] New appointment form loads Firestore selects
- [x] Calendar loads
- [x] Consultations `:id`
- [x] Doctor dashboard patient names / no permission-denied
- [x] Doctor appointments + schedule
- [x] Patient appointments list
- [x] Patient blocked from other appointment
- [x] Deleted JSON grep = 0

Screenshots: `docs/qa-screenshots/appointments/`.