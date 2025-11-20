import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventApi } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ImageWithBasePath from "../../../../../../core/imageWithBasePath";
import type { Appointment } from "../appointment-types";

interface AppointmentCalendarProps {
  appointments?: Appointment[];
  onEventClick?: (event: any) => void;
}

const AppointmentCalendar = ({
  appointments = [],
  onEventClick,
}: AppointmentCalendarProps) => {
  const calendarRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Convert appointments to FullCalendar events
  const events = appointments.map((appointment) => {
    const dateStr = appointment.Date_Time;
    const date = new Date(dateStr);
    
    const patientImage = appointment.img;
    const patientName = appointment.Patient;
    
    return {
      id: appointment.id,
      title: `${patientName} - ${appointment.Mode}`,
      start: date.toISOString(),
      extendedProps: {
        appointment: appointment,
        image: patientImage,
        patientName: patientName,
        status: appointment.Status,
        mode: appointment.Mode,
        phone: appointment.phone_number,
      },
      backgroundColor: appointment.Status.toLowerCase() === "completed" 
        ? "#27AE60" 
        : appointment.Status.toLowerCase() === "cancelled" 
        ? "#EF1E1E" 
        : appointment.Status.toLowerCase() === "pending" 
        ? "#E2B93B" 
        : appointment.Status.toLowerCase() === "confirmed" 
        ? "#27AE60" 
        : appointment.Status.toLowerCase() === "rescheduled" 
        ? "#17a2b8" 
        : "#3B28CC",
      borderColor: appointment.Status.toLowerCase() === "completed" 
        ? "#27AE60" 
        : appointment.Status.toLowerCase() === "cancelled" 
        ? "#EF1E1E" 
        : appointment.Status.toLowerCase() === "pending" 
        ? "#E2B93B" 
        : appointment.Status.toLowerCase() === "confirmed" 
        ? "#27AE60" 
        : appointment.Status.toLowerCase() === "rescheduled" 
        ? "#17a2b8" 
        : "#3B28CC",
    };
  });

  const renderEventContent = (eventInfo: any) => {
    const { image, patientName } = eventInfo.event.extendedProps;
    const hasImage = !!image;
    
    const getInitials = (name: string): string => {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {hasImage ? (
          <ImageWithBasePath
            src={image}
            alt={patientName}
            className="avatar-xs rounded-circle"
            style={{ width: "20px", height: "20px" }}
          />
        ) : (
          <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#3B28CC",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            {getInitials(patientName || "?")}
          </span>
        )}
        <span style={{ fontSize: "11px", marginLeft: "4px" }}>
          {patientName}
        </span>
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setModalOpen(true);
    if (onEventClick) {
      onEventClick(clickInfo.event.extendedProps.appointment);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="card mb-0">
      <div className="card-body">
        <div id="calendar" className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{
              start: "today,prev,next",
              center: "title",
              end: "dayGridMonth,dayGridWeek,timeGridDay",
            }}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            ref={calendarRef}
            height="auto"
          />

          {selectedEvent && (
            <div
              className={`modal fade ${modalOpen ? "show d-block" : ""}`}
              tabIndex={-1}
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={closeModal}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Appointment Details</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    {selectedEvent.extendedProps.appointment && (
                      <div>
                        <p>
                          <strong>Patient:</strong>{" "}
                          {selectedEvent.extendedProps.patientName}
                        </p>
                        <p>
                          <strong>Date & Time:</strong>{" "}
                          {selectedEvent.extendedProps.appointment.Date_Time}
                        </p>
                        <p>
                          <strong>Mode:</strong>{" "}
                          {selectedEvent.extendedProps.mode}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          {selectedEvent.extendedProps.status}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {selectedEvent.extendedProps.phone}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;

