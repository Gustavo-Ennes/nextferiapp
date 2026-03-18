import type { FuelPriceVersionFormData } from "@/app/(secure)/fuel/types";
import { FuelPriceVersionValidator } from "@/app/(secure)/fuel/validator";
import type { SearchParams } from "@/app/(secure)/types";
import type { PaginatedResponse } from "@/app/api/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import { endOfDaySP, startOfDaySP } from "@/app/utils";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import dbConnect from "@/lib/database/database";
import type { IFuelPriceVersion } from "@/models/FuelPriceVersion";
import { isObjectIdOrHexString } from "mongoose";
import type {
  Repository,
  FindOneRepositoryParam,
  UpdateRepositoryParam,
} from "../types";
import { parseFuelPriceVersions, toFuelPriceVersionDTO } from "./parse";
import FuelPriceVersionModel from "@/models/FuelPriceVersion";

export const FuelPriceVersionRepository: Repository<
  FuelPriceVersionDTO,
  FuelPriceVersionFormData
> = {
  async find(
    params: SearchParams,
  ): Promise<PaginatedResponse<FuelPriceVersionDTO>> {
    await dbConnect();

    const { page = 1 } = params;
    const skip = (Number(page) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      FuelPriceVersionModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .lean<IFuelPriceVersion[]>(),
      FuelPriceVersionModel.countDocuments(),
    ]);

    return {
      data: parseFuelPriceVersions(data) as FuelPriceVersionDTO[],
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
    const fuels: FuelPriceVersionDTO[] = [];
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
    filter: FuelPriceVersionFormData | Partial<FuelPriceVersionFormData>,
  ): Promise<FuelPriceVersionDTO | null> {
    await dbConnect();
    const fuel = await FuelPriceVersionModel.findOne(filter);
    return fuel ? (toFuelPriceVersionDTO(fuel) as FuelPriceVersionDTO) : null;
  },

  async findByFuel(fuel: string) {
    await dbConnect();
    const versions = await FuelPriceVersionModel.find({ fuel });
    return parseFuelPriceVersions(versions) as FuelPriceVersionDTO[];
  },

  async findOne({
    id,
  }: FindOneRepositoryParam): Promise<FuelPriceVersionDTO | null> {
    await dbConnect();
    const fuel =
      await FuelPriceVersionModel.findById(id).lean<IFuelPriceVersion>();
    return fuel ? (toFuelPriceVersionDTO(fuel) as FuelPriceVersionDTO) : null;
  },

  async create(
    payload: FuelPriceVersionFormData,
  ): Promise<FuelPriceVersionDTO> {
    await dbConnect();

    let validPayload: FuelPriceVersionFormData | null = null;

    const result = FuelPriceVersionValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else {
      validPayload = result.data as FuelPriceVersionFormData;
    }

    const priceVersionsSameFuel =
      await FuelPriceVersionModel.find<IFuelPriceVersion>({
        fuel: payload.fuel,
      });
    const versions = priceVersionsSameFuel.map(
      (priceVersion) => priceVersion.version,
    );
    const version = versions.length > 0 ? Math.max(...versions) + 1 : 1;
    const created = await FuelPriceVersionModel.create({
      ...validPayload,
      version,
    });

    return toFuelPriceVersionDTO(created.toObject()) as FuelPriceVersionDTO;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<FuelPriceVersionFormData>): Promise<FuelPriceVersionDTO> {
    await dbConnect();

    let validPayload: FuelPriceVersionFormData | null = null;

    const result = FuelPriceVersionValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else if (!isObjectIdOrHexString(id)) {
      throw new Error("Id prop needs to be a valid ObjectId.");
    } else {
      validPayload = result.data as FuelPriceVersionFormData;
    }

    const updated = await FuelPriceVersionModel.findByIdAndUpdate(
      id,
      validPayload,
      {
        returnDocumentAfter: true,
      },
    ).lean<IFuelPriceVersion>();

    if (!updated) throw new Error("No fuel found with provided id.");

    return toFuelPriceVersionDTO(updated) as FuelPriceVersionDTO;
  },

  async delete(id: string): Promise<FuelPriceVersionDTO | null> {
    await dbConnect();

    const deleted = await FuelPriceVersionModel.findOneAndDelete(
      { _id: id },
      { returnOriginal: true },
    );
    return deleted
      ? (toFuelPriceVersionDTO(deleted) as FuelPriceVersionDTO)
      : null;
  },
};
