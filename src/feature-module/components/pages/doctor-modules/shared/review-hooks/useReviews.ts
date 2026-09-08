import { useState, useCallback, useMemo, useEffect } from "react";
import type { Review, ReviewFilters } from "../review-types";
import { getDoctorReviews, type FirestoreReview } from "../../../../../../core/services/firestore/reviews.service";
import { useAuth } from "../../../../../../core/context/AuthContext";
import { Timestamp } from "firebase/firestore";

export interface UseReviewsReturn {
  reviews: Review[];
  filteredReviews: Review[];
  loading: boolean;
  error: string | null;
  applyFilters: (filters: ReviewFilters) => void;
  applySort: (sortBy: string) => void;
  currentFilters: ReviewFilters;
  currentSort: string;
}

// Helper to convert Firestore review to UI Review format
const convertFirestoreToReview = (
  firestoreReview: FirestoreReview & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } }
): Review => {
  // Format date
  const formatDate = (date: Timestamp | Date | string | undefined): string => {
    if (!date) return new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    
    let dateObj: Date;
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const patientName = firestoreReview.reviewedBy || 
                     firestoreReview.reviewed_by || 
                     firestoreReview.patient?.display_name || 
                     "Unknown Patient";
  
  const patientImage = firestoreReview.patient?.photo_url || undefined;
  const rating = firestoreReview.rating || 0;
  // Priority: comment (which should already contain description from service) > review > empty
  const comment = firestoreReview.comment || firestoreReview.review || "";
  const date = formatDate(
    firestoreReview.createdAt || 
    firestoreReview.created || 
    firestoreReview.created_at || 
    firestoreReview.date
  );
  
  console.log(`🔄 [useReviews Hook] Converting review:`, {
    id: firestoreReview._id,
    rating,
    commentLength: comment.length,
    commentPreview: comment.substring(0, 50),
    patientName,
  });

  return {
    id: firestoreReview._id || "",
    patientName,
    patientImage,
    rating,
    comment,
    date,
    appointmentId: firestoreReview.appointmentId,
  };
};

export const useReviews = (): UseReviewsReturn => {
  const { doctorUserId } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ReviewFilters>({});
  const [currentSort, setCurrentSort] = useState<string>("recent");

  // Fetch reviews from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      console.log("🔄 [useReviews Hook] Starting to fetch reviews...");
      console.log("🔄 [useReviews Hook] doctorUserId:", doctorUserId);
      
      if (!doctorUserId) {
        console.warn("⚠️ [useReviews Hook] No doctorUserId provided, skipping fetch");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("📡 [useReviews Hook] Calling getDoctorReviews...");
        
        const reviewsWithPatients = await getDoctorReviews(doctorUserId);
        console.log("📦 [useReviews Hook] Raw reviews from Firestore:", reviewsWithPatients);
        console.log("📦 [useReviews Hook] Number of reviews:", reviewsWithPatients.length);
        
        const convertedReviews = reviewsWithPatients.map((review, index) => {
          const converted = convertFirestoreToReview(review);
          console.log(`🔄 [useReviews Hook] Converted review ${index + 1}:`, converted);
          return converted;
        });
        
        console.log("✅ [useReviews Hook] All converted reviews:", convertedReviews);
        setReviews(convertedReviews);
        console.log("✅ [useReviews Hook] Reviews state updated with", convertedReviews.length, "reviews");
      } catch (err) {
        console.error("❌ [useReviews Hook] Error fetching reviews:", err);
        if (err instanceof Error) {
          console.error("❌ [useReviews Hook] Error message:", err.message);
          console.error("❌ [useReviews Hook] Error stack:", err.stack);
        }
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
        console.log("🏁 [useReviews Hook] Fetch completed, loading set to false");
      }
    };

    fetchReviews();
  }, [doctorUserId]);

  // Apply filters
  const applyFilters = useCallback((filters: ReviewFilters) => {
    setCurrentFilters(filters);
  }, []);

  // Apply sort
  const applySort = useCallback((sortBy: string) => {
    setCurrentSort(sortBy);
  }, []);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    console.log("🔍 [useReviews Hook] Filtering reviews...");
    console.log("🔍 [useReviews Hook] Total reviews:", reviews.length);
    console.log("🔍 [useReviews Hook] Current filters:", currentFilters);
    console.log("🔍 [useReviews Hook] Current sort:", currentSort);
    
    let filtered = [...reviews];
    console.log("🔍 [useReviews Hook] Starting with", filtered.length, "reviews");

    // Apply filters
    if (currentFilters.rating && currentFilters.rating.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((review) =>
        currentFilters.rating?.includes(review.rating)
      );
      console.log(`⭐ [useReviews Hook] Rating filter: ${beforeCount} → ${filtered.length}`);
    }
    if (currentFilters.date) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((review) => {
        const reviewDateStr = review.date.toLowerCase();
        const filterDateStr = currentFilters.date!.toLowerCase();
        return reviewDateStr.includes(filterDateStr);
      });
      console.log(`📅 [useReviews Hook] Date filter: ${beforeCount} → ${filtered.length}`);
    }
    if (currentFilters.search && currentFilters.search.trim()) {
      const beforeCount = filtered.length;
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.patientName.toLowerCase().includes(searchLower) ||
          review.comment.toLowerCase().includes(searchLower)
      );
      console.log(`🔎 [useReviews Hook] Search filter: ${beforeCount} → ${filtered.length}`);
    }

    // Apply sorting
    switch (currentSort) {
      case "recent":
        filtered.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    console.log("✅ [useReviews Hook] Filtered reviews count:", filtered.length);
    return filtered;
  }, [reviews, currentFilters, currentSort]);

  return {
    reviews,
    filteredReviews,
    loading,
    error,
    applyFilters,
    applySort,
    currentFilters,
    currentSort,
  };
};

