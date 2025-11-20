import { doc, getDoc, collection, query, where, getDocs, Timestamp, updateDoc } from "firebase/firestore";
// @ts-expect-error - Firebase config file (JS file, no types)
import { db } from "../../../firebase";

export interface DoctorTimeSlots {
  mondayStart?: Timestamp | Date;
  mondayEnd?: Timestamp | Date;
  tuesdayStart?: Timestamp | Date;
  tuesdayEnd?: Timestamp | Date;
  wednesdayStart?: Timestamp | Date;
  wednesdayEnd?: Timestamp | Date;
  thursdayStart?: Timestamp | Date;
  thursdayEnd?: Timestamp | Date;
  fridayStart?: Timestamp | Date;
  fridayEnd?: Timestamp | Date;
  saturdayStart?: Timestamp | Date;
  saturdayEnd?: Timestamp | Date;
  sundayStart?: Timestamp | Date;
  sundayEnd?: Timestamp | Date;
}

export interface DoctorHoliday {
  id: string;
  date: Timestamp | Date;
  reason: string;
}

export interface DoctorEnabledDays {
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
}

export interface DoctorData {
  _id?: string;
  specialization?: string;
  time_slots?: DoctorTimeSlots;
  enabled_days?: DoctorEnabledDays;
  holidays?: DoctorHoliday[];
  [key: string]: unknown;
}

/**
 * Fetch doctor data from Doctor collection by doctorId
 * @param doctorId - The doctor's document ID in the Doctor collection
 * @returns Doctor data including time slots
 */
export const getDoctorData = async (doctorId: string): Promise<DoctorData | null> => {
  try {
    if (!doctorId) {
      console.error("❌ [Doctor Service] doctorId is empty or undefined");
      return null;
    }

    const doctorRef = doc(db, "Doctor", doctorId);
    const doctorDoc = await getDoc(doctorRef);

    if (!doctorDoc.exists()) {
      console.warn(`⚠️ [Doctor Service] Doctor document with ID ${doctorId} does not exist`);
      return null;
    }

    const doctorData = {
      _id: doctorDoc.id,
      ...doctorDoc.data(),
    } as DoctorData;

    console.log("✅ [Doctor Service] Successfully fetched doctor data:", {
      id: doctorData._id,
      hasTimeSlots: !!doctorData.time_slots,
      timeSlotsKeys: doctorData.time_slots ? Object.keys(doctorData.time_slots) : [],
    });

    return doctorData;
  } catch (error) {
    console.error("❌ [Doctor Service] Error fetching doctor data:", error);
    if (error instanceof Error) {
      console.error("❌ [Doctor Service] Error message:", error.message);
      console.error("❌ [Doctor Service] Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * Fetch doctor data from Doctor collection by doctorUserId (userid field)
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @returns Doctor data including time slots
 */
export const getDoctorDataByUserId = async (doctorUserId: string): Promise<DoctorData | null> => {
  try {
    if (!doctorUserId) {
      console.error("❌ [Doctor Service] doctorUserId is empty or undefined");
      return null;
    }

    console.log("🔍 [Doctor Service] Fetching doctor data by userid:", doctorUserId);

    const doctorsRef = collection(db, "Doctor");
    const doctorUserRef = doc(db, "Users", doctorUserId);
    
    const q = query(doctorsRef, where("userid", "==", doctorUserRef));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`⚠️ [Doctor Service] No doctor found with userid: ${doctorUserId}`);
      return null;
    }

    // Get the first matching doctor document
    const doctorDoc = querySnapshot.docs[0];
    const doctorData = {
      _id: doctorDoc.id,
      ...doctorDoc.data(),
    } as DoctorData;

    console.log("✅ [Doctor Service] Successfully fetched doctor data by userid:", {
      id: doctorData._id,
      hasTimeSlots: !!doctorData.time_slots,
      timeSlotsKeys: doctorData.time_slots ? Object.keys(doctorData.time_slots) : [],
    });

    // Log the actual time_slots structure for debugging
    if (doctorData.time_slots) {
      console.log("📋 [Doctor Service] Time slots structure:", doctorData.time_slots);
      console.log("📋 [Doctor Service] Time slots type:", typeof doctorData.time_slots);
      console.log("📋 [Doctor Service] All time_slots keys:", Object.keys(doctorData.time_slots));
      console.log("📋 [Doctor Service] Raw time_slots object:", JSON.stringify(doctorData.time_slots, null, 2));
      
      // Check for start times explicitly
      const timeSlots = doctorData.time_slots as Record<string, unknown>;
      console.log("📋 [Doctor Service] mondayStart exists:", 'mondayStart' in timeSlots, timeSlots.mondayStart);
      console.log("📋 [Doctor Service] mondayEnd exists:", 'mondayEnd' in timeSlots, timeSlots.mondayEnd);
      console.log("📋 [Doctor Service] All properties:", Object.getOwnPropertyNames(timeSlots));
      
      // Try accessing with bracket notation
      console.log("📋 [Doctor Service] mondayStart (bracket):", timeSlots['mondayStart']);
      console.log("📋 [Doctor Service] mondayEnd (bracket):", timeSlots['mondayEnd']);
    }

    return doctorData;
  } catch (error) {
    console.error("❌ [Doctor Service] Error fetching doctor data by userid:", error);
    if (error instanceof Error) {
      console.error("❌ [Doctor Service] Error message:", error.message);
      console.error("❌ [Doctor Service] Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * Check if a specific date is a holiday for a doctor
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @param date - The date to check (Date object or Timestamp)
 * @returns true if the date is a holiday, false otherwise
 */
export const isHoliday = async (
  doctorUserId: string,
  date: Date | Timestamp
): Promise<boolean> => {
  try {
    const doctorData = await getDoctorDataByUserId(doctorUserId);
    
    if (!doctorData?.holidays || !Array.isArray(doctorData.holidays)) {
      return false;
    }

    // Convert input date to Date for comparison
    let checkDate: Date;
    if (date instanceof Timestamp) {
      checkDate = date.toDate();
    } else if (date instanceof Date) {
      checkDate = date;
    } else {
      return false;
    }

    // Normalize to start of day for comparison (ignore time)
    const checkDateStart = new Date(checkDate);
    checkDateStart.setHours(0, 0, 0, 0);

    // Check if any holiday matches this date
    return doctorData.holidays.some((holiday: DoctorHoliday) => {
      let holidayDate: Date;
      if (holiday.date instanceof Timestamp) {
        holidayDate = holiday.date.toDate();
      } else if (holiday.date instanceof Date) {
        holidayDate = holiday.date;
      } else {
        return false;
      }

      // Normalize holiday date to start of day
      const holidayDateStart = new Date(holidayDate);
      holidayDateStart.setHours(0, 0, 0, 0);

      // Compare dates (year, month, day only)
      return (
        checkDateStart.getFullYear() === holidayDateStart.getFullYear() &&
        checkDateStart.getMonth() === holidayDateStart.getMonth() &&
        checkDateStart.getDate() === holidayDateStart.getDate()
      );
    });
  } catch (error) {
    console.error("Error checking holiday:", error);
    // Return false on error to allow appointment creation (fail-safe)
    return false;
  }
};

/**
 * Check if a specific date is available for appointments (not a holiday)
 * This is a convenience function that returns the inverse of isHoliday
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @param date - The date to check (Date object or Timestamp)
 * @returns true if the date is available (not a holiday), false if it's a holiday
 */
export const isDateAvailable = async (
  doctorUserId: string,
  date: Date | Timestamp
): Promise<boolean> => {
  const holiday = await isHoliday(doctorUserId, date);
  return !holiday;
};

/**
 * Update doctor schedule (time_slots, enabled_days, holidays) in Doctor collection by doctorUserId
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @param timeSlots - The time slots to update
 * @param enabledDays - The enabled days configuration
 * @param holidays - The holidays list
 * @returns Updated doctor data
 */
export const updateDoctorSchedule = async (
  doctorUserId: string,
  timeSlots: DoctorTimeSlots,
  enabledDays?: DoctorEnabledDays,
  holidays?: DoctorHoliday[]
): Promise<void> => {
  try {
    if (!doctorUserId) {
      console.error("❌ [Doctor Service] doctorUserId is empty or undefined");
      throw new Error("doctorUserId is required");
    }

    console.log("🔍 [Doctor Service] Updating doctor schedule by userid:", doctorUserId);

    const doctorsRef = collection(db, "Doctor");
    const doctorUserRef = doc(db, "Users", doctorUserId);
    
    const q = query(doctorsRef, where("userid", "==", doctorUserRef));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`⚠️ [Doctor Service] No doctor found with userid: ${doctorUserId}`);
      throw new Error(`No doctor found with userid: ${doctorUserId}`);
    }

    // Get the first matching doctor document
    const doctorDoc = querySnapshot.docs[0];
    const doctorRef = doc(db, "Doctor", doctorDoc.id);

    // Convert Date objects to Timestamp if needed
    const timeSlotsToUpdate: Record<string, Timestamp> = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const startKey = `${day}Start` as keyof DoctorTimeSlots;
      const endKey = `${day}End` as keyof DoctorTimeSlots;
      
      if (timeSlots[startKey]) {
        const startValue = timeSlots[startKey];
        if (startValue instanceof Date) {
          timeSlotsToUpdate[startKey] = Timestamp.fromDate(startValue);
        } else if (startValue instanceof Timestamp) {
          timeSlotsToUpdate[startKey] = startValue;
        }
      }
      
      if (timeSlots[endKey]) {
        const endValue = timeSlots[endKey];
        if (endValue instanceof Date) {
          timeSlotsToUpdate[endKey] = Timestamp.fromDate(endValue);
        } else if (endValue instanceof Timestamp) {
          timeSlotsToUpdate[endKey] = endValue;
        }
      }
    });

    const updateData: Record<string, unknown> = {
      time_slots: timeSlotsToUpdate,
    };

    // Add enabled days if provided
    if (enabledDays) {
      updateData.enabled_days = enabledDays;
    }

    // Add holidays if provided (convert dates to Timestamps)
    if (holidays) {
      const holidaysToUpdate = holidays.map(holiday => ({
        id: holiday.id,
        date: holiday.date instanceof Date 
          ? Timestamp.fromDate(holiday.date)
          : holiday.date instanceof Timestamp
          ? holiday.date
          : Timestamp.fromDate(new Date(holiday.date)),
        reason: holiday.reason,
      }));
      updateData.holidays = holidaysToUpdate;
    }

    await updateDoc(doctorRef, updateData);

    console.log("✅ [Doctor Service] Successfully updated doctor schedule");
  } catch (error) {
    console.error("❌ [Doctor Service] Error updating doctor schedule:", error);
    if (error instanceof Error) {
      console.error("❌ [Doctor Service] Error message:", error.message);
      console.error("❌ [Doctor Service] Error stack:", error.stack);
    }
    throw error;
  }
};

