import { Types, type PipelineStage } from "mongoose";
import PurchaseOrderModel from "@/models/PurchaseOrder";
import type { GetFilteredOrderIdsParams } from "../types";

export const getFilteredOrderIds = async ({
  hideLowBalance,
  hideOutdated,
  baseMatch = {},
}: GetFilteredOrderIdsParams): Promise<Types.ObjectId[]> => {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        ...(!!baseMatch.suplier && {
          supplier: new Types.ObjectId(baseMatch.supplier as string),
        }),
      },
    },

    // preserva o índice original pra remontar o array items na ordem certa
    { $unwind: { path: "$items", includeArrayIndex: "itemIndex" } },

    // traz o Fuel referenciado pelo item
    {
      $lookup: {
        from: "fuels",
        localField: "items.fuel",
        foreignField: "_id",
        as: "itemFuel",
      },
    },
    { $unwind: "$itemFuel" },

    // resolve o currentPriceVersion (maior "version") sem depender do virtual
    {
      $lookup: {
        from: "fuelpriceversions",
        let: { fuelId: "$itemFuel._id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$fuel", "$$fuelId"] } } },
          { $sort: { version: -1 } },
          { $limit: 1 },
        ],
        as: "currentPriceVersion",
      },
    },
    {
      $addFields: {
        currentPriceVersion: { $arrayElemAt: ["$currentPriceVersion", 0] },
      },
    },

    // flags por item
    {
      $addFields: {
        "items.itemLowBalance": { $lt: ["$items.quantity", 5] },
        "items.itemOutdated": {
          $ne: ["$items.fuelPriceVersion", "$currentPriceVersion._id"],
        },
      },
    },

    // remonta o array items na ordem original
    { $sort: { itemIndex: 1 } },
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
        items: { $push: "$items" },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ["$doc", { items: "$items" }] },
      },
    },

    // status agregado do pedido: "none" | "some" | "all"
    {
      $addFields: {
        lowBalanceStatus: {
          $switch: {
            branches: [
              {
                case: { $allElementsTrue: ["$items.itemLowBalance"] },
                then: "all",
              },
              {
                case: { $anyElementTrue: ["$items.itemLowBalance"] },
                then: "some",
              },
            ],
            default: "none",
          },
        },
        outdatedStatus: {
          $switch: {
            branches: [
              {
                case: { $allElementsTrue: ["$items.itemOutdated"] },
                then: "all",
              },
              {
                case: { $anyElementTrue: ["$items.itemOutdated"] },
                then: "some",
              },
            ],
            default: "none",
          },
        },
      },
    },
  ];

  const filterMatch: Record<string, unknown> = {};
  if (hideLowBalance) filterMatch.lowBalanceStatus = { $ne: "all" };
  if (hideOutdated) filterMatch.outdatedStatus = { $ne: "all" };

  if (Object.keys(filterMatch).length > 0) {
    pipeline.push({ $match: filterMatch });
  }

  pipeline.push({ $project: { _id: 1 } });

  const result = await PurchaseOrderModel.aggregate(pipeline);

  return result.map((r) => r._id);
};
