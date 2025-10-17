import type { SearchParams } from "@/app/(secure)/types";
import type { FacetResult, AggregatedVacation } from "@/app/api/types";
import VacationModel from "@/models/Vacation";
import { addMilliseconds } from "date-fns";
import { Types } from "mongoose";
import type {
  VacationFindOneRepositoryParam,
  PaginationRepositoryReturn,
  UpdateRepositoryParam,
} from "./types";
import type { Vacation } from "@/app/types";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";

export const VacationRepository = {
  async find({
    page,
    type,
    worker,
    contains,
  }: SearchParams): Promise<PaginationRepositoryReturn<Vacation>> {
    const skip = ((page as number) - 1) * (PAGINATION_LIMIT as number);
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
          // Aplica skip e PAGINATION_LIMIT
          data: [{ $skip: skip }, { $limit: PAGINATION_LIMIT }],
        },
      },
    ]).exec();

    const totalItems = data.totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);

    // Ajusta o formato da resposta para corresponder ao seu modelo
    const finalData = data.data.map((doc: AggregatedVacation) => ({
      ...doc,
      worker: doc.workerData,
      boss: doc.bossData,
      returnDate: addMilliseconds(doc.endDate, 1),
      workerData: undefined, // Remove os campos auxiliares
      bossData: undefined,
    }));

    return { totalItems, totalPages, data: finalData };
  },

  async create(payload: VacationFormData): Promise<Vacation> {
    return await VacationModel.create(payload);
  },

  async findOne({
    id,
    cancelled,
  }: VacationFindOneRepositoryParam): Promise<Vacation | void> {
    const vacation = await VacationModel.findOne({
      _id: id,
      ...(cancelled !== undefined && cancelled !== null && { cancelled }),
    })
      .populate("worker")
      .populate("boss");

    return vacation;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<VacationFormData>): Promise<Vacation> {
    const vacation = await VacationModel.findByIdAndUpdate(id, payload);
    return vacation;
  },

  async delete(id: string): Promise<Vacation> {
    return await this.update({ id, payload: { cancelled: true } });
  },
};
