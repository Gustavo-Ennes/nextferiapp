import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { IPurchaseOrder } from "@/models/PurchaseOrder";
import { toDepartmentDTO } from "../department/parse";
import { toFuelDTO } from "../fuel/parse";
import { isObjectIdOrHexString, Types } from "mongoose";

export const toPurchaseOrderDTO = (
  order: IPurchaseOrder | Types.ObjectId,
): PurchaseOrderDTO | string => {
  if (!order) throw new Error(`Cannot parse purchaseOrder: order is ${order}`);

  if (isObjectIdOrHexString(order)) return (order as Types.ObjectId).toString();

  const purchaseOrderEntity = order as IPurchaseOrder;

  return {
    _id: purchaseOrderEntity._id.toString(),
    reference: purchaseOrderEntity.reference,
    department: toDepartmentDTO(purchaseOrderEntity.department),
    items: purchaseOrderEntity.items.map((item) => ({
      fuel: toFuelDTO(item.fuel),
      quantity: item.quantity,
      price: item.price,
      totalItem: item.quantity * item.price,
    })),
    createdAt: purchaseOrderEntity.createdAt.toISOString(),
    updatedAt: purchaseOrderEntity.updatedAt.toISOString(),
  };
};

export const parsePurchaseOrders = (
  orders: (IPurchaseOrder | Types.ObjectId)[],
): (PurchaseOrderDTO | string)[] => orders.map(toPurchaseOrderDTO);
