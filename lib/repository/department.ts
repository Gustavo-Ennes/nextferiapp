import type { Boss, Department } from "@/app/types";
import type {
  FindOneRepositoryParam,
  PaginationRepositoryReturn,
  UpdateRepositoryParam,
} from "./types";
import type { SearchParams } from "@/app/(secure)/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { FacetResult, AggregatedDepartment } from "@/app/api/types";
import DepartmentModel from "@/models/Department";
import type { DepartmentFormData } from "@/app/(secure)/department/types";
import { BossRepository } from "./boss";

export const DepartmentRepository = {
  async find({
    page,
    contains,
    isActive,
  }: SearchParams): Promise<PaginationRepositoryReturn<Department>> {
    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const filter = {
      ...(isActive !== null && isActive !== undefined && { isActive }),
    };
    const pipeline = [];

    pipeline.push({ $match: filter });

    pipeline.push({
      $lookup: {
        from: "bosses",
        localField: "responsible",
        foreignField: "_id",
        as: "responsibleData",
      },
    });
    pipeline.push({ $unwind: "$responsibleData" });

    pipeline.push({
      $lookup: {
        from: "workers",
        localField: "responsibleData.worker",
        foreignField: "_id",
        as: "workerData",
      },
    });
    pipeline.push({ $unwind: "$workerData" });

    if (contains) {
      const regex = new RegExp(contains, "i");
      pipeline.push({
        $match: {
          $or: [
            { "workerData.name": { $regex: regex } },
            { name: { $regex: regex } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { name: 1 as 1 } });

    const [aggregationResult] = await DepartmentModel.aggregate<
      FacetResult<AggregatedDepartment>
    >([
      ...pipeline,
      {
        $facet: {
          totalItems: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: PAGINATION_LIMIT }],
        },
      },
    ]);

    const totalItems = aggregationResult.totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);
    const rawData = aggregationResult.data;

    const data = rawData.map((doc) => ({
      ...doc,
      responsible: {
        ...doc.responsibleData,
        worker: doc.workerData,
      },
    }));

    return { data, totalItems, totalPages };
  },

  async create(payload: DepartmentFormData): Promise<Department> {
    const boss = await BossRepository.findOne({
      id: payload.responsible,
      isActive: true,
    });

    if (!boss) throw new Error("No boss found for given id.");

    const department = await DepartmentModel.create(payload);

    return department;
  },

  async findOne({
    id,
    isActive,
  }: FindOneRepositoryParam): Promise<Department | null> {
    const department = await DepartmentModel.findOne({
      _id: id,
      ...(isActive !== null && isActive !== undefined && { isActive }),
    }).populate({
      path: "responsible",
      populate: {
        path: "worker",
      },
    });

    return department;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<DepartmentFormData>): Promise<Department> {
    let responsible: Boss | null = null;

    if (payload.responsible)
      responsible = await BossRepository.findOne({
        id: payload.responsible,
        isActive: true,
      });

    if (payload.responsible && !responsible)
      throw new Error("Department boss not found.");

    const department = await DepartmentModel.findByIdAndUpdate(id, payload);
    return department;
  },

  async delete(id: string): Promise<Department> {
    const department = await this.update({ id, payload: { isActive: false } });
    return department;
  },
};
