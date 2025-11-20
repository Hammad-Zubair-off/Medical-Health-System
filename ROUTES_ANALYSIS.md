# Routes Analysis - Organized by Role

## Overview
This document categorizes all routes in the application by user role and access level.

---

## 🔐 **AUTHENTICATION ROUTES** (Public - No Auth Required)
These routes are accessible to all users (unauthenticated).

| Route Key | Path | Component |
|-----------|------|-----------|
| `login` | `/login` | Login |
| `loginCover` | `/login-cover` | LoginCover |
| `loginillustration` | `/login-illustration` | LoginIllustration |
| `loginbasic` | `/login-basic` | LoginBasic |
| `registercover` | `/register-cover` | RegisterCover |
| `registerillustration` | `/register-illustration` | RegisterIllustration |
| `registerbasic` | `/register-basic` | RegisterBasic |
| `forgotpasswordcover` | `/forgot-password-cover` | ForgotPasswordCover |
| `forgotpasswordillustration` | `/forgot-password-illustration` | ForgotPasswordIllustration |
| `forgotpasswordbasic` | `/forgot-password-basic` | ForgotPasswordBasic |
| `resetpasswordcover` | `/reset-password-cover` | ResetPasswordCover |
| `resetpasswordillustration` | `/reset-password-illustration` | ResetPasswordIllustration |
| `resetpasswordbasic` | `/reset-password-basic` | ResetPasswordBasic |
| `emailverificationcover` | `/email-verification-cover` | EmailVerificationCover |
| `emailverificationillustration` | `/email-verification-illustration` | EmailVerificationIllustration |
| `emailverificationbasic` | `/email-verification-basic` | EmailVerificationBasic |
| `twostepverificationcover` | `/two-step-verification-cover` | TwoStepVerificationCover |
| `twostepverificationillustration` | `/two-step-verification-illustration` | TwoStepVerificationIllustration |
| `twostepverificationbasic` | `/two-step-verification-basic` | TwoStepVerificationBasic |
| `lockscreen` | `/lock-screen` | LockScreen |
| `error404` | `/error-404` | Error404 |
| `error500` | `/error-500` | Error500 |
| `successCover` | `/success-cover` | - (Not in router.link.tsx) |
| `successIllustration` | `/success-illustration` | - (Not in router.link.tsx) |
| `successBasic` | `/success-basic` | - (Not in router.link.tsx) |

**Total: 23 routes**

---

## 👨‍⚕️ **DOCTOR ROUTES** (Doctor Role Only)
Routes prefixed with `/doctor/` - Doctor-specific functionality.

| Route Key | Path | Component |
|-----------|------|-----------|
| `doctordashboard` | `/doctor/doctor-dashboard` | DoctorDahboard |
| `doctorschedule` | `/doctor/doctor-schedule` | DoctorSchedules |
| `doctordetails` | `/doctor/doctor-details` | - (Not in router.link.tsx) |
| `doctorreviews` | `/doctor/doctors-reviews` | DoctorsReviews |
| `doctorleaves` | `/doctor/doctors-leaves` | DoctorsLeaves |
| `doctorsprofilesettings` | `/doctor/doctors-profile-settings` | DoctorsProfileSettings |
| `doctorspasswordsettings` | `/doctor/doctors-password-settings` | DoctorsPasswordSettings |
| `doctorsnotificationsettings` | `/doctor/doctors-notification-settings` | DoctorsNotificationSettings |
| `doctorsprescriptions` | `/doctor/doctors-prescriptions` | DoctorsPrescriptions |
| `doctorsprescriptiondetails` | `/doctor/doctors-prescription-details` | DoctorsPrescriptionDetails |
| `onlineconsultations` | `/doctor/online-consultations` | OnlineConsultations |
| `doctorsappointments` | `/doctor/doctors-appointments` | DoctorAppointments |
| `doctorsappointmentdetails` | `/doctor/doctors-appointment-details` | DoctorsAppointmentDetails |
| `doctorspatientdetails` | `/doctor/doctors-patient-details` | - (Not in router.link.tsx) |

**Total: 14 routes**

---

## 👤 **PATIENT ROUTES** (Patient Role Only)
Routes prefixed with `/patient/` - Patient-specific functionality.

| Route Key | Path | Component |
|-----------|------|-----------|
| `patientdashboard` | `/patient/patient-dashboard` | PatientDashboard |
| `patientdetails` | `/patient/patient-details` | - (Not in router.link.tsx) |
| `patientappointments` | `/patient/patient-appointments` | PatientAppointments |
| `patientappointmentdetails` | `/patient/patient-appointment-details` | PatientAppointmentDetails |
| `patientdoctors` | `/patient/patient-doctors` | PatientDoctors |
| `patientPrescriptions` | `/patient/patient-prescriptions` | PatientPrescriptions |
| `patientprescriptiondetails` | `/patient/patient-prescription-details` | PatientPrescriptionDetails |
| `patientinvoices` | `/patient/patient-invoices` | PatientInvoices |
| `patientinvoicedetails` | `/patient/patient-invoice-details` | PatientInvoiceDetails |
| `patientprofilesettings` | `/patient/patient-profile-settings` | PatientProfileSettings |
| `patientpasswordsettings` | `/patient/patient-password-settings` | PatientPasswordSettings |
| `patientnotificationssettings` | `/patient/patient-notifications-settings` | PatientNotificationsSettings |

**Total: 12 routes**

---

## 🏢 **SUPER ADMIN ROUTES** (Super Admin Role Only)
Routes prefixed with `/super-admin/` - Multi-tenant management.

| Route Key | Path | Component |
|-----------|------|-----------|
| `superAdminDashboard` | `/super-admin/super-admin-dashboard` | - (Not in router.link.tsx) |
| `companies` | `/super-admin/companies` | - (Not in router.link.tsx) |
| `subscriptions` | `/super-admin/subscriptions` | - (Not in router.link.tsx) |
| `packages` | `/super-admin/packages` | - (Not in router.link.tsx) |
| `packagesGrid` | `/super-admin/packages-grid` | - (Not in router.link.tsx) |
| `domain` | `/super-admin/domain` | - (Not in router.link.tsx) |
| `purchaseTransaction` | `/super-admin/purchase-transaction` | - (Not in router.link.tsx) |

**Total: 7 routes** (⚠️ **None are implemented in router.link.tsx**)

---

## 👨‍💼 **ADMIN/CLINIC ADMIN ROUTES** (Admin Role)
Main administrative routes for clinic management.

### **Dashboard**
| Route Key | Path | Component |
|-----------|------|-----------|
| `dashboard` | `/dashboard` | Dashboard |

### **Clinic Management**
| Route Key | Path | Component |
|-----------|------|-----------|
| `doctors` | `/doctors` | Doctors |
| `doctorsList` | `/doctors-list` | DoctorsList |
| `doctorsDetails` | `/doctor-details` | DoctorDetails |
| `addDoctors` | `/add-doctor` | AddDoctor |
| `editDoctors` | `/edit-doctors` | EditDoctor |
| `doctorScheduleClini` | `/doctor-schedule` | DoctorSchedules |
| `patients` | `/patients` | Patients |
| `patientsGrid` | `/patients-grid` | PatientsGrid |
| `createPatient` | `/create-patient` | CreatePatient |
| `editPatient` | `/edit-patient` | EditPatient |
| `patientDetails` | `/patient-details` | PatientDetails |
| `appointments` | `/appointments` | Appointments |
| `newAppointment` | `/new-appointment` | NewAppointment |
| `appointmentCalendar` | `/appointment-calendar` | AppointmentCalendar |
| `appointmentconsultations` | `/appointment-consultations` | AppointmentConsultations |
| `locations` | `/locations` | Locations |
| `services` | `/services` | Services |
| `specializations` | `/specializations` | Specializations |
| `assets` | `/assets` | Assets |
| `activities` | `/activities` | Activities |
| `messages` | `/messages` | Messages |

### **HRM (Human Resource Management)**
| Route Key | Path | Component |
|-----------|------|-----------|
| `staffs` | `/staffs` | StaffsList |
| `hrmDepartments` | `/hrm-departments` | HrmDepartments |
| `designation` | `/designation` | DesignationList |
| `attendance` | `/attendance` | AttendanceList |
| `leaves` | `/leaves` | LeavesList |
| `leaveType` | `/leave-type` | LeaveType |
| `holidays` | `/holidays` | HolidaysList |
| `payroll` | `/payroll` | PayrollList |
| `payroll2` | `/payroll-2` | PayrollTwo |

### **Finance & Accounts**
| Route Key | Path | Component |
|-----------|------|-----------|
| `expenses` | `/expenses` | ExpensesList |
| `expenseCategory` | `/expense-category` | ExpenseCategory |
| `income` | `/income` | IncomeList |
| `invoices` | `/invoices` | InvoicesList |
| `invoicesDetails` | `/invoices-details` | InvoicesDetails |
| `addInvoices` | `/add-invoices` | AddInvoices |
| `editInvoices` | `/edit-invoices` | EditInvoices |
| `payments` | `/payments` | PaymentsList |
| `transactions` | `/transactions` | TransactionsList |

### **Administration**
| Route Key | Path | Component |
|-----------|------|-----------|
| `rolesPermissions` | `/roles-and-permissions` | RolesAndPermissions |
| `permissions` | `/permissions` | Permissions |
| `deleteaccountrequest` | `/delete-account-request` | DeleteAccountRequest |
| `incomeReport` | `/income-report` | IncomeReport |
| `expenseReport` | `/expense-report` | ExpenseReport |
| `profitloss` | `/profit-and-loss` | ProfitAndLoss |
| `appointmentReport` | `/appointment-report` | AppointmentReport |
| `patientReport` | `/patient-report` | PatientReport |

### **Content Management**
| Route Key | Path | Component |
|-----------|------|-----------|
| `pages` | `/pages` | Pages |
| `addPage` | `/add-page` | AddPages |
| `editPage` | `/edit-page` | EditPage |
| `blogs` | `/blogs` | Blogs |
| `addBlogs` | `/add-blog` | AddBlog |
| `editBlogs` | `/edit-blog` | EditBlog |
| `blogDetails` | `/blog-details` | - (Not in router.link.tsx) |
| `blogCategories` | `/blog-categories` | BlogCategories |
| `blogTags` | `/blog-tags` | - (Not in router.link.tsx) |
| `blogComments` | `/blog-comments` | BlogComments |
| `countries` | `/countries` | Countries |
| `states` | `/states` | States |
| `cities` | `/cities` | Cities |
| `testimonials` | `/testimonials` | Testimonials |
| `faq` | `/faq` | Faq |

### **Support**
| Route Key | Path | Component |
|-----------|------|-----------|
| `contactMessages` | `/contact-messages` | ContactMessages |
| `tickets` | `/tickets` | TicketsList |
| `ticketDetails` | `/ticket-details` | TicketDetails |
| `announcements` | `/announcements` | AnnouncementsList |
| `newsletters` | `/newsletters` | Newsletters |

**Total Admin Routes: 65 routes**

---

## ⚙️ **SETTINGS ROUTES** (Admin Role)
System and application settings.

### **Account Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `profilesettings` | `/profile-settings` | ProfileSettings |
| `securitysettings` | `/security-settings` | SecuritySettings |
| `notificationssettings` | `/notifications-settings` | NotificationsSettings |
| `integrationssettings` | `/integrations-settings` | IntegrationsSettings |

### **Website Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `organizationsettings` | `/organization-settings` | OrganizationSettings |
| `localizationsettings` | `/localization-settings` | LocalizationSettings |
| `prefixessettings` | `/prefixes-settings` | PrefixesSettings |
| `seosetupsettings` | `/seo-setup-settings` | SeoSetupSettings |
| `languagesettings` | `/language-settings` | LanguageSettings |
| `languagesettings2` | `/language-settings2` | LanguageSettings2 |
| `languagesettings3` | `/language-settings3` | LanguageSettings3 |
| `maintenancemodesettings` | `/maintenance-mode-settings` | MaintenanceModeSettings |
| `loginandregistersettings` | `/login-and-register-settings` | LoginAndRegisterSettings |
| `preferencessettings` | `/preferences-settings` | PreferencesSettings |

### **Clinic Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `appointmentsettings` | `/appointment-settings` | AppointmentSettings |
| `workinghourssettings` | `/working-hours-settings` | WorkingHoursSettings |
| `cancellationreasonsettings` | `/cancellation-reason-settings` | CancellationReasonSettings |
| `invoicesettings` | `/invoice-settings` | InvoiceSettings |
| `invoicetemplatessettings` | `/invoice-templates-settings` | InvoiceTemplatesSettings |
| `signaturessettings` | `/signatures-settings` | SignaturesSettings |
| `customfieldssettings` | `/custom-fields-settings` | CustomFieldsSettings |

### **System Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `emailsettings` | `/email-settings` | EmailSettings |
| `emailtemplatessettings` | `/email-templates-settings` | EmailTemplatesSettings |
| `smsgatewayssettings` | `/sms-gateways-settings` | SmsGatewaysSettings |
| `smstemplatessettings` | `/sms-templates-settings` | SmsTemplatesSettings |
| `gdprcookiessettings` | `/gdpr-cookies-settings` | GdprCookiesSettings |

### **Finance Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `paymentmethodssettings` | `/payment-methods-settings` | PaymentMethodsSettings |
| `bankaccountssettings` | `/bank-accounts-settings` | BankAccountsSettings |
| `taxratessettings` | `/tax-rates-settings` | TaxRatesSettings |
| `currenciessettings` | `/currencies-settings` | CurrenciesSettings |

### **Other Settings**
| Route Key | Path | Component |
|-----------|------|-----------|
| `sitemapsettings` | `/sitemap-settings` | SitemapSettings |
| `clearcachesettings` | `/clear-cache-settings` | ClearCacheSettings |
| `storagesettings` | `/storage-settings` | StorageSettings |
| `cronjobsettings` | `/cronjob-settings` | CronjobSettings |
| `banipaddresssettings` | `/ban-ip-address-settings` | BanIpAddressSettings |
| `systembackupsettings` | `/system-backup-settings` | SystemBackupSettings |
| `databasebackupsettings` | `/database-backup-settings` | DatabaseBackupSettings |
| `systemupdate` | `/system-update` | SystemUpdate |

**Total Settings Routes: 38 routes**

---

## 📱 **APPLICATION ROUTES** (Shared - Multiple Roles)
General application features accessible to authenticated users.

| Route Key | Path | Component |
|-----------|------|-----------|
| `chat` | `/application/chat` | Chat |
| `calendar` | `/application/calendar` | Calendars |
| `notes` | `/application/notes` | Notes |
| `voiceCall` | `/application/voice-call` | VoiceCalls |
| `videoCall` | `/application/video-call` | VideoCall |
| `outgoingCall` | `/application/outgoing-call` | OutGoingCall |
| `incomingCall` | `/application/incoming-call` | IncomingCall |
| `callHistory` | `/application/call-history` | CallHistory |
| `todo` | `/application/todo` | Todo |
| `todoList` | `/application/todo-list` | TodoList |
| `email` | `/application/email` | Email |
| `EmailReply` | `/application/email-reply` | - (Not in router.link.tsx) |
| `audioCall` | `/application/audio-call` | - (Not in router.link.tsx) |
| `fileManager` | `/application/file-manager` | FileManager |
| `socialFeed` | `/application/social-feed` | SocialFeed |
| `kanbanView` | `/application/kanban-view` | KanbanView |
| `invoice` | `/application/invoice` | Invoice |
| `contacts` | `/application/contacts` | Contacts |
| `searchList` | `/application/search-list` | SearchList |
| `invoiceDetails` | `/application/invoice-details` | InvoiceDetails |
| `addInvoice` | `/add-invoice` | AddInoivce |
| `notifications` | `/notifications` | Notifications |

**Total: 22 routes**

---

## 🎨 **UI/DEVELOPMENT ROUTES** (Development/Testing)
UI components, forms, charts - typically for development/testing.

### **Layout Routes**
| Route Key | Path | Component |
|-----------|------|-----------|
| `layoutDefault` | `/layout-default` | Dashboard |
| `layoutMini` | `/layout-mini` | Dashboard |
| `layoutHoverView` | `/layout-hover-view` | Dashboard |
| `layoutHidden` | `/layout-hidden` | Dashboard |
| `layoutFullWidth` | `/layout-full-width` | Dashboard |
| `layoutDark` | `/layout-dark` | Dashboard |
| `layoutRTL` | `/layout-rtl` | Dashboard |

### **Base UI Components**
| Route Key | Path | Component |
|-----------|------|-----------|
| `uiAccordion` | `/ui-accordion` | UiAccordion |
| `uiAlerts` | `/ui-alerts` | UiAlerts |
| `uiAvatar` | `/ui-avatar` | UiAvatar |
| `uiBadges` | `/ui-badges` | UiBadges |
| `uiBreadcrumb` | `/ui-breadcrumb` | UiBreadcrumb |
| `uiButtons` | `/ui-buttons` | UiButtons |
| `uiButtonsGroup` | `/ui-buttons-group` | UiButtonsGroup |
| `uiCards` | `/ui-cards` | UiCards |
| `uiCarousel` | `/ui-carousel` | UiCarousel |
| `uiCollapse` | `/ui-collapse` | UiCollapse |
| `uiDropdowns` | `/ui-dropdowns` | UiDropdowns |
| `uiRatio` | `/ui-ratio` | UiRatio |
| `uiGrid` | `/ui-grid` | UiGrid |
| `uiImages` | `/ui-images` | UiImages |
| `uiLinks` | `/ui-links` | UiLinks |
| `uiListGroup` | `/ui-list-group` | UiListGroup |
| `uiModals` | `/ui-modals` | UiModals |
| `uiOffcanvas` | `/ui-offcanvas` | UiOffcanvas |
| `uiPagination` | `/ui-pagination` | UiPagination |
| `uiPlaceholders` | `/ui-placeholders` | UiPlaceholders |
| `uiPopovers` | `/ui-popovers` | UiPopovers |
| `uiProgress` | `/ui-progress` | UiProgress |
| `uiScrollspy` | `/ui-scrollspy` | UiScrollspy |
| `uiSpinner` | `/ui-spinner` | UiSpinner |
| `uiNavTabs` | `/ui-nav-tabs` | UiNavTabs |
| `uiToasts` | `/ui-toasts` | UiToasts |
| `uiTooltips` | `/ui-tooltips` | UiTooltips |
| `uiTypography` | `/ui-typography` | UiTypography |
| `uiUtilities` | `/ui-utilities` | UiUtilities |

### **Advanced UI Components**
| Route Key | Path | Component |
|-----------|------|-----------|
| `uiDraggble` / `dragula` | `/extended-dragula` | UiDragula |
| `uiClipboard` | `/ui-clipboard` | UiClipBoard |
| `uiRangeslider` | `/ui-rangeslider` | UiRangeSlides |
| `uiLightbox` | `/ui-lightbox` | UiLightboxes |
| `uiRating` | `/ui-rating` | UiRating |
| `uiCounter` | `/ui-counter` | UiCounter |
| `uiScrollbar` | `/ui-scrollbar` | UiScrollbar |

### **Charts**
| Route Key | Path | Component |
|-----------|------|-----------|
| `chartApex` | `/chart-apex` | ChartApex |
| `chartJs` | `/chart-js` | ChartJSExample |

### **Maps**
| Route Key | Path | Component |
|-----------|------|-----------|
| `mapsLeaflet` | `/maps-leaflet` | MapsLeaflet |

### **Tables**
| Route Key | Path | Component |
|-----------|------|-----------|
| `tablesBasic` | `/tables-basic` | TablesBasic |
| `dataTables` | `/data-tables` | DataTables |

### **Icons**
| Route Key | Path | Component |
|-----------|------|-----------|
| `iconFontawesome` | `/icon-fontawesome` | IconFontawesome |
| `iconTabler` | `/icon-tabler` | IconTabler |
| `iconBootstrap` | `/icon-bootstrap` | IconBootstrap |
| `iconRemix` | `/icon-remix` | IconRemix |
| `iconIonic` | `/icon-ionic` | IconIonic |
| `iconMaterial` | `/icon-material` | IconMaterial |
| `iconPe7` | `/icon-pe7` | IconPe7 |
| `iconThemify` | `/icon-themify` | IconThemify |
| `iconWeather` | `/icon-weather` | IconWeather |
| `iconTypicon` | `/icon-typicon` | IconTypicon |
| `iconFlag` | `/icon-flag` | IconFlag |

### **Forms**
| Route Key | Path | Component |
|-----------|------|-----------|
| `formBasicInputs` | `/form-basic-inputs` | FormBasicInputs |
| `formCheckboxRadios` | `/form-checkbox-radios` | FormCheckboxRadios |
| `formInputGroups` | `/form-input-groups` | FormInputGroups |
| `formGridGutters` | `/form-grid-gutters` | FormGridGutters |
| `formFileupload` | `/form-fileupload` | FormFileupload |
| `formHorizontal` | `/form-horizontal` | FormHorizontal |
| `formVertical` | `/form-vertical` | FormVertical |
| `formFloatingLabels` | `/form-floating-labels` | FormFloatingLabels |
| `formValidation` | `/form-validation` | FormValidation |
| `formSelect2` | `/form-select2` | FormSelect2 |
| `formPickers` | `/form-pickers` | FormPickers |
| `formWizard` | `/form-wizard` | FormWizard |
| `formMask` | `/form-mask` | FormMask |

### **Pages**
| Route Key | Path | Component |
|-----------|------|-----------|
| `profile` | `/profile` | Profile |
| `starter` | `/starter` | Starter |
| `gallery` | `/gallery` | Gallery |
| `pricing` | `/pricing` | Pricing |
| `timeline` | `/timeline` | Timeline |
| `comingSoon` | `/coming-soon` | ComingSoon |
| `underMaintenance` | `/under-maintenance` | UnderMaintenance |
| `underConstruction` | `/under-construction` | - (Not in router.link.tsx) |
| `apiKeys` | `/api-keys` | - (Not in router.link.tsx) |
| `privacyPolicy` | `/privacy-policy` | PrivacyPolicy |
| `termsCondition` | `/terms-condition` | - (Not in router.link.tsx) |

**Total UI/Development Routes: 95 routes**

---

## 📊 **ROUTE SUMMARY**

| Category | Count |
|----------|-------|
| Authentication Routes | 23 |
| Doctor Routes | 14 |
| Patient Routes | 12 |
| Super Admin Routes | 7 (⚠️ Not implemented) |
| Admin/Clinic Admin Routes | 65 |
| Settings Routes | 38 |
| Application Routes (Shared) | 22 |
| UI/Development Routes | 95 |
| **TOTAL** | **276 routes** |

---

## ⚠️ **ISSUES IDENTIFIED**

### 1. **Missing Route Implementations**
The following routes are defined in `all_routes.tsx` but **NOT** implemented in `router.link.tsx`:
- `successCover`, `successIllustration`, `successBasic`
- `doctordetails` (doctor route)
- `doctorspatientdetails` (doctor route)
- `patientdetails` (patient route)
- All 7 Super Admin routes
- `blogDetails`, `blogTags`
- `EmailReply`, `audioCall`
- `underConstruction`, `apiKeys`, `termsCondition`

### 2. **Route Organization Issues**
- No role-based route protection
- All routes are in `publicRoutes` array (should be protected)
- No route guards or authentication checks
- Duplicate route definitions (e.g., `uiDraggble` and `dragula` point to same path)

### 3. **Modularity Issues**
- All routes in single large file (1509 lines)
- No separation by role/feature
- Hard to maintain and scale

---

## ✅ **RECOMMENDATIONS**

1. **Create Role-Based Route Groups**
   - Separate routes by role (Admin, Doctor, Patient, Super Admin)
   - Implement route guards/authentication middleware

2. **Implement Missing Routes**
   - Create components for missing routes or remove from definitions

3. **Modular Route Structure**
   - Split `router.link.tsx` into separate files:
     - `admin.routes.tsx`
     - `doctor.routes.tsx`
     - `patient.routes.tsx`
     - `superAdmin.routes.tsx`
     - `auth.routes.tsx`
     - `shared.routes.tsx`

4. **Add Route Protection**
   - Implement `ProtectedRoute` component
   - Add role-based access control
   - Redirect unauthorized users

5. **Remove Development Routes**
   - Consider removing or restricting UI component routes in production

---

**Generated:** $(date)
**Last Updated:** Analysis of current codebase structure

