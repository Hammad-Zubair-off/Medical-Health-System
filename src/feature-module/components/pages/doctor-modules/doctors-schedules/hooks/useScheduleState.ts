import { useState, useCallback } from "react";
import { type Dayjs } from "dayjs";
import type { ScheduleRow, DayKey } from "../types";

interface DaySchedules {
  monday: ScheduleRow[];
  tuesday: ScheduleRow[];
  wednesday: ScheduleRow[];
  thursday: ScheduleRow[];
  friday: ScheduleRow[];
  saturday: ScheduleRow[];
  sunday: ScheduleRow[];
}

export const useScheduleState = () => {
  const [schedules, setSchedules] = useState<DaySchedules>({
    monday: [{ id: Date.now(), from: null, to: null }],
    tuesday: [{ id: Date.now() + 1, from: null, to: null }],
    wednesday: [{ id: Date.now() + 2, from: null, to: null }],
    thursday: [{ id: Date.now() + 3, from: null, to: null }],
    friday: [{ id: Date.now() + 4, from: null, to: null }],
    saturday: [{ id: Date.now() + 5, from: null, to: null }],
    sunday: [{ id: Date.now() + 6, from: null, to: null }],
  });

  const getDaySchedule = useCallback((day: DayKey): ScheduleRow[] => {
    return schedules[day];
  }, [schedules]);

  const updateDaySchedule = useCallback((day: DayKey, newSchedules: ScheduleRow[]) => {
    setSchedules(prev => ({ ...prev, [day]: newSchedules }));
  }, []);

  const handleTimeChange = useCallback((
    day: DayKey,
    rowId: number,
    field: 'from' | 'to',
    time: Dayjs | null
  ) => {
    setSchedules(prev => ({
      ...prev,
      [day]: prev[day].map(row =>
        row.id === rowId ? { ...row, [field]: time } : row
      ),
    }));
  }, []);

  const handleAddSchedule = useCallback((day: DayKey) => {
    const newRow: ScheduleRow = {
      id: Date.now() + Math.random(),
      from: null,
      to: null,
    };
    setSchedules(prev => ({
      ...prev,
      [day]: [...prev[day], newRow],
    }));
  }, []);

  const handleDeleteSchedule = useCallback((day: DayKey, id: number) => {
    setSchedules(prev => ({
      ...prev,
      [day]: prev[day].filter((row) => row.id !== id),
    }));
  }, []);

  return {
    schedules,
    getDaySchedule,
    updateDaySchedule,
    handleTimeChange,
    handleAddSchedule,
    handleDeleteSchedule,
  };
};

