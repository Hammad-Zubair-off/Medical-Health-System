export const all_routes = {
  //Auth routes
  login: "/login",
  loginbasic: "/login-basic",
  registerbasic: "/register-basic",
  forgotpasswordbasic: "/forgot-password-basic",
  resetpasswordbasic: "/reset-password-basic",
  emailverificationbasic: "/email-verification-basic",
  twostepverificationbasic: "/two-step-verification-basic",
  lockscreen: "/lock-screen",
  error403: "/error-403",
  error404: "/error-404",
  error500: "/error-500",
  successBasic: "/success-basic",

  //Dashboard routes
  dashboard: "/dashboard",
  doctordashboard: "/doctor/doctor-dashboard",
  patientdashboard: "/patient/patient-dashboard",

  //Patient
  patientdetails: "/patient/patient-details",
  patientappointments: "/patient/patient-appointments",
  patientappointmentdetails: "/patient/patient-appointment-details/:id",
  patientdoctors: "/patient/patient-doctors",
  patientPrescriptions: "/patient/patient-prescriptions",
  patientinvoices: "/patient/patient-invoices",
  patientprofilesettings: "/patient/patient-profile-settings",
  patientpasswordsettings: "/patient/patient-password-settings",
  patientnotificationssettings: "/patient/patient-notifications-settings",
  patientprescriptiondetails: "/patient/patient-prescription-details/:id",
  patientinvoicedetails: "/patient/patient-invoice-details/:id",

  //Doctor
  doctorschedule: "/doctor/doctor-schedule",
  doctordetails: "/doctor/doctor-details",
  doctorreviews: "/doctor/doctors-reviews",
  doctorleaves: "/doctor/doctors-leaves",
  doctorsprofilesettings: "/doctor/doctors-profile-settings",
  doctorspasswordsettings: "/doctor/doctors-password-settings",
  doctorsnotificationsettings: "/doctor/doctors-notification-settings",
  doctorsprescriptions: "/doctor/doctors-prescriptions",
  addPrescription: "/doctor/add-prescription",
  editPrescription: "/doctor/edit-prescription/:id",
  onlineconsultations: "/doctor/online-consultations",
  doctorsappointments: "/doctor/doctors-appointments",
  doctorspatientdetails: "/doctor/doctors-patient-details",
  doctorsappointmentdetails: "/doctor/doctors-appointment-details/:id",
  doctorsprescriptiondetails: "/doctor/doctors-prescription-details/:id",

  //Application routes
  chat: "/application/chat",
  calendar: "/application/calendar",
  notes: "/application/notes",
  voiceCall: "/application/voice-call",
  videoCall: "/application/video-call",
  outgoingCall: "/application/outgoing-call",
  incomingCall: "/application/incoming-call",
  callHistory: "/application/call-history",
  todo: "/application/todo",
  todoList: "/application/todo-list",
  email: "/application/email",
  EmailReply: "/application/email-reply",
  audioCall: "/application/audio-call",
  fileManager: "/application/file-manager",
  fileManagerFolder: "/application/file-manager/folder/:folderId",
  socialFeed: "/application/social-feed",
  kanbanView: "/application/kanban-view",
  invoice: "/application/invoice",
  contacts: "/application/contacts",
  searchList: "/application/search-list",
  invoiceDetails: "/application/invoice-details/:id",
  addInvoice: "/add-invoice",
  editInvoice: "/edit-invoice/:id",
  notifications: "/notifications",

  //Layout Routes
  layoutDefault: "/layout-default",
  layoutMini: "/layout-mini",
  layoutHoverView: "/layout-hover-view",
  layoutHidden: "/layout-hidden",
  layoutFullWidth: "/layout-full-width",
  layoutDark: "/layout-dark",
  layoutRTL: "/layout-rtl",

  //Clinic Pages
  doctors: "/doctors",
  doctorsList: "/doctors-list",
  doctorsDetails: "/doctor-details/:id",
  addDoctors: "/add-doctor",
  editDoctors: "/edit-doctors/:id",
  doctorScheduleClini: "/doctor-schedule",
  patients: "/patients",
  patientsGrid: "/patients-grid",
  editPatient: "/edit-patient/:id",
  patientDetails: "/patient-details/:id",
  createPatient: "/create-patient",
  appointments: "/appointments",
  newAppointment: "/new-appointment",
  appointmentCalendar: "/appointment-calendar",
  locations: "/locations",
  services: "/services",
  specializations: "/specializations",
  assets: "/clinic-assets",
  activities: "/activities",
  messages: "/messages",
  appointmentconsultations: "/appointment-consultations/:id",

  //HRM Pages
  staffs: "/staffs",
  staffDetails: "/staff-details/:id",
  editStaff: "/edit-staff/:id",
  hrmDepartments: "/hrm-departments",
  designation: "/designation",
  attendance: "/attendance",
  leaves: "/leaves",
  leaveDetails: "/leave-details/:id",
  leaveType: "/leave-type",
  holidays: "/holidays",
  payroll: "/payroll",
  payroll2: "/payroll-2",
  payrollDetails: "/payroll-details/:id",

  //Finance & Accounts
  expenses: "/expenses",
  expenseCategory: "/expense-category",
  income: "/income",
  invoices: "/invoices",
  invoicesDetails: "/invoices-details/:id",
  addInvoices: "/add-invoices",
  editInvoices: "/edit-invoices/:id",
  payments: "/payments",
  transactions: "/transactions",

  //Administration
  incomeReport: "/income-report",
  expenseReport: "/expense-report",
  profitloss: "/profit-and-loss",
  appointmentReport: "/appointment-report",
  patientReport: "/patient-report",

  //Pages routes
  profile: "/profile",
  starter: "/starter",
  gallery: "/gallery",
  pricing: "/pricing",
  timeline: "/timeline",
  comingSoon: "/coming-soon",
  underMaintenance: "/under-maintenance",
  underConstruction: "/under-construction",
  apiKeys: "/api-keys",
  privacyPolicy: "/privacy-policy",
  termsCondition: "/terms-condition",

  //Settings
  profilesettings: "/profile-settings",
  securitysettings: "/security-settings",
  notificationssettings: "/notifications-settings",
  integrationssettings: "/integrations-settings",
  organizationsettings: "/organization-settings",
  localizationsettings: "/localization-settings",
  prefixessettings: "/prefixes-settings",
  seosetupsettings: "/seo-setup-settings",
  languagesettings: "/language-settings",
  languagesettings2: "/language-settings2",
  languagesettings3: "/language-settings3",
  maintenancemodesettings: "/maintenance-mode-settings",
  loginandregistersettings: "/login-and-register-settings",
  preferencessettings: "/preferences-settings",
  appointmentsettings: "/appointment-settings",
  workinghourssettings: "/working-hours-settings",
  cancellationreasonsettings: "/cancellation-reason-settings",
  invoicesettings: "/invoice-settings",
  invoicetemplatessettings: "/invoice-templates-settings",
  signaturessettings: "/signatures-settings",
  customfieldssettings: "/custom-fields-settings",
  emailsettings: "/email-settings",
  emailtemplatessettings: "/email-templates-settings",
  smsgatewayssettings: "/sms-gateways-settings",
  smstemplatessettings: "/sms-templates-settings",
  gdprcookiessettings: "/gdpr-cookies-settings",
  paymentmethodssettings: "/payment-methods-settings",
  bankaccountssettings: "/bank-accounts-settings",
  taxratessettings: "/tax-rates-settings",
  currenciessettings: "/currencies-settings",
  sitemapsettings: "/sitemap-settings",
  clearcachesettings: "/clear-cache-settings",
  storagesettings: "/storage-settings",
  cronjobsettings: "/cronjob-settings",
  banipaddresssettings: "/ban-ip-address-settings",
  systembackupsettings: "/system-backup-settings",
  databasebackupsettings: "/database-backup-settings",
  systemupdate: "/system-update",
};

export function patientDetailsPath(id: string): string {
  return `/patient-details/${id}`;
}

export function editPatientPath(id: string): string {
  return `/edit-patient/${id}`;
}

export function doctorsDetailsPath(id: string): string {
  return `/doctor-details/${id}`;
}

export function editDoctorsPath(id: string): string {
  return `/edit-doctors/${id}`;
}

export function appointmentConsultationsPath(id: string): string {
  return `/appointment-consultations/${id}`;
}

export function doctorsAppointmentDetailsPath(id: string): string {
  return `/doctor/doctors-appointment-details/${id}`;
}

export function patientAppointmentDetailsPath(id: string): string {
  return `/patient/patient-appointment-details/${id}`;
}

export function doctorsPrescriptionDetailsPath(id: string): string {
  return `/doctor/doctors-prescription-details/${id}`;
}

export function patientPrescriptionDetailsPath(id: string): string {
  return `/patient/patient-prescription-details/${id}`;
}

export function editPrescriptionPath(id: string): string {
  return `/doctor/edit-prescription/${id}`;
}

export function staffDetailsPath(id: string): string {
  return `/staff-details/${id}`;
}

export function editStaffPath(id: string): string {
  return `/edit-staff/${id}`;
}

export function payrollDetailsPath(id: string): string {
  return `/payroll-details/${id}`;
}

export function leaveDetailsPath(id: string): string {
  return `/leave-details/${id}`;
}

export function fileManagerFolderPath(id: string): string {
  return `/application/file-manager/folder/${id}`;
}

export function invoiceDetailsPath(id: string): string {
  return `/application/invoice-details/${id}`;
}

export function patientInvoiceDetailsPath(id: string): string {
  return `/patient/patient-invoice-details/${id}`;
}

export function invoicesDetailsPath(id: string): string {
  return `/invoices-details/${id}`;
}

export function editInvoicePath(id: string): string {
  return `/edit-invoice/${id}`;
}

export function editInvoicesPath(id: string): string {
  return `/edit-invoices/${id}`;
}
