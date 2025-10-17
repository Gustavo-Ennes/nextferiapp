import type { SearchParams } from "@/app/(secure)/types";
import type { FacetResult, AggregatedBoss } from "@/app/api/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import BossModel from "@/models/Boss";
import type {
  FindOneRepositoryParam,
  PaginationRepositoryReturn,
  UpdateRepositoryParam,
} from "./types";
import type { Boss } from "@/app/types";
import type { BossFormData } from "@/app/(secure)/boss/types";
import { WorkerRepository } from "./worker";

export const BossRepository = {
  async find({
    page,
    isExternal,
    contains,
    isActive,
  }: SearchParams): Promise<PaginationRepositoryReturn<Boss>> {
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

    const [aggregationResult] = await BossModel.aggregate<
      FacetResult<AggregatedBoss>
    >([
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

    const data = rawData.map((doc: AggregatedBoss) => ({
      ...doc,
      worker: doc.workerData,
    }));

    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);

    return { data, totalPages, totalItems };
  },

  async create(payload: BossFormData): Promise<Boss> {
    const worker = await WorkerRepository.findOne({
      id: payload.worker,
      isActive: true,
    });

    if (!worker) throw new Error("No worker found for given id.");

    const boss = await BossModel.create({
      ...payload,
      isExternal: worker.isExternal,
    });

    return boss;
  },

  async findOne({
    id,
    isActive,
    isExternal,
  }: FindOneRepositoryParam): Promise<Boss | null> {
    const boss = await BossModel.findOne({
      _id: id,
      ...(isActive !== null && isActive !== undefined && { isActive }),
      ...(isExternal !== null && isExternal !== undefined && { isExternal }),
    }).populate("worker");

    return boss;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<BossFormData>): Promise<Boss> {
    let worker: Worker | null = null;

    if (payload.worker)
      worker = await WorkerRepository.findOne({
        id: payload.worker,
        isActive: true,
      });

    if (payload.worker && !worker) throw new Error("Boss worker not found.");

    const boss = await BossModel.findByIdAndUpdate(id, payload);

    return boss;
  },

  async delete(id: string): Promise<Boss> {
    const boss = await this.update({ id, payload: { isActive: false } });
    return boss;
  },
};
