import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";

export type ServiceStatus = "active" | "inactive";

export interface ClinicService {
  _id: string;
  name: string;
  nameLower: string;
  specializationId: string | null;
  specializationName: string | null;
  price: MinorUnits;
  durationMinutes: number | null;
  description: string | null;
  status: ServiceStatus;
  created?: Timestamp | Date | null;
}

export interface ServiceFormValues {
  name: string;
  specializationId: string;
  /** Major units in the form; stored as minor units. */
  price: number;
  durationMinutes: number;
  description: string;
  status: ServiceStatus;
}

export interface ListServicesParams {
  status?: ServiceStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListServicesResult {
  services: ClinicService[];
  nextCursor: string | null;
}
