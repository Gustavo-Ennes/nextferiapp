import { toFuelDTO } from "../fuel/parse";
import { toDepartmentDTO } from "../department/parse";
import type {
  FuelingBatchDepartment,
  FuelingBatchInvoice,
  FuelingBatchInvoiceItem,
  FuelingBatchVehicle,
} from "@/models/types";
import type {
  FuelingBatchDTO,
  FuelingBatchTableLine,
} from "@/dto/FuelingBatchDTO";
import type { FuelingBatch } from "@/models/FuelingBatch";
import { toPurchaseOrderDTO } from "../purchaseOrder/parse";
import { toFuelPriceVersionDTO } from "../fuelPriceVersion/parse";

export const toFuelingBatchDTO = (doc: FuelingBatch): FuelingBatchDTO => ({
  _id: doc._id.toString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt?.toISOString(),
  observation: doc.observation,
  totals: doc.totals,
  departments: doc.departments.map((d: FuelingBatchDepartment) => ({
    department: d.department ? toDepartmentDTO(d.department) : undefined,
    name: d.name,
    totals: d.totals,
    invoices: d.invoices.map((i: FuelingBatchInvoice) => ({
      purchaseOrder: toPurchaseOrderDTO(i.purchaseOrder),
      department: toDepartmentDTO(i.department),
      number: i.number,
      series: i.series,
      total: i.total,
      items: i.items.map((item: FuelingBatchInvoiceItem) => ({
        fuel: toFuelDTO(item.fuel),
        fuelPriceVersion: toFuelPriceVersionDTO(item.fuelPriceVersion),
        quantity: item.quantity,
        total: item.total,
      })),
    })),
    vehicles: d.vehicles.map((v: FuelingBatchVehicle) => ({
      vehicle: v.vehicle,
      prefix: v.prefix,
      fuel: v.fuel ? toFuelDTO(v.fuel) : null,
      fuelings: v.fuelings ?? [],
      totals: v.totals,
      lastKm: v.lastKm ?? null,
    })),
  })),
});

export const parseFuelingBatches = (docs: FuelingBatch[]): FuelingBatchDTO[] =>
  docs.map(toFuelingBatchDTO);

export const toFuelingBatchTableLine = (
  doc: FuelingBatchDTO,
): FuelingBatchTableLine => ({
  _id: doc._id.toString(),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  observation: doc.observation,
  totalFuels: doc.totals,
  totalValue: doc.totals.totalValue,
  totalKmHrs: doc.totals.totalKmHrs,
  totalVehicles: doc.totals.totalVehicles,
  totalFuelings: doc.totals.totalFuelings,
  totalDepartments: doc.departments.length,
});

export const parseFuelingBatchTableLines = (
  docs: FuelingBatchDTO[],
): FuelingBatchTableLine[] => docs.map(toFuelingBatchTableLine);
