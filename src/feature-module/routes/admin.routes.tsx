import type { RouteObject } from "react-router";
import { lazyPage } from "./lazyPage";
import { all_routes } from "./all_routes";

const routes = all_routes;

const Activities = lazyPage(() => import("../components/pages/clinic-modules/activities/activities"));
const AddDoctor = lazyPage(() => import("../components/pages/clinic-modules/add-doctor/addDoctor"));
const AddInoivce = lazyPage(() => import("../components/pages/application-modules/application/invoice/add-invoice/addInoivce"));
const AddInvoices = lazyPage(() => import("../components/pages/finance-accounts-module/invoices/addInvoices"));
const AppointmentCalendar = lazyPage(() => import("../components/pages/clinic-modules/appointment-calendar/appointmentCalendar"));
const AppointmentConsultations = lazyPage(() => import("../components/pages/clinic-modules/appointment-consultations/appointmentConsultations"));
const AppointmentReport = lazyPage(() => import("../components/pages/administration-modules/reports/appointment-report/appointmentReport"));
const AppointmentSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/appointment-settings/appointmentSettings"));
const Appointments = lazyPage(() => import("../components/pages/clinic-modules/appointments/appointments"));
const Assets = lazyPage(() => import("../components/pages/clinic-modules/assets/assets"));
const AttendanceList = lazyPage(() => import("../components/pages/hrm-modules/attendance"));
const BanIpAddressSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/ban-ip-address-settings/banIpAddressSettings"));
const BankAccountsSettings = lazyPage(() => import("../components/pages/settings-modules/finance-settings/bank-accounts-settings/bankAccountsSettings"));
const CancellationReasonSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/cancellation-reason-settings/cancellationReasonSettings"));
const ClearCacheSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/clear-cache-settings/clearCacheSettings"));
const CreatePatient = lazyPage(() => import("../components/pages/clinic-modules/create-patient/createPatient"));
const CronjobSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/cronjob-settings/cronjobSettings"));
const CurrenciesSettings = lazyPage(() => import("../components/pages/settings-modules/finance-settings/currencies-settings/currenciesSettings"));
const CustomFieldsSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/custom-fields-settings/customFieldsSettings"));
const Dashboard = lazyPage(() => import("../components/pages/dashboard/dashboard"));
const DatabaseBackupSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/database-backup-settings/databaseBackupSettings"));
const DesignationList = lazyPage(() => import("../components/pages/hrm-modules/designation"));
const DoctorDetails = lazyPage(() => import("../components/pages/clinic-modules/doctor-details/doctorDetails"));
const DoctorSchedules = lazyPage(() => import("../components/pages/doctor-modules/doctors-schedules/doctorSchedules"));
const Doctors = lazyPage(() => import("../components/pages/clinic-modules/doctors/doctors"));
const DoctorsList = lazyPage(() => import("../components/pages/clinic-modules/doctors-list/doctorsList"));
const EditDoctor = lazyPage(() => import("../components/pages/clinic-modules/edit-doctor/editDoctor"));
const EditInvoices = lazyPage(() => import("../components/pages/finance-accounts-module/invoices/editInvoices"));
const EditPatient = lazyPage(() => import("../components/pages/clinic-modules/edit-patient/editPatient"));
const EmailSettings = lazyPage(() => import("../components/pages/settings-modules/system-settings/email-settings/emailSettings"));
const EmailTemplatesSettings = lazyPage(() => import("../components/pages/settings-modules/system-settings/email-templates-settings/emailTemplatesSettings"));
const ExpenseCategory = lazyPage(() => import("../components/pages/finance-accounts-module/expenses/expenseCategory"));
const ExpenseReport = lazyPage(() => import("../components/pages/administration-modules/reports/expense-report/expenseReport"));
const ExpensesList = lazyPage(() => import("../components/pages/finance-accounts-module/expenses/expenses"));
const Gallery = lazyPage(() => import("../components/pages/pages-module/gallery"));
const GdprCookiesSettings = lazyPage(() => import("../components/pages/settings-modules/system-settings/gdpr-cookies-settings/gdprCookiesSettings"));
const HolidaysList = lazyPage(() => import("../components/pages/hrm-modules/holidays"));
const HrmDepartments = lazyPage(() => import("../components/pages/hrm-modules/hrmDepartments"));
const IncomeList = lazyPage(() => import("../components/pages/finance-accounts-module/income"));
const IncomeReport = lazyPage(() => import("../components/pages/administration-modules/reports/income-report/incomeReport"));
const IntegrationsSettings = lazyPage(() => import("../components/pages/settings-modules/account-settings/integrations-settings/integrationsSettings"));
const InvoiceSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/invoice-settings/invoiceSettings"));
const InvoiceTemplatesSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/invoice-templates-settings/invoiceTemplatesSettings"));
const InvoicesDetails = lazyPage(() => import("../components/pages/finance-accounts-module/invoices/invoicesDetails"));
const InvoicesList = lazyPage(() => import("../components/pages/finance-accounts-module/invoices/invoices"));
const LanguageSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/language-settings/languageSettings"));
const LanguageSettings2 = lazyPage(() => import("../components/pages/settings-modules/website-settings/language-settings2/languageSettings2"));
const LanguageSettings3 = lazyPage(() => import("../components/pages/settings-modules/website-settings/language-settings3/languageSettings3"));
const LeaveType = lazyPage(() => import("../components/pages/hrm-modules/leaves/leaveType"));
const LeavesList = lazyPage(() => import("../components/pages/hrm-modules/leaves/leavesList"));
const LocalizationSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/localization-settings/localizationSettings"));
const Locations = lazyPage(() => import("../components/pages/clinic-modules/locations/locations"));
const LoginAndRegisterSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/login-and-register-settings/loginAndRegisterSettings"));
const MaintenanceModeSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/maintenance-mode-settings/maintenanceModeSettings"));
const Messages = lazyPage(() => import("../components/pages/clinic-modules/messages/messages"));
const NewAppointment = lazyPage(() => import("../components/pages/clinic-modules/new-appointment/newAppointment"));
const Notifications = lazyPage(() => import("../components/pages/application-modules/application/notifications/notifications"));
const NotificationsSettings = lazyPage(() => import("../components/pages/settings-modules/account-settings/notifications-settings/notificationsSettings"));
const OrganizationSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/organization-settings/organizationSettings"));
const PatientDetails = lazyPage(() => import("../components/pages/clinic-modules/patient-details/patientDetails"));
const PatientReport = lazyPage(() => import("../components/pages/administration-modules/reports/patient-report/patientReport"));
const Patients = lazyPage(() => import("../components/pages/clinic-modules/patients/patients"));
const PatientsGrid = lazyPage(() => import("../components/pages/clinic-modules/patients-grid/patientsGrid"));
const PaymentMethodsSettings = lazyPage(() => import("../components/pages/settings-modules/finance-settings/payment-methods-settings/paymentMethodsSettings"));
const PaymentsList = lazyPage(() => import("../components/pages/finance-accounts-module/payments"));
const PayrollList = lazyPage(() => import("../components/pages/hrm-modules/payroll"));
const PayrollTwo = lazyPage(() => import("../components/pages/hrm-modules/payrollTwo"));
const PreferencesSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/preferences-settings/preferencesSettings"));
const PrefixesSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/prefixes-settings/prefixesSettings"));
const Pricing = lazyPage(() => import("../components/pages/pages-modules/pricing/pricing"));
const PrivacyPolicy = lazyPage(() => import("../components/pages/pages-modules/privacy-policy/privacyPolicy"));
const Profile = lazyPage(() => import("../components/pages/pages-module/profile"));
const ProfileSettings = lazyPage(() => import("../components/pages/settings-modules/account-settings/profile-settings/profileSettings"));
const ProfitAndLoss = lazyPage(() => import("../components/pages/administration-modules/reports/profit-and-loss/profitAndLoss"));
const SecuritySettings = lazyPage(() => import("../components/pages/settings-modules/account-settings/security-settings/securitySettings"));
const SeoSetupSettings = lazyPage(() => import("../components/pages/settings-modules/website-settings/seo-setup-settings/seoSetupSettings"));
const Services = lazyPage(() => import("../components/pages/clinic-modules/services/services"));
const SignaturesSettings = lazyPage(() => import("../components/pages/settings-modules/app-settings/signaturesSettings"));
const SitemapSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/sitemap-settings/sitemapSettings"));
const SmsGatewaysSettings = lazyPage(() => import("../components/pages/settings-modules/system-settings/sms-gateways-settings/smsGatewaysSettings"));
const SmsTemplatesSettings = lazyPage(() => import("../components/pages/settings-modules/system-settings/sms-templates-settings/smsTemplatesSettings"));
const Specializations = lazyPage(() => import("../components/pages/clinic-modules/specializations/specializations"));
const StaffsList = lazyPage(() => import("../components/pages/hrm-modules/staffs"));
const Starter = lazyPage(() => import("../components/pages/pages-module/starter"));
const StorageSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/storage-settings/storageSettings"));
const SystemBackupSettings = lazyPage(() => import("../components/pages/settings-modules/other-settings/system-backup-settings/systemBackupSettings"));
const SystemUpdate = lazyPage(() => import("../components/pages/settings-modules/other-settings/system-update/systemUpdate"));
const TaxRatesSettings = lazyPage(() => import("../components/pages/settings-modules/finance-settings/tax-rates-settings/taxRatesSettings"));
const Timeline = lazyPage(() => import("../components/pages/pages-module/timeline"));
const TransactionsList = lazyPage(() => import("../components/pages/finance-accounts-module/transactions"));
const WorkingHoursSettings = lazyPage(() => import("../components/pages/settings-modules/clinic-settings/working-hours-settings/workingHoursSettings"));

export const adminRoutes: RouteObject[] = [
  {
    path: routes.dashboard,
    element: <Dashboard />,
  },
  {
    path: routes.layoutDefault,
    element: <Dashboard />,
  },
  {
    path: routes.layoutMini,
    element: <Dashboard />,
  },
  {
    path: routes.layoutHoverView,
    element: <Dashboard />,
  },
  {
    path: routes.layoutHidden,
    element: <Dashboard />,
  },
  {
    path: routes.layoutFullWidth,
    element: <Dashboard />,
  },
  {
    path: routes.layoutRTL,
    element: <Dashboard />,
  },
  {
    path: routes.layoutDark,
    element: <Dashboard />,
  },
  {
    path: routes.doctors,
    element: <Doctors />,
  },
  {
    path: routes.doctorsList,
    element: <DoctorsList />,
  },
  {
    path: routes.editDoctors,
    element: <EditDoctor />,
  },
  {
    path: routes.addDoctors,
    element: <AddDoctor />,
  },
  {
    path: routes.doctorsDetails,
    element: <DoctorDetails />,
  },
  {
    path: routes.patients,
    element: <Patients />,
  },
  {
    path: routes.patientsGrid,
    element: <PatientsGrid />,
  },
  {
    path: routes.createPatient,
    element: <CreatePatient />,
  },
  {
    path: routes.editPatient,
    element: <EditPatient />,
  },
  {
    path: routes.patientDetails,
    element: <PatientDetails />,
  },
  {
    path: routes.profilesettings,
    element: <ProfileSettings />,
  },
  {
    path: routes.securitysettings,
    element: <SecuritySettings />,
  },
  {
    path: routes.notificationssettings,
    element: <NotificationsSettings />,
  },
  {
    path: routes.integrationssettings,
    element: <IntegrationsSettings />,
  },
  {
    path: routes.organizationsettings,
    element: <OrganizationSettings />,
  },
  {
    path: routes.localizationsettings,
    element: <LocalizationSettings />,
  },
  {
    path: routes.prefixessettings,
    element: <PrefixesSettings />,
  },
  {
    path: routes.seosetupsettings,
    element: <SeoSetupSettings />,
  },
  {
    path: routes.languagesettings,
    element: <LanguageSettings />,
  },
  {
    path: routes.languagesettings2,
    element: <LanguageSettings2 />,
  },
  {
    path: routes.languagesettings3,
    element: <LanguageSettings3 />,
  },
  {
    path: routes.maintenancemodesettings,
    element: <MaintenanceModeSettings />,
  },
  {
    path: routes.loginandregistersettings,
    element: <LoginAndRegisterSettings />,
  },
  {
    path: routes.preferencessettings,
    element: <PreferencesSettings />,
  },
  {
    path: routes.appointmentsettings,
    element: <AppointmentSettings />,
  },
  {
    path: routes.workinghourssettings,
    element: <WorkingHoursSettings />,
  },
  {
    path: routes.cancellationreasonsettings,
    element: <CancellationReasonSettings />,
  },
  {
    path: routes.invoicesettings,
    element: <InvoiceSettings />,
  },
  {
    path: routes.invoicetemplatessettings,
    element: <InvoiceTemplatesSettings />,
  },
  {
    path: routes.emailsettings,
    element: <EmailSettings />,
  },
  {
    path: routes.emailtemplatessettings,
    element: <EmailTemplatesSettings />,
  },
  {
    path: routes.smsgatewayssettings,
    element: <SmsGatewaysSettings />,
  },
  {
    path: routes.smstemplatessettings,
    element: <SmsTemplatesSettings />,
  },
  {
    path: routes.gdprcookiessettings,
    element: <GdprCookiesSettings />,
  },
  {
    path: routes.paymentmethodssettings,
    element: <PaymentMethodsSettings />,
  },
  {
    path: routes.bankaccountssettings,
    element: <BankAccountsSettings />,
  },
  {
    path: routes.taxratessettings,
    element: <TaxRatesSettings />,
  },
  {
    path: routes.currenciessettings,
    element: <CurrenciesSettings />,
  },
  {
    path: routes.sitemapsettings,
    element: <SitemapSettings />,
  },
  {
    path: routes.clearcachesettings,
    element: <ClearCacheSettings />,
  },
  {
    path: routes.storagesettings,
    element: <StorageSettings />,
  },
  {
    path: routes.cronjobsettings,
    element: <CronjobSettings />,
  },
  {
    path: routes.systembackupsettings,
    element: <SystemBackupSettings />,
  },
  {
    path: routes.databasebackupsettings,
    element: <DatabaseBackupSettings />,
  },
  {
    path: routes.systemupdate,
    element: <SystemUpdate />,
  },
  {
    path: routes.incomeReport,
    element: <IncomeReport />,
  },
  {
    path: routes.expenseReport,
    element: <ExpenseReport />,
  },
  {
    path: routes.profitloss,
    element: <ProfitAndLoss />,
  },
  {
    path: routes.appointmentReport,
    element: <AppointmentReport />,
  },
  {
    path: routes.patientReport,
    element: <PatientReport />,
  },
  {
    path: routes.doctorScheduleClini,
    element: <DoctorSchedules />,
  },
  {
    path: routes.starter,
    element: <Starter />,
  },
  {
    path: routes.profile,
    element: <Profile />,
  },
  {
    path: routes.timeline,
    element: <Timeline />,
  },
  {
    path: routes.gallery,
    element: <Gallery />,
  },
  {
    path: routes.staffs,
    element: <StaffsList />,
  },
  {
    path: routes.hrmDepartments,
    element: <HrmDepartments />,
  },
  {
    path: routes.designation,
    element: <DesignationList />,
  },
  {
    path: routes.attendance,
    element: <AttendanceList />,
  },
  {
    path: routes.leaves,
    element: <LeavesList />,
  },
  {
    path: routes.leaves,
    element: <LeavesList />,
  },
  {
    path: routes.leaveType,
    element: <LeaveType />,
  },
  {
    path: routes.holidays,
    element: <HolidaysList />,
  },
  {
    path: routes.payroll,
    element: <PayrollList />,
  },
  {
    path: routes.payroll2,
    element: <PayrollTwo />,
  },
  {
    path: routes.expenses,
    element: <ExpensesList />,
  },
  {
    path: routes.expenseCategory,
    element: <ExpenseCategory />,
  },
  {
    path: routes.income,
    element: <IncomeList />,
  },
  {
    path: routes.invoices,
    element: <InvoicesList />,
  },
  {
    path: routes.invoicesDetails,
    element: <InvoicesDetails />,
  },
  {
    path: routes.addInvoices,
    element: <AddInvoices />,
  },
  {
    path: routes.editInvoices,
    element: <EditInvoices />,
  },
  {
    path: routes.payments,
    element: <PaymentsList />,
  },
  {
    path: routes.transactions,
    element: <TransactionsList />,
  },
  {
    path: routes.pricing,
    element: <Pricing />,
  },
  {
    path: routes.appointments,
    element: <Appointments />,
  },
  {
    path: routes.newAppointment,
    element: <NewAppointment />,
  },
  {
    path: routes.appointmentCalendar,
    element: <AppointmentCalendar />,
  },
  {
    path: routes.locations,
    element: <Locations />,
  },
  {
    path: routes.services,
    element: <Services />,
  },
  {
    path: routes.specializations,
    element: <Specializations />,
  },
  {
    path: routes.assets,
    element: <Assets />,
  },
  {
    path: routes.activities,
    element: <Activities />,
  },
  {
    path: routes.messages,
    element: <Messages />,
  },
  {
    path: routes.addInvoice,
    element: <AddInoivce />,
  },
  {
    path: routes.editInvoice,
    element: <EditInvoices />,
  },
  {
    path: routes.notifications,
    element: <Notifications />,
  },
  {
    path: routes.appointmentconsultations,
    element: <AppointmentConsultations />,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
  },
  {
    path: routes.signaturessettings,
    element: <SignaturesSettings />,
  },
  {
    path: routes.customfieldssettings,
    element: <CustomFieldsSettings />,
  },
  {
    path: routes.banipaddresssettings,
    element: <BanIpAddressSettings />,
  },
];
