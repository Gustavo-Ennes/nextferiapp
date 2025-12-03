import { Types } from "mongoose";
import type { RawDepartment } from "./types";

export const getDepartmentMock = (
  responsible?: Types.ObjectId
): RawDepartment => ({
  _id: new Types.ObjectId(),
  name: "Recursos Humanos",
  isActive: true,
  ...(responsible && { responsible }),
});
