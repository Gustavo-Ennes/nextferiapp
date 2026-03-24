import type { FindOneRepositoryParam, UpdateRepositoryParam } from "../types";
import type { SearchParams } from "@/app/(secure)/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type {
  FacetResult,
  AggregatedDepartment,
  PaginatedResponse,
} from "@/app/api/types";
import DepartmentModel from "@/models/Department";
import type { DepartmentFormData } from "@/app/(secure)/department/types";
import { BossRepository } from "../boss/boss";
import { parseDepartments, toDepartmentDTO } from "./parse";
import type { DepartmentDTO } from "@/dto";
import type { Worker } from "@/models/Worker";
import type { Department } from "@/models/Department";
import type { Boss } from "@/models/Boss";
import type { BossDTO } from "@/dto";
import type { Repository } from "../types";
import dbConnect from "@/lib/database/database";
import { endOfDaySP, startOfDaySP } from "@/app/utils";

export const DepartmentRepository: Repository<
  DepartmentDTO,
  DepartmentFormData
> = {
  async find({
    page,
    contains,
    isActive,
  }: SearchParams): Promise<PaginatedResponse<DepartmentDTO>> {
    await dbConnect();

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
    const currentPage = page as number;
    const hasNextPage = totalPages > currentPage;
    const hasPrevPage = currentPage > 1;

    const data: Department[] = rawData.map((doc) => {
      const { workerData, responsibleData, ...rest } = doc;

      return {
        ...rest,
        responsible: {
          ...responsibleData,
          worker: workerData as Worker,
        } as Boss,
      };
    });
    const parsedDepartments = parseDepartments(data) as DepartmentDTO[];
    return {
      data: parsedDepartments,
      totalItems,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      limit: PAGINATION_LIMIT,
    };
  },

  async findWithoutPagination(params: SearchParams) {
    let page = 1;
    let shouldFetchNextPage = false;
    let to;
    let from;
    const departments: DepartmentDTO[] = [];
    const today = new Date();

    if (params.timePeriod == "past") to = endOfDaySP(today);
    else if (params.timePeriod === "future") from = startOfDaySP(today);

    do {
      const { data: departmentPage, hasNextPage } = await this.find({
        ...params,
        ...(params.timePeriod && to && { to }),
        ...(params.timePeriod && from && { from }),
        page: page++,
      });
      departments.push(...departmentPage);
      shouldFetchNextPage = hasNextPage;
    } while (shouldFetchNextPage);

    return departments;
  },

  async create(payload: DepartmentFormData): Promise<DepartmentDTO> {
    await dbConnect();

    const boss = await BossRepository.findOne({
      id: payload.responsible,
      isActive: true,
    });

    if (!boss) throw new Error("No boss found for given id.");

    const department = await DepartmentModel.create(payload);

    return toDepartmentDTO(department.toObject()) as DepartmentDTO;
  },

  async findOne({
    id,
    isActive,
  }: FindOneRepositoryParam): Promise<DepartmentDTO | null> {
    await dbConnect();

    const department = await DepartmentModel.findOne({
      _id: id,
      ...(isActive !== null && isActive !== undefined && { isActive }),
    }).populate({
      path: "responsible",
      populate: {
        path: "worker",
      },
    });

    return department
      ? (toDepartmentDTO(department.toObject()) as DepartmentDTO)
      : null;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<DepartmentFormData>): Promise<DepartmentDTO | null> {
    await dbConnect();

    let responsible: BossDTO | null = null;

    if (payload.responsible)
      responsible = await BossRepository.findOne({
        id: payload.responsible,
        isActive: true,
      });

    if (payload.responsible && !responsible)
      throw new Error("Department boss not found.");

    const department = await DepartmentModel.findByIdAndUpdate(id, payload);
    return toDepartmentDTO(department.toObject()) as DepartmentDTO;
  },

  async delete(id: string): Promise<DepartmentDTO | null> {
    await dbConnect();

    const department = await this.update({ id, payload: { isActive: false } });
    return department;
  },
};
