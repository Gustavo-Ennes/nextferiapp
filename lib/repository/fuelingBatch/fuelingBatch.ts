import { startOfDaySP } from "@/app/utils";
import { startOfWeek } from "date-fns";
import { isObjectIdOrHexString } from "mongoose";
import {
  parseFuelingBatches,
  toFuelingBatchDTO,
  toFuelingBatchTableLine,
} from "./parse";
import dbConnect from "@/lib/database/database";
import {
  areDepartmentsOK,
  areFuelsOk,
  calculateFuelingBatchTotals,
} from "./utils";
import { FuelRepository } from "../fuel/fuel";
import { DepartmentRepository } from "../department/department";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { SearchParams } from "@/app/(secure)/types";
import type { PaginatedResponse } from "@/app/api/types";
import type {
  FuelingBatchDTO,
  FuelingBatchTableLine,
} from "@/dto/FuelingBatchDTO";
import { FuelingBatchModel } from "@/models/FuelingBatch";

export const FuelingBatchRepository = {
  async findByWeekStart(): Promise<FuelingBatchDTO[] | null> {
    await dbConnect();

    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });
    const fuelingBatches = await FuelingBatchModel.find({ weekStart })
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });

    if (!fuelingBatches.length) return null;

    const parsed = parseFuelingBatches(fuelingBatches);
    return parsed;
  },

  async find({
    page,
  }: SearchParams): Promise<PaginatedResponse<FuelingBatchDTO>> {
    await dbConnect();

    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      FuelingBatchModel.find()
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .populate({
          path: "departments.department",
          model: "Department",
        })
        .populate({
          path: "departments.vehicles.fuel",
          model: "Fuel",
        })
        .lean(),
      FuelingBatchModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);
    const parsed = parseFuelingBatches((data as any) ?? []);
    const currentPage = page as number;
    const hasNextPage = totalPages > currentPage;
    const hasPrevPage = currentPage > 1;

    return {
      data: parsed,
      totalItems,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      limit: PAGINATION_LIMIT,
    };
  },

  async findTableLines({
    page,
  }: SearchParams): Promise<PaginatedResponse<FuelingBatchTableLine>> {
    const paginatedResponse = await this.find({ page });
    const tableLines = paginatedResponse.data.map((doc) =>
      toFuelingBatchTableLine(doc),
    );
    return {
      ...paginatedResponse,
      data: tableLines,
    };
  },

  async findWithoutPagination(): Promise<FuelingBatchDTO[]> {
    await dbConnect();

    const fuelingBatches = await FuelingBatchModel.find()
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });

    return parseFuelingBatches(fuelingBatches);
  },

  async findById(id: string): Promise<FuelingBatchDTO | null> {
    await dbConnect();

    const batch = await FuelingBatchModel.findById(id)
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      }).lean();

    return batch ? toFuelingBatchDTO(batch as any) : null;
  },

  async delete(id: string): Promise<void> {
    await dbConnect();

    if (!id || !isObjectIdOrHexString(id)) throw new Error("Id not found");

    const fuelingBatches = await this.findWithoutPagination();
    const fuelingBatch = fuelingBatches.find((s) => s._id === id);
    if (!fuelingBatch) throw new Error("Fueling batch not found");

    await FuelingBatchModel.deleteOne({ _id: id });
  },

  async create(
    payload: Partial<FuelingBatchDTO>,
  ): Promise<FuelingBatchDTO | null> {
    await dbConnect();

    const fuels = await FuelRepository.findWithoutPagination!({});

    const okDepartments = areDepartmentsOK({
      DepartmentRepository,
      payload: payload as FuelingBatchDTO,
    });
    const okFuels = areFuelsOk({ payload: payload as FuelingBatchDTO, fuels });

    if (!okDepartments) {
      throw new Error("One or more departments in the payload do not exist.");
    }

    if (!okFuels) {
      throw new Error("One or more fuels in the payload do not exist.");
    }

    const payloadWithUpdatedTotals = calculateFuelingBatchTotals({
      payload,
      fuels,
    });

    const fuelingBatch = await FuelingBatchModel.create(
      payloadWithUpdatedTotals,
    );

    await fuelingBatch.populate({
      path: "departments.department",
      model: "Department",
    });
    await fuelingBatch.populate({
      path: "departments.vehicles.fuel",
      model: "Fuel",
    });

    const parsedFuelingBatch = toFuelingBatchDTO(fuelingBatch as any);
    return parsedFuelingBatch;
  },

  async update(payload: FuelingBatchDTO): Promise<FuelingBatchDTO> {
    await dbConnect();

    const exists = await FuelingBatchModel.exists({_id: payload._id})
    if(!exists) throw new Error("Fueling batch not found with provided id.")

    const fuels = await FuelRepository.findWithoutPagination!({});

    const okDepartments = areDepartmentsOK({
      DepartmentRepository,
      payload: payload as FuelingBatchDTO,
    });
    const okFuels = areFuelsOk({ payload: payload as FuelingBatchDTO, fuels });

    if (!okDepartments) {
      throw new Error("One or more departments in the payload do not exist.");
    }

    if (!okFuels) {
      throw new Error("One or more fuels in the payload do not exist.");
    }

    const payloadWithUpdatedTotals = calculateFuelingBatchTotals({
      payload,
      fuels,
    });

    const fuelingBatch = await FuelingBatchModel.findOneAndUpdate(
      { _id: payload._id },
      {
        $set: payloadWithUpdatedTotals,
      },
      {
        returnDocument: "after",
      },
    )
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      })
      .lean();

    const parsedFuelingBatch = toFuelingBatchDTO(fuelingBatch as any);
    return parsedFuelingBatch;
  },

  async createEmpty(): Promise<FuelingBatchDTO> {
    await dbConnect();
    const fuelingBatch = await FuelingBatchModel.create({});
    return toFuelingBatchDTO(fuelingBatch);
  },
};
