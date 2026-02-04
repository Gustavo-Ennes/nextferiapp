import type { DepartmentDTO } from "@/dto";
import type { Department } from "@/models/Department";
import { toBossDTO } from "../boss/parse";
import { Types, isObjectIdOrHexString } from "mongoose";
import type { Boss } from "@/models/Boss";

export const toDepartmentDTO = (
  department: Department | Types.ObjectId,
): DepartmentDTO | string => {
  if (!department)
    throw new Error(`Cannot parse department: department is ${department}`);

  if (isObjectIdOrHexString(department))
    return (department as Types.ObjectId).toString();

  const departmentEntity = department as Department;

  return {
    ...departmentEntity,
    _id: departmentEntity._id.toString(),
    createdAt: departmentEntity.createdAt.toISOString(),
    updatedAt: departmentEntity.updatedAt.toISOString(),
    responsible: departmentEntity.responsible
      ? toBossDTO(departmentEntity.responsible as Boss)
      : undefined,
  };
};

export const parseDepartments = (
  departments: (Department | Types.ObjectId)[],
): (DepartmentDTO | string)[] => departments.map(toDepartmentDTO);
