import dbConnect from "@/lib/database/database";
import type { Repository } from "../types";
import type { FuelDTO } from "@/dto/FuelDTO";
import FuelModel, { type IFuel } from "@/models/Fuel";
import { parseFuels, toFuelDTO } from "./parse";
import type { FuelFormData } from "@/app/(secure)/fuel/types";
import type { FindOneRepositoryParam, UpdateRepositoryParam } from "../types";
import type { PaginatedResponse } from "@/app/api/types";
import type { SearchParams } from "@/app/(secure)/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import { FuelValidator } from "@/app/(secure)/fuel/validator";
import { isObjectIdOrHexString } from "mongoose";
import { startOfDaySP, endOfDaySP } from "@/app/utils";

export const FuelRepository: Repository<FuelDTO, FuelFormData> = {
  async find(params: SearchParams): Promise<PaginatedResponse<FuelDTO>> {
    await dbConnect();

    const { page = 1 } = params;
    const skip = (Number(page) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      FuelModel.find<IFuel>()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .populate("priceVersions currentPriceVersion"),
      FuelModel.countDocuments(),
    ]);

    return {
      data: parseFuels(data) as FuelDTO[],
      totalItems,
      totalPages: Math.ceil(totalItems / PAGINATION_LIMIT),
      currentPage: Number(page),
      hasNextPage: Math.ceil(totalItems / PAGINATION_LIMIT) > Number(page),
      hasPrevPage: Number(page) > 1,
      limit: PAGINATION_LIMIT,
    };
  },

  async findWithoutPagination(params: SearchParams) {
    let page = 1;
    let shouldFetchNextPage = false;
    let to;
    let from;
    const fuels: FuelDTO[] = [];
    const today = new Date();

    if (params.timePeriod == "past") to = endOfDaySP(today);
    else if (params.timePeriod === "future") from = startOfDaySP(today);

    do {
      const { data: fuelPage, hasNextPage } = await this.find({
        ...params,
        ...(params.timePeriod && to && { to }),
        ...(params.timePeriod && from && { from }),
        page: page++,
      });

      fuels.push(...fuelPage);
      shouldFetchNextPage = hasNextPage;
    } while (shouldFetchNextPage);

    return fuels;
  },

  async findByFilter(
    filter: FuelFormData | Partial<FuelFormData>,
  ): Promise<FuelDTO | null> {
    await dbConnect();
    const fuel = await FuelModel.findOne(filter).populate(
      "priceVersions currentPriceVersion",
    );
    return fuel ? (toFuelDTO(fuel) as FuelDTO) : null;
  },

  async findOne({ id }: FindOneRepositoryParam): Promise<FuelDTO | null> {
    await dbConnect();
    const fuel = await FuelModel.findById<IFuel>(id).populate(
      "priceVersions currentPriceVersion",
    );
    return fuel ? (toFuelDTO(fuel) as FuelDTO) : null;
  },

  async create(payload: FuelFormData): Promise<FuelDTO> {
    await dbConnect();

    let validPayload: FuelFormData | null = null;

    const result = FuelValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else {
      validPayload = result.data as FuelFormData;
    }
    const created = await FuelModel.create(validPayload);
    await created.populate("priceVersions currentPriceVersion");

    return toFuelDTO(created.toObject()) as FuelDTO;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<FuelFormData>): Promise<FuelDTO> {
    await dbConnect();

    let validPayload: FuelFormData | null = null;

    const result = FuelValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else if (!isObjectIdOrHexString(id)) {
      throw new Error("Id prop needs to be a valid ObjectId.");
    } else {
      validPayload = result.data as FuelFormData;
    }

    const updated = await FuelModel.findByIdAndUpdate<IFuel>(id, validPayload, {
      returnDocumentAfter: true,
    });
    await updated?.populate("priceVersions ");

    if (!updated) throw new Error("No fuel found with provided id.");

    return toFuelDTO(updated) as FuelDTO;
  },

  async delete(id: string): Promise<FuelDTO | null> {
    await dbConnect();

    const deleted = await FuelModel.findOneAndDelete(
      { _id: id },
      { returnOriginal: true },
    );
    return deleted ? (toFuelDTO(deleted) as FuelDTO) : null;
  },
};
