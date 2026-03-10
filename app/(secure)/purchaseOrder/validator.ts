import { z } from "zod";
import { fuelTypes } from "@/lib/repository/weeklyFuellingSummary/types";

export const OrderItemSchema = z.object({
  fuel: z.enum(fuelTypes),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  price: z.optional(z.number().min(0, "Price cannot be negative")),
});

export const PurchaseOrderValidator = z.object({
  reference: z.string().regex(/^\d+\/\d{2}$/, {
    message: "Reference must follow the 'number/year' format (e.g., 123/26)",
  }),
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
});
