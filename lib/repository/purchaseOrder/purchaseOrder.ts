import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import type { SearchParams } from "@/app/(secure)/types";
import type { PaginatedResponse } from "@/app/api/types";
import { PAGINATION_LIMIT } from "@/app/api/utils";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import dbConnect from "@/lib/database/database";
import PurchaseOrderModel, {
  type IPurchaseOrder,
} from "@/models/PurchaseOrder";
import type { FindOneRepositoryParam, UpdateRepositoryParam } from "../types";
import { parsePurchaseOrders, toPurchaseOrderDTO } from "./parse";
import { FuelRepository } from "../fuel/fuel";
import type { Repository } from "../types";
import { PurchaseOrderValidator } from "@/app/(secure)/purchaseOrder/validator";
import { isObjectIdOrHexString } from "mongoose";
import { calculatePurchaseOrderPrices } from "../utils";

export const PurchaseOrderRepository: Repository<
  PurchaseOrderDTO,
  PurchaseOrderFormData
> = {
  async find(
    params: SearchParams,
  ): Promise<PaginatedResponse<PurchaseOrderDTO>> {
    await dbConnect();
    const { page = 1 } = params;
    const skip = (Number(page) - 1) * PAGINATION_LIMIT;

    const [data, totalItems] = await Promise.all([
      PurchaseOrderModel.find()
        .populate("department")
        .populate("items.fuel") // Popula o combustível dentro de cada item do array
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT)
        .lean<IPurchaseOrder[]>(),
      PurchaseOrderModel.countDocuments(),
    ]);

    return {
      data: parsePurchaseOrders(data) as PurchaseOrderDTO[],
      totalItems,
      totalPages: Math.ceil(totalItems / PAGINATION_LIMIT),
      currentPage: Number(page),
      hasNextPage: Math.ceil(totalItems / PAGINATION_LIMIT) > Number(page),
      hasPrevPage: Number(page) > 1,
      limit: PAGINATION_LIMIT,
    };
  },

  async findOne({
    id,
  }: FindOneRepositoryParam): Promise<PurchaseOrderDTO | null> {
    await dbConnect();
    const order = await PurchaseOrderModel.findById(id)
      .populate("department")
      .populate("items.fuel")
      .lean<IPurchaseOrder>();

    return order ? (toPurchaseOrderDTO(order) as PurchaseOrderDTO) : null;
  },

  async findByReference(reference: string) {
    await dbConnect();
    const order = await PurchaseOrderModel.findOne({ reference });

    return order ? (toPurchaseOrderDTO(order) as PurchaseOrderDTO) : null;
  },

  async create(payload: PurchaseOrderFormData): Promise<PurchaseOrderDTO> {
    await dbConnect();

    let validPayload: PurchaseOrderFormData | null = null;

    const result = PurchaseOrderValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else {
      validPayload = result.data as PurchaseOrderFormData;
    }

    const { data: fuels } = await FuelRepository.find({});

    const calculatedPayload = calculatePurchaseOrderPrices({
      order: validPayload,
      fuels,
    });

    const newOrder = await PurchaseOrderModel.create(calculatedPayload);

    await newOrder.populate("department");
    await newOrder.populate("items.fuel");

    return toPurchaseOrderDTO(newOrder as IPurchaseOrder) as PurchaseOrderDTO;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<PurchaseOrderFormData>): Promise<PurchaseOrderDTO> {
    await dbConnect();

    let validPayload: PurchaseOrderFormData | null = null;

    const result = PurchaseOrderValidator.safeParse(payload);

    if (!result.success) {
      throw new Error(JSON.parse(result.error.message)[0].message);
    } else if (!isObjectIdOrHexString(id)) {
      throw new Error("Id prop needs to be a valid ObjectId.");
    } else {
      validPayload = result.data as PurchaseOrderFormData;
    }

    const { data: fuels } = await FuelRepository.find({});
    const calculatedPayload = calculatePurchaseOrderPrices({
      order: validPayload,
      fuels,
    });

    const purchaseOrder = await PurchaseOrderModel.findByIdAndUpdate(
      id,
      calculatedPayload,
      {
        returnDocument: "after",
      },
    );

    if (!purchaseOrder)
      throw new Error("No purchase order found with provided id.");

    await purchaseOrder.populate("department");
    await purchaseOrder.populate("items.fuel");

    return toPurchaseOrderDTO(purchaseOrder) as PurchaseOrderDTO;
  },

  async delete(id: string): Promise<PurchaseOrderDTO | null> {
    await dbConnect();

    const deleted = await PurchaseOrderModel.findOneAndDelete(
      { _id: id },
      { returnOriginal: true },
    );
    return deleted ? (toPurchaseOrderDTO(deleted) as PurchaseOrderDTO) : null;
  },
};
