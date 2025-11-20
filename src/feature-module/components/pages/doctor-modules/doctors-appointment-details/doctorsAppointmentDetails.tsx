import { Link } from "react-router";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppointmentHeader from "../shared/appointment-components/AppointmentHeader";
import AppointmentFilters from "../shared/appointment-components/AppointmentFilters";
import AppointmentCalendar from "../shared/appointment-components/AppointmentCalendar";
import { useAppointments } from "../shared/appointment-hooks/useAppointments";
import { all_routes } from "../../../../routes/all_routes";

const DoctorsAppointmentDetails = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  const {
    filteredAppointments,
    loading,
    error,
    applyFilters,
    applySort,
  } = useAppointments();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleNewAppointment = () => {
    // Modal will be opened via data-bs-toggle
  };

  const handleExport = (format: "pdf" | "excel") => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const handleViewModeChange = (mode: "list" | "calendar") => {
    if (mode === "list") {
      navigate(all_routes.doctorsappointments);
    }
  };

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
            onNewAppointmentClick={handleNewAppointment}
            onExportClick={handleExport}
            viewMode="calendar"
            onViewModeChange={handleViewModeChange}
          />
          {/* End Page Header */}
          {/* Filters */}
          <AppointmentFilters
            searchText={searchText}
            onSearchChange={handleSearch}
            onFilterChange={applyFilters}
            onSortChange={applySort}
            showSearch={false}
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
          {/* Calendar */}
          {!loading && (
            <AppointmentCalendar appointments={filteredAppointments} />
          )}
          {/* End Calendar */}
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
    </>
  );
};

export default DoctorsAppointmentDetails;
