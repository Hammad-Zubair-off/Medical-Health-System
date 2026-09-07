import type { RouteObject } from "react-router";
import Activities from "../components/pages/clinic-modules/activities/activities";
import AddBlog from "../components/pages/content-modules/add-blog/addBlog";
import AddDoctor from "../components/pages/clinic-modules/add-doctor/addDoctor";
import AddInoivce from "../components/pages/application-modules/application/invoice/add-invoice/addInoivce";
import AddInvoices from "../components/pages/finance-accounts-module/invoices/addInvoices";
import AddPages from "../components/pages/content-modules/add-page/addPages";
import AnnouncementsList from "../components/pages/support-modules/announcements";
import AppointmentCalendar from "../components/pages/clinic-modules/appointment-calendar/appointmentCalendar";
import AppointmentConsultations from "../components/pages/clinic-modules/appointment-consultations/appointmentConsultations";
import AppointmentReport from "../components/pages/administration-modules/reports/appointment-report/appointmentReport";
import AppointmentSettings from "../components/pages/settings-modules/clinic-settings/appointment-settings/appointmentSettings";
import Appointments from "../components/pages/clinic-modules/appointments/appointments";
import Assets from "../components/pages/clinic-modules/assets/assets";
import AttendanceList from "../components/pages/hrm-modules/attendance";
import BanIpAddressSettings from "../components/pages/settings-modules/other-settings/ban-ip-address-settings/banIpAddressSettings";
import BankAccountsSettings from "../components/pages/settings-modules/finance-settings/bank-accounts-settings/bankAccountsSettings";
import BlogCategories from "../components/pages/content-modules/blog-categories/blogCategories";
import BlogComments from "../components/pages/content-modules/blog-comments/blogComments";
import Blogs from "../components/pages/content-modules/blogs/blogs";
import CancellationReasonSettings from "../components/pages/settings-modules/clinic-settings/cancellation-reason-settings/cancellationReasonSettings";
import Cities from "../components/pages/content-modules/cities/cities";
import ClearCacheSettings from "../components/pages/settings-modules/other-settings/clear-cache-settings/clearCacheSettings";
import ContactMessages from "../components/pages/support-modules/contactMessages";
import Countries from "../components/pages/content-modules/countries/countries";
import CreatePatient from "../components/pages/clinic-modules/create-patient/createPatient";
import CronjobSettings from "../components/pages/settings-modules/other-settings/cronjob-settings/cronjobSettings";
import CurrenciesSettings from "../components/pages/settings-modules/finance-settings/currencies-settings/currenciesSettings";
import CustomFieldsSettings from "../components/pages/settings-modules/clinic-settings/custom-fields-settings/customFieldsSettings";
import Dashboard from "../components/pages/dashboard/dashboard";
import DatabaseBackupSettings from "../components/pages/settings-modules/other-settings/database-backup-settings/databaseBackupSettings";
import DeleteAccountRequest from "../components/pages/administration-modules/users/delete-account-request/deleteAccountRequest";
import DesignationList from "../components/pages/hrm-modules/designation";
import DoctorDetails from "../components/pages/clinic-modules/doctor-details/doctorDetails";
import DoctorSchedules from "../components/pages/doctor-modules/doctors-schedules/doctorSchedules";
import Doctors from "../components/pages/clinic-modules/doctors/doctors";
import DoctorsList from "../components/pages/clinic-modules/doctors-list/doctorsList";
import EditBlog from "../components/pages/content-modules/edit-blog/editBlog";
import EditDoctor from "../components/pages/clinic-modules/edit-doctor/editDoctor";
import EditInvoices from "../components/pages/finance-accounts-module/invoices/editInvoices";
import EditPage from "../components/pages/content-modules/edit-page/editPage";
import EditPatient from "../components/pages/clinic-modules/edit-patient/editPatient";
import EmailSettings from "../components/pages/settings-modules/system-settings/email-settings/emailSettings";
import EmailTemplatesSettings from "../components/pages/settings-modules/system-settings/email-templates-settings/emailTemplatesSettings";
import ExpenseCategory from "../components/pages/finance-accounts-module/expenses/expenseCategory";
import ExpenseReport from "../components/pages/administration-modules/reports/expense-report/expenseReport";
import ExpensesList from "../components/pages/finance-accounts-module/expenses/expenses";
import Faq from "../components/pages/content-modules/faq/faq";
import Gallery from "../components/pages/pages-module/gallery";
import GdprCookiesSettings from "../components/pages/settings-modules/system-settings/gdpr-cookies-settings/gdprCookiesSettings";
import HolidaysList from "../components/pages/hrm-modules/holidays";
import HrmDepartments from "../components/pages/hrm-modules/hrmDepartments";
import IncomeList from "../components/pages/finance-accounts-module/income";
import IncomeReport from "../components/pages/administration-modules/reports/income-report/incomeReport";
import IntegrationsSettings from "../components/pages/settings-modules/account-settings/integrations-settings/integrationsSettings";
import InvoiceSettings from "../components/pages/settings-modules/clinic-settings/invoice-settings/invoiceSettings";
import InvoiceTemplatesSettings from "../components/pages/settings-modules/clinic-settings/invoice-templates-settings/invoiceTemplatesSettings";
import InvoicesDetails from "../components/pages/finance-accounts-module/invoices/invoicesDetails";
import InvoicesList from "../components/pages/finance-accounts-module/invoices/invoices";
import LanguageSettings from "../components/pages/settings-modules/website-settings/language-settings/languageSettings";
import LanguageSettings2 from "../components/pages/settings-modules/website-settings/language-settings2/languageSettings2";
import LanguageSettings3 from "../components/pages/settings-modules/website-settings/language-settings3/languageSettings3";
import LeaveType from "../components/pages/hrm-modules/leaves/leaveType";
import LeavesList from "../components/pages/hrm-modules/leaves/leavesList";
import LocalizationSettings from "../components/pages/settings-modules/website-settings/localization-settings/localizationSettings";
import Locations from "../components/pages/clinic-modules/locations/locations";
import LoginAndRegisterSettings from "../components/pages/settings-modules/website-settings/login-and-register-settings/loginAndRegisterSettings";
import MaintenanceModeSettings from "../components/pages/settings-modules/website-settings/maintenance-mode-settings/maintenanceModeSettings";
import Messages from "../components/pages/clinic-modules/messages/messages";
import NewAppointment from "../components/pages/clinic-modules/new-appointment/newAppointment";
import Newsletters from "../components/pages/support-modules/newsletters";
import Notifications from "../components/pages/application-modules/application/notifications/notifications";
import NotificationsSettings from "../components/pages/settings-modules/account-settings/notifications-settings/notificationsSettings";
import OrganizationSettings from "../components/pages/settings-modules/website-settings/organization-settings/organizationSettings";
import Pages from "../components/pages/content-modules/page/pages";
import PatientDetails from "../components/pages/clinic-modules/patient-details/patientDetails";
import PatientReport from "../components/pages/administration-modules/reports/patient-report/patientReport";
import Patients from "../components/pages/clinic-modules/patients/patients";
import PatientsGrid from "../components/pages/clinic-modules/patients-grid/patientsGrid";
import PaymentMethodsSettings from "../components/pages/settings-modules/finance-settings/payment-methods-settings/paymentMethodsSettings";
import PaymentsList from "../components/pages/finance-accounts-module/payments";
import PayrollList from "../components/pages/hrm-modules/payroll";
import PayrollTwo from "../components/pages/hrm-modules/payrollTwo";
import Permissions from "../components/pages/administration-modules/users/permissions/permissions";
import PreferencesSettings from "../components/pages/settings-modules/website-settings/preferences-settings/preferencesSettings";
import PrefixesSettings from "../components/pages/settings-modules/website-settings/prefixes-settings/prefixesSettings";
import Pricing from "../components/pages/pages-modules/pricing/pricing";
import PrivacyPolicy from "../components/pages/pages-modules/privacy-policy/privacyPolicy";
import Profile from "../components/pages/pages-module/profile";
import ProfileSettings from "../components/pages/settings-modules/account-settings/profile-settings/profileSettings";
import ProfitAndLoss from "../components/pages/administration-modules/reports/profit-and-loss/profitAndLoss";
import RolesAndPermissions from "../components/pages/administration-modules/users/roles-and-permissions/rolesAndPermissions";
import SecuritySettings from "../components/pages/settings-modules/account-settings/security-settings/securitySettings";
import SeoSetupSettings from "../components/pages/settings-modules/website-settings/seo-setup-settings/seoSetupSettings";
import Services from "../components/pages/clinic-modules/services/services";
import SignaturesSettings from "../components/pages/settings-modules/app-settings/signaturesSettings";
import SitemapSettings from "../components/pages/settings-modules/other-settings/sitemap-settings/sitemapSettings";
import SmsGatewaysSettings from "../components/pages/settings-modules/system-settings/sms-gateways-settings/smsGatewaysSettings";
import SmsTemplatesSettings from "../components/pages/settings-modules/system-settings/sms-templates-settings/smsTemplatesSettings";
import Specializations from "../components/pages/clinic-modules/specializations/specializations";
import StaffsList from "../components/pages/hrm-modules/staffs";
import Starter from "../components/pages/pages-module/starter";
import States from "../components/pages/content-modules/states/states";
import StorageSettings from "../components/pages/settings-modules/other-settings/storage-settings/storageSettings";
import SystemBackupSettings from "../components/pages/settings-modules/other-settings/system-backup-settings/systemBackupSettings";
import SystemUpdate from "../components/pages/settings-modules/other-settings/system-update/systemUpdate";
import TaxRatesSettings from "../components/pages/settings-modules/finance-settings/tax-rates-settings/taxRatesSettings";
import Testimonials from "../components/pages/content-modules/testimonials/testimonials";
import TicketDetails from "../components/pages/support-modules/ticketDetails";
import TicketsList from "../components/pages/support-modules/tickets";
import Timeline from "../components/pages/pages-module/timeline";
import TransactionsList from "../components/pages/finance-accounts-module/transactions";
import WorkingHoursSettings from "../components/pages/settings-modules/clinic-settings/working-hours-settings/workingHoursSettings";
import { all_routes } from "./all_routes";

const routes = all_routes;

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
    path: routes.rolesPermissions,
    element: <RolesAndPermissions />,
  },
  {
    path: routes.permissions,
    element: <Permissions />,
  },
  {
    path: routes.deleteaccountrequest,
    element: <DeleteAccountRequest />,
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
    path: routes.contactMessages,
    element: <ContactMessages />,
  },
  {
    path: routes.tickets,
    element: <TicketsList />,
  },
  {
    path: routes.ticketDetails,
    element: <TicketDetails />,
  },
  {
    path: routes.announcements,
    element: <AnnouncementsList />,
  },
  {
    path: routes.newsletters,
    element: <Newsletters />,
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
    path: routes.pages,
    element: <Pages />,
  },
  {
    path: routes.addPage,
    element: <AddPages />,
  },
  {
    path: routes.editPage,
    element: <EditPage />,
  },
  {
    path: routes.addBlogs,
    element: <AddBlog />,
  },
  {
    path: routes.blogs,
    element: <Blogs />,
  },
  {
    path: routes.editBlogs,
    element: <EditBlog />,
  },
  {
    path: routes.blogCategories,
    element: <BlogCategories />,
  },
  {
    path: routes.blogComments,
    element: <BlogComments />,
  },
  {
    path: routes.countries,
    element: <Countries />,
  },
  {
    path: routes.states,
    element: <States />,
  },
  {
    path: routes.cities,
    element: <Cities />,
  },
  {
    path: routes.testimonials,
    element: <Testimonials />,
  },
  {
    path: routes.faq,
    element: <Faq />,
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
