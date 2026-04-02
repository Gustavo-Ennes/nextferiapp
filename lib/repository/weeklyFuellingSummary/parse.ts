import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import type { WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";
import { toFuelDTO } from "../fuel/parse";
import { toDepartmentDTO } from "../department/parse";

export const toWeeklySummaryDTO = (
  doc: WeeklyFuellingSummary,
): WeeklyFuellingSummaryDTO => ({
  _id: doc._id.toString(),
  weekStart: doc.weekStart.toISOString(),
  createdAt: doc.createdAt.toISOString(),
  departments: doc.departments.map((d: any) => ({
    department: toDepartmentDTO(d.department),
    name: d.name,
    totalValue: d.totalValue ?? 0,
    vehicles: d.vehicles.map((v: any) => ({
      vehicle: v.vehicle,
      prefix: v.prefix,
      fuel: v.fuel ? toFuelDTO(v.fuel) : undefined,
      totalLiters: v.totalLiters,
      totalValue: v.totalValue ?? 0,
      lastKm: v.lastKm ?? undefined,
    })),
  })),
});

export const parseWeeklySummaries = (
  docs: WeeklyFuellingSummary[],
): WeeklyFuellingSummaryDTO[] => docs.map(toWeeklySummaryDTO);
