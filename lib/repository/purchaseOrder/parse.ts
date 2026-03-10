import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { IPurchaseOrder } from "@/models/PurchaseOrder";

export const toPurchaseOrderDTO = (
  order: IPurchaseOrder,
): PurchaseOrderDTO => ({
  _id: order._id.toString(),
  reference: order.reference,
  items: order.items.map((item) => ({
    fuel: item.fuel,
    quantity: item.quantity,
    price: item.price,
    totalItem: item.quantity * item.price,
  })),
  createdAt: order.createdAt,
});

export const parsePurchaseOrders = (
  orders: IPurchaseOrder[],
): PurchaseOrderDTO[] => orders.map(toPurchaseOrderDTO);
