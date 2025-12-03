import { Types } from "mongoose";
import type { RawWorker } from "./types";

export const getWorkerMock = (): RawWorker => ({
  _id: new Types.ObjectId(),
  name: "João da Silva",
  role: "Analista de Sistemas",
  registry: "123456",
  matriculation: "654321",
  admissionDate: new Date("2020-01-15").toISOString(),
  isActive: true,
  department: new Types.ObjectId(),
});
