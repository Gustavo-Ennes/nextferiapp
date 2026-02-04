import type { SearchParams } from "@/app/(secure)/types";
import type {
  PaginationRepositoryReturn,
  FindOneRepositoryParam,
  UpdateRepositoryParam,
} from "../types";
import WorkerModel from "@/models/Worker";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { WorkerFormData } from "@/app/(secure)/worker/types";
import type { WorkerDTO } from "@/dto";
import { toWorkerDTO, parseWorkers } from "./parse";
import type { Worker } from "@/models/Worker";

export const WorkerRepository = {
  async find({
    page,
    isActive,
    isExternal,
    contains,
  }: SearchParams): Promise<PaginationRepositoryReturn<WorkerDTO>> {
    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const filter = {
      ...(isActive !== null && isActive !== undefined && { isActive }),
      ...(contains && { name: { $regex: contains, $options: "i" } }),
      ...(isExternal !== null && isExternal !== undefined && { isExternal }),
    };

    const [data, totalItems] = await Promise.all([
      WorkerModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .populate("department")
        .lean<Worker[]>(),
      WorkerModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);
    const parsedWorkers = parseWorkers(data) as WorkerDTO[];

    return { data: parsedWorkers, totalItems, totalPages };
  },

  async create(payload: WorkerFormData): Promise<WorkerDTO> {
    const worker = await WorkerModel.create(payload);
    return toWorkerDTO(worker.toObject()) as WorkerDTO;
  },

  async findOne({
    id,
    isActive,
    isExternal,
  }: FindOneRepositoryParam): Promise<WorkerDTO | null> {
    const worker = await WorkerModel.findOne({
      _id: id,
      ...(isActive !== null && isActive !== undefined && { isActive }),
      ...(isExternal !== null && isExternal !== undefined && { isExternal }),
    }).populate("department");

    return worker ? (toWorkerDTO(worker.toObject()) as WorkerDTO) : null;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<WorkerFormData>): Promise<WorkerDTO> {
    const worker = await WorkerModel.findByIdAndUpdate(id, payload);
    return toWorkerDTO(worker.toObject()) as WorkerDTO;
  },

  async delete(id: string): Promise<WorkerDTO> {
    const worker = await this.update({ id, payload: { isActive: false } });
    return worker;
  },
};
