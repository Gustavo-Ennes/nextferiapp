import type { Types } from "mongoose";
import type { RefDoc } from "./types";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import type { Department } from "@/models/Department";
import type { IFuel } from "@/models/Fuel";

export const migrationInterface = createInterface({ input, output });
const ask = (q: string) => migrationInterface.question(q);

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function fuzzyScore(a: string, b: string): number {
  const ta = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const tb = new Set(normalize(b).split(/\s+/).filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let overlap = 0;
  for (const t of Array.from(ta)) if (tb.has(t)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

/**
 * Retorna candidatos de combustível ordenados por probabilidade
 * baseado no nome do veículo. Retorna null se não reconhecer.summa
 */
function inferFuelCandidates(vehicleName: string): string[] | null {
  const n = normalize(vehicleName);
  if (/ambul/.test(n)) return ["s10", "diesel", "s500"];
  if (/caminhao|onibus|trator|retroescavadeira|patrol|moto.niveladora/.test(n))
    return ["s500", "s10", "diesel"];
  if (/moto(?!niveladora)/.test(n)) return ["gas", "gasolina"];
  if (/gol|uno|palio|fiesta|corsa|celta|\bka\b|hb20|onix|voyage|spin/.test(n))
    return ["gas", "gasolina"];
  if (/van|kombi|sprinter/.test(n)) return ["gas", "gasolina", "s10"];
  return null;
}

/** Resolve o _id do primeiro fuel cujo nome contenha algum dos candidatos. */
function resolveFuelId(
  candidates: string[],
  fuels: RefDoc[],
): Types.ObjectId | null {
  for (const cand of candidates) {
    const nc = normalize(cand);
    for (const f of fuels) {
      const nf = normalize(f.name);
      if (nf.includes(nc) || nc.includes(nf)) return f._id;
    }
  }
  return null;
}

/** Retorna as chaves de fuelTotals ordenadas por quantidade desc (ignora zeros). */
function fuelTotalsRanked(fuelTotals?: Record<string, number>): string[] {
  if (!fuelTotals) return [];
  return Object.entries(fuelTotals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}

// ── Interação com usuário ─────────────────────────────────────────────────────
async function askFuelInteractive(
  vehicleName: string,
  prefix: number,
  deptName: string,
  fuelTotals: Record<string, number> | undefined,
  fuels: IFuel[],
  ranked: string[],
): Promise<IFuel> {
  console.log("\n" + "─".repeat(58));
  console.log(`Veículo  : "${vehicleName}" (prefix ${prefix})`);
  console.log(`Setor    : ${deptName}`);

  if (fuelTotals) {
    const lines = Object.entries(fuelTotals).filter(([, v]) => v > 0);
    if (lines.length) {
      console.log("fuelTotals do setor:");
      lines.forEach(([k, v]) => console.log(`  ${k}: ${v} L`));
    }
  }

  if (ranked.length) {
    console.log(
      `\nRanking por volume : ${ranked.map((r, i) => `[${i + 1}] ${r}`).join("  ")}`,
    );
  }

  console.log("\nCombustíveis no sistema:");
  fuels.forEach((f, i) => console.log(`  [${i + 1}] ${f.name}  (${f._id})`));

  const ans = await ask("Qual combustível? (número ou nome): ");
  const idx = parseInt(ans, 10);

  if (!isNaN(idx) && idx >= 1 && idx <= fuels.length) return fuels[idx - 1];

  const match = fuels.find(
    (f) =>
      normalize(f.name).includes(normalize(ans)) ||
      normalize(ans).includes(normalize(f.name)),
  );
  if (match) return match;

  console.log("  ⚠ Opção inválida, tente novamente.");
  return askFuelInteractive(
    vehicleName,
    prefix,
    deptName,
    fuelTotals,
    fuels,
    ranked,
  );
}

async function resolveDeptInteractive(
  rawName: string,
  departments: Department[],
  cache: Map<string, Types.ObjectId | null>,
): Promise<Types.ObjectId | null> {
  const key = normalize(rawName);
  if (cache.has(key)) return cache.get(key)!;

  let best: Department | null = null;
  let bestScore = 0;
  for (const d of departments) {
    const score = fuzzyScore(rawName, d.name);
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }

  let chosenId: Types.ObjectId | null;

  if (best && bestScore >= 0.6) {
    console.log(
      `  Setor "${rawName}" → match automático: "${best.name}" (score ${bestScore.toFixed(2)})`,
    );
    chosenId = best._id;
  } else {
    console.log(`\n  ⚠ Setor "${rawName}" sem match confiante.`);
    if (best)
      console.log(
        `    Melhor candidato: "${best.name}" (score ${bestScore.toFixed(2)})`,
      );
    departments.forEach((d, i) => console.log(`    [${i + 1}] ${d.name}`));
    const ans = await ask(
      "    Qual setor corresponde? (número, ou Enter para deixar sem ref): ",
    );
    const idx = parseInt(ans, 10);
    chosenId =
      !isNaN(idx) && idx >= 1 && idx <= departments.length
        ? departments[idx - 1]._id
        : null;
  }

  cache.set(key, chosenId);
  return chosenId;
}

export {
  askFuelInteractive,
  fuelTotalsRanked,
  fuzzyScore,
  inferFuelCandidates,
  normalize,
  resolveDeptInteractive,
  resolveFuelId,
};
