import { z } from "zod";

const ObjectIdString = z
  .string()
  .min(1, "Campo obrigatório")
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido");

export const OrderItemSchema = z.object({
  fuel: ObjectIdString,
  quantity: z.number().min(0, "Quantity cannot be negative"),
  price: z.optional(z.number().min(0, "Price cannot be negative")),
});

export const PurchaseOrderValidator = z.object({
  reference: z.string().regex(/^\d+\/\d{2}$/, {
    message: "Reference must follow the 'number/year' format (e.g., 123/26)",
  }),
  department: ObjectIdString,
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
});
