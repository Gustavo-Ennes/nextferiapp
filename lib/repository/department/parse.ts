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
  const { _id, name, createdAt, updatedAt, isActive, responsible } =
    departmentEntity;

  return {
    _id: _id.toString(),
    name,
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    responsible: responsible ? toBossDTO(responsible as Boss) : undefined,
  };
};

export const parseDepartments = (
  departments: (Department | Types.ObjectId)[],
): (DepartmentDTO | string)[] => departments.map(toDepartmentDTO);
