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
import {
  PurchaseOrderValidator,
  PurchaseOrderValidatorUpdate,
} from "@/lib/validators/purchaseOrder";
import { isObjectIdOrHexString } from "mongoose";
import { calculatePurchaseOrderPrices } from "../utils";
import { getFilteredOrderIds } from "./utils";

export const PurchaseOrderRepository: Repository<
  PurchaseOrderDTO,
  PurchaseOrderFormData
> = {
  async find({
    hideLowBalance,
    hideOutdated,
    supplier,
    page = 1,
  }: SearchParams): Promise<PaginatedResponse<PurchaseOrderDTO>> {
    await dbConnect();

    const baseMatch = { ...(!!supplier && { supplier }) };
    const skip = (Number(page) - 1) * PAGINATION_LIMIT;

    const needsAggregateFilter = !!hideLowBalance || !!hideOutdated;

    const query = needsAggregateFilter
      ? {
          ...baseMatch,
          _id: {
            $in: await getFilteredOrderIds({
              hideLowBalance,
              hideOutdated,
              baseMatch, // testar
            }),
          },
        }
      : baseMatch;

    const [data, totalItems] = await Promise.all([
      PurchaseOrderModel.find<IPurchaseOrder>(query)
        .populate([
          { path: "department" },
          {
            path: "items.fuel",
            populate: { path: "currentPriceVersion" },
          },
          { path: "items.fuelPriceVersion" },
          { path: "supplier" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGINATION_LIMIT),
      PurchaseOrderModel.countDocuments(query),
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
  async findWithoutPagination(params: SearchParams) {
    let page = 1;
    let shouldFetchNextPage = false;
    const orders: PurchaseOrderDTO[] = [];

    do {
      const { data: orderPage, hasNextPage } = await this.find({
        ...params,
        page: page++,
      });

      orders.push(...orderPage);
      shouldFetchNextPage = hasNextPage;
    } while (shouldFetchNextPage);

    return orders;
  },

  async findOne({
    id,
  }: FindOneRepositoryParam): Promise<PurchaseOrderDTO | null> {
    await dbConnect();
    const order = await PurchaseOrderModel.findById<IPurchaseOrder>(
      id,
    ).populate([
      { path: "department" },
      {
        path: "items.fuel",
        populate: { path: "currentPriceVersion" },
      },
      { path: "items.fuelPriceVersion" },
      { path: "supplier" },
    ]);

    return order ? (toPurchaseOrderDTO(order) as PurchaseOrderDTO) : null;
  },

  async findByReference(reference: string) {
    await dbConnect();
    const order = await PurchaseOrderModel.findOne<IPurchaseOrder>({
      reference,
    }).populate([
      { path: "department" },
      {
        path: "items.fuel",
        populate: { path: "currentPriceVersion" },
      },
      { path: "items.fuelPriceVersion" },
      { path: "supplier" },
    ]);

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

    await newOrder.populate([
      { path: "department" },
      {
        path: "items.fuel",
        populate: { path: "currentPriceVersion" },
      },
      { path: "items.fuelPriceVersion" },
      { path: "supplier" },
    ]);

    return toPurchaseOrderDTO(newOrder as IPurchaseOrder) as PurchaseOrderDTO;
  },

  async update({
    id,
    payload,
  }: UpdateRepositoryParam<PurchaseOrderFormData>): Promise<PurchaseOrderDTO> {
    await dbConnect();

    let validPayload: PurchaseOrderFormData | null = null;

    const result = PurchaseOrderValidatorUpdate.safeParse(payload);

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
        new: true,
      },
    );

    if (!purchaseOrder)
      throw new Error("No purchase order found with provided id.");

    await purchaseOrder.populate([
      { path: "department" },
      {
        path: "items.fuel",
        populate: { path: "currentPriceVersion" },
      },
      { path: "items.fuelPriceVersion" },
      { path: "supplier" },
    ]);

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
