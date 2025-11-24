import { Link } from "react-router";
import { useState, useEffect } from "react";
import ImageWithBasePath from "../../../../../../core/imageWithBasePath";
import { DatePicker, TimePicker, type TimePickerProps } from "antd";
import dayjs from "dayjs";
import StatusBadge from "../../shared/appointment-components/StatusBadge";
import type { Appointment } from "../../shared/appointment-types";

interface ModalProps {
  selectedAppointment?: Appointment | null;
  onUpdateAppointment?: (appointmentData: Partial<Appointment>) => Promise<void>;
  onStatusChange?: (appointmentId: string, status: string) => void;
  onReschedule?: (appointmentId: string) => void;
  isRescheduleMode?: boolean;
  onRescheduleModeChange?: (isReschedule: boolean) => void;
}

const Modal = ({ selectedAppointment, onUpdateAppointment, onStatusChange, onReschedule, isRescheduleMode = false, onRescheduleModeChange }: ModalProps) => {
  const [formData, setFormData] = useState({
    appointmentId: "",
    patient: "",
    appointmentType: "",
    date: "",
    time: "",
    reason: "",
    status: "",
  });

  // Update form data when selectedAppointment changes
  useEffect(() => {
    if (selectedAppointment) {
      // Parse Date_Time string (format: "Nov 6, 2025, 8:42 PM")
      const dateTime = new Date(selectedAppointment.Date_Time);
      const dateStr = dateTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = dateTime.toTimeString().slice(0, 5); // HH:MM

      setFormData({
        appointmentId: selectedAppointment.AppointmentId || "",
        patient: selectedAppointment.Patient || "",
        appointmentType: selectedAppointment.Mode === "Online" ? "Online" : "In Person",
        date: dateStr,
        time: timeStr,
        reason: selectedAppointment._firestoreData?.description || selectedAppointment._firestoreData?.Complain || "",
        status: selectedAppointment.Status || "",
      });
    }
  }, [selectedAppointment]);

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const onChangeTime: TimePickerProps["onChange"] = (time, timeString) => {
    if (time) {
      const timeValue = typeof timeString === "string" ? timeString : Array.isArray(timeString) ? timeString[0] : "";
      setFormData((prev) => ({ ...prev, time: timeValue }));
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date: date.format("YYYY-MM-DD") }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAppointment && selectedAppointment) {
      if (isRescheduleMode) {
        // In reschedule mode, only update date/time and set status to rescheduled
        if (!formData.date || !formData.time) {
          alert("Please select both date and time for rescheduling.");
          return;
        }
        const appointmentData: Partial<Appointment> = {
          Date_Time: `${formData.date} ${formData.time}`,
          Status: "Confirmed",
        };
        await onUpdateAppointment(appointmentData);
        // Reset reschedule mode
        if (onRescheduleModeChange) {
          onRescheduleModeChange(false);
        }
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
      } else {
        // In edit mode, update all fields
        const appointmentData: Partial<Appointment> = {
          AppointmentId: formData.appointmentId,
          Patient: formData.patient,
          Mode: formData.appointmentType,
          Date_Time: `${formData.date} ${formData.time}`,
          Status: formData.status,
        };
        await onUpdateAppointment(appointmentData);
      }
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time range (assuming 2 hour duration)
  const formatTimeRange = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    const startTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    const endTime = endDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <>
      {/* Start Add New Appointment */}
      <div
        className="offcanvas offcanvas-offset offcanvas-end"
        tabIndex={-1}
        id="new_appointment"
      >
        <div className="offcanvas-header d-block pb-0 px-0">
          <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
            <h5 className="offcanvas-title fs-18 fw-bold">New Appointment</h5>
            <button
              type="button"
              className="btn-close opacity-100"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
        </div>
        <div className="offcanvas-body pt-3">
          <form action="#">
            {/* start row*/}
            <div className="row">
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Appointment ID <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded bg-light"
                      defaultValue="AP234354"
                    />
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Patient<span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                      Select
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search"
                          />
                        </div>
                      </div>
                      <ul className="mb-3 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/users/user-02.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Emily Clark
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            John Carter
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-16.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Sophia White
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-15.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Michael Johnson
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-14.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Olivia Harris
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            David Anderson
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Appointment Type <span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                      Select
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Select"
                          />
                        </div>
                      </div>
                      <ul className="mb-3 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            In Person
                          </label>
                        </li>
                        <li className="list-none">
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Online
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Date of Appointment <span className="text-danger">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <DatePicker
                      className="form-control datetimepicker"
                      format={{
                        format: "DD-MM-YYYY",
                        type: "mask",
                      }}
                      getPopupContainer={getModalContainer}
                      placeholder="DD-MM-YYYY"
                      suffixIcon={null}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar" />
                    </span>
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Time <span className="text-danger">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <TimePicker
                      className="form-control"
                      onChange={onChangeTime}
                      defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-clock" />
                    </span>
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-12">
                <div className="mb-3">
                  <div>
                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                      Appointment Reason
                    </label>
                    <textarea rows={4} className="form-control rounded" />
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Status<span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                      Select
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Select"
                          />
                        </div>
                      </div>
                      <ul className="mb-3 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Checked Out
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                              defaultChecked
                            />
                            Checked In
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Cancelled
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Scheduled
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* end col*/}
            </div>
            {/* end row*/}
          </form>
        </div>
        <div className="offcanvas-footer mb-1 mt-3 p-3 border-1 border-top">
          <div className=" d-flex justify-content-end gap-2">
            <Link to="#" className="btn btn-light btm-md">
              Cancel
            </Link>
            <button
              data-bs-dismiss="offcanvas"
              className="btn btn-primary btm-md"
              id="filter-submit"
            >
              Create Create Appointment
            </button>
          </div>
        </div>
      </div>
      {/* End Add New Appointment*/}
      {/* Start Edit New Appointment */}
      <div
        className="offcanvas offcanvas-offset offcanvas-end"
        tabIndex={-1}
        id="edit_appointment"
      >
        <div className="offcanvas-header d-block pb-0 px-0">
          <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
            <h5 className="offcanvas-title fs-18 fw-bold">
              {isRescheduleMode ? "Reschedule Appointment" : "Edit Appointment"}
            </h5>
            <button
              type="button"
              className="btn-close opacity-100"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
        </div>
        <div className="offcanvas-body pt-3">
          <form action="#">
            {/* start row*/}
            <div className="row">
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Appointment ID <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded bg-light"
                      value={formData.appointmentId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, appointmentId: e.target.value }))}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              {/* end col*/}
              {!isRescheduleMode && (
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Patient<span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                        {formData.patient || "Select"}
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search"
                          />
                        </div>
                      </div>
                      <ul className="mb-3 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/users/user-02.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Emily Clark
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            John Carter
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-16.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Sophia White
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-15.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Michael Johnson
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-14.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            Olivia Harris
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            <span className="avatar avatar-sm rounded-circle me-2">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="flex-shrink-0 rounded-circle"
                                alt="img"
                              />
                            </span>
                            David Anderson
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {/* end col*/}
              {!isRescheduleMode && (
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Appointment Type <span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                        {formData.appointmentType || "Select"}
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Select"
                          />
                        </div>
                      </div>
                      <ul className="mb-0 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            In Person
                          </label>
                        </li>
                        <li className="list-none">
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Online
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {/* end col*/}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Date of Appointment <span className="text-danger">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <DatePicker
                      className="form-control datetimepicker"
                      format={{
                        format: "DD-MM-YYYY",
                        type: "mask",
                      }}
                      getPopupContainer={getModalContainer}
                      placeholder="DD-MM-YYYY"
                      suffixIcon={null}
                      value={formData.date ? dayjs(formData.date, "YYYY-MM-DD") : null}
                      onChange={handleDateChange}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar" />
                    </span>
                  </div>
                </div>
              </div>
              {/* end col*/}
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Time <span className="text-danger">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <TimePicker
                      className="form-control"
                      onChange={onChangeTime}
                      defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
                      value={formData.time ? dayjs(formData.time, "HH:mm") : null}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-clock" />
                    </span>
                  </div>
                </div>
              </div>
              {/* end col*/}
              {!isRescheduleMode && (
              <div className="col-lg-12">
                <div className="mb-3">
                  <div>
                    <label className="form-label mb-1 text-dark fs-14 fw-medium">
                      Appointment Reason
                    </label>
                    <textarea
                      rows={4}
                      className="form-control rounded"
                        value={formData.reason}
                        onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="Enter appointment reason..."
                    />
                  </div>
                </div>
              </div>
              )}
              {/* end col*/}
              {!isRescheduleMode && (
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label mb-1 text-dark fs-14 fw-medium">
                    Status<span className="text-danger">*</span>
                  </label>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle form-control rounded d-flex align-items-center justify-content-between border"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="true"
                    >
                        {formData.status || "Select"}
                    </Link>
                    <div className="dropdown-menu shadow-lg w-100 dropdown-info">
                      <div className="mb-3">
                        <div className="input-icon-start position-relative">
                          <span className="input-icon-addon fs-12">
                            <i className="ti ti-search" />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Select"
                          />
                        </div>
                      </div>
                      <ul className="mb-3 list-style-none">
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Checked Out
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                              defaultChecked
                            />
                            Checked In
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Cancelled
                          </label>
                        </li>
                        <li>
                          <label className="dropdown-item px-2 d-flex align-items-center text-dark">
                            <input
                              className="form-check-input m-0 me-2"
                              type="checkbox"
                            />
                            Scheduled
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {/* end col*/}
            </div>
            {/* end row*/}
          </form>
        </div>
        <div className="offcanvas-footer mb-1 mt-3 p-3 border-1 border-top">
          <div className=" d-flex justify-content-end gap-2">
            <Link 
              to="#" 
              className="btn btn-light btm-md"
              onClick={() => {
                if (onRescheduleModeChange) {
                  onRescheduleModeChange(false);
                }
              }}
              data-bs-dismiss="offcanvas"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary btm-md"
              id="filter-submit2"
            >
              {isRescheduleMode ? "Reschedule Appointment" : "Update Appointment"}
            </button>
          </div>
        </div>
      </div>
      {/* End Edit New Appointment*/}
      {/* Start View Details */}
      <div
        className="offcanvas offcanvas-offset offcanvas-end"
        tabIndex={-1}
        id="view_details"
      >
        <div className="offcanvas-header d-block pb-0 px-0">
          <div className="border-bottom d-flex align-items-center justify-content-between pb-3 px-3">
            <h5 className="offcanvas-title fs-18 fw-bold">
              Appointment Details
              {selectedAppointment && (
              <span className="badge badge-soft-primary border pt-1 px-2 border-primary fw-medium ms-2">
                  #{selectedAppointment.AppointmentId}
              </span>
              )}
            </h5>
            <button
              type="button"
              className="btn-close opacity-100"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
        </div>
        <div className="offcanvas-body pt-0 px-0">
          {selectedAppointment ? (
            <>
              {/* Patient Information */}
          <h6 className="bg-light py-2 px-3 text-dark fw-bold">
                Patient Information
          </h6>
          <div className="px-3 my-4">
                <div className="d-flex align-items-center mb-3">
                  {selectedAppointment.img ? (
                    <img
                      src={selectedAppointment.img}
                      alt={selectedAppointment.Patient}
                      className="rounded-circle me-3"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="avatar avatar-lg bg-primary text-white rounded-circle me-3 d-inline-flex align-items-center justify-content-center">
                      {selectedAppointment.Patient?.charAt(0) || "?"}
                </span>
                  )}
                  <div>
                    <h6 className="fw-bold mb-1">{selectedAppointment.Patient || "N/A"}</h6>
                    <p className="text-muted mb-0 fs-13">{selectedAppointment.phone_number || "N/A"}</p>
              </div>
            </div>
          </div>

              {/* Appointment Details */}
          <h6 className="bg-light py-2 px-3 text-dark fw-bold">
            Appointment Details
          </h6>
          <div className="px-3 my-4">
                <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                  <span>Appointment ID</span>
                  <span className="text-body fw-normal">#{selectedAppointment.AppointmentId || "N/A"}</span>
                </p>
                <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                  <span>Date</span>
                  <span className="text-body fw-normal">
                    {selectedAppointment ? formatDateForDisplay(selectedAppointment.Date_Time) : "N/A"}
                  </span>
                </p>
                <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                  <span>Time</span>
                  <span className="text-body fw-normal">
                    {selectedAppointment ? formatTimeRange(selectedAppointment.Date_Time) : "N/A"}
                  </span>
                </p>
                <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                  <span>Mode</span>
                  <span className="text-body fw-normal">
                    {selectedAppointment.Mode === "Online" ? "Online" : "Offline"}
                  </span>
                </p>
                <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                  <span>Status</span>
                  <StatusBadge status={selectedAppointment.Status || "N/A"} />
                </p>
                {(() => {
                  const description = selectedAppointment._firestoreData?.description as string | undefined;
                  const complain = selectedAppointment._firestoreData?.Complain as string | undefined;
                  const diagnosis = selectedAppointment._firestoreData?.diagnosis as string | undefined;
                  const hasDescription = description || complain || diagnosis;
                  
                  return hasDescription ? (
                    <div className="mb-3">
                      <p className="text-dark mb-2 fw-semibold">Description / Complaint</p>
                      <p className="text-body fw-normal">
                        {description || complain || diagnosis || "N/A"}
                      </p>
              </div>
                  ) : null;
                })()}
                {(() => {
                  const price = selectedAppointment._firestoreData?.price;
                  if (price !== undefined && typeof price === "number") {
                    return (
                      <p className="text-dark mb-3 fw-semibold d-flex align-items-center justify-content-between">
                        <span>Consultation Fee</span>
                        <span className="text-body fw-normal">
                          ${price.toFixed(2)}
                        </span>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            </>
          ) : (
            <div className="px-3 py-5 text-center">
              <p className="text-muted">No appointment selected</p>
            </div>
          )}
              </div>
        {/* Action Buttons Footer */}
        {selectedAppointment && (
          <div className="offcanvas-footer p-3 border-top">
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              {(() => {
                const statusLower = (selectedAppointment.Status || "").toLowerCase();
                const isCompleted = statusLower === "completed" || statusLower === "complete";
                const isCancelled = statusLower === "cancelled" || statusLower === "cancel";
                const isFinalState = isCompleted || isCancelled;
                const isPending = statusLower === "pending";
                const isConfirmed = statusLower === "confirmed" || statusLower === "accept" || statusLower === "accepted" || statusLower === "rescheduled";

                // If completed or cancelled, show no actions
                if (isFinalState) {
                  return (
                    <button
                      type="button"
                      className="btn btn-light"
                      data-bs-dismiss="offcanvas"
                    >
                      Close
                    </button>
                  );
                }

                return (
                  <>
                    {/* Pending: Accept */}
                    {isPending && (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                          if (onStatusChange && selectedAppointment.id) {
                            onStatusChange(selectedAppointment.id, "accept");
                            // Close modal after action
                            const offcanvas = document.getElementById("view_details");
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
                          }
                        }}
                      >
                        <i className="ti ti-check me-1" />
                        Accept
                      </button>
                    )}

                    {/* Confirmed: Complete, Cancel, Reschedule */}
                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (onStatusChange && selectedAppointment.id) {
                              onStatusChange(selectedAppointment.id, "complete");
                              const offcanvas = document.getElementById("view_details");
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
                            }
                          }}
                        >
                          <i className="ti ti-circle-check me-1" />
                          Complete
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            if (onStatusChange && selectedAppointment.id) {
                              onStatusChange(selectedAppointment.id, "cancel");
                              const offcanvas = document.getElementById("view_details");
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
                            }
                          }}
                        >
                          <i className="ti ti-x me-1" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={() => {
                            if (onReschedule && selectedAppointment.id) {
                              onReschedule(selectedAppointment.id);
                              // Close view modal and open edit modal
                              const viewOffcanvas = document.getElementById("view_details");
                              if (viewOffcanvas) {
                                const win = window as unknown as {
                                  bootstrap?: {
                                    Offcanvas: {
                                      getInstance: (element: HTMLElement) => { hide: () => void } | null;
                                    };
                                  };
                                };
                                if (win.bootstrap) {
                                  const instance = win.bootstrap.Offcanvas.getInstance(viewOffcanvas);
                                  instance?.hide();
                                }
                              }
                            }
                          }}
                        >
                          <i className="ti ti-calendar-event me-1" />
                          Reschedule
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn-light"
                      data-bs-dismiss="offcanvas"
                    >
                      Close
                    </button>
                  </>
                );
              })()}
                        </div>
                      </div>
        )}
      </div>
      {/* End Add New Appointment*/}
      {/* Start Delete Modal  */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body text-center position-relative">
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-01.png"
                alt=""
                className="img-fluid position-absolute top-0 start-0 z-0"
              />
              <ImageWithBasePath
                src="assets/img/bg/delete-modal-bg-02.png"
                alt=""
                className="img-fluid position-absolute bottom-0 end-0 z-0"
              />
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-lg bg-danger text-white">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="fw-bold mb-1 position-relative z-1">
                Delete Confirmation
              </h5>
              <p className="mb-3 position-relative z-1">
                Are you sure want to delete?
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light position-relative z-1 me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link
                  to=""
                  className="btn btn-danger position-relative z-1"
                  data-bs-dismiss="modal"
                >
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Delete Modal  */}
    </>
  );
};

export default Modal;
