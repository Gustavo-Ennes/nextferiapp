import type {
  DepartmentDTO,
  FuelDTO,
  FuelingBatchDTO,
  PurchaseOrderDTO,
} from "@/dto";
import type { FuelingBatchFueling, FuelingBatchTotals } from "@/models/types";
import { Types } from "mongoose";

export const getBaseTotals = () => ({
  totalValue: 0,
  totalFuelings: 0,
  totalFuels: { Gasolina: { liters: 0, value: 0 } },
  totalKmHrs: 0,
  totalVehicles: 1,
});

export const getFuelingBatchBasePayload = ({
  missingDepartment,
  missingItemFuel,
  noDepartments,
  noInvoices,
  fuelings,
  department,
  fuel,
  baseTotals,
  purchaseOrder,
}: {
  missingItemFuel?: boolean;
  missingDepartment?: boolean;
  noDepartments?: boolean;
  noInvoices?: boolean;
  fuelings?: FuelingBatchFueling[];
  baseTotals: FuelingBatchTotals;
  department: DepartmentDTO;
  purchaseOrder: PurchaseOrderDTO;
  fuel: FuelDTO;
  _id?: string;
}): Omit<FuelingBatchDTO, "_id" | "createdAt"> => ({
  totals: baseTotals,
  departments: noDepartments
    ? []
    : [
        {
          invoices: noInvoices
            ? []
            : [
                {
                  department: department!,
                  items: [],
                  number: 1,
                  purchaseOrder: purchaseOrder!._id,
                  total: 0,
                },
              ],
          totals: baseTotals,
          name: department!.name,
          vehicles: [
            {
              fuel: missingItemFuel
                ? new Types.ObjectId().toString()
                : fuel._id,
              lastKm: 123,
              prefix: 1,
              totals: {
                totalLiters: 0,
                totalValue: 0,
              },
              vehicle: "fusca",
              fuelings: fuelings ?? [],
            },
          ],
          department: missingDepartment
            ? new Types.ObjectId().toString()
            : department!._id,
        },
      ],
});
