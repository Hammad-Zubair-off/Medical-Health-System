import { useState } from "react";
import { Link } from "react-router";
import { useUser } from "../../../../../core/context/UserContext";
import { type DoctorEnabledDays } from "../../../../../core/services/firestore/doctor.service";
import { useScheduleState } from "./hooks/useScheduleState";
import { useHolidays } from "./hooks/useHolidays";
import { useScheduleData } from "./hooks/useScheduleData";
import { WeeklyOverview } from "./components/WeeklyOverview";
import { ScheduleTabs } from "./components/ScheduleTabs";
import { HolidaysSection } from "./components/HolidaysSection";
import type { DayKey } from "./types";

const DoctorSchedules = () => {
  const { doctorUserId } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [enabledDays, setEnabledDays] = useState<DoctorEnabledDays>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  // Schedule state management
  const {
    schedules,
    getDaySchedule,
    updateDaySchedule,
    handleTimeChange,
    handleAddSchedule,
    handleDeleteSchedule,
  } = useScheduleState();

  // Holidays management
  const {
    holidays,
    setHolidays,
    newHolidayDate,
    setNewHolidayDate,
    newHolidayReason,
    setNewHolidayReason,
    handleAddHoliday,
    handleDeleteHoliday,
  } = useHolidays();

  // Data fetching and saving
  const {
    loading,
    saving,
    successMessage,
    setSuccessMessage,
    fetchSchedule,
    handleSubmit,
  } = useScheduleData({
    doctorUserId,
    schedules,
    enabledDays,
    holidays,
    updateDaySchedule,
    setEnabledDays,
    setHolidays,
    setError,
  });

  // Toggle day enabled/disabled
  const handleToggleDay = (day: DayKey) => {
    setEnabledDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Handle holiday add with error handling
  const handleAddHolidayWithError = () => {
    handleAddHoliday(setError);
  };

  return (
    <>
      {/* ========================
            Start Page Content
        ========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* Start Row */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Start Page Header */}
              <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                  <h4 className="fw-bold mb-0"> My Schedule</h4>
                </div>
                <div className="text-end d-flex">
                  {/* dropdown*/}
                </div>
              </div>
              {/* End Page Header */}
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading schedule...</p>
                </div>
              )}
              <div className="card">
                <div className="card-body">
                  <WeeklyOverview
                    enabledDays={enabledDays}
                    getDaySchedule={getDaySchedule}
                  />

                  <ScheduleTabs
                    enabledDays={enabledDays}
                    getDaySchedule={getDaySchedule}
                    onToggleDay={handleToggleDay}
                    onTimeChange={handleTimeChange}
                    onAddSchedule={handleAddSchedule}
                    onDeleteSchedule={handleDeleteSchedule}
                  />

                  <HolidaysSection
                    holidays={holidays}
                    newHolidayDate={newHolidayDate}
                    newHolidayReason={newHolidayReason}
                    onDateChange={setNewHolidayDate}
                    onReasonChange={setNewHolidayReason}
                    onAdd={handleAddHolidayWithError}
                    onDelete={handleDeleteHoliday}
                  />
                </div>
                {/* End card body */}
              </div>
              {/* End card */}
              {/* Error and Success Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
                  {successMessage}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccessMessage(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              <div className="modal-footer d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-white border"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    fetchSchedule(); // Reset to saved data
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={saving || loading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
          {/* End Row */}
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

export default DoctorSchedules;
