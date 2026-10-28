import * as z from "zod";

const nameMore5Str = "O nome precisa ter mais de 5 caracteres";
const nameLess60Str = "O nome precisa ter menos de 60 caracteres";

export const SupplierValidator = z.object({
  name: z.string("Um nome precisa ser fornecido").min(5, nameMore5Str).max(60, nameLess60Str),
});
