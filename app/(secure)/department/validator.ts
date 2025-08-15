import * as z from "zod";

const nameMore5Str = "O nome precisa ter mais de 5 caracteres";
const nameLess60Str = "O nome precisa ter menos de 60 carateres";
const responsibleMissingStr = "Um chefe precisa ser selecionado";

export const DepartmentValidator = z.object({
  name: z.string().min(5, nameMore5Str).max(60, nameLess60Str),
  responsible: z
    .string()
    .overwrite((str) => (str === "-" ? "" : str))
    .nonempty(responsibleMissingStr),
  isActive: z.boolean().default(true),
});
