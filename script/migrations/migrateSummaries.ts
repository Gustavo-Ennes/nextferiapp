/**
 * scripts/migrate-summaries.ts
 *
 * Migra WeeklyFuellingSummary do schema antigo para o novo:
 *  - Resolve department.name → Department._id  (fuzzy match)
 *  - Infere Fuel._id por veículo (padrão de nome + fuelTotals + cache por prefix)
 *  - Pergunta interativamente quando não há inferência confiante
 *
 * Uso:
 *   npx tsx scripts/migrate-summaries.ts [--dry-run]
 *
 * Requer tsx:  npm i -D tsx
 */

import "dotenv/config";
import mongoose, { Types } from "mongoose";

// ── Ajuste estes imports para os caminhos reais do seu projeto ────────────────
import dbConnect from "@/lib/database/database";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
// Assumindo que você tem estes models — ajuste os nomes se necessário
import "@/models/Department";
import "@/models/Fuel";
import type { OldSummary } from "./types";
import {
  askFuelInteractive,
  fuelTotalsRanked,
  resolveDeptInteractive,
  migrationInterface,
} from "./utils";
import DepartmentModel, { type Department } from "@/models/Department";
import FuelModel, { type IFuel } from "@/models/Fuel";
import type { IFuelPriceVersion } from "@/models/FuelPriceVersion";

const DRY_RUN = process.argv.includes("--dry-run");
const ARLA_ID = "6a05bb5c7234b817cd84312b";

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🔌 Conectando ao banco...");
  await dbConnect();
  console.log("   Conectado.\n");

  const departments =
    await DepartmentModel.find<Department>().populate("responsible");

  const fuels = await FuelModel.find<IFuel>().populate(
    "priceVersions currentPriceVersion",
  );

  if (!fuels.length) {
    console.error(
      "Nenhum documento na collection 'fuels'. Verifique a conexão.",
    );
    process.exit(1);
  }

  console.log(`Setores  : ${departments.map((d) => d.name).join(", ")}`);
  console.log(`Combustíveis    : ${fuels.map((f) => f.name).join(", ")}\n`);

  const summaries = (await WeeklyFuellingSummaryModel.find({})
    .lean()
    .sort({ weekStart: 1 })) as unknown as OldSummary[];

  console.log(`Summaries encontrados: ${summaries.length}\n`);

  // Caches
  const prefixFuelCache = new Map<number, Types.ObjectId>();
  const deptNameCache = new Map<string, Types.ObjectId | null>();

  for (const summary of summaries) {
    const weekLabel = new Date(summary.weekStart).toISOString().slice(0, 10);
    console.log("\n" + "═".repeat(60));
    console.log(`📅  Semana: ${weekLabel}  (_id: ${summary._id})`);

    const newDepartments = [];

    for (const dept of summary.departments ?? []) {
      console.log(`\n  📁 Setor: "${dept.name}"`);

      let departmentTotalValue = 0;
      const departmentId = await resolveDeptInteractive(
        dept.name,
        departments,
        deptNameCache,
      );

      if (!departmentId) continue;

      const ranked = fuelTotalsRanked(dept.fuelTotals);

      const newVehicles = [];

      for (const v of dept.vehicles ?? []) {
        // Já migrado
        if (v.fuel instanceof Types.ObjectId) {
          newVehicles.push(v);
          continue;
        }

        let fuelId: Types.ObjectId;
        let fuel: IFuel;
        let vehicleTotalValue = 0;

        if (prefixFuelCache.has(v.prefix)) {
          fuelId = prefixFuelCache.get(v.prefix)!;
          fuel = fuels.find((f) => f._id.equals(fuelId))!;
          console.log(
            `    🚗 "${v.vehicle}" (prefix ${v.prefix}) → cache: ${fuel?.name}`,
          );
        } else {
          fuel = await askFuelInteractive(
            v.vehicle,
            v.prefix,
            dept.name,
            dept.fuelTotals,
            fuels,
            ranked,
          );

          fuelId = fuel._id;

          if (fuelId.toString() !== ARLA_ID)
            prefixFuelCache.set(v.prefix, fuelId);
        }

        vehicleTotalValue =
          (fuel.currentPriceVersion as IFuelPriceVersion).price * v.totalLiters;
        departmentTotalValue += vehicleTotalValue;

        newVehicles.push({
          vehicle: v.vehicle,
          prefix: v.prefix,
          fuel: fuelId.toString(),
          totalLiters: v.totalLiters ?? 0,
          totalValue: vehicleTotalValue ?? 0,
          totalKmHr: v.totalKmHr ?? 0,
          ...(v.lastKm !== undefined ? { lastKm: v.lastKm } : {}),
        });
      }
      newDepartments.push({
        department: departmentId,
        name: dept.name,
        vehicles: newVehicles,
        totalValue: departmentTotalValue ?? 0,
      });
    }

    if (!DRY_RUN) {
      await WeeklyFuellingSummaryModel.updateOne(
        { _id: summary._id },
        { $set: { departments: newDepartments } },
      );
      console.log(`\n  ✅ Summary ${weekLabel} atualizado.`);
    } else {
      console.log(`\n  [DRY-RUN] Resultado:`);
      console.log(
        JSON.stringify(
          newDepartments.map((d) => `department: ${d.name}\n`),
          null,
          2,
        ),
      );
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅  Migração concluída.");
  migrationInterface.close();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  migrationInterface.close();
  process.exit(1);
});
