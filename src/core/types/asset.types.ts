import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";

export type AssetStatus = "active" | "inactive" | "retired";

export interface Asset {
  _id: string;
  assetId: string;
  name: string;
  nameLower: string;
  category: string | null;
  serialNumber: string | null;
  purchaseDate: Timestamp | Date | null;
  purchaseCost: MinorUnits;
  assignedToStaffId: string | null;
  locationId: string | null;
  status: AssetStatus;
}

export interface AssetFormValues {
  name: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  /** Major units in the form; stored as minor units. */
  purchaseCost: number;
  assignedToStaffId: string;
  locationId: string;
  status: AssetStatus;
}

export interface ListAssetsParams {
  status?: AssetStatus;
  locationId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListAssetsResult {
  assets: Asset[];
  nextCursor: string | null;
}
