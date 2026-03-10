import type { FuelType } from "@/lib/repository/weeklyFuellingSummary/types";

export interface PurchaseOrderDTO {
  _id: string;
  reference: string;
  items: Array<{
    fuel: FuelType;
    quantity: number;
    price: number;
    totalItem: number;
  }>;
  createdAt: Date;
}
