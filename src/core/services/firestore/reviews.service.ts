import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  DocumentReference,
  doc,
} from "firebase/firestore";
// @ts-expect-error - Firebase config file (JS file, no types)
import { db } from "../../../firebase";
import { getPatientData } from "./appointments.service";

// Review interface matching Firestore schema
// Reviews are stored as nested objects within Appointment documents
export interface FirestoreReview {
  _id?: string;
  doctorUserId?: DocumentReference | string;
  doctorId?: DocumentReference | string;
  patientUserId?: DocumentReference | string;
  appointmentId?: string;
  rating?: number;
  comment?: string;
  review?: string; // Alternative field name
  reviewedBy?: string;
  reviewed_by?: string; // Alternative field name
  Reviewed_By?: string; // Alternative field name
  Rating?: number; // Alternative field name
  Comment?: string; // Alternative field name
  Review?: string; // Alternative field name
  Date?: string; // Alternative field name
  createdAt?: Timestamp | Date;
  created?: Timestamp | Date;
  created_at?: Timestamp | Date;
  date?: string;
}

// User interface for patient data (reuse from appointments)
export interface PatientData {
  uid: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url?: string;
}

/**
 * Fetch reviews for a specific doctor from Appointment collection
 * Reviews are stored as a nested field within Appointment documents
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @returns Array of reviews with patient information
 */
export const getDoctorReviews = async (
  doctorUserId: string
): Promise<(FirestoreReview & { patient?: PatientData; appointmentId?: string })[]> => {
  console.log("🔍 [Reviews Service] Starting to fetch reviews from Appointment collection for doctorUserId:", doctorUserId);
  
  if (!doctorUserId) {
    console.error("❌ [Reviews Service] doctorUserId is empty or undefined");
    throw new Error("Doctor user ID is required");
  }

  try {
    // Fetch appointments for this doctor
    const appointmentsRef = collection(db, "Appointment");
    const doctorUserRef = doc(db, "Users", doctorUserId);
    console.log(`👤 [Reviews Service] Doctor User Reference:`, doctorUserRef.path);
    
    // Query appointments for this doctor
    const q = query(
      appointmentsRef,
      where("doctorUserId", "==", doctorUserRef)
    );

    const querySnapshot = await getDocs(q);
    console.log(`📊 [Reviews Service] Found ${querySnapshot.docs.length} appointments for doctor`);

    const reviews: (FirestoreReview & { patient?: PatientData; appointmentId?: string })[] = [];
    let reviewsCount = 0;

    // Process each appointment to extract reviews
    for (const docSnapshot of querySnapshot.docs) {
      const appointmentData = docSnapshot.data();
      console.log(`📄 [Reviews Service] Processing appointment:`, {
        id: docSnapshot.id,
        appointmentId: appointmentData.AppointmentId,
        hasReview: !!appointmentData.review,
        reviewData: appointmentData.review,
      });

      // Check if appointment has a review field
      if (appointmentData.review) {
        reviewsCount++;
        const reviewData = appointmentData.review;
        
        // Extract review information
        // Priority: description (main field) > comment > review > other variations
        const review: FirestoreReview = {
          _id: docSnapshot.id, // Use appointment ID as review ID
          appointmentId: reviewData.AppointmentId || appointmentData.AppointmentId || docSnapshot.id,
          rating: reviewData.rating || reviewData.Rating || 0,
          comment: reviewData.description || reviewData.Description || reviewData.comment || reviewData.Comment || reviewData.review || reviewData.Review || "",
          reviewedBy: reviewData.reviewedBy || reviewData.reviewed_by || reviewData.Reviewed_By || "",
          reviewed_by: reviewData.reviewed_by || reviewData.reviewedBy || reviewData.Reviewed_By || "",
          createdAt: reviewData.createdAt || reviewData.created || reviewData.created_at || appointmentData.created,
          created: reviewData.created || reviewData.createdAt || reviewData.created_at || appointmentData.created,
          created_at: reviewData.created_at || reviewData.createdAt || reviewData.created || appointmentData.created,
          date: reviewData.date || reviewData.Date || undefined,
          doctorUserId: appointmentData.doctorUserId,
          doctorId: appointmentData.doctorId,
          patientUserId: appointmentData.UserPatientID,
        };

        console.log(`✅ [Reviews Service] Extracted review from appointment:`, {
          appointmentId: review.appointmentId,
          rating: review.rating,
          hasComment: !!review.comment,
          commentLength: review.comment?.length || 0,
          reviewedBy: review.reviewedBy,
          reviewDataKeys: Object.keys(reviewData),
          reviewDataDescription: reviewData.description,
          reviewDataComment: reviewData.comment,
        });

        // Get patient data from appointment
        let patient: PatientData | null = null;
        let patientId: string = "";
        
        if (appointmentData.UserPatientID) {
          try {
            if (typeof appointmentData.UserPatientID === "string") {
              patientId = appointmentData.UserPatientID;
            } else {
              // Extract ID from DocumentReference
              const pathParts = (appointmentData.UserPatientID as DocumentReference).path.split("/");
              patientId = pathParts[pathParts.length - 1];
            }
            
            console.log(`👤 [Reviews Service] Fetching patient data for ID: ${patientId}`);
            patient = await getPatientData(patientId);
            console.log(`✅ [Reviews Service] Patient data fetched:`, patient?.display_name || "Not found");
          } catch (patientError) {
            console.error(`❌ [Reviews Service] Error fetching patient data:`, patientError);
            // Try to use patient data from appointment if available
            if (appointmentData.patientsName) {
              patient = {
                uid: patientId || "",
                display_name: appointmentData.patientsName,
                email: appointmentData.patientsEmail || "",
                phone_number: appointmentData.patientsNumber || "",
                photo_url: undefined,
              } as PatientData;
              console.log(`✅ [Reviews Service] Using patient data from appointment:`, patient.display_name);
            }
          }
        } else if (appointmentData.patientsName) {
          // Use patient data directly from appointment
          patient = {
            uid: patientId || "",
            display_name: appointmentData.patientsName,
            email: appointmentData.patientsEmail || "",
            phone_number: appointmentData.patientsNumber || "",
            photo_url: undefined,
          } as PatientData;
          console.log(`✅ [Reviews Service] Using patient data from appointment:`, patient.display_name);
        }

        reviews.push({
          ...review,
          patient: patient || undefined,
        });
      }
    }

    console.log(`📊 [Reviews Service] Found ${reviewsCount} reviews out of ${querySnapshot.docs.length} appointments`);

    if (reviews.length === 0) {
      console.warn(`⚠️ [Reviews Service] No reviews found in appointments. Total appointments checked: ${querySnapshot.docs.length}`);
      return [];
    }

    // Sort by date (most recent first) - in memory
    reviews.sort((a, b) => {
      const getDate = (review: FirestoreReview): number => {
        if (review.createdAt instanceof Timestamp) {
          return review.createdAt.toMillis();
        }
        if (review.created instanceof Timestamp) {
          return review.created.toMillis();
        }
        if (review.created_at instanceof Timestamp) {
          return review.created_at.toMillis();
        }
        if (review.createdAt instanceof Date) {
          return review.createdAt.getTime();
        }
        if (review.created instanceof Date) {
          return review.created.getTime();
        }
        if (review.date) {
          return new Date(review.date).getTime();
        }
        // Fallback to appointment date if available
        return 0;
      };

      return getDate(b) - getDate(a); // Descending order
    });

    console.log(`✅ [Reviews Service] Successfully fetched and processed ${reviews.length} reviews from appointments`);
    return reviews;
  } catch (error) {
    console.error("❌ [Reviews Service] Error fetching doctor reviews:", error);
    if (error instanceof Error) {
      console.error("❌ [Reviews Service] Error message:", error.message);
      console.error("❌ [Reviews Service] Error stack:", error.stack);
    }
    throw error;
  }
};

