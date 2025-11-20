import { useState } from "react";
import { type Dayjs } from "dayjs";
import type { Holiday } from "../types";

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState<Dayjs | null>(null);
  const [newHolidayReason, setNewHolidayReason] = useState<string>("");

  const handleAddHoliday = (onError: (message: string) => void) => {
    if (!newHolidayDate || !newHolidayReason.trim()) {
      onError("Please provide both date and reason for the holiday");
      return;
    }

    const newHoliday: Holiday = {
      id: `holiday-${Date.now()}`,
      date: newHolidayDate,
      reason: newHolidayReason.trim(),
    };

    setHolidays(prev => [...prev, newHoliday]);
    setNewHolidayDate(null);
    setNewHolidayReason("");
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(holiday => holiday.id !== id));
  };

  return {
    holidays,
    setHolidays,
    newHolidayDate,
    setNewHolidayDate,
    newHolidayReason,
    setNewHolidayReason,
    handleAddHoliday,
    handleDeleteHoliday,
  };
};

