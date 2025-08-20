import * as z from "zod";

const nameMore5Str = "O cargo precisa ter mais de 5 caracteres";
const nameLess60Str = "O cargo precisa ter menos de 60 carateres";
const workerMissingStr = "Um trabalhador precisa ser selecionado";

export const BossValidator = z.object({
  role: z.string().min(5, nameMore5Str).max(60, nameLess60Str),
  isDirector: z.boolean(),
  worker: z
    .string()
    .overwrite((str) => (str === "_" ? "" : str))
    .nonempty(workerMissingStr),
});
