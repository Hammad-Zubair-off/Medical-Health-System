import { Link } from "react-router";
import type { MouseEvent } from "react";

interface ActionMenuProps {
  appointmentId: string;
  currentStatus?: string;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onReschedule?: (id: string) => void;
}

const ActionMenu = ({
  appointmentId,
  currentStatus,
  onEdit,
  onView,
  onStatusChange,
  onReschedule,
}: ActionMenuProps) => {
  const statusLower = (currentStatus || "").toLowerCase();
  
  // Determine which actions are available based on current status
  // Flow: Pending → Accept (becomes Confirmed) → Complete/Cancel/Reschedule
  // Once Completed or Cancelled, only View is available
  
  const isCompleted = statusLower === "completed" || statusLower === "complete";
  const isCancelled = statusLower === "cancelled" || statusLower === "cancel";
  const isFinalState = isCompleted || isCancelled;
  
  // Pending: Can Accept (which becomes Confirmed)
  const canAccept = statusLower === "pending";
  
  // Confirmed/Rescheduled: Can Complete, Cancel, or Reschedule
  const isConfirmed = statusLower === "confirmed" || statusLower === "accept" || statusLower === "accepted" || statusLower === "rescheduled";
  const canComplete = isConfirmed;
  const canCancel = isConfirmed;
  const canReschedule = isConfirmed;
  
  // Edit is only available for Pending, Confirmed, and Rescheduled (not for Completed/Cancelled)
  const canEdit = !isFinalState;

  const handleStatusChange = (e: MouseEvent, status: string) => {
    e.preventDefault();
    if (onStatusChange) {
      onStatusChange(appointmentId, status);
    }
  };

  const handleReschedule = (e: MouseEvent) => {
    e.preventDefault();
    if (onReschedule) {
      onReschedule(appointmentId);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.preventDefault();
    if (onEdit) {
      onEdit(appointmentId);
    } else {
      const offcanvas = document.getElementById("edit_appointment");
      if (offcanvas) {
        const win = window as unknown as {
          bootstrap?: {
            Offcanvas: {
              new (element: HTMLElement): { show: () => void };
            };
          };
        };
        if (win.bootstrap) {
          const bsOffcanvas = new win.bootstrap.Offcanvas(offcanvas);
          bsOffcanvas.show();
        }
      }
    }
  };

  const handleView = (e: MouseEvent) => {
    e.preventDefault();
    if (onView) {
      onView(appointmentId);
    } else {
      const offcanvas = document.getElementById("view_details");
      if (offcanvas) {
        const win = window as unknown as {
          bootstrap?: {
            Offcanvas: {
              new (element: HTMLElement): { show: () => void };
            };
          };
        };
        if (win.bootstrap) {
          const bsOffcanvas = new win.bootstrap.Offcanvas(offcanvas);
          bsOffcanvas.show();
        }
      }
    }
  };


  return (
    <div className="action-item">
      <Link to="#" data-bs-toggle="dropdown">
        <i className="ti ti-dots-vertical" />
      </Link>
      <ul className="dropdown-menu p-2">
        {/* View - Always available */}
        <li>
          <Link
            to="#"
            className="dropdown-item d-flex align-items-center"
            onClick={handleView}
            data-bs-toggle="offcanvas"
            data-bs-target="#view_details"
          >
            <i className="ti ti-eye me-2" />
            View
          </Link>
        </li>
        
        {/* Edit - Only for Pending and Confirmed */}
        {canEdit && (
          <li>
            <Link
              to="#"
              className="dropdown-item d-flex align-items-center"
              onClick={handleEdit}
              data-bs-toggle="offcanvas"
              data-bs-target="#edit_appointment"
            >
              <i className="ti ti-edit me-2" />
              Edit
            </Link>
          </li>
        )}
        
        {/* Status Actions - Only show divider if there are status actions */}
        {(canAccept || canComplete || canCancel || canReschedule) && (
          <li>
            <hr className="dropdown-divider" />
          </li>
        )}
        
        {/* Pending: Accept (becomes Confirmed) */}
        {canAccept && (
          <li>
            <Link
              to="#"
              className="dropdown-item d-flex align-items-center text-success"
              onClick={(e) => handleStatusChange(e, "accept")}
            >
              <i className="ti ti-check me-2" />
              Accept
            </Link>
          </li>
        )}
        
        {/* Confirmed: Complete, Cancel, Reschedule */}
        {canComplete && (
          <li>
            <Link
              to="#"
              className="dropdown-item d-flex align-items-center text-primary"
              onClick={(e) => handleStatusChange(e, "complete")}
            >
              <i className="ti ti-circle-check me-2" />
              Complete
            </Link>
          </li>
        )}
        {canCancel && (
          <li>
            <Link
              to="#"
              className="dropdown-item d-flex align-items-center text-danger"
              onClick={(e) => handleStatusChange(e, "cancel")}
            >
              <i className="ti ti-x me-2" />
              Cancel
            </Link>
          </li>
        )}
        {canReschedule && (
          <li>
            <Link
              to="#"
              className="dropdown-item d-flex align-items-center text-info"
              onClick={handleReschedule}
            >
              <i className="ti ti-calendar-event me-2" />
              Reschedule
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ActionMenu;

