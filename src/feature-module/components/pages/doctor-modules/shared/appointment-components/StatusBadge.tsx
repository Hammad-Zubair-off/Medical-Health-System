interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Completed - Green (solid background for prominence)
    if (statusLower.includes("completed") || statusLower.includes("complete")) {
      return {
        badgeClass: "bg-success",
        textClass: "text-white",
      };
    }
    
    // Confirmed/Accepted - Blue (distinct from completed)
    if (statusLower.includes("confirmed") || statusLower.includes("accept") || statusLower.includes("accepted")) {
      return {
        badgeClass: "bg-primary",
        textClass: "text-white",
      };
    }
    
    // Pending - Orange/Warning (more prominent yellow)
    if (statusLower.includes("pending")) {
      return {
        badgeClass: "bg-warning",
        textClass: "text-dark",
      };
    }
    
    // Rescheduled - Info/Cyan (distinct blue)
    if (statusLower.includes("rescheduled") || statusLower.includes("reschedule")) {
      return {
        badgeClass: "bg-info",
        textClass: "text-white",
      };
    }
    
    // Checked Out - Secondary/Gray
    if (statusLower.includes("checked out") || statusLower.includes("checked-out")) {
      return {
        badgeClass: "bg-secondary",
        textClass: "text-white",
      };
    }
    
    // Checked In - Warning/Yellow
    if (statusLower.includes("checked in") || statusLower.includes("checked-in") || statusLower.includes("checkedin")) {
      return {
        badgeClass: "bg-warning",
        textClass: "text-dark",
      };
    }
    
    // Cancelled - Red (solid background for prominence)
    if (statusLower.includes("cancelled") || statusLower.includes("cancel")) {
      return {
        badgeClass: "bg-danger",
        textClass: "text-white",
      };
    }
    
    // Default - Pending (Orange/Warning)
    return {
      badgeClass: "bg-warning",
      textClass: "text-dark",
    };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`badge ${config.badgeClass} ${config.textClass} fw-semibold fs-12 px-3 py-1 ${className}`}
      style={{ borderRadius: "20px" }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

