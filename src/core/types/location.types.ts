import type { Timestamp } from "firebase/firestore";

export type LocationStatus = "active" | "inactive";

export interface LocationAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string | null;
}

export interface ClinicLocation {
  _id: string;
  name: string;
  nameLower: string;
  address: LocationAddress | null;
  phoneNumber: string | null;
  email: string | null;
  status: LocationStatus;
  created?: Timestamp | Date | null;
}

export interface LocationFormValues {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  status: LocationStatus;
}

export interface ListLocationsParams {
  status?: LocationStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListLocationsResult {
  locations: ClinicLocation[];
  nextCursor: string | null;
}
