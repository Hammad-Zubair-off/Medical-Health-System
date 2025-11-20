import { type Dayjs } from "dayjs";

export interface ScheduleRow {
  id: number;
  from: Dayjs | null;
  to: Dayjs | null;
}

export interface Holiday {
  id: string;
  date: Dayjs | null;
  reason: string;
}

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
