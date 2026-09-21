import type { SupplierDTO } from "@/dto";
import type { ISupplier } from "@/models/Supplier";
import { isObjectIdOrHexString, type Types } from "mongoose";

export const toSupplierDTO = (
  supplier: ISupplier | Types.ObjectId,
): SupplierDTO | string => {
  if (!supplier)
    throw new Error(`Cannot parse supplier: supplier is ${supplier}`);

  if (isObjectIdOrHexString(supplier))
    return (supplier as Types.ObjectId).toString();

  const supplierEntity = supplier as ISupplier;

  return {
    _id: supplierEntity._id.toString(),
    name: supplierEntity.name,
    createdAt: supplierEntity.createdAt.toISOString(),
    updatedAt:
      supplierEntity.updatedAt?.toISOString() ||
      supplierEntity.createdAt.toISOString(),
  };
};

export const parseSuupliers = (
  suppliers: (ISupplier | Types.ObjectId)[],
): (SupplierDTO | string)[] => suppliers.map(toSupplierDTO);
