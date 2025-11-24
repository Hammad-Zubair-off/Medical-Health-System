import { Link } from "react-router";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppointmentHeader from "../shared/appointment-components/AppointmentHeader";
import AppointmentFilters from "../shared/appointment-components/AppointmentFilters";
import AppointmentTable from "../shared/appointment-components/AppointmentTable";
import { useAppointments } from "../shared/appointment-hooks/useAppointments";
import Modal from "./modal/modals";
import { all_routes } from "../../../../routes/all_routes";
import type { Appointment } from "../shared/appointment-types";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState<boolean>(false);

  const {
    filteredAppointments,
    loading,
    error,
    updateAppointmentStatus,
    updateAppointment,
    applyFilters,
    applySort,
  } = useAppointments();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Open view modal
    const offcanvas = document.getElementById("view_details");
    if (offcanvas) {
      const win = window as unknown as { bootstrap?: { Offcanvas: { new (element: HTMLElement): { show: () => void } } } };
      if (win.bootstrap) {
        const bsOffcanvas = new win.bootstrap.Offcanvas(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  const handleUpdateAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!selectedAppointment) {
      console.error("No appointment selected for update");
      return;
    }

    try {
      await updateAppointment(selectedAppointment.id, appointmentData);
      setSelectedAppointment(null);
      // Close modal
      const offcanvas = document.getElementById("edit_appointment");
      if (offcanvas) {
        const win = window as unknown as {
          bootstrap?: {
            Offcanvas: {
              getInstance: (element: HTMLElement) => { hide: () => void } | null;
            };
          };
        };
        if (win.bootstrap) {
          const instance = win.bootstrap.Offcanvas.getInstance(offcanvas);
          instance?.hide();
        }
      }
    } catch (err) {
      console.error("Failed to update appointment:", err);
    }
  };


  const handleExport = (format: "pdf" | "excel") => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const handleViewModeChange = (mode: "list" | "calendar") => {
    if (mode === "calendar") {
      navigate(all_routes.doctorsappointmentdetails);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
    } catch (err) {
      console.error("Failed to update appointment status:", err);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    // Find the appointment and open edit modal for rescheduling
    const appointment = filteredAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsRescheduleMode(true); // Set reschedule mode
      // Open edit modal for rescheduling
      const offcanvas = document.getElementById("edit_appointment");
      if (offcanvas) {
        const win = window as unknown as { bootstrap?: { Offcanvas: { new (element: HTMLElement): { show: () => void } } } };
        if (win.bootstrap) {
          const bsOffcanvas = new win.bootstrap.Offcanvas(offcanvas);
          bsOffcanvas.show();
        }
      }
    }
  };

  // handleEdit is kept for potential future use
  // const handleEdit = (appointment: Appointment) => {
  //   setSelectedAppointment(appointment);
  //   setIsRescheduleMode(false); // Ensure edit mode (not reschedule)
  //   // Open edit modal
  //   const offcanvas = document.getElementById("edit_appointment");
  //   if (offcanvas) {
  //     const win = window as unknown as { bootstrap?: { Offcanvas: { new (element: HTMLElement): { show: () => void } } } };
  //     if (win.bootstrap) {
  //       const bsOffcanvas = new win.bootstrap.Offcanvas(offcanvas);
  //       bsOffcanvas.show();
  //     }
  //   }
  // };

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Page Header */}
          <AppointmentHeader
            onExportClick={handleExport}
            viewMode="list"
            onViewModeChange={handleViewModeChange}
          />
          {/* End Page Header */}
          {/* Filters */}
          <AppointmentFilters
            searchText={searchText}
            onSearchChange={handleSearch}
            onFilterChange={applyFilters}
            onSortChange={applySort}
            showSearch={true}
          />
          {/* End Filters */}
          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {/* Table */}
          {!loading && (
            <AppointmentTable
              data={filteredAppointments}
              searchText={searchText}
              onView={handleView}
            />
          )}
          {/* End Table */}
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
      <Modal 
        selectedAppointment={selectedAppointment}
        onUpdateAppointment={handleUpdateAppointment}
        onStatusChange={handleStatusChange}
        onReschedule={handleReschedule}
        isRescheduleMode={isRescheduleMode}
        onRescheduleModeChange={setIsRescheduleMode}
      />
    </>
  );
};

export default DoctorAppointments;
