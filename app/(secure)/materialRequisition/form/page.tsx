import { DepartmentRepository } from "@/lib/repository/department/department";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { MaterialRequisitionForm } from "./MaterialRequisitionForm";
import { FuelRepository } from "@/lib/repository/fuel/fuel";

export default async function MaterialRequisitionFormPage() {
  const weeklySummary = await WeeklyFuellingSummaryRepository.findByWeekStart();
  const departments = await DepartmentRepository.findWithoutPagination!({
    isActive: true,
  });
  const fuels = await FuelRepository.findWithoutPagination!({});

  return (
    <MaterialRequisitionForm
      actualWeeklyFuelingSummary={weeklySummary}
      departments={departments}
      fuels={fuels}
    />
  );
}
