# High Priority Issues - Detailed File List

## 🎯 **FOCUS AREAS**

1. Extract duplicate code into reusable components/hooks
2. Break down large components
3. Add proper TypeScript types
4. Implement form handling
5. Add code splitting

---

## 1️⃣ **EXTRACT DUPLICATE CODE INTO REUSABLE COMPONENTS/HOOKS**

### **1.1 Search Functionality (33+ files)**

**Issue:** Same search pattern repeated in 33+ components

**Pattern:**
```tsx
const [searchText, setSearchText] = useState<string>("");
const handleSearch = (value: string) => {
  setSearchText(value);
};
```

**Files Affected:**

#### **Clinic Modules (10 files)**
1. `src/feature-module/components/pages/clinic-modules/doctors-list/doctorsList.tsx`
   - **Why:** Has search functionality for doctors list
   - **Flow:** User types → `handleSearch` updates state → `Datatable` filters data
   - **Impact:** Duplicate code, no reusability

2. `src/feature-module/components/pages/clinic-modules/patients/patients.tsx`
   - **Why:** Has search functionality for patients list
   - **Flow:** Same as above

3. `src/feature-module/components/pages/clinic-modules/appointments/appointments.tsx`
   - **Why:** Has search functionality for appointments
   - **Flow:** Same pattern

4. `src/feature-module/components/pages/clinic-modules/specializations/specializations.tsx`
5. `src/feature-module/components/pages/clinic-modules/services/services.tsx`
6. `src/feature-module/components/pages/clinic-modules/assets/assets.tsx`
7. `src/feature-module/components/pages/clinic-modules/patient-details/patientDetails.tsx`
8. `src/feature-module/components/pages/clinic-modules/locations/locations.tsx`
9. `src/feature-module/components/pages/clinic-modules/activities/activities.tsx`
10. `src/feature-module/components/pages/clinic-modules/patients-grid/patientsGrid.tsx`

#### **Doctor Modules (5 files)**
11. `src/feature-module/components/pages/doctor-modules/doctor-appointments/doctorAppointments.tsx`
12. `src/feature-module/components/pages/doctor-modules/doctors-prescriptions/doctorsPrescriptions.tsx`
13. `src/feature-module/components/pages/doctor-modules/doctors-leaves/doctorsLeaves.tsx`
14. `src/feature-module/components/pages/doctor-modules/doctors-reviews/doctorsReviews.tsx`
15. `src/feature-module/components/pages/doctor-modules/doctors-schedules/doctorSchedules.tsx`

#### **Patient Modules (5 files)**
16. `src/feature-module/components/pages/patient-modules/patient-appointments/patientAppointments.tsx`
17. `src/feature-module/components/pages/patient-modules/patient-prescriptions/patientPrescriptions.tsx`
18. `src/feature-module/components/pages/patient-modules/patient-invoices/patientInvoices.tsx`
19. `src/feature-module/components/pages/patient-modules/patient-doctors/patientDoctors.tsx`
20. `src/feature-module/components/pages/patient-modules/patient-appointment-details/patientAppointmentDetails.tsx`

#### **Finance Modules (5 files)**
21. `src/feature-module/components/pages/finance-accounts-module/invoices/invoices.tsx`
22. `src/feature-module/components/pages/finance-accounts-module/expenses/expenses.tsx`
23. `src/feature-module/components/pages/finance-accounts-module/income.tsx`
24. `src/feature-module/components/pages/finance-accounts-module/payments.tsx`
25. `src/feature-module/components/pages/finance-accounts-module/transactions.tsx`

#### **HRM Modules (5 files)**
26. `src/feature-module/components/pages/hrm-modules/staffs.tsx`
27. `src/feature-module/components/pages/hrm-modules/payroll.tsx`
28. `src/feature-module/components/pages/hrm-modules/leaves/leavesList.tsx`
29. `src/feature-module/components/pages/hrm-modules/hrmDepartments.tsx`
30. `src/feature-module/components/pages/hrm-modules/designation.tsx`
31. `src/feature-module/components/pages/hrm-modules/attendance.tsx`

#### **Support Modules (4 files)**
32. `src/feature-module/components/pages/support-modules/tickets.tsx`
33. `src/feature-module/components/pages/support-modules/announcements.tsx`
34. `src/feature-module/components/pages/support-modules/newsletters.tsx`
35. `src/feature-module/components/pages/support-modules/contactMessages.tsx`

#### **Administration Modules (2 files)**
36. `src/feature-module/components/pages/administration-modules/users/delete-account-request/deleteAccountRequest.tsx`
37. `src/feature-module/components/pages/application-modules/application/contacts/contacts.tsx`

**Solution:**
```typescript
// Create: src/core/hooks/useSearch.ts
export const useSearch = (initialValue = "") => {
  const [searchText, setSearchText] = useState<string>(initialValue);
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);
  return { searchText, handleSearch, setSearchText };
};

// Usage in components:
const { searchText, handleSearch } = useSearch();
```

**Action Required:**
1. Create `useSearch` hook
2. Replace search logic in all 33+ files
3. Test each component after replacement

---

### **1.2 getModalContainer Function (115+ files)**

**Issue:** Same function repeated in 115+ files

**Pattern:**
```tsx
const getModalContainer = () => {
  const modalElement = document.getElementById("modal-datepicker");
  return modalElement ? modalElement : document.body;
};
```

**Files Affected:** (Too many to list individually - found in almost all form components)

**Key Files:**
1. `src/feature-module/components/pages/clinic-modules/add-doctor/addDoctor.tsx` (Line 24)
2. `src/feature-module/components/pages/clinic-modules/edit-doctor/editDoctor.tsx`
3. `src/feature-module/components/pages/clinic-modules/create-patient/createPatient.tsx`
4. `src/feature-module/components/pages/clinic-modules/edit-patient/editPatient.tsx`
5. `src/feature-module/components/pages/clinic-modules/new-appointment/newAppointment.tsx` (Line 16)
6. `src/feature-module/components/pages/finance-accounts-module/invoices/addInvoices.tsx`
7. `src/feature-module/components/pages/finance-accounts-module/invoices/editInvoices.tsx`
8. `src/feature-module/components/pages/doctor-modules/doctors-schedules/doctorSchedules.tsx`
9. `src/feature-module/components/pages/doctor-modules/doctors-reviews/doctorsReviews.tsx`
10. `src/feature-module/components/pages/doctor-modules/doctors-prescriptions/doctorsPrescriptions.tsx`
11. `src/feature-module/components/pages/doctor-modules/doctors-leaves/doctorsLeaves.tsx`
12. `src/feature-module/components/pages/doctor-modules/doctor-appointments/doctorAppointments.tsx`
13. `src/feature-module/components/pages/application-modules/application/notes/notes.tsx` (Line 22)
14. All modal components in `modals/` folders
15. All form components

**Solution:**
```typescript
// Create: src/core/utils/modalHelpers.ts
export const getModalContainer = (): HTMLElement => {
  const modalElement = document.getElementById("modal-datepicker");
  return modalElement || document.body;
};

// Usage:
import { getModalContainer } from '@core/utils/modalHelpers';
<DatePicker getPopupContainer={getModalContainer} />
```

**Action Required:**
1. Create utility function
2. Replace in all 115+ files
3. Update imports

---

### **1.3 Page Header Structure (50+ files)**

**Issue:** Same page header structure repeated

**Pattern:**
```tsx
<div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
  <div className="flex-grow-1">
    <h4 className="fw-bold mb-0">
      Page Title
      <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
        Total: 565
      </span>
    </h4>
  </div>
  <div className="text-end d-flex">
    {/* Export, View Toggle, Add Button */}
  </div>
</div>
```

**Files Affected:** All list/view components (50+ files)

**Key Examples:**
1. `src/feature-module/components/pages/clinic-modules/doctors-list/doctorsList.tsx` (Line 139-196)
2. `src/feature-module/components/pages/clinic-modules/patients/patients.tsx` (Line 164-219)
3. `src/feature-module/components/pages/clinic-modules/appointments/appointments.tsx` (Line 155-204)
4. `src/feature-module/components/pages/finance-accounts-module/invoices/invoices.tsx` (Line 141-150)
5. All other list components

**Solution:**
```typescript
// Create: src/core/components/PageHeader/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  total?: number;
  totalLabel?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  total,
  totalLabel,
  actions,
  children
}) => {
  return (
    <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
      <div className="flex-grow-1">
        <h4 className="fw-bold mb-0">
          {title}
          {total !== undefined && (
            <span className="badge badge-soft-primary fs-13 fw-medium ms-2">
              {totalLabel || 'Total'}: {total}
            </span>
          )}
        </h4>
      </div>
      {actions && <div className="text-end d-flex">{actions}</div>}
      {children}
    </div>
  );
};
```

**Action Required:**
1. Create `PageHeader` component
2. Replace in all 50+ files
3. Extract action buttons into separate components

---

### **1.4 Export Dropdown (40+ files)**

**Issue:** Same export dropdown repeated

**Pattern:**
```tsx
<div className="dropdown me-1">
  <Link to="#" className="btn btn-md fs-14 fw-normal border bg-white rounded text-dark d-inline-flex align-items-center" data-bs-toggle="dropdown">
    Export
    <i className="ti ti-chevron-down ms-2" />
  </Link>
  <ul className="dropdown-menu p-2">
    <li><Link className="dropdown-item" to="#">Download as PDF</Link></li>
    <li><Link className="dropdown-item" to="#">Download as Excel</Link></li>
  </ul>
</div>
```

**Files Affected:** All list components (40+ files)

**Solution:**
```typescript
// Create: src/core/components/ExportDropdown/ExportDropdown.tsx
interface ExportDropdownProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportPDF,
  onExportExcel
}) => {
  // Implementation
};
```

---

### **1.5 Filter Dropdown (30+ files)**

**Issue:** Large filter dropdown structure repeated

**Files Affected:** All list components with filters

**Solution:** Create `FilterDropdown` component with configurable fields

---

### **1.6 Status Badge (25+ files)**

**Issue:** Status badge rendering logic repeated with variations

**Pattern:**
```tsx
render: (text: string) => (
  <span className={`badge ${text === "Available" ? "badge-soft-success" : "badge-soft-danger"}`}>
    {text}
  </span>
)
```

**Files Affected:** All table components with status columns

**Solution:** Create `StatusBadge` component with status mapping

---

### **1.7 Action Menu (40+ files)**

**Issue:** Action dropdown menu repeated

**Pattern:**
```tsx
{
  title: "",
  render: () => (
    <div className="action-item">
      <Link to="#" data-bs-toggle="dropdown">
        <i className="ti ti-dots-vertical" />
      </Link>
      <ul className="dropdown-menu p-2">
        <li><Link to="#">Edit</Link></li>
        <li><Link to="#">View</Link></li>
        <li><Link to="#">Delete</Link></li>
      </ul>
    </div>
  )
}
```

**Solution:** Create `ActionMenu` component

---

## 2️⃣ **BREAK DOWN LARGE COMPONENTS**

### **2.1 Extremely Large Components (500+ lines)**

#### **notes.tsx - 2752 lines** 🔴 **CRITICAL**
**Location:** `src/feature-module/components/pages/application-modules/application/notes/notes.tsx`

**Why It's Large:**
- Contains entire notes management UI
- Multiple forms inline
- Large JSX blocks
- No component extraction

**What Should Be Extracted:**
1. `NoteCard` component (note display)
2. `NoteForm` component (create/edit form)
3. `NoteFilters` component (filter sidebar)
4. `NoteList` component (notes list view)
5. `NoteEditor` component (rich text editor section)
6. `NoteTags` component (tag management)

**Flow:**
```
Notes Component (2752 lines)
  ├── NoteFilters (sidebar filters)
  ├── NoteList (list of notes)
  │   └── NoteCard (individual note)
  ├── NoteForm (create/edit form)
  └── NoteEditor (rich text editor)
```

**Action Required:**
1. Create `components/NoteCard.tsx`
2. Create `components/NoteForm.tsx`
3. Create `components/NoteFilters.tsx`
4. Create `components/NoteList.tsx`
5. Create `components/NoteEditor.tsx`
6. Refactor main component to use these

---

#### **dashboard.tsx - 1804 lines** 🔴 **CRITICAL**
**Location:** `src/feature-module/components/pages/dashboard/dashboard.tsx`

**Why It's Large:**
- Multiple chart components inline
- Statistics cards
- Calendar component
- Recent activities
- All dashboard sections in one file

**What Should Be Extracted:**
1. `DashboardStats` component (statistics cards)
2. `DashboardCharts` component (all charts)
3. `DashboardCalendar` component (calendar section)
4. `RecentActivities` component (activities list)
5. `QuickActions` component (action buttons)
6. Individual chart components (already exist but used inline)

**Flow:**
```
Dashboard Component (1804 lines)
  ├── DashboardHeader (title + actions)
  ├── DashboardStats (4 stat cards)
  ├── DashboardCharts (multiple charts)
  ├── DashboardCalendar (calendar widget)
  └── RecentActivities (activity feed)
```

**Action Required:**
1. Extract each section into separate components
2. Create hooks for data fetching (`useDashboardStats`, `useRecentActivities`)
3. Simplify main component

---

#### **addDoctor.tsx - 675 lines** 🔴 **HIGH**
**Location:** `src/feature-module/components/pages/clinic-modules/add-doctor/addDoctor.tsx`

**Why It's Large:**
- Multiple form sections inline
- Schedule tabs (7 days × duplicate forms)
- Education forms
- Rewards forms
- All in one component

**What Should Be Extracted:**
1. `ContactInformationForm` component (contact section)
2. `PersonalInformationForm` component (personal details)
3. `EducationForm` component (education section)
4. `ScheduleForm` component (weekly schedule)
5. `DayScheduleForm` component (single day schedule - used 7 times)
6. `RewardsForm` component (rewards section)

**Flow:**
```
AddDoctor Component (675 lines)
  ├── ContactInformationForm
  ├── PersonalInformationForm
  ├── EducationForm
  ├── ScheduleForm
  │   ├── DayScheduleForm (Monday)
  │   ├── DayScheduleForm (Tuesday)
  │   └── ... (5 more days)
  └── RewardsForm
```

**Action Required:**
1. Extract each form section
2. Create reusable `DayScheduleForm` component
3. Use form state management (react-hook-form)

---

#### **newAppointment.tsx - 1000+ lines** 🔴 **HIGH**
**Location:** `src/feature-module/components/pages/clinic-modules/new-appointment/newAppointment.tsx`

**Why It's Large:**
- Complex appointment form
- Multiple sections
- Time pickers
- Patient/doctor selection
- All inline

**What Should Be Extracted:**
1. `AppointmentBasicInfo` component
2. `AppointmentDateTime` component
3. `AppointmentParticipants` component (patient/doctor selection)
4. `AppointmentNotes` component
5. `AppointmentActions` component (submit buttons)

**Action Required:**
1. Break into smaller components
2. Use form library for state management

---

#### **doctorsProfileSettings.tsx - 800+ lines** 🔴 **HIGH**
**Location:** `src/feature-module/components/pages/doctor-modules/doctors-profile-settings/doctorsProfileSettings.tsx`

**What Should Be Extracted:**
1. `ProfileImageUpload` component
2. `PersonalInfoForm` component
3. `ContactInfoForm` component
4. `ProfessionalInfoForm` component
5. `SocialLinksForm` component

---

#### **editPatient.tsx - 700+ lines** 🔴 **HIGH**
**Location:** `src/feature-module/components/pages/clinic-modules/edit-patient/editPatient.tsx`

**What Should Be Extracted:**
1. `PatientBasicInfo` component
2. `PatientContactInfo` component
3. `PatientMedicalInfo` component
4. `PatientInsuranceInfo` component

---

#### **createPatient.tsx - 600+ lines** 🔴 **HIGH**
**Location:** `src/feature-module/components/pages/clinic-modules/create-patient/createPatient.tsx`

**What Should Be Extracted:**
1. Same as editPatient (reusable form components)

---

### **2.2 Medium Large Components (300-500 lines)**

**Files:**
1. `editDoctor.tsx` - 500+ lines
2. `editInvoices.tsx` - 400+ lines
3. `addInvoices.tsx` - 400+ lines
4. `doctorSchedules.tsx` - 500+ lines
5. `doctorsAppointmentDetails.tsx` - 400+ lines
6. `patientAppointmentDetails.tsx` - 400+ lines
7. `patientsGrid.tsx` - 450+ lines

**Action Required:** Extract sub-components from each

---

## 3️⃣ **ADD PROPER TYPESCRIPT TYPES**

### **3.1 TypeScript `any` Usage (100+ instances)**

**Issue:** `any` type used everywhere, losing type safety

**Pattern:**
```tsx
render: (text: any, render: any) => (...)
sorter: (a: any, b: any) => (...)
const [data, setData] = useState<any[]>([]);
```

**Files Affected:** Almost all table/list components

#### **Critical Files with Most `any` Usage:**

1. **doctorsList.tsx** - 10+ `any` usages
   - Line 24: `render: (text: any, render: any)`
   - Line 41: `sorter: (a: any, b: any)`
   - Multiple render functions

2. **patients.tsx** - 8+ `any` usages
   - Similar pattern

3. **appointments.tsx** - 6+ `any` usages

4. **invoices.tsx** - 12+ `any` usages
   - Line 16: `render: (text: any)`
   - Line 19: `sorter: (a: any, b: any)`
   - Line 24: `render: (text: any, record: any)`
   - Multiple instances

5. **expenses.tsx** - 15+ `any` usages

6. **All table components** - Each has 5-15 `any` usages

**Solution:**
```typescript
// Create: src/core/types/table.types.ts
export interface TableColumn<T = Record<string, unknown>> {
  title: string;
  dataIndex: keyof T | string;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filters?: Array<{ text: string; value: string }>;
  // ... other antd Table column props
}

// Create: src/core/types/doctor.types.ts
export interface Doctor {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  fees: string;
  status: 'Available' | 'Unavailable';
  img: string;
}

// Usage:
const columns: TableColumn<Doctor>[] = [
  {
    title: "Name & Designation",
    dataIndex: "name",
    render: (value: string, record: Doctor) => (
      <div>{value} - {record.designation}</div>
    ),
    sorter: (a: Doctor, b: Doctor) => a.name.localeCompare(b.name),
  }
];
```

**Action Required:**
1. Create type definitions for all entities:
   - `doctor.types.ts`
   - `patient.types.ts`
   - `appointment.types.ts`
   - `invoice.types.ts`
   - `expense.types.ts`
   - etc.

2. Create `TableColumn` generic type
3. Replace all `any` with proper types in:
   - All table components (50+ files)
   - All form components (30+ files)
   - All data handling (40+ files)

---

### **3.2 Missing Component Props Types**

**Issue:** Components don't have proper prop interfaces

**Files Affected:** All components

**Example:**
```tsx
// Current (no types)
const DoctorsList = () => {
  // ...
}

// Should be:
interface DoctorsListProps {
  showFilters?: boolean;
  defaultView?: 'list' | 'grid';
  onDoctorSelect?: (doctor: Doctor) => void;
}

const DoctorsList: React.FC<DoctorsListProps> = ({
  showFilters = true,
  defaultView = 'list',
  onDoctorSelect
}) => {
  // ...
}
```

**Action Required:**
1. Add prop interfaces to all components
2. Use TypeScript strict mode
3. Remove all `any` types

---

## 4️⃣ **IMPLEMENT FORM HANDLING**

### **4.1 Forms Without Handlers (30+ files)**

**Issue:** Forms have no submission logic, no validation, no error handling

**Pattern:**
```tsx
<form action="#">
  {/* Form fields */}
  <button type="submit">Submit</button>
</form>
```

**Files Affected:**

#### **Critical Form Files:**

1. **addDoctor.tsx** (Line 68)
   - **Why:** Main doctor creation form
   - **Issue:** No `onSubmit` handler, no validation
   - **Flow:** User fills form → clicks submit → nothing happens
   - **Impact:** Form doesn't work, data not saved

2. **editDoctor.tsx**
   - Same issues as addDoctor

3. **createPatient.tsx**
   - **Why:** Patient creation form
   - **Issue:** No form handling
   - **Impact:** Can't create patients

4. **editPatient.tsx**
   - Same issues

5. **newAppointment.tsx** (Line 48)
   - **Why:** Appointment creation form
   - **Issue:** No submission handler
   - **Impact:** Can't create appointments

6. **addInvoices.tsx** (Line 68)
   - **Why:** Invoice creation form
   - **Issue:** No form handling
   - **Impact:** Can't create invoices

7. **editInvoices.tsx** (Line 69)
   - Same issues

8. **doctorSchedules.tsx** (Line 479)
   - **Why:** Schedule form
   - **Issue:** Submit button but no handler

9. **doctorsReviews.tsx** (Line 147, 259)
   - **Why:** Review form
   - **Issue:** `action="#"` but no handler

10. **doctorsPrescriptions.tsx** (Line 180, 292)
    - **Why:** Prescription form
    - **Issue:** No form handling

11. **doctorsPrescriptionDetails.tsx** (Line 235)
    - Same issues

12. **All modal forms** in `modals/` folders
    - Multiple modal forms without handlers

**Solution:**
```typescript
// Use react-hook-form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Create validation schema
const doctorSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  // ... other fields
});

// In component:
const AddDoctor = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(doctorSchema)
  });

  const onSubmit = async (data: DoctorFormData) => {
    try {
      await doctorsService.create(data);
      // Show success message
      // Navigate or refresh
    } catch (error) {
      // Show error message
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with register() */}
      <button type="submit">Submit</button>
    </form>
  );
};
```

**Action Required:**
1. Install `react-hook-form` and `yup`
2. Create validation schemas for each form type
3. Add form handlers to all 30+ form components
4. Add error handling
5. Add success/error messages
6. Connect to Firestore services

---

### **4.2 Filter Forms Don't Work (30+ files)**

**Issue:** Filter forms have no logic

**Pattern:**
```tsx
<form action="#">
  {/* Filter fields */}
  <button type="submit">Filter</button>
</form>
```

**Files Affected:** All list components with filters

**Solution:**
```typescript
const [filters, setFilters] = useState<FilterState>({});

const handleFilterSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Apply filters to data
  const filtered = applyFilters(data, filters);
  setFilteredData(filtered);
};
```

**Action Required:**
1. Add filter state management
2. Implement filter logic
3. Connect filters to data filtering

---

## 5️⃣ **ADD CODE SPLITTING**

### **5.1 No Lazy Loading**

**Issue:** All components loaded upfront, large initial bundle

**Files Affected:** `src/feature-module/routes/router.link.tsx`

**Current:**
```tsx
import DoctorsList from "../components/pages/clinic-modules/doctors-list/doctorsList";
import Patients from "../components/pages/clinic-modules/patients/patients";
// ... 243+ imports all at once
```

**Solution:**
```typescript
// router.link.tsx
import { lazy } from 'react';

const DoctorsList = lazy(() => 
  import("../components/pages/clinic-modules/doctors-list/doctorsList")
);
const Patients = lazy(() => 
  import("../components/pages/clinic-modules/patients/patients")
);
// ... lazy load all components

// router.tsx
import { Suspense } from 'react';
import LoadingSpinner from '@core/components/LoadingSpinner';

<Route
  path={routes.doctors}
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <DoctorsList />
    </Suspense>
  }
/>
```

**Action Required:**
1. Convert all imports in `router.link.tsx` to lazy imports
2. Wrap routes in `Suspense` in `router.tsx`
3. Create `LoadingSpinner` component
4. Test route loading

---

### **5.2 Large Components Not Split**

**Issue:** Large components increase bundle size

**Files:**
- `notes.tsx` (2752 lines) - Should be code split
- `dashboard.tsx` (1804 lines) - Should be code split
- `addDoctor.tsx` (675 lines) - Should be code split

**Solution:** Use dynamic imports for large sections

---

## 📋 **PRIORITY ORDER FOR FIXES**

### **Phase 1: Foundation (Do First)**
1. ✅ Create `useSearch` hook → Replace in 33+ files
2. ✅ Create `getModalContainer` utility → Replace in 115+ files
3. ✅ Create `PageHeader` component → Replace in 50+ files
4. ✅ Create type definitions → Fix TypeScript `any` in 100+ places

### **Phase 2: Forms (Do Next)**
5. ✅ Install react-hook-form + yup
6. ✅ Add form handlers to critical forms (addDoctor, createPatient, newAppointment)
7. ✅ Add form handlers to all other forms (30+ files)

### **Phase 3: Component Breakdown (Do After Forms)**
8. ✅ Break down `notes.tsx` (2752 lines)
9. ✅ Break down `dashboard.tsx` (1804 lines)
10. ✅ Break down `addDoctor.tsx` (675 lines)
11. ✅ Break down other large components

### **Phase 4: Code Splitting (Do Last)**
12. ✅ Implement lazy loading for routes
13. ✅ Add Suspense boundaries
14. ✅ Test bundle size reduction

---

## 🎯 **SUMMARY**

**Total Files to Fix:**
- **Duplicate Code:** 200+ files
- **Large Components:** 15+ files
- **TypeScript Types:** 100+ files
- **Form Handling:** 30+ files
- **Code Splitting:** 1 file (router.link.tsx) but affects all routes

**Estimated Work:**
- **Phase 1:** 2-3 days
- **Phase 2:** 2-3 days
- **Phase 3:** 3-4 days
- **Phase 4:** 1 day

**Total:** ~8-11 days of focused work

---

**Last Updated:** Complete file list with explanations and flow

