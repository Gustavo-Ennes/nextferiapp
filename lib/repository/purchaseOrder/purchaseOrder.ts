import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import dbConnect from "@/lib/database/database";
import PurchaseOrderModel, {
  type IPurchaseOrder,
} from "@/models/PurchaseOrder";
import type {
  FindOneRepositoryParam,
  Repository,
  UpdateRepositoryParam,
} from "../types";
import { parsePurchaseOrders, toPurchaseOrderDTO } from "./parse";
import type { PaginatedResponse } from "@/app/api/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { SearchParams } from "@/app/(secure)/types";

export const PurchaseOrderRepository: Repository<
  PurchaseOrderDTO,
  PurchaseOrderFormData
> = {
  async find(
    params: SearchParams,
  ): Promise<PaginatedResponse<PurchaseOrderDTO>> {
    await dbConnect();

    const { page } = params;
    const skip = ((page as number) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      PurchaseOrderModel.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .lean<IPurchaseOrder[]>(),
      PurchaseOrderModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalItems / PAGINATION_LIMIT);
    const parsedOrders = parsePurchaseOrders(data);
    const currentPage = page as number;
    const hasNextPage = totalPages > currentPage;
    const hasPrevPage = currentPage > 1;

    return {
      data: parsedOrders,
      totalItems,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      limit: PAGINATION_LIMIT,
    };
  },

  async findOne({
    id,
  }: FindOneRepositoryParam): Promise<PurchaseOrderDTO | null> {
    await dbConnect();

    const rawOrder = await PurchaseOrderModel.findById<IPurchaseOrder>(id);

    return rawOrder ? toPurchaseOrderDTO(rawOrder) : null;
  },

  async create(data: PurchaseOrderFormData): Promise<PurchaseOrderDTO> {
    await dbConnect();

    const newOrder = new PurchaseOrderModel(data);
    const newRawOrder = await newOrder.save();
    const order = toPurchaseOrderDTO(newRawOrder);

    return order;
  },

  async findByReference(reference: string): Promise<PurchaseOrderDTO | null> {
    await dbConnect();
    return await PurchaseOrderModel.findOne({ reference });
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<PurchaseOrderFormData>): Promise<PurchaseOrderDTO | null> {
    await dbConnect();

    return await PurchaseOrderModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true },
    );
  },

  async delete(id: string): Promise<PurchaseOrderDTO | null> {
    await dbConnect();

    const rawDeleted = await PurchaseOrderModel.findByIdAndDelete(id);
    const deleted = toPurchaseOrderDTO(rawDeleted);
    return deleted;
  },
};
