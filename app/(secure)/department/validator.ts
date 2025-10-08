import * as z from "zod";

const nameMore5Str = "O nome precisa ter mais de 2 caracteres";
const nameLess60Str = "O nome precisa ter menos de 60 carateres";
const responsibleMissingStr = "Um chefe precisa ser selecionado";

export const DepartmentValidator = z.object({
  name: z.string().min(3, nameMore5Str).max(60, nameLess60Str),
  responsible: z
    .string()
    .min(1, "Campo obrigatório")
    .regex(/^[0-9a-fA-F]{24}$/, responsibleMissingStr),
  isActive: z.optional(z.boolean().default(true)),
});
