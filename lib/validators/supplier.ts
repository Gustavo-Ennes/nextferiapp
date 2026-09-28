import * as z from "zod";

const nameMore5Str = "O cargo precisa ter mais de 5 caracteres";
const nameLess60Str = "O cargo precisa ter menos de 60 carateres";

export const SupplierValidator = z.object({
  name: z.string().min(5, nameMore5Str).max(60, nameLess60Str),
});
