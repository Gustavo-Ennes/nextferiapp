import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import type { WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";

export const toWeeklySummaryDTO = (
  doc: WeeklyFuellingSummary
): WeeklyFuellingSummaryDTO => ({
  _id: doc._id.toString(),
  weekStart: doc.weekStart.toISOString(),
  createdAt: doc.createdAt.toISOString(),
  departments: doc.departments.map((d: any) => ({
    name: d.name,
    fuelTotals: { ...d.fuelTotals },
    vehicles: d.vehicles.map((v: any) => ({
      vehicle: v.vehicle,
      prefix: v.prefix,
      fuelType: v.fuelType,
      totalLiters: v.totalLiters,
      lastKm: v.lastKm ?? undefined,
    })),
  })),
});

export const parseWeeklySummaries = (
  docs: WeeklyFuellingSummary[]
): WeeklyFuellingSummaryDTO[] => docs.map(toWeeklySummaryDTO);
