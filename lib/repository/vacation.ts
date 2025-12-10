import type { SearchParams } from "@/app/(secure)/types";
import type { FacetResult, AggregatedVacation } from "@/app/api/types";
import VacationModel from "@/models/Vacation";
import { addMilliseconds, startOfYear, toDate } from "date-fns";
import { isObjectIdOrHexString, Types } from "mongoose";
import type {
  VacationFindOneRepositoryParam,
  PaginationRepositoryReturn,
  UpdateRepositoryParam,
} from "./types";
import type { Boss, Vacation, Worker } from "@/app/types";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import {
  updateVacationDates,
  validateDayOffsQuantity,
  validateOverlappingVacations,
  validateVacationDuration,
} from "./utils";
import { WorkerRepository } from "./worker";
import { BossRepository } from "./boss";
import {
  VacationCreateSchema,
  VacationUpdateSchema,
} from "../validators/vacation";
import { endOfDaySP, startOfDaySP } from "@/app/utils";

export const VacationRepository = {
  async find({
    page,
    type,
    worker,
    contains,
    from,
    to,
  }: SearchParams): Promise<PaginationRepositoryReturn<Vacation>> {
    const skip = ((page as number) - 1) * (PAGINATION_LIMIT as number);
    const typeFilter = type === "all" ? undefined : !type ? "normal" : type;
    const period =
      from || to
        ? {
            ...(from && { start: startOfDaySP(from) }),
            ...(to && { end: endOfDaySP(to) }),
          }
        : undefined;

    const conditions = [];

    if (typeFilter) {
      conditions.push({ type: typeFilter });
    }
    if (worker) {
      conditions.push({ worker: new Types.ObjectId(worker) });
    }

    conditions.push({ $or: [{ cancelled: false }, { cancelled: undefined }] });

    if (period) {
      const periodConditions = [];

      if (period.start && period.end) {
        periodConditions.push({
          $or: [
            // or vacation starts before period and ends in period
            {
              $and: [
                { startDate: { $lt: period.start } },
                { endDate: { $gte: period.start } },
              ],
            },
            // or vacation is within period
            {
              $and: [
                { startDate: { $gte: period.start } },
                { endDate: { $lte: period.end } },
              ],
            },
            // or vacation starts in period and ends after period
            {
              $and: [
                { startDate: { $lte: period.end } },
                { endDate: { $gt: period.end } },
              ],
            },
            // or vacation starts before period and ends after period
            {
              $and: [
                { startDate: { $lte: period.end } },
                { endDate: { $gt: period.end } },
              ],
            },
          ],
        });
      } else if (period.start) {
        periodConditions.push({
          $or: [
            { startDate: { $gte: period.start } },
            { endDate: { $gte: period.start } },
          ],
        });
      } else if (period.end) {
        periodConditions.push({
          $or: [
            { endDate: { $lte: period.end } },
            { startDate: { $lte: period.end } },
          ],
        });
      }
      if (periodConditions.length > 0) {
        conditions.push(periodConditions[0]);
      }
    }

    const baseFilter = {
      ...(conditions.length > 0 ? { $and: conditions } : {}),
    };

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
    let workerVacations: Vacation[] | undefined;
    let validPayload: VacationFormData | null = null;

    const result = VacationCreateSchema.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else {
      validPayload = result.data as VacationFormData;
    }
    if (validPayload.type === "dayOff")
      workerVacations = (
        await this.find({
          page: 1,
          type: validPayload.type,
          worker: validPayload.worker,
          from: startOfYear(toDate(validPayload.startDate)),
        })
      ).data;

    if (workerVacations?.length && workerVacations.length >= 6)
      throw new Error("Worker exceeds his annual dayOff limits (6).");

    const worker = await WorkerRepository.findOne({
      id: validPayload.worker,
      isActive: true,
    });
    if (!worker) throw new Error("Worker not found");

    const boss = await BossRepository.findOne({
      id: validPayload.boss,
      isActive: true,
    });
    if (!boss) throw new Error("Boss not found");

    const durationValidatedPayload = validateVacationDuration(
      validPayload
    ) as VacationFormData;

    const payloadWithDates = updateVacationDates(durationValidatedPayload);

    const noOverlappingPayload = await validateOverlappingVacations(
      payloadWithDates
    );

    const validDayOffsQuantityPayload = await validateDayOffsQuantity(
      noOverlappingPayload
    );

    return await VacationModel.create(validDayOffsQuantityPayload);
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
    let validPayload: VacationFormData | null = null;

    const result = VacationUpdateSchema.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else if (!isObjectIdOrHexString(id)) {
      throw new Error("Id prop needs to be a valid ObjectId.");
    } else {
      validPayload = result.data as VacationFormData;
    }

    let worker: Worker | null = null;
    let boss: Boss | null = null;

    const vacationToUpdate = await VacationRepository.findOne({ id });
    if (!vacationToUpdate) throw new Error("Vacation doesn't exists.");

    if (validPayload?.worker)
      worker = await WorkerRepository.findOne({
        id: validPayload.worker as string,
        isActive: true,
      });
    if (!worker && validPayload?.worker) throw new Error("Worker not found");

    if (validPayload?.boss)
      boss = await BossRepository.findOne({
        id: validPayload.boss as string,
        isActive: true,
      });
    if (!boss && validPayload?.boss) throw new Error("Boss not found");

    const validDurationPayload = validateVacationDuration(
      validPayload,
      vacationToUpdate
    );

    const payloadWithDates = updateVacationDates(
      validDurationPayload as VacationFormData,
      vacationToUpdate
    );

    const noOverlappingPayload = await validateOverlappingVacations(
      payloadWithDates,
      vacationToUpdate
    );

    const validDayOffQuantityPayload = await validateDayOffsQuantity(
      noOverlappingPayload,
      vacationToUpdate
    );

    const vacation = await VacationModel.findByIdAndUpdate(
      id,
      validDayOffQuantityPayload,
      {
        returnDocument: "after",
      }
    );

    return vacation;
  },

  async delete(id: string): Promise<Vacation> {
    return this.update({ id, payload: { cancelled: true } });
  },
};
