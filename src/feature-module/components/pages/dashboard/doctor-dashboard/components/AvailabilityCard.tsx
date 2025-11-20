import { Link } from "react-router";
import { all_routes } from "../../../../../routes/all_routes";

interface AvailabilitySchedule {
  monday?: { start: string; end: string } | null;
  tuesday?: { start: string; end: string } | null;
  wednesday?: { start: string; end: string } | null;
  thursday?: { start: string; end: string } | null;
  friday?: { start: string; end: string } | null;
  saturday?: { start: string; end: string } | null;
  sunday?: { start: string; end: string } | null;
}

interface AvailabilityCardProps {
  schedule?: AvailabilitySchedule;
}

interface DaySchedule {
  day: string;
  dayKey: keyof AvailabilitySchedule;
  time: string;
  isClosed: boolean;
}

const AvailabilityCard = ({ schedule = {} }: AvailabilityCardProps) => {
  // Convert schedule to display format
  const getScheduleData = (): DaySchedule[] => {
    const days: DaySchedule[] = [
      { day: "Mon", dayKey: "monday", time: "", isClosed: false },
      { day: "Tue", dayKey: "tuesday", time: "", isClosed: false },
      { day: "Wed", dayKey: "wednesday", time: "", isClosed: false },
      { day: "Thu", dayKey: "thursday", time: "", isClosed: false },
      { day: "Fri", dayKey: "friday", time: "", isClosed: false },
      { day: "Sat", dayKey: "saturday", time: "", isClosed: false },
      { day: "Sun", dayKey: "sunday", time: "", isClosed: false },
    ];

    return days.map((day) => {
      const daySchedule = schedule[day.dayKey];
      // Check if day is null (not enabled or times not set)
      if (daySchedule === null || !daySchedule || !daySchedule.start || !daySchedule.end) {
        return { ...day, time: "Closed", isClosed: true };
      }
      return {
        ...day,
        time: `${daySchedule.start} - ${daySchedule.end}`,
        isClosed: false,
      };
    });
  };

  const scheduleData = getScheduleData();

  return (
    <div className="col-xl-4 d-flex">
      <div className="card shadow-sm flex-fill w-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">Availability</h5>
        </div>
        <div className="card-body">
          {scheduleData.map((scheduleItem, index) => (
            <div
              key={scheduleItem.day}
              className={`d-flex align-items-center justify-content-between mb-2 ${
                index < scheduleData.length - 1 ? "border-bottom pb-2" : "pb-2"
              }`}
            >
              <p className="text-dark fw-semibold mb-0">{scheduleItem.day}</p>
              <p
                className={`mb-0 d-inline-flex align-items-center ${
                  scheduleItem.isClosed ? "text-danger" : "text-dark"
                }`}
              >
                <i className={`ti ti-clock me-1 ${scheduleItem.isClosed ? "text-danger" : "text-muted"}`} />
                {scheduleItem.time}
              </p>
            </div>
          ))}
          <Link to={all_routes.doctorschedule} className="btn btn-light w-100 mt-2 fs-13">
            Edit Availability
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCard;

