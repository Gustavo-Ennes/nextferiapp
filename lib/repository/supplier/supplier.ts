import type { SupplierFormData } from "@/app/(secure)/supplier/types";
import type { SearchParams } from "@/app/(secure)/types";
import type { PaginatedResponse } from "@/app/api/types";
import type { SupplierDTO } from "@/dto";
import dbConnect from "@/lib/database/database";
import type {
  FindOneRepositoryParam,
  Repository,
  UpdateRepositoryParam,
} from "../types";
import SupplierModel, { type ISupplier } from "@/models/Supplier";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import { parseSuupliers, toSupplierDTO } from "./parse";
import { SupplierValidator } from "@/lib/validators/supplier";
import { isObjectIdOrHexString } from "mongoose";

export const SupplierRepository: Repository<SupplierDTO, SupplierFormData> = {
  async find(params: SearchParams): Promise<PaginatedResponse<SupplierDTO>> {
    await dbConnect();
    const { page = 1 } = params;
    const skip = (Number(page) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      SupplierModel.find<ISupplier>()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT),
      SupplierModel.countDocuments(),
    ]);

    return {
      data: parseSuupliers(data) as SupplierDTO[],
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
    const suppliers: SupplierDTO[] = [];

    do {
      const { data: supplierPage, hasNextPage } = await this.find({
        ...params,
        page: page++,
      });

      suppliers.push(...supplierPage);
      shouldFetchNextPage = hasNextPage;
    } while (shouldFetchNextPage);

    return suppliers;
  },

  async findByFilter(
    filter: SupplierFormData | Partial<SupplierFormData>,
  ): Promise<SupplierDTO | null> {
    await dbConnect();
    const supplier = await SupplierModel.findOne(filter);
    return supplier ? (toSupplierDTO(supplier) as SupplierDTO) : null;
  },

  async findOne({ id }: FindOneRepositoryParam): Promise<SupplierDTO | null> {
    await dbConnect();
    const supplier = await SupplierModel.findById<ISupplier>(id);
    return supplier ? (toSupplierDTO(supplier) as SupplierDTO) : null;
  },

  async create(payload: SupplierFormData): Promise<SupplierDTO> {
    await dbConnect();

    let validPayload: SupplierFormData | null = null;

    const result = SupplierValidator.safeParse(payload as SupplierFormData);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else {
      validPayload = result.data as SupplierFormData;
    }

    const created = await SupplierModel.create(validPayload);

    return toSupplierDTO(created.toObject()) as SupplierDTO;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<SupplierFormData>): Promise<SupplierDTO> {
    await dbConnect();

    let validPayload: SupplierFormData | null = null;

    const result = SupplierValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else if (!isObjectIdOrHexString(id)) {
      throw new Error("Id prop needs to be a valid ObjectId.");
    } else {
      validPayload = result.data as SupplierFormData;
    }

    const updated = await SupplierModel.findByIdAndUpdate(id, validPayload, {
      new: true,
    });

    if (!updated) throw new Error("No supplier found with provided id.");

    return toSupplierDTO(updated.toObject()) as SupplierDTO;
  },

  async delete(id: string): Promise<SupplierDTO | null> {
    await dbConnect();

    const deleted = await SupplierModel.findOneAndDelete(
      { _id: id },
      { returnOriginal: true },
    );
    return deleted ? (toSupplierDTO(deleted) as SupplierDTO) : null;
  },
};
