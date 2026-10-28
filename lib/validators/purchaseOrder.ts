import { z } from "zod";
import { ObjectIdString } from "./utils";

export const OrderItemSchema = z.object({
  fuel: ObjectIdString("fuel"),
  fuelPriceVersion: ObjectIdString("fuelPriceVersion"),
  quantity: z.number().gt(0, "Quantity cannot be negative or zero"),
  price: z.number().min(0, "Price cannot be negative or zero"),
});

export const PurchaseOrderValidator = z.object({
  reference: z.string().regex(/^\d+\/\d{2}$/, {
    message: "Reference must follow the 'number/year' format (e.g., 123/26)",
  }),
  department: ObjectIdString("department"),
  supplier: ObjectIdString("supplier"),
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  total: z.optional(z.number().gt(0, "Order total must be greater than zero.")),
});

export const PurchaseOrderValidatorUpdate = z.object({
  reference: z.optional(
    z.string().regex(/^\d+\/\d{2}$/, {
      message: "Reference must follow the 'number/year' format (e.g., 123/26)",
    }),
  ),
  department: z.optional(ObjectIdString("department")),
  supplier: z.optional(ObjectIdString("supplier")),
  items: z.optional(
    z.array(OrderItemSchema).min(1, "Order must have at least one item"),
  ),
  total: z.optional(z.number().gt(0, "Order total must be greater than zero.")),
});
