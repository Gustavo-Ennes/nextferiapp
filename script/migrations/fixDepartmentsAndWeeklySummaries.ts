import dbConnect from "@/lib/database/database";
import DepartmentModel from "@/models/Department";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type { FuelDTO } from "@/dto/FuelDTO";

export async function migrateDepartmentsAndWeeklySummaries() {
  await dbConnect();

  const activeDepartments = await DepartmentModel.find({ isActive: true });
  const activeNames = activeDepartments.map((d) => d.name.trim().toLowerCase());

  // 2) Normalize weekly summaries + create stub departments based on vehicle fuel names
  const summaries = await WeeklyFuellingSummaryModel.find();
  const fuels = await FuelRepository.findWithoutPagination!({});

  for (const summary of summaries) {
    let summaryChanged = false;

    for (const dept of summary.departments) {
      if (!dept.department || !dept.name) {
        const ramdomDept =
          activeDepartments[
            Math.floor(Math.random() * activeDepartments.length)
          ];
        dept.department = ramdomDept._id;
        dept.name = ramdomDept.name;
        summaryChanged = true;
      }

      for (const vehicle of dept.vehicles) {
        let candidateName = "";

        // fuel can be string (older docs), ObjectId, or populated fuel object
        if (!vehicle.fuel) {
          const randomFuel = fuels[Math.floor(Math.random() * fuels.length)];
          vehicle.fuel = randomFuel._id;
          summaryChanged = true;
          continue;
        }

        if (typeof vehicle.fuel === "string") {
          candidateName = vehicle.fuel;
        } else if (typeof vehicle.fuel === "object" && "name" in vehicle.fuel) {
          candidateName = (vehicle.fuel as any).name;
        } else if (
          typeof vehicle.fuel === "object" &&
          (vehicle.fuel as FuelDTO).toString
        ) {
          const fuelDoc = await FuelRepository.findOne({
            id: vehicle.fuel as string,
          });

          if (fuelDoc) {
            candidateName = fuelDoc.name;
            // keep fuel as ObjectId for normalized schema
            if ((vehicle.fuel as any).toString() !== fuelDoc._id.toString()) {
              vehicle.fuel = fuelDoc._id;
              summaryChanged = true;
            }
          }
        }

        candidateName = String(candidateName || "").trim();
        if (!candidateName) continue;

        const candidateKey = candidateName.toLowerCase();
        const exact = activeDepartments.find(
          (d) => d.name.trim().toLowerCase() === candidateKey,
        );
        const fuzzy = activeDepartments.find(
          (d) =>
            d.name.trim().toLowerCase().includes(candidateKey) ||
            candidateKey.includes(d.name.trim().toLowerCase()),
        );

        if (!exact && !fuzzy) {
          // Create a new active worker department from fuel name
          const created = await DepartmentModel.create({
            name: candidateName,
            isActive: true,
            hasWorkers: true,
          });
          activeDepartments.push(created);
          activeNames.push(candidateKey);
        }
      }
    }

    if (summaryChanged) {
      await summary.save();
    }
  }

  return {
    updatedDepartments: activeNames.length,
    scannedSummaries: summaries.length,
  };
}
