export interface Review {
  id: string;
  patientName: string;
  patientImage?: string;
  rating: number;
  comment: string;
  date: string;
  appointmentId?: string;
}

export interface ReviewFilters {
  rating?: number[];
  date?: string;
  search?: string;
}

