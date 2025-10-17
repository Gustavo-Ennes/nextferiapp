import type { SearchParams } from "@/app/(secure)/types";
import type {
  PaginationRepositoryReturn,
  FindOneRepositoryParam,
  UpdateRepositoryParam,
} from "./types";
import type { Worker } from "@/app/types";
import WorkerModel from "@/models/Worker";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { WorkerFormData } from "@/app/(secure)/worker/types";

export const WorkerRepository = {
  async find({
    page,
    isActive,
    isExternal,
    contains,
  }: SearchParams): Promise<PaginationRepositoryReturn<Worker>> {
    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const filter = {
      ...(isActive !== null && { isActive }),
      ...(contains && { name: { $regex: contains, $options: "i" } }),
      ...(isExternal !== null && { isExternal }),
    };

    const [data, totalItems] = await Promise.all([
      WorkerModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .populate("department"),
      WorkerModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);

    return { data, totalItems, totalPages };
  },

  async create(payload: WorkerFormData) {
    const worker = await WorkerModel.create(payload);
    return worker;
  },

  async findOne({ id, isActive, isExternal }: FindOneRepositoryParam) {
    const worker = await WorkerModel.findOne({
      _id: id,
      ...(isActive !== undefined && { isActive }),
      ...(isExternal !== undefined && { isActive }),
    }).populate("department");

    return worker;
  },

  async update({ id, payload }: UpdateRepositoryParam<WorkerFormData>) {
    const worker = await WorkerModel.findByIdAndUpdate(id, payload);
    return worker;
  },

  async delete(id: string) {
    const worker = await this.update({ id, payload: { isActive: false } });
    return worker;
  },
};
