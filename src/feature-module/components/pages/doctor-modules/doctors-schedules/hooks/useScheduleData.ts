import { useState, useEffect, useCallback } from "react";
import { Timestamp } from "firebase/firestore";
import { 
  getDoctorDataByUserId, 
  updateDoctorSchedule, 
  type DoctorTimeSlots,
  type DoctorHoliday,
  type DoctorEnabledDays
} from "../../../../../../core/services/firestore/doctor.service";
import { timestampToDayjs, checkValidTimeRange, hasValidTimeRange } from "../utils";
import type { ScheduleRow, Holiday, DayKey } from "../types";
import { DAYS } from "../types";

interface UseScheduleDataProps {
  doctorUserId: string | null;
  schedules: Record<DayKey, ScheduleRow[]>;
  enabledDays: DoctorEnabledDays;
  holidays: Holiday[];
  updateDaySchedule: (day: DayKey, schedules: ScheduleRow[]) => void;
  setEnabledDays: React.Dispatch<React.SetStateAction<DoctorEnabledDays>>;
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  setError: (error: string | null) => void;
}

export const useScheduleData = ({
  doctorUserId,
  schedules,
  enabledDays,
  holidays,
  updateDaySchedule,
  setEnabledDays,
  setHolidays,
  setError,
}: UseScheduleDataProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing schedule data
  const fetchSchedule = useCallback(async () => {
    if (!doctorUserId) {
      setError("Doctor user ID not found");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const doctorData = await getDoctorDataByUserId(doctorUserId);
      
      if (doctorData?.time_slots) {
        const timeSlots = doctorData.time_slots;
        
        DAYS.forEach((dayKey) => {
          const startKey = `${dayKey}Start` as keyof DoctorTimeSlots;
          const endKey = `${dayKey}End` as keyof DoctorTimeSlots;
          const startTime = timestampToDayjs(timeSlots[startKey] as Timestamp | Date | undefined);
          const endTime = timestampToDayjs(timeSlots[endKey] as Timestamp | Date | undefined);
          
          // Only load times if they are valid (not 0:00)
          if (checkValidTimeRange(startTime, endTime)) {
            updateDaySchedule(dayKey, [{
              id: Date.now() + Math.random(),
              from: startTime,
              to: endTime,
            }]);
            // If time slots exist and are valid, mark day as enabled
            setEnabledDays(prev => ({ ...prev, [dayKey]: true }));
          } else if (startTime || endTime) {
            // If times exist but are 0:00, still mark as enabled but don't set times
            setEnabledDays(prev => ({ ...prev, [dayKey]: true }));
            updateDaySchedule(dayKey, [{
              id: Date.now() + Math.random(),
              from: null,
              to: null,
            }]);
          }
        });

        // Load enabled days from database
        if (doctorData.enabled_days) {
          setEnabledDays(prev => ({ ...prev, ...doctorData.enabled_days }));
        }

        // Load holidays from database
        if (doctorData.holidays && Array.isArray(doctorData.holidays)) {
          const loadedHolidays: Holiday[] = doctorData.holidays.map((holiday: DoctorHoliday) => ({
            id: holiday.id,
            date: timestampToDayjs(holiday.date as Timestamp | Date | undefined),
            reason: holiday.reason,
          }));
          setHolidays(loadedHolidays);
        }
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err instanceof Error ? err.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [doctorUserId, updateDaySchedule, setEnabledDays, setHolidays, setError]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorUserId) {
      setError("Doctor user ID not found");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Convert schedule rows to time slots format (only for enabled days)
      const timeSlots: DoctorTimeSlots = {};

      const processDay = (dayKey: DayKey, isEnabled: boolean) => {
        if (!isEnabled) return; // Skip disabled days
        
        const daySchedules = schedules[dayKey];
        const firstSchedule = daySchedules[0];
        
        // Create a date with today's date
        const today = new Date();
        let startTime: Date;
        let endTime: Date;
        
        if (firstSchedule?.from && firstSchedule?.to && hasValidTimeRange(firstSchedule.from, firstSchedule.to)) {
          // Valid times are set
          const startDate = firstSchedule.from.toDate();
          const endDate = firstSchedule.to.toDate();
          
          startTime = new Date(today);
          startTime.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
          
          endTime = new Date(today);
          endTime.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
        } else {
          // No valid time set - save as 0:00 (midnight) for both start and end
          startTime = new Date(today);
          startTime.setHours(0, 0, 0, 0);
          
          endTime = new Date(today);
          endTime.setHours(0, 0, 0, 0);
        }

        timeSlots[`${dayKey}Start` as keyof DoctorTimeSlots] = Timestamp.fromDate(startTime);
        timeSlots[`${dayKey}End` as keyof DoctorTimeSlots] = Timestamp.fromDate(endTime);
      };

      DAYS.forEach(dayKey => {
        processDay(dayKey, enabledDays[dayKey] || false);
      });

      // Convert holidays to DoctorHoliday format
      const doctorHolidays: DoctorHoliday[] = holidays.map(holiday => ({
        id: holiday.id,
        date: holiday.date ? holiday.date.toDate() : new Date(),
        reason: holiday.reason,
      }));

      await updateDoctorSchedule(doctorUserId, timeSlots, enabledDays, doctorHolidays);
      setSuccessMessage("Schedule saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err instanceof Error ? err.message : "Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    successMessage,
    setSuccessMessage,
    fetchSchedule,
    handleSubmit,
  };
};

