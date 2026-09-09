export type SpecializationStatus = "active" | "inactive";

export interface Specialization {
  _id: string;
  name: string;
  nameLower: string;
  description: string | null;
  icon: string | null;
  status: SpecializationStatus;
}

export interface SpecializationFormValues {
  name: string;
  description: string;
  icon: string;
  status: SpecializationStatus;
}
