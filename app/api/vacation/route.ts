import type { Vacation } from "@/app/types";
import dbConnect from "@/lib/database/database";
import type { NextRequest } from "next/server";
import {
  optionsResponse,
  responseWithHeaders,
  updateVacationDates,
} from "../utils";
import VacationModel from "@/models/Vacation";
import type { AggregatedVacation, FacetResult } from "../types";
import { revalidatePath } from "next/cache";
import { addMilliseconds } from "date-fns";
import { Types } from "mongoose";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const worker = searchParams.get("worker");
    const contains = searchParams.get("contains"); // O termo de busca

    const skip = (page - 1) * limit;
    const typeFilter = type === "all" ? undefined : !type ? "normal" : type;

    // --- 1. CONSTRUÇÃO DO FILTRO BASE ---
    const baseFilter = {
      ...(typeFilter && { type: typeFilter }),
      ...(worker && { worker: new Types.ObjectId(worker) }),
      $or: [{ cancelled: false }, { cancelled: undefined }],
    };

    // --- 2. QUERY PRINCIPAL (Aggregation Pipeline) ---
    // Usamos Aggregation para buscar em campos populados
    const pipeline: any[] = [];

    // 1. Macth (Filtro base)
    pipeline.push({ $match: baseFilter });

    // 2. Lookup/Populate (Para buscar em Worker e Boss)
    pipeline.push({
      $lookup: {
        from: "workers", // Nome da coleção de Workers no DB
        localField: "worker",
        foreignField: "_id",
        as: "workerData",
      },
    });
    pipeline.push({
      $unwind: "$workerData",
    });

    pipeline.push({
      $lookup: {
        from: "bosses", // Boss também está na coleção Workers
        localField: "boss",
        foreignField: "_id",
        as: "bossData",
      },
    });
    pipeline.push({
      $unwind: "$bossData",
    });

    // 3. Filtro de Texto (contains)
    if (contains) {
      const regex = new RegExp(contains, "i"); // Busca case-insensitive

      // A busca por data formatada deve ser feita no frontend
      // A busca no backend é feita nos campos de texto (Nomes)
      pipeline.push({
        $match: {
          $or: [
            { "workerData.name": { $regex: regex } },
            { "bossData.name": { $regex: regex } },
          ],
        },
      });
    }

    // 4. Ordenação
    pipeline.push({ $sort: { startDate: -1 } });

    // 5. Paginação e Contagem Total
    const [data] = await VacationModel.aggregate<
      FacetResult<AggregatedVacation>
    >([
      ...pipeline,
      {
        $facet: {
          // Contagem total para a paginação
          totalItems: [{ $count: "count" }],
          // Aplica skip e limit
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalItems = data.totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Ajusta o formato da resposta para corresponder ao seu modelo
    const finalData = data.data.map((doc: AggregatedVacation) => ({
      ...doc,
      worker: doc.workerData,
      boss: doc.bossData,
      returnDate: addMilliseconds(doc.endDate, 1),
      workerData: undefined, // Remove os campos auxiliares
      bossData: undefined,
    }));

    const response = responseWithHeaders<Vacation>({
      data: finalData, // Retorna os dados populados e filtrados pelo DB
      currentPage: page,
      totalItems,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });

    return response;
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const bodyWithUpdatedDates = updateVacationDates(body);
    const vacation = await VacationModel.create(bodyWithUpdatedDates);
    revalidatePath("/vacation");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}
