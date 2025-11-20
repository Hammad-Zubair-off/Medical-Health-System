import dayjs, { type Dayjs } from "dayjs";
import { Timestamp } from "firebase/firestore";

// Helper function to convert Firestore Timestamp to dayjs
export const timestampToDayjs = (timestamp: Timestamp | Date | undefined): Dayjs | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return dayjs(timestamp.toDate());
  }
  if (timestamp instanceof Date) {
    return dayjs(timestamp);
  }
  return null;
};

// Helper function to check if time is 0:00 (midnight) - meaning not set
export const isTimeNotSet = (time: Dayjs | null): boolean => {
  if (!time) return true;
  const hour = time.hour();
  const minute = time.minute();
  return hour === 0 && minute === 0;
};

// Helper function to check if both start and end times are valid (not 0:00)
export const hasValidTimeRange = (from: Dayjs | null, to: Dayjs | null): boolean => {
  return from !== null && to !== null && !isTimeNotSet(from) && !isTimeNotSet(to);
};

// Helper function to check if both start and end times are valid (not 0:00)
export const checkValidTimeRange = (from: Dayjs | null, to: Dayjs | null): boolean => {
  if (!from || !to) return false;
  const fromHour = from.hour();
  const fromMinute = from.minute();
  const toHour = to.hour();
  const toMinute = to.minute();
  return !(fromHour === 0 && fromMinute === 0) && !(toHour === 0 && toMinute === 0);
};

// Get day label
export const getDayLabel = (day: string): string => {
  const labels: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  return labels[day] || day;
};

// Get modal container for date pickers
export const getModalContainer = () => {
  const modalElement = document.getElementById("modal-datepicker");
  return modalElement ? modalElement : document.body;
};

