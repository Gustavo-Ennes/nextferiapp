import type { SearchParams } from "@/app/(secure)/types";
import type { FacetResult } from "@/app/api/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import BossModel, { type Boss } from "@/models/Boss";
import type {
  FindOneRepositoryParam,
  PaginationRepositoryReturn,
  UpdateRepositoryParam,
} from "../types";
import type { BossFormData } from "@/app/(secure)/boss/types";
import { WorkerRepository } from "../worker/worker";
import type { BossDTO, WorkerDTO } from "@/dto";
import { parseBosses, toBossDTO } from "./parse";

export const BossRepository = {
  async find({
    page,
    isExternal,
    contains,
    isActive,
  }: SearchParams): Promise<PaginationRepositoryReturn<BossDTO>> {
    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const filter = {
      ...(isActive !== null && isActive !== undefined && { isActive }),
      ...(isExternal !== null && isExternal !== undefined && { isExternal }),
    };

    const pipeline = [];

    pipeline.push({ $match: filter });

    pipeline.push({
      $lookup: {
        from: "workers",
        localField: "worker",
        foreignField: "_id",
        as: "workerData",
      },
    });

    pipeline.push({ $unwind: "$workerData" });

    if (contains) {
      const regex = new RegExp(contains, "i");
      pipeline.push({
        $match: {
          "workerData.name": { $regex: regex },
        },
      });
    }
    pipeline.push({ $sort: { name: 1 as 1 } });

    pipeline.push({
      $project: {
        role: 1,
        isDirector: 1,
        isActive: 1,
        isExternal: 1,
        createdAt: 1,
        updatedAt: 1,
        worker: "$workerData",
      },
    });

    const [aggregationResult] = await BossModel.aggregate<FacetResult<Boss>>([
      ...pipeline,
      {
        $facet: {
          totalItems: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: PAGINATION_LIMIT }],
        },
      },
    ]).exec();

    const totalItems = aggregationResult.totalItems[0]?.count || 0;
    const rawData = aggregationResult.data;

    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);
    const parsedBosses = parseBosses(rawData) as BossDTO[];

    return { data: parsedBosses, totalPages, totalItems };
  },

  async create(payload: BossFormData): Promise<BossDTO> {
    const worker = await WorkerRepository.findOne({
      id: payload.worker,
      isActive: true,
    });

    if (!worker) throw new Error("No worker found for given id.");

    const boss = await BossModel.create({
      ...payload,
      isExternal: worker.isExternal,
    });

    return toBossDTO(boss.toObject()) as BossDTO;
  },

  async findOne({
    id,
    isActive,
    isExternal,
  }: FindOneRepositoryParam): Promise<BossDTO | null> {
    const boss = await BossModel.findOne<Boss>({
      _id: id,
      ...(isActive !== null && isActive !== undefined && { isActive }),
      ...(isExternal !== null && isExternal !== undefined && { isExternal }),
    }).populate("worker");

    return boss ? (toBossDTO(boss.toObject()) as BossDTO) : null;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<BossFormData>): Promise<BossDTO | null> {
    let worker: WorkerDTO | null = null;

    if (payload.worker)
      worker = await WorkerRepository.findOne({
        id: payload.worker,
        isActive: true,
      });

    if (payload.worker && !worker) throw new Error("Boss worker not found.");

    const boss = await BossModel.findByIdAndUpdate(id, payload);

    return boss ? (toBossDTO(boss.toObject()) as BossDTO) : null;
  },

  async delete(id: string): Promise<BossDTO | null> {
    const boss = await this.update({ id, payload: { isActive: false } });
    return boss;
  },
};
